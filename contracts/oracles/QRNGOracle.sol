// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title QRNGOracle
 * @notice Quantum Random Number Generator Oracle
 * @dev Provides cryptographically secure quantum random numbers from ANU Quantum Random Numbers Server
 *
 * Quantum Source: Australian National University (ANU) QRNG API
 * - Uses quantum vacuum fluctuations measured with homodyne detection
 * - True randomness from quantum mechanics (not pseudo-random)
 * - Published research: https://qrng.anu.edu.au/
 *
 * Similar to Chainlink VRF but with quantum randomness source
 *
 * Usage Flow:
 * 1. Consumer calls requestRandomness() with payment
 * 2. Oracle listens for RandomnessRequested event
 * 3. Oracle fetches quantum random from ANU QRNG API
 * 4. Oracle submits via fulfillRandomness()
 * 5. Consumer's callback is triggered with random number
 */
contract QRNGOracle is Ownable, ReentrancyGuard {
    // ============ State Variables ============

    /// @notice Fee per randomness request
    uint256 public randomnessFee = 0.0005 ether;

    /// @notice Oracle operators authorized to fulfill requests
    mapping(address => bool) public operators;

    /// @notice Request tracking
    mapping(bytes32 => RandomnessRequest) public requests;

    /// @notice Subscription balances (prepaid model)
    mapping(address => uint256) public subscriptions;

    /// @notice Whitelisted addresses that can use oracle for free
    mapping(address => bool) public freeUsers;

    /// @notice Number of random bytes per request
    uint256 public constant RANDOM_BYTES = 32; // 256 bits

    /// @notice Total revenue collected
    uint256 public totalRevenue;

    /// @notice Nonce for request ID generation
    uint256 private nonce;

    // ============ Structs & Enums ============

    enum RequestStatus {
        Pending,
        Fulfilled,
        Failed
    }

    struct RandomnessRequest {
        address requester;
        uint256 timestamp;
        RequestStatus status;
        uint256 randomness; // 256-bit quantum random number
        bytes32 seed; // Optional user seed for additional entropy
    }

    // ============ Events ============

    event RandomnessRequested(
        bytes32 indexed requestId,
        address indexed requester,
        bytes32 seed
    );

    event RandomnessFulfilled(
        bytes32 indexed requestId,
        address indexed requester,
        uint256 randomness
    );

    event RandomnessFailed(bytes32 indexed requestId, string reason);

    event OperatorAdded(address indexed operator);
    event OperatorRemoved(address indexed operator);
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event SubscriptionDeposit(address indexed subscriber, uint256 amount);
    event SubscriptionWithdrawal(address indexed subscriber, uint256 amount);
    event FreeUserAdded(address indexed user);
    event FreeUserRemoved(address indexed user);

    // ============ Errors ============

    error InsufficientPayment();
    error UnauthorizedOperator();
    error InvalidRequestStatus();
    error InsufficientSubscription();
    error InvalidRandomness();

    // ============ Constructor ============

    constructor() {
        operators[msg.sender] = true;
    }

    // ============ Core Functions ============

    /**
     * @notice Request quantum random number (pay-per-use)
     * @param seed Optional user-provided seed for additional entropy
     * @return requestId Unique identifier for this randomness request
     */
    function requestRandomness(bytes32 seed) external payable nonReentrant returns (bytes32 requestId) {
        // Check if user is whitelisted for free usage
        if (!freeUsers[msg.sender]) {
            if (msg.value < randomnessFee) revert InsufficientPayment();
            totalRevenue += randomnessFee;
        }

        requestId = keccak256(
            abi.encodePacked(
                msg.sender,
                block.timestamp,
                block.number,
                nonce++,
                seed
            )
        );

        requests[requestId] = RandomnessRequest({
            requester: msg.sender,
            timestamp: block.timestamp,
            status: RequestStatus.Pending,
            randomness: 0,
            seed: seed
        });

        emit RandomnessRequested(requestId, msg.sender, seed);

        // Refund excess payment
        if (msg.value > randomnessFee) {
            payable(msg.sender).transfer(msg.value - randomnessFee);
        }

        return requestId;
    }

    /**
     * @notice Request randomness using subscription
     * @param seed Optional user-provided seed
     * @return requestId Unique identifier
     */
    function requestRandomnessWithSubscription(bytes32 seed) external nonReentrant returns (bytes32 requestId) {
        if (subscriptions[msg.sender] < randomnessFee) revert InsufficientSubscription();

        subscriptions[msg.sender] -= randomnessFee;
        totalRevenue += randomnessFee;

        requestId = keccak256(
            abi.encodePacked(
                msg.sender,
                block.timestamp,
                block.number,
                nonce++,
                seed
            )
        );

        requests[requestId] = RandomnessRequest({
            requester: msg.sender,
            timestamp: block.timestamp,
            status: RequestStatus.Pending,
            randomness: 0,
            seed: seed
        });

        emit RandomnessRequested(requestId, msg.sender, seed);

        return requestId;
    }

    /**
     * @notice Fulfill randomness request (called by oracle operator)
     * @param requestId The request ID
     * @param randomness The quantum random number from ANU QRNG
     */
    function fulfillRandomness(
        bytes32 requestId,
        uint256 randomness
    ) external nonReentrant {
        if (!operators[msg.sender]) revert UnauthorizedOperator();

        RandomnessRequest storage request = requests[requestId];
        if (request.status != RequestStatus.Pending) revert InvalidRequestStatus();
        if (randomness == 0) revert InvalidRandomness();

        // Mix with user seed if provided
        if (request.seed != bytes32(0)) {
            randomness = uint256(keccak256(abi.encodePacked(randomness, request.seed)));
        }

        request.randomness = randomness;
        request.status = RequestStatus.Fulfilled;

        emit RandomnessFulfilled(requestId, request.requester, randomness);

        // Callback to consumer
        try IRandomnessConsumer(request.requester).handleRandomness(requestId, randomness) {
            // Success
        } catch {
            // Consumer doesn't implement callback, that's ok
        }
    }

    /**
     * @notice Mark request as failed and refund
     * @param requestId The request ID
     * @param reason Failure reason
     */
    function markRandomnessFailed(bytes32 requestId, string calldata reason) external {
        if (!operators[msg.sender]) revert UnauthorizedOperator();

        RandomnessRequest storage request = requests[requestId];
        if (request.status != RequestStatus.Pending) revert InvalidRequestStatus();

        request.status = RequestStatus.Failed;

        emit RandomnessFailed(requestId, reason);

        // Refund the fee
        payable(request.requester).transfer(randomnessFee);
    }

    // ============ Batch Randomness (for efficiency) ============

    /**
     * @notice Request multiple random numbers at once
     * @param count Number of random numbers needed
     * @param seed User seed
     * @return requestIds Array of request IDs
     */
    function requestMultipleRandomness(
        uint256 count,
        bytes32 seed
    ) external payable nonReentrant returns (bytes32[] memory requestIds) {
        uint256 totalFee = randomnessFee * count;
        if (msg.value < totalFee) revert InsufficientPayment();

        requestIds = new bytes32[](count);

        for (uint256 i = 0; i < count; i++) {
            bytes32 requestId = keccak256(
                abi.encodePacked(
                    msg.sender,
                    block.timestamp,
                    block.number,
                    nonce++,
                    seed,
                    i
                )
            );

            requests[requestId] = RandomnessRequest({
                requester: msg.sender,
                timestamp: block.timestamp,
                status: RequestStatus.Pending,
                randomness: 0,
                seed: seed
            });

            requestIds[i] = requestId;
            emit RandomnessRequested(requestId, msg.sender, seed);
        }

        totalRevenue += totalFee;

        // Refund excess
        if (msg.value > totalFee) {
            payable(msg.sender).transfer(msg.value - totalFee);
        }

        return requestIds;
    }

    // ============ Subscription Management ============

    /**
     * @notice Deposit for subscription
     */
    function subscribe() external payable {
        subscriptions[msg.sender] += msg.value;
        emit SubscriptionDeposit(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw subscription balance
     * @param amount Amount to withdraw
     */
    function withdrawSubscription(uint256 amount) external nonReentrant {
        if (subscriptions[msg.sender] < amount) revert InsufficientSubscription();

        subscriptions[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);

        emit SubscriptionWithdrawal(msg.sender, amount);
    }

    // ============ Admin Functions ============

    /**
     * @notice Add a user to the free usage whitelist (e.g., your own apps)
     * @param user Address to whitelist
     */
    function addFreeUser(address user) external onlyOwner {
        freeUsers[user] = true;
        emit FreeUserAdded(user);
    }

    /**
     * @notice Remove a user from the free usage whitelist
     * @param user Address to remove
     */
    function removeFreeUser(address user) external onlyOwner {
        freeUsers[user] = false;
        emit FreeUserRemoved(user);
    }

    function addOperator(address operator) external onlyOwner {
        operators[operator] = true;
        emit OperatorAdded(operator);
    }

    function removeOperator(address operator) external onlyOwner {
        operators[operator] = false;
        emit OperatorRemoved(operator);
    }

    function setRandomnessFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = randomnessFee;
        randomnessFee = newFee;
        emit FeeUpdated(oldFee, newFee);
    }

    function withdrawRevenue(uint256 amount) external onlyOwner {
        require(amount <= totalRevenue, "Insufficient revenue");
        totalRevenue -= amount;
        payable(owner()).transfer(amount);
    }

    // ============ View Functions ============

    function getRequest(bytes32 requestId) external view returns (RandomnessRequest memory) {
        return requests[requestId];
    }

    function isRequestFulfilled(bytes32 requestId) external view returns (bool) {
        return requests[requestId].status == RequestStatus.Fulfilled;
    }

    /**
     * @notice Get random number in a specific range
     * @param requestId The fulfilled request ID
     * @param min Minimum value (inclusive)
     * @param max Maximum value (inclusive)
     * @return Random number in range [min, max]
     */
    function getRandomInRange(
        bytes32 requestId,
        uint256 min,
        uint256 max
    ) external view returns (uint256) {
        require(requests[requestId].status == RequestStatus.Fulfilled, "Not fulfilled");
        require(max > min, "Invalid range");

        uint256 randomness = requests[requestId].randomness;
        return min + (randomness % (max - min + 1));
    }
}

/**
 * @title IRandomnessConsumer
 * @notice Interface for contracts that consume randomness
 */
interface IRandomnessConsumer {
    /**
     * @notice Callback when randomness is ready
     * @param requestId The request ID
     * @param randomness The quantum random number
     */
    function handleRandomness(bytes32 requestId, uint256 randomness) external;
}
