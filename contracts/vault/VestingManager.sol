// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

/// @title VestingManager
/// @notice Manages time-locked vesting schedules for multiple beneficiaries
/// @dev Supports linear and cliff-based vesting
contract VestingManager is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    /// @notice Vesting schedule structure
    struct VestingSchedule {
        address beneficiary;        // Who receives the tokens
        uint256 totalAmount;        // Total tokens to be vested
        uint256 releasedAmount;     // Tokens already released
        uint64 startTimestamp;      // Vesting start time
        uint64 cliffDuration;       // Cliff period in seconds
        uint64 vestingDuration;     // Total vesting duration
        bool revocable;             // Can the schedule be revoked
        bool revoked;               // Has it been revoked
    }

    /// @notice The token being vested
    IERC20 public immutable token;

    /// @notice Counter for vesting schedule IDs
    uint256 public nextScheduleId;

    /// @notice Mapping of schedule ID to vesting schedule
    mapping(uint256 => VestingSchedule) public vestingSchedules;

    /// @notice Mapping of beneficiary to their schedule IDs
    mapping(address => uint256[]) public beneficiarySchedules;

    /// @notice Emitted when a vesting schedule is created
    event VestingScheduleCreated(
        uint256 indexed scheduleId,
        address indexed beneficiary,
        uint256 amount,
        uint64 startTimestamp,
        uint64 cliffDuration,
        uint64 vestingDuration,
        bool revocable
    );

    /// @notice Emitted when tokens are released
    event TokensReleased(
        uint256 indexed scheduleId,
        address indexed beneficiary,
        uint256 amount
    );

    /// @notice Emitted when a schedule is revoked
    event VestingScheduleRevoked(
        uint256 indexed scheduleId,
        address indexed beneficiary,
        uint256 unvestedAmount
    );

    /// @notice Constructor
    /// @param _token The token to be vested
    constructor(IERC20 _token) Ownable(msg.sender) {
        require(address(_token) != address(0), "Invalid token");
        token = _token;
    }

    /// @notice Create a new vesting schedule
    /// @param beneficiary Who will receive the vested tokens
    /// @param amount Total amount to vest
    /// @param cliffDuration Cliff period in seconds
    /// @param vestingDuration Total vesting duration in seconds
    /// @param revocable Can this schedule be revoked
    /// @return scheduleId The ID of the created schedule
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint64 cliffDuration,
        uint64 vestingDuration,
        bool revocable
    ) external returns (uint256 scheduleId) {
        return createVestingScheduleWithStartTime(
            beneficiary,
            amount,
            uint64(block.timestamp),
            cliffDuration,
            vestingDuration,
            revocable
        );
    }

    function createVestingScheduleWithStartTime(
        address beneficiary,
        uint256 amount,
        uint64 startTimestamp,
        uint64 cliffDuration,
        uint64 vestingDuration,
        bool revocable
    ) public returns (uint256 scheduleId) {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(amount > 0, "Amount must be > 0");
        require(vestingDuration > 0, "Duration must be > 0");
        require(cliffDuration <= vestingDuration, "Cliff exceeds duration");
        require(startTimestamp <= block.timestamp, "Start time cannot be in future");

        // Transfer tokens to this contract
        token.safeTransferFrom(msg.sender, address(this), amount);

        // Create schedule
        scheduleId = nextScheduleId++;
        vestingSchedules[scheduleId] = VestingSchedule({
            beneficiary: beneficiary,
            totalAmount: amount,
            releasedAmount: 0,
            startTimestamp: startTimestamp,
            cliffDuration: cliffDuration,
            vestingDuration: vestingDuration,
            revocable: revocable,
            revoked: false
        });

        beneficiarySchedules[beneficiary].push(scheduleId);

        emit VestingScheduleCreated(
            scheduleId,
            beneficiary,
            amount,
            startTimestamp,
            cliffDuration,
            vestingDuration,
            revocable
        );

        return scheduleId;
    }

    /// @notice Release vested tokens for a schedule
    /// @param scheduleId The vesting schedule ID
    function release(uint256 scheduleId) external nonReentrant {
        VestingSchedule storage schedule = vestingSchedules[scheduleId];
        require(schedule.beneficiary != address(0), "Schedule does not exist");
        // Anyone can trigger release, but tokens go to beneficiary
        require(!schedule.revoked, "Schedule revoked");

        uint256 releasable = _releasableAmount(scheduleId);
        require(releasable > 0, "No tokens to release");

        schedule.releasedAmount += releasable;
        token.safeTransfer(schedule.beneficiary, releasable);

        emit TokensReleased(scheduleId, schedule.beneficiary, releasable);
    }

    /// @notice Revoke a vesting schedule
    /// @param scheduleId The schedule to revoke
    function revoke(uint256 scheduleId) external onlyOwner {
        VestingSchedule storage schedule = vestingSchedules[scheduleId];
        require(schedule.beneficiary != address(0), "Schedule does not exist");
        require(schedule.revocable, "Schedule not revocable");
        require(!schedule.revoked, "Already revoked");

        uint256 releasable = _releasableAmount(scheduleId);
        uint256 unvested = schedule.totalAmount - schedule.releasedAmount - releasable;

        schedule.revoked = true;

        // Transfer unvested tokens back to owner
        if (unvested > 0) {
            token.safeTransfer(owner(), unvested);
        }

        // Release any vested tokens to beneficiary
        if (releasable > 0) {
            schedule.releasedAmount += releasable;
            token.safeTransfer(schedule.beneficiary, releasable);
        }

        emit VestingScheduleRevoked(scheduleId, schedule.beneficiary, unvested);
    }

    /// @notice Calculate releasable amount for a schedule
    /// @param scheduleId The schedule ID
    /// @return Amount of tokens that can be released
    function _releasableAmount(uint256 scheduleId) internal view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[scheduleId];

        if (schedule.revoked) {
            return 0;
        }

        uint256 vestedAmount = _vestedAmount(scheduleId);
        return vestedAmount - schedule.releasedAmount;
    }

    /// @notice Calculate vested amount for a schedule
    /// @param scheduleId The schedule ID
    /// @return Amount of tokens vested
    function _vestedAmount(uint256 scheduleId) internal view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[scheduleId];

        uint64 cliffEnd = schedule.startTimestamp + schedule.cliffDuration;
        uint64 vestingEnd = schedule.startTimestamp + schedule.vestingDuration;

        // Before cliff
        if (block.timestamp < cliffEnd) {
            return 0;
        }

        // After full vesting
        if (block.timestamp >= vestingEnd) {
            return schedule.totalAmount;
        }

        // Linear vesting between cliff and end
        uint256 vestingPeriod = vestingEnd - cliffEnd;
        uint256 timeVested = block.timestamp - cliffEnd;

        return (schedule.totalAmount * timeVested) / vestingPeriod;
    }

    /// @notice Get vested amount for a schedule (external)
    /// @param scheduleId The schedule ID
    /// @return Amount vested
    function getVestedAmount(uint256 scheduleId) external view returns (uint256) {
        return _vestedAmount(scheduleId);
    }

    /// @notice Get releasable amount for a schedule (external)
    /// @param scheduleId The schedule ID
    /// @return Amount releasable
    function getReleasableAmount(uint256 scheduleId) external view returns (uint256) {
        return _releasableAmount(scheduleId);
    }

    /// @notice Get all schedule IDs for a beneficiary
    /// @param beneficiary The beneficiary address
    /// @return Array of schedule IDs
    function getBeneficiarySchedules(address beneficiary) external view returns (uint256[] memory) {
        return beneficiarySchedules[beneficiary];
    }
}
