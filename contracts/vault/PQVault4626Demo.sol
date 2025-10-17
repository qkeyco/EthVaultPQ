// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {PQVault4626} from "./PQVault4626.sol";
import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title PQVault4626Demo
/// @notice Demo version of PQVault4626 with ACCELERATED vesting for testing/demonstrations
/// @dev WARNING: For demonstration ONLY. Uses 60x acceleration (1 month per minute).
///      DO NOT use for production. Inherits all security features from PQVault4626.
///
/// Time Acceleration:
/// - 1 minute real-time = 1 hour in demo
/// - 60 minutes (1 hour) = 60 hours (2.5 days) in demo
/// - 1 day (1440 min) = 1440 hours (60 days / 2 months) in demo
/// - Therefore: ~30 minutes real-time = 1 month vesting
///
/// Example Vesting Periods (real-time):
/// - 1 month vesting = ~30 minutes
/// - 3 month vesting = ~1.5 hours
/// - 6 month vesting = ~3 hours
/// - 1 year vesting = ~6 hours
///
/// Perfect for:
/// - Live demonstrations
/// - Quick testing
/// - User education
/// - Conference demos
contract PQVault4626Demo is PQVault4626 {
    /// @notice Acceleration factor: Each block represents 60x normal time
    /// @dev Block time is effectively 12 seconds * 60 = 720 seconds (12 minutes)
    ///      This means vesting that would take 30 days takes 30 minutes!
    uint256 public constant ACCELERATION_FACTOR = 60;

    /// @notice Accelerated block time (12 seconds * 60 = 720 seconds = 12 minutes)
    uint256 public constant DEMO_BLOCK_TIME = BLOCK_TIME * ACCELERATION_FACTOR;

    /// @notice Flag to indicate this is a demo contract
    bool public constant IS_DEMO = true;

    /// @notice Demo description
    string public constant DEMO_DESCRIPTION = "Fast-forward vesting: 1 month per 30 minutes";

    /// @notice Constructor
    /// @param asset_ The underlying ERC20 asset
    /// @param name_ The name of the vault token
    /// @param symbol_ The symbol of the vault token
    constructor(
        IERC20 asset_,
        string memory name_,
        string memory symbol_
    ) PQVault4626(asset_, name_, symbol_) {}

    /// @notice Deposit assets with ACCELERATED vesting schedule
    /// @dev Override to use accelerated block time calculations
    /// @param assets Amount of assets to deposit
    /// @param receiver Address receiving the shares
    /// @param vestingDuration Total vesting duration in seconds (will be accelerated)
    /// @param cliffDuration Cliff period in seconds (will be accelerated)
    /// @return shares Amount of shares minted
    function depositWithVesting(
        uint256 assets,
        address receiver,
        uint256 vestingDuration,
        uint256 cliffDuration
    ) external override returns (uint256 shares) {
        require(assets > 0, "Cannot deposit 0");
        require(receiver != address(0), "Invalid receiver");
        require(vestingDuration > 0, "Invalid vesting duration");
        require(vestingDuration <= 10 * 365 days, "Vesting too long"); // Max 10 years
        require(cliffDuration <= vestingDuration, "Cliff exceeds vesting");
        require(!vestingSchedules[receiver].active, "Vesting already active");

        // Convert time durations to ACCELERATED block counts
        // Each block represents DEMO_BLOCK_TIME instead of BLOCK_TIME
        uint256 vestingBlocks = vestingDuration / DEMO_BLOCK_TIME;
        uint256 cliffBlocks = cliffDuration / DEMO_BLOCK_TIME;

        // Prevent overflow in block number calculations
        require(block.number + vestingBlocks < type(uint64).max, "Block number overflow");

        // Calculate shares
        shares = previewDeposit(assets);
        require(shares > 0, "Zero shares");
        require(shares <= type(uint128).max, "Shares overflow");

        // Transfer assets from sender
        SafeERC20.safeTransferFrom(IERC20(asset()), msg.sender, address(this), assets);

        // Mint shares to this contract (held until vested)
        _mint(address(this), shares);

        // Create ACCELERATED vesting schedule using block numbers
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

        return shares;
    }

    /// @notice Get demo vesting time estimates
    /// @param vestingDuration Desired vesting duration in normal time
    /// @return realTimeMinutes Approximate real-time duration in minutes
    /// @return demoBlocks Number of blocks required
    function getDemoTimeEstimate(uint256 vestingDuration)
        external
        pure
        returns (uint256 realTimeMinutes, uint256 demoBlocks)
    {
        demoBlocks = vestingDuration / DEMO_BLOCK_TIME;
        // Each block is 12 seconds, so total seconds = blocks * 12
        // Then convert to minutes
        realTimeMinutes = (demoBlocks * BLOCK_TIME) / 60;
        return (realTimeMinutes, demoBlocks);
    }

    /// @notice Get vesting information with demo context
    /// @param user The user address
    /// @return totalShares Total shares in vesting
    /// @return vestedShares Currently vested shares
    /// @return withdrawnShares Already withdrawn shares
    /// @return cliffBlock Cliff end block number
    /// @return vestingEndBlock Full vesting end block number
    /// @return isDemo Always true for this contract
    /// @return accelerationFactor The acceleration multiplier
    function getVestingInfoDemo(address user)
        external
        view
        returns (
            uint256 totalShares,
            uint256 vestedShares,
            uint256 withdrawnShares,
            uint256 cliffBlock,
            uint256 vestingEndBlock,
            bool isDemo,
            uint256 accelerationFactor
        )
    {
        VestingSchedule memory schedule = vestingSchedules[user];
        return (
            schedule.totalShares,
            _calculateVestedShares(user),
            schedule.withdrawnShares,
            schedule.cliffBlock,
            schedule.vestingEndBlock,
            IS_DEMO,
            ACCELERATION_FACTOR
        );
    }
}
