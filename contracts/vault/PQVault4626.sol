// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC4626} from "lib/openzeppelin-contracts/contracts/token/ERC20/extensions/ERC4626.sol";
import {ERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "lib/openzeppelin-contracts/contracts/utils/Pausable.sol";
import {Ownable} from "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

/// @title PQVault4626
/// @notice ERC-4626 tokenized vault with vesting schedules for PQ wallets
/// @dev Extends OpenZeppelin's ERC4626 with time-locked vesting functionality
contract PQVault4626 is ERC4626, ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    /// @notice Vesting schedule for a depositor
    struct VestingSchedule {
        uint128 totalShares;        // Total shares vested
        uint128 withdrawnShares;    // Shares already withdrawn
        uint64 cliffTimestamp;      // Cliff period end
        uint64 vestingEnd;          // Full vesting timestamp
        uint64 startTimestamp;      // Vesting start time
        bool active;                // Is vesting active
    }

    /// @notice Mapping of user address to their vesting schedule
    mapping(address => VestingSchedule) public vestingSchedules;

    /// @notice Emitted when user deposits with vesting
    event DepositWithVesting(
        address indexed user,
        uint256 assets,
        uint256 shares,
        uint256 vestingDuration,
        uint256 cliffDuration
    );

    /// @notice Emitted when user withdraws vested shares
    event WithdrawVested(
        address indexed user,
        uint256 shares,
        uint256 assets
    );

    /// @notice Constructor
    /// @param asset_ The underlying ERC20 asset
    /// @param name_ The name of the vault token
    /// @param symbol_ The symbol of the vault token
    constructor(
        IERC20 asset_,
        string memory name_,
        string memory symbol_
    ) ERC4626(asset_) ERC20(name_, symbol_) Ownable(msg.sender) {}

    /// @notice Deposit assets with a vesting schedule
    /// @param assets Amount of assets to deposit
    /// @param receiver Address receiving the shares
    /// @param vestingDuration Total vesting duration in seconds
    /// @param cliffDuration Cliff period in seconds
    /// @return shares Amount of shares minted
    function depositWithVesting(
        uint256 assets,
        address receiver,
        uint256 vestingDuration,
        uint256 cliffDuration
    ) external nonReentrant whenNotPaused returns (uint256 shares) {
        require(assets > 0, "Cannot deposit 0");
        require(receiver != address(0), "Invalid receiver");
        require(vestingDuration > 0, "Invalid vesting duration");
        require(vestingDuration <= 10 * 365 days, "Vesting too long"); // Max 10 years
        require(cliffDuration <= vestingDuration, "Cliff exceeds vesting");
        require(!vestingSchedules[receiver].active, "Vesting already active");

        // Prevent overflow in timestamp calculations
        require(block.timestamp + vestingDuration < type(uint64).max, "Timestamp overflow");

        // Calculate shares
        shares = previewDeposit(assets);
        require(shares > 0, "Zero shares");
        require(shares <= type(uint128).max, "Shares overflow"); // Prevent overflow in VestingSchedule

        // Transfer assets from sender
        SafeERC20.safeTransferFrom(IERC20(asset()), msg.sender, address(this), assets);

        // Mint shares to this contract (held until vested)
        _mint(address(this), shares);

        // Create vesting schedule
        uint64 startTime = uint64(block.timestamp);
        vestingSchedules[receiver] = VestingSchedule({
            totalShares: uint128(shares),
            withdrawnShares: 0,
            cliffTimestamp: startTime + uint64(cliffDuration),
            vestingEnd: startTime + uint64(vestingDuration),
            startTimestamp: startTime,
            active: true
        });

        emit DepositWithVesting(receiver, assets, shares, vestingDuration, cliffDuration);
        emit Deposit(msg.sender, receiver, assets, shares);

        return shares;
    }

    /// @notice Withdraw vested shares
    /// @param shares Amount of shares to withdraw
    /// @return assets Amount of assets received
    function withdrawVested(uint256 shares) external nonReentrant returns (uint256 assets) {
        require(shares > 0, "Cannot withdraw 0");

        VestingSchedule storage schedule = vestingSchedules[msg.sender];
        require(schedule.active, "No active vesting");

        uint256 vestedShares = _calculateVestedShares(msg.sender);
        require(vestedShares > schedule.withdrawnShares, "No vested shares available");

        uint256 withdrawableShares = vestedShares - schedule.withdrawnShares;
        require(shares <= withdrawableShares, "Insufficient vested shares");

        // Update withdrawn shares
        schedule.withdrawnShares += uint128(shares);

        // Transfer shares from vault to user
        _transfer(address(this), msg.sender, shares);

        // Redeem shares for assets
        assets = redeem(shares, msg.sender, msg.sender);

        // If all shares withdrawn and fully vested, deactivate schedule
        if (schedule.withdrawnShares >= schedule.totalShares) {
            schedule.active = false;
        }

        emit WithdrawVested(msg.sender, shares, assets);

        return assets;
    }

    /// @notice Get vesting information for a user
    /// @param user The user address
    /// @return totalShares Total shares in vesting
    /// @return vestedShares Currently vested shares
    /// @return withdrawnShares Already withdrawn shares
    /// @return cliffTimestamp Cliff end timestamp
    /// @return vestingEnd Full vesting timestamp
    function getVestingInfo(address user)
        external
        view
        returns (
            uint256 totalShares,
            uint256 vestedShares,
            uint256 withdrawnShares,
            uint256 cliffTimestamp,
            uint256 vestingEnd
        )
    {
        VestingSchedule memory schedule = vestingSchedules[user];
        return (
            schedule.totalShares,
            _calculateVestedShares(user),
            schedule.withdrawnShares,
            schedule.cliffTimestamp,
            schedule.vestingEnd
        );
    }

    /// @notice Calculate vested shares for a user
    /// @param user The user address
    /// @return Amount of vested shares
    function _calculateVestedShares(address user) internal view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[user];

        if (!schedule.active) {
            return 0;
        }

        // Before cliff, nothing is vested
        if (block.timestamp < schedule.cliffTimestamp) {
            return 0;
        }

        // After vesting end, everything is vested
        if (block.timestamp >= schedule.vestingEnd) {
            return schedule.totalShares;
        }

        // Linear vesting between cliff and end
        uint256 vestingDuration = schedule.vestingEnd - schedule.cliffTimestamp;
        uint256 timeVested = block.timestamp - schedule.cliffTimestamp;

        return (uint256(schedule.totalShares) * timeVested) / vestingDuration;
    }

    /// @notice Emergency pause
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Override deposit to add pause check
    function deposit(uint256 assets, address receiver)
        public
        override
        whenNotPaused
        returns (uint256)
    {
        return super.deposit(assets, receiver);
    }

    /// @notice Override mint to add pause check
    function mint(uint256 shares, address receiver)
        public
        override
        whenNotPaused
        returns (uint256)
    {
        return super.mint(shares, receiver);
    }
}
