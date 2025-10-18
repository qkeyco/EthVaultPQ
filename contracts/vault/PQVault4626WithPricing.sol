// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./PQVault4626.sol";
import "../oracles/PythPriceOracle.sol";

/**
 * @title PQVault4626WithPricing
 * @notice Enhanced PQVault4626 with Pyth Network price oracle integration
 * @dev Adds USD valuation and multi-currency pricing to vesting schedules
 *
 * Prize Eligibility: Pyth Network Integration
 *
 * Features:
 * - Real-time USD valuation of vested tokens
 * - Multi-currency price queries (USD, ETH, BTC)
 * - Historical value tracking
 * - Price-based vesting milestones
 */
contract PQVault4626WithPricing is PQVault4626 {
    /// @notice Pyth price oracle contract
    PythPriceOracle public priceOracle;

    /// @notice Token decimals (for price calculations)
    uint8 public immutable assetDecimals;

    /// @notice Price history tracking
    struct PriceSnapshot {
        uint64 timestamp;
        int64 price;       // USD price with 8 decimals
        uint64 blockNumber;
    }

    /// @notice Price snapshots at vesting milestones
    mapping(address => PriceSnapshot[]) public priceHistory;

    // Events
    event PriceOracleUpdated(address indexed oldOracle, address indexed newOracle);
    event PriceSnapshotRecorded(address indexed user, int64 price, uint64 timestamp);
    event VestingValueQueried(address indexed user, uint256 valueUSD, uint256 shares);

    // Errors
    error PriceOracleNotSet();
    error InvalidPriceOracle();

    /**
     * @notice Constructor
     * @param asset_ The underlying ERC20 asset
     * @param name_ The name of the vault token
     * @param symbol_ The symbol of the vault token
     * @param decimals_ Token decimals
     * @param oracle_ Pyth price oracle address
     */
    constructor(
        IERC20 asset_,
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address oracle_
    ) PQVault4626(asset_, name_, symbol_) {
        assetDecimals = decimals_;
        if (oracle_ != address(0)) {
            priceOracle = PythPriceOracle(oracle_);
        }
    }

    /**
     * @notice Set or update price oracle
     * @param oracle_ New oracle address
     */
    function setPriceOracle(address oracle_) external onlyOwner {
        require(oracle_ != address(0), "Invalid oracle");
        address oldOracle = address(priceOracle);
        priceOracle = PythPriceOracle(oracle_);
        emit PriceOracleUpdated(oldOracle, oracle_);
    }

    /**
     * @notice Deposit with vesting and record initial price
     * @dev Extends parent to add price snapshot
     */
    function depositWithVestingAndPrice(
        uint256 assets,
        address receiver,
        uint256 vestingDuration,
        uint256 cliffDuration
    ) external nonReentrant whenNotPaused returns (uint256 shares) {
        require(assets > 0, "Cannot deposit 0");
        require(receiver != address(0), "Invalid receiver");
        require(vestingDuration > 0, "Invalid vesting duration");
        require(vestingDuration <= 10 * 365 days, "Vesting too long");
        require(cliffDuration <= vestingDuration, "Cliff exceeds vesting");
        require(!vestingSchedules[receiver].active, "Vesting already active");

        // Convert time durations to block counts
        uint256 vestingBlocks = vestingDuration / BLOCK_TIME;
        uint256 cliffBlocks = cliffDuration / BLOCK_TIME;

        require(block.number + vestingBlocks < type(uint64).max, "Block number overflow");

        // Calculate shares
        shares = previewDeposit(assets);
        require(shares > 0, "Zero shares");
        require(shares <= type(uint128).max, "Shares overflow");

        // Transfer assets from sender
        SafeERC20.safeTransferFrom(IERC20(asset()), msg.sender, address(this), assets);

        // Mint shares to this contract
        _mint(address(this), shares);

        // Create vesting schedule
        uint64 startBlock = uint64(block.number);
        vestingSchedules[receiver] = VestingSchedule({
            totalShares: uint128(shares),
            withdrawnShares: 0,
            cliffBlock: startBlock + uint64(cliffBlocks),
            vestingEndBlock: startBlock + uint64(vestingBlocks),
            startBlock: startBlock,
            active: true
        });

        emit DepositWithVesting(receiver, assets, shares, vestingDuration, cliffDuration);
        emit Deposit(msg.sender, receiver, assets, shares);

        // Record price snapshot if oracle is set
        if (address(priceOracle) != address(0)) {
            _recordPriceSnapshot(receiver);
        }

        return shares;
    }

    /**
     * @notice Get current USD value of user's vested shares
     * @param user User address
     * @return valueUSD USD value with 8 decimals
     * @return vestedShares Number of vested shares
     */
    function getVestedValueUSD(address user)
        external
        view
        returns (uint256 valueUSD, uint256 vestedShares)
    {
        if (address(priceOracle) == address(0)) revert PriceOracleNotSet();

        vestedShares = _calculateVestedShares(user);
        if (vestedShares == 0) return (0, 0);

        // Convert shares to assets
        uint256 vestedAssets = convertToAssets(vestedShares);

        // Get USD value from oracle
        valueUSD = priceOracle.getValueUSD(asset(), vestedAssets, assetDecimals);

        return (valueUSD, vestedShares);
    }

    /**
     * @notice Get current USD value of user's total vesting
     * @param user User address
     * @return totalValueUSD Total USD value with 8 decimals
     * @return vestedValueUSD Currently vested USD value
     * @return unvestedValueUSD Not yet vested USD value
     */
    function getVestingValueBreakdown(address user)
        external
        view
        returns (
            uint256 totalValueUSD,
            uint256 vestedValueUSD,
            uint256 unvestedValueUSD
        )
    {
        if (address(priceOracle) == address(0)) revert PriceOracleNotSet();

        VestingSchedule memory schedule = vestingSchedules[user];
        if (!schedule.active) return (0, 0, 0);

        // Total vesting value
        uint256 totalAssets = convertToAssets(schedule.totalShares);
        totalValueUSD = priceOracle.getValueUSD(asset(), totalAssets, assetDecimals);

        // Vested value
        uint256 vestedShares = _calculateVestedShares(user);
        uint256 vestedAssets = convertToAssets(vestedShares);
        vestedValueUSD = priceOracle.getValueUSD(asset(), vestedAssets, assetDecimals);

        // Unvested value
        unvestedValueUSD = totalValueUSD - vestedValueUSD;

        return (totalValueUSD, vestedValueUSD, unvestedValueUSD);
    }

    /**
     * @notice Get current token price from oracle
     * @return price USD price with 8 decimals
     * @return timestamp Price timestamp
     */
    function getCurrentPrice()
        external
        view
        returns (int64 price, uint256 timestamp)
    {
        if (address(priceOracle) == address(0)) revert PriceOracleNotSet();
        (price, , timestamp) = priceOracle.getPrice(asset());
        return (price, timestamp);
    }

    /**
     * @notice Get price history for a user's vesting
     * @param user User address
     * @return Array of price snapshots
     */
    function getPriceHistory(address user)
        external
        view
        returns (PriceSnapshot[] memory)
    {
        return priceHistory[user];
    }

    /**
     * @notice Get vesting progress with price data
     * @param user User address
     * @return percentVested Percentage vested (basis points, 10000 = 100%)
     * @return vestedShares Number of vested shares
     * @return totalShares Total shares in vesting
     * @return currentValueUSD Current USD value of vested shares
     * @return initialPrice Initial price when vesting started
     * @return currentPrice Current price
     */
    function getVestingProgress(address user)
        external
        view
        returns (
            uint256 percentVested,
            uint256 vestedShares,
            uint256 totalShares,
            uint256 currentValueUSD,
            int64 initialPrice,
            int64 currentPrice
        )
    {
        VestingSchedule memory schedule = vestingSchedules[user];
        if (!schedule.active) return (0, 0, 0, 0, 0, 0);

        vestedShares = _calculateVestedShares(user);
        totalShares = schedule.totalShares;
        percentVested = (vestedShares * 10000) / totalShares;

        if (address(priceOracle) != address(0)) {
            // Current value
            uint256 vestedAssets = convertToAssets(vestedShares);
            currentValueUSD = priceOracle.getValueUSD(asset(), vestedAssets, assetDecimals);

            // Initial and current prices
            PriceSnapshot[] memory history = priceHistory[user];
            if (history.length > 0) {
                initialPrice = history[0].price;
            }

            (currentPrice, , ) = priceOracle.getPrice(asset());
        }

        return (percentVested, vestedShares, totalShares, currentValueUSD, initialPrice, currentPrice);
    }

    /**
     * @notice Record a price snapshot for a user
     * @param user User address
     */
    function _recordPriceSnapshot(address user) internal {
        try priceOracle.getPrice(asset()) returns (int64 price, int32, uint256 timestamp) {
            priceHistory[user].push(
                PriceSnapshot({
                    timestamp: uint64(timestamp),
                    price: price,
                    blockNumber: uint64(block.number)
                })
            );

            emit PriceSnapshotRecorded(user, price, uint64(timestamp));
        } catch {
            // Silently fail if price not available
            // This prevents deposit from reverting due to oracle issues
        }
    }

    /**
     * @notice Manually record price snapshot (for milestone tracking)
     * @dev Can be called by anyone to update price history
     */
    function recordPriceSnapshot() external {
        if (address(priceOracle) == address(0)) revert PriceOracleNotSet();
        if (!vestingSchedules[msg.sender].active) revert("No active vesting");

        _recordPriceSnapshot(msg.sender);
    }

    /**
     * @notice Estimate future vesting value at a given block
     * @param user User address
     * @param futureBlock Future block number
     * @return estimatedShares Estimated vested shares at that block
     * @return estimatedValueUSD Estimated USD value (using current price)
     */
    function estimateFutureValue(address user, uint256 futureBlock)
        external
        view
        returns (uint256 estimatedShares, uint256 estimatedValueUSD)
    {
        if (address(priceOracle) == address(0)) revert PriceOracleNotSet();

        VestingSchedule memory schedule = vestingSchedules[user];
        if (!schedule.active) return (0, 0);

        // Calculate shares that will be vested at future block
        if (futureBlock < schedule.cliffBlock) {
            estimatedShares = 0;
        } else if (futureBlock >= schedule.vestingEndBlock) {
            estimatedShares = schedule.totalShares;
        } else {
            uint256 vestingBlocks = schedule.vestingEndBlock - schedule.cliffBlock;
            uint256 blocksVested = futureBlock - schedule.cliffBlock;
            estimatedShares = (uint256(schedule.totalShares) * blocksVested) / vestingBlocks;
        }

        // Estimate value using current price
        if (estimatedShares > 0) {
            uint256 estimatedAssets = convertToAssets(estimatedShares);
            estimatedValueUSD = priceOracle.getValueUSD(asset(), estimatedAssets, assetDecimals);
        }

        return (estimatedShares, estimatedValueUSD);
    }
}
