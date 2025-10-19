// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./PQVault4626WithPricing.sol";

/**
 * @title PQVault4626With83b
 * @notice Vesting vault with 83(b) election tracking and compliance features
 * @dev Handles native project token vesting with US tax compliance
 *
 * Prize Eligibility: PayPal USD Integration
 *
 * Tax Workflow:
 * 1. Employee receives vesting grant in native tokens
 * 2. Must file IRS 83(b) election within 30 days (critical!)
 * 3. Tokens vest over time (e.g., 4 years with 1-year cliff)
 * 4. When selling vested tokens → use PYUSD for tax withholding
 *
 * Features:
 * - 83(b) election deadline tracking
 * - Lockup period enforcement
 * - SEC compliance flags (Clarity Act / Torres ruling)
 * - PYUSD integration for tax withholding on sales
 */
contract PQVault4626With83b is PQVault4626WithPricing {

    /// @notice 83(b) election tracking
    struct Election83b {
        bool filed;                 // Whether 83(b) was filed
        uint64 grantDate;          // Date of grant (for 30-day deadline)
        uint64 filingDeadline;     // Grant date + 30 days
        uint64 filedDate;          // Actual filing date (0 if not filed)
        uint256 fairMarketValue;   // FMV at grant (for tax basis)
    }

    /// @notice Lockup and compliance tracking
    struct LockupInfo {
        uint64 lockupEndBlock;     // Company lockup period end
        bool companyLockup;        // Subject to company lockup?
        bool sec144Restriction;    // Subject to SEC Rule 144?
        uint256 maxSellPercent;    // Max % of holdings per sale (basis points)
    }

    /// @notice Mapping of user to 83(b) election info
    mapping(address => Election83b) public elections83b;

    /// @notice Mapping of user to lockup info
    mapping(address => LockupInfo) public lockupInfo;

    /// @notice PYUSD contract address for tax withholding
    address public constant PYUSD = 0x6c3ea9036406852006290770BEdFcAbA0e23A0e8;

    /// @notice Tax withholding percentage (basis points, 10000 = 100%)
    uint256 public defaultWithholdingBps = 2200; // 22% default federal

    /// @notice Treasury address for withheld taxes
    address public taxTreasury;

    // Events
    event Election83bFiled(address indexed user, uint256 fairMarketValue, uint64 filedDate);
    event Election83bDeadlineMissed(address indexed user, uint64 deadline);
    event LockupSet(address indexed user, uint64 lockupEndBlock, bool companyLockup);
    event TokensSoldWithTaxWithholding(
        address indexed user,
        uint256 tokenAmount,
        uint256 pyusdReceived,
        uint256 taxWithheld
    );
    event WithholdingRateUpdated(uint256 oldBps, uint256 newBps);

    // Errors
    error Election83bAlreadyFiled();
    error Election83bDeadlinePassed();
    error Election83bNotFiled();
    error StillInLockup(uint64 lockupEndBlock);
    error ExceedsMaxSellAmount(uint256 attempted, uint256 max);
    error InvalidWithholdingRate();

    /**
     * @notice Constructor
     * @param asset_ The underlying project token
     * @param name_ Vault name
     * @param symbol_ Vault symbol
     * @param decimals_ Token decimals
     * @param oracle_ Pyth price oracle
     * @param taxTreasury_ Address to receive withheld taxes
     */
    constructor(
        IERC20 asset_,
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address oracle_,
        address taxTreasury_
    ) PQVault4626WithPricing(asset_, name_, symbol_, decimals_, oracle_) {
        require(taxTreasury_ != address(0), "Invalid tax treasury");
        taxTreasury = taxTreasury_;
    }

    /**
     * @notice Create vesting grant and initialize 83(b) deadline
     * @dev Called when granting equity to employee
     * @param assets Amount of tokens
     * @param receiver Employee address
     * @param vestingDuration Total vesting (e.g., 4 years)
     * @param cliffDuration Cliff period (e.g., 1 year)
     * @param fairMarketValue FMV per token at grant (for 83b)
     * @param hasCompanyLockup Subject to company lockup agreement?
     * @param lockupDuration Lockup period in seconds (if applicable)
     */
    function createGrantWith83b(
        uint256 assets,
        address receiver,
        uint256 vestingDuration,
        uint256 cliffDuration,
        uint256 fairMarketValue,
        bool hasCompanyLockup,
        uint256 lockupDuration
    ) external nonReentrant whenNotPaused returns (uint256 shares) {
        // Create normal vesting schedule
        shares = this.depositWithVestingAndPrice(assets, receiver, vestingDuration, cliffDuration);

        // Initialize 83(b) election tracking
        uint64 now64 = uint64(block.timestamp);
        elections83b[receiver] = Election83b({
            filed: false,
            grantDate: now64,
            filingDeadline: now64 + 30 days,
            filedDate: 0,
            fairMarketValue: fairMarketValue
        });

        // Set lockup info if applicable
        if (hasCompanyLockup) {
            uint64 lockupEndBlock = uint64(block.number + (lockupDuration / BLOCK_TIME));
            lockupInfo[receiver] = LockupInfo({
                lockupEndBlock: lockupEndBlock,
                companyLockup: true,
                sec144Restriction: true, // Assume SEC restrictions
                maxSellPercent: 1000     // 10% max per sale (Torres spirit)
            });

            emit LockupSet(receiver, lockupEndBlock, true);
        }

        return shares;
    }

    /**
     * @notice File 83(b) election (employee must do within 30 days)
     * @dev Records that employee filed with IRS
     * @param user Employee address (can be called by employee or admin)
     */
    function file83bElection(address user) external {
        Election83b storage election = elections83b[user];

        require(election.grantDate > 0, "No grant found");
        if (election.filed) revert Election83bAlreadyFiled();
        if (block.timestamp > election.filingDeadline) revert Election83bDeadlinePassed();

        election.filed = true;
        election.filedDate = uint64(block.timestamp);

        emit Election83bFiled(user, election.fairMarketValue, uint64(block.timestamp));
    }

    /**
     * @notice Check if 83(b) deadline was missed
     * @param user Employee address
     * @return missed True if deadline passed and not filed
     */
    function is83bDeadlineMissed(address user) public view returns (bool missed) {
        Election83b memory election = elections83b[user];
        return election.grantDate > 0
            && !election.filed
            && block.timestamp > election.filingDeadline;
    }

    /**
     * @notice Sell vested tokens with automatic PYUSD tax withholding
     * @dev Employee sells tokens, receives PYUSD minus withholding
     * @param tokenAmount Amount of vested tokens to sell
     * @param minPyusdOut Minimum PYUSD to receive (slippage protection)
     * @param swapData DEX swap data (e.g., Uniswap path)
     * @return pyusdReceived Amount of PYUSD sent to user (after tax)
     * @return taxWithheld Amount of PYUSD withheld for taxes
     */
    function sellVestedWithTaxWithholding(
        uint256 tokenAmount,
        uint256 minPyusdOut,
        bytes calldata swapData
    ) external nonReentrant returns (uint256 pyusdReceived, uint256 taxWithheld) {
        // Check 83(b) election status
        Election83b memory election = elections83b[msg.sender];
        if (election.grantDate > 0 && !election.filed) {
            // Warning: not filed = tax on vesting + tax on gains
            emit Election83bDeadlineMissed(msg.sender, election.filingDeadline);
        }

        // Check lockup restrictions
        LockupInfo memory lockup = lockupInfo[msg.sender];
        if (lockup.companyLockup && block.number < lockup.lockupEndBlock) {
            revert StillInLockup(lockup.lockupEndBlock);
        }

        // Check max sell amount (Torres ruling compliance)
        if (lockup.maxSellPercent > 0) {
            uint256 totalVested = _calculateVestedShares(msg.sender);
            uint256 maxSell = (totalVested * lockup.maxSellPercent) / 10000;
            if (tokenAmount > maxSell) {
                revert ExceedsMaxSellAmount(tokenAmount, maxSell);
            }
        }

        // Withdraw vested tokens to this contract
        uint256 shares = previewWithdraw(tokenAmount);
        _withdrawVested(msg.sender, shares);

        // Swap tokens → PYUSD (via DEX integration)
        uint256 totalPyusd = _swapToPYUSD(tokenAmount, minPyusdOut, swapData);

        // Calculate tax withholding
        taxWithheld = (totalPyusd * defaultWithholdingBps) / 10000;
        pyusdReceived = totalPyusd - taxWithheld;

        // Transfer PYUSD to user
        IERC20(PYUSD).transfer(msg.sender, pyusdReceived);

        // Transfer withheld taxes to treasury
        IERC20(PYUSD).transfer(taxTreasury, taxWithheld);

        emit TokensSoldWithTaxWithholding(msg.sender, tokenAmount, pyusdReceived, taxWithheld);

        return (pyusdReceived, taxWithheld);
    }

    /**
     * @notice Update withholding rate (for different states/countries)
     * @param newBps New withholding rate in basis points
     */
    function setWithholdingRate(uint256 newBps) external onlyOwner {
        require(newBps <= 5000, "Max 50% withholding"); // Sanity check
        uint256 oldBps = defaultWithholdingBps;
        defaultWithholdingBps = newBps;
        emit WithholdingRateUpdated(oldBps, newBps);
    }

    /**
     * @notice Get 83(b) election info
     * @param user Employee address
     * @return Election info struct
     */
    function get83bInfo(address user) external view returns (Election83b memory) {
        return elections83b[user];
    }

    /**
     * @notice Get lockup and compliance info
     * @param user Employee address
     * @return Lockup info struct
     */
    function getLockupInfo(address user) external view returns (LockupInfo memory) {
        return lockupInfo[user];
    }

    /**
     * @notice Internal: Swap project tokens to PYUSD via DEX
     * @dev Override this with actual DEX integration (Uniswap, etc.)
     */
    function _swapToPYUSD(
        uint256 tokenAmount,
        uint256 minPyusdOut,
        bytes calldata swapData
    ) internal virtual returns (uint256 pyusdAmount) {
        // TODO: Implement actual DEX swap
        // For now, this is a placeholder that would integrate with:
        // - Uniswap V3
        // - 1inch aggregator
        // - Cowswap (MEV protection)

        // Example: Approve token to DEX router
        // IERC20(asset()).approve(DEX_ROUTER, tokenAmount);
        // pyusdAmount = IRouter(DEX_ROUTER).swap(token, PYUSD, tokenAmount, minPyusdOut, swapData);

        revert("DEX integration required");
    }

    /**
     * @notice Internal: Withdraw vested shares
     */
    function _withdrawVested(address user, uint256 shares) internal {
        VestingSchedule storage schedule = vestingSchedules[user];
        require(schedule.active, "No active vesting");

        uint256 vestedShares = _calculateVestedShares(user);
        uint256 availableShares = vestedShares - schedule.withdrawnShares;
        require(shares <= availableShares, "Insufficient vested shares");

        schedule.withdrawnShares += uint128(shares);
    }
}
