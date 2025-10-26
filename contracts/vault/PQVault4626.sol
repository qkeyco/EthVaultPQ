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
    /// @dev Using block numbers instead of timestamps to prevent miner manipulation
    struct VestingSchedule {
        uint128 totalShares;        // Total shares vested
        uint128 withdrawnShares;    // Shares already withdrawn
        uint64 cliffBlock;          // Cliff period end (block number)
        uint64 vestingEndBlock;     // Full vesting end (block number)
        uint64 startBlock;          // Vesting start (block number)
        bool active;                // Is vesting active
    }

    /// @notice Average block time in seconds (12 seconds for Ethereum mainnet)
    uint256 public constant BLOCK_TIME = 12;

    /// @notice Virtual shares to prevent ERC-4626 inflation attack
    /// @dev See: https://docs.openzeppelin.com/contracts/4.x/erc4626#inflation-attack
    uint256 private constant VIRTUAL_SHARES = 1e3; // 1000 virtual shares
    uint256 private constant VIRTUAL_ASSETS = 1;   // 1 wei virtual asset

    /// @notice Minimum deposit to prevent dust attacks
    uint256 public constant MIN_DEPOSIT = 1e15; // 0.001 ETH minimum

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
    ) ERC4626(asset_) ERC20(name_, symbol_) Ownable(msg.sender) {
        // Mint virtual shares to dead address to prevent inflation attack
        // This ensures first depositor can't manipulate share price
        _mint(address(0xdead), VIRTUAL_SHARES);
    }

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
    ) external virtual nonReentrant whenNotPaused returns (uint256 shares) {
        require(assets > 0, "Cannot deposit 0");
        require(assets >= MIN_DEPOSIT, "Deposit below minimum"); // Prevent dust/inflation attacks
        require(receiver != address(0), "Invalid receiver");
        require(vestingDuration > 0, "Invalid vesting duration");
        require(vestingDuration <= 10 * 365 days, "Vesting too long"); // Max 10 years
        require(cliffDuration <= vestingDuration, "Cliff exceeds vesting");
        require(!vestingSchedules[receiver].active, "Vesting already active");

        // Convert time durations to block counts (more manipulation-resistant)
        uint256 vestingBlocks = vestingDuration / BLOCK_TIME;
        uint256 cliffBlocks = cliffDuration / BLOCK_TIME;

        // Prevent overflow in block number calculations
        require(block.number + vestingBlocks < type(uint64).max, "Block number overflow");

        // Calculate shares
        shares = previewDeposit(assets);
        require(shares > 0, "Zero shares");
        require(shares <= type(uint128).max, "Shares overflow"); // Prevent overflow in VestingSchedule

        // Transfer assets from sender
        SafeERC20.safeTransferFrom(IERC20(asset()), msg.sender, address(this), assets);

        // Mint shares to this contract (held until vested)
        _mint(address(this), shares);

        // Create vesting schedule using block numbers
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

    /// @notice Withdraw vested shares
    /// @param shares Amount of shares to withdraw
    /// @return assets Amount of assets received
    function withdrawVested(uint256 shares) public virtual nonReentrant returns (uint256 assets) {
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
    /// @return cliffBlock Cliff end block number
    /// @return vestingEndBlock Full vesting end block number
    function getVestingInfo(address user)
        external
        view
        returns (
            uint256 totalShares,
            uint256 vestedShares,
            uint256 withdrawnShares,
            uint256 cliffBlock,
            uint256 vestingEndBlock
        )
    {
        VestingSchedule memory schedule = vestingSchedules[user];
        return (
            schedule.totalShares,
            _calculateVestedShares(user),
            schedule.withdrawnShares,
            schedule.cliffBlock,
            schedule.vestingEndBlock
        );
    }

    /// @notice Calculate vested shares for a user
    /// @param user The user address
    /// @return Amount of vested shares
    /// @dev Uses block numbers instead of timestamps to prevent miner manipulation
    function _calculateVestedShares(address user) internal view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[user];

        if (!schedule.active) {
            return 0;
        }

        // Before cliff block, nothing is vested
        if (block.number < schedule.cliffBlock) {
            return 0;
        }

        // After vesting end block, everything is vested
        if (block.number >= schedule.vestingEndBlock) {
            return schedule.totalShares;
        }

        // Linear vesting between cliff and end (by block number)
        uint256 vestingBlocks = schedule.vestingEndBlock - schedule.cliffBlock;
        uint256 blocksVested = block.number - schedule.cliffBlock;

        return (uint256(schedule.totalShares) * blocksVested) / vestingBlocks;
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
        virtual
        override
        whenNotPaused
        returns (uint256)
    {
        require(assets >= MIN_DEPOSIT, "Deposit below minimum"); // Prevent inflation attack
        return super.deposit(assets, receiver);
    }

    /// @notice Override mint to add pause check and minimum deposit
    function mint(uint256 shares, address receiver)
        public
        virtual
        override
        whenNotPaused
        returns (uint256)
    {
        uint256 assets = previewMint(shares);
        require(assets >= MIN_DEPOSIT, "Mint below minimum"); // Prevent inflation attack
        return super.mint(shares, receiver);
    }
}
