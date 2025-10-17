// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../oracles/ZKProofOracle.sol";
import "../oracles/QRNGOracle.sol";

/**
 * @title OracleConsumerExample
 * @notice Example contract showing how to use ZKProofOracle and QRNGOracle
 * @dev Demonstrates both pay-per-use and subscription models
 */
contract OracleConsumerExample is IProofConsumer, IRandomnessConsumer {
    ZKProofOracle public zkOracle;
    QRNGOracle public qrngOracle;

    // Track requests
    mapping(bytes32 => bool) public proofRequests;
    mapping(bytes32 => bool) public randomnessRequests;

    // Results
    mapping(bytes32 => bytes) public proofResults;
    mapping(bytes32 => uint256) public randomResults;

    event ProofRequestSent(bytes32 indexed requestId);
    event ProofReceived(bytes32 indexed requestId, bool isValid);
    event RandomnessRequestSent(bytes32 indexed requestId);
    event RandomnessReceived(bytes32 indexed requestId, uint256 randomness);

    constructor(address _zkOracle, address _qrngOracle) {
        zkOracle = ZKProofOracle(_zkOracle);
        qrngOracle = QRNGOracle(_qrngOracle);
    }

    // ============ ZK Proof Usage Examples ============

    /**
     * @notice Request ZK proof verification (pay-per-use)
     * @param message The message that was signed
     * @param signature The Dilithium signature
     * @param publicKey The Dilithium public key
     */
    function requestProofVerification(
        bytes memory message,
        bytes memory signature,
        bytes memory publicKey
    ) external payable returns (bytes32 requestId) {
        // Forward payment to oracle
        requestId = zkOracle.requestProof{value: msg.value}(
            message,
            signature,
            publicKey
        );

        proofRequests[requestId] = true;
        emit ProofRequestSent(requestId);

        return requestId;
    }

    /**
     * @notice Request proof using subscription
     */
    function requestProofWithSub(
        bytes memory message,
        bytes memory signature,
        bytes memory publicKey
    ) external returns (bytes32 requestId) {
        requestId = zkOracle.requestProofWithSubscription(
            message,
            signature,
            publicKey
        );

        proofRequests[requestId] = true;
        emit ProofRequestSent(requestId);

        return requestId;
    }

    /**
     * @notice Callback from ZKProofOracle (implements IProofConsumer)
     */
    function handleProof(
        bytes32 requestId,
        bytes memory proof,
        uint256[3] memory publicSignals
    ) external override {
        require(msg.sender == address(zkOracle), "Only oracle");
        require(proofRequests[requestId], "Unknown request");

        proofResults[requestId] = proof;

        // publicSignals[2] is the is_valid flag (0 or 1)
        bool isValid = publicSignals[2] == 1;

        emit ProofReceived(requestId, isValid);

        // Your business logic here
        if (isValid) {
            // Signature is valid, proceed with action
        } else {
            // Signature is invalid, reject
        }
    }

    // ============ QRNG Usage Examples ============

    /**
     * @notice Request quantum random number
     * @param seed Optional user seed for additional entropy
     */
    function requestRandomNumber(bytes32 seed) external payable returns (bytes32 requestId) {
        requestId = qrngOracle.requestRandomness{value: msg.value}(seed);

        randomnessRequests[requestId] = true;
        emit RandomnessRequestSent(requestId);

        return requestId;
    }

    /**
     * @notice Request multiple random numbers (more efficient)
     */
    function requestMultipleRandom(uint256 count) external payable returns (bytes32[] memory requestIds) {
        bytes32 seed = keccak256(abi.encodePacked(block.timestamp, msg.sender));
        requestIds = qrngOracle.requestMultipleRandomness{value: msg.value}(count, seed);

        for (uint256 i = 0; i < requestIds.length; i++) {
            randomnessRequests[requestIds[i]] = true;
            emit RandomnessRequestSent(requestIds[i]);
        }

        return requestIds;
    }

    /**
     * @notice Callback from QRNGOracle (implements IRandomnessConsumer)
     */
    function handleRandomness(bytes32 requestId, uint256 randomness) external override {
        require(msg.sender == address(qrngOracle), "Only oracle");
        require(randomnessRequests[requestId], "Unknown request");

        randomResults[requestId] = randomness;
        emit RandomnessReceived(requestId, randomness);

        // Your business logic here
        // Example: Use randomness for lottery, NFT traits, game mechanics, etc.
    }

    // ============ Subscription Management ============

    /**
     * @notice Subscribe to ZK Proof Oracle for discounted rates
     */
    function subscribeToZKOracle() external payable {
        zkOracle.subscribe{value: msg.value}();
    }

    /**
     * @notice Subscribe to QRNG Oracle
     */
    function subscribeToQRNG() external payable {
        qrngOracle.subscribe{value: msg.value}();
    }

    // ============ View Functions ============

    function getProofResult(bytes32 requestId) external view returns (bytes memory) {
        return proofResults[requestId];
    }

    function getRandomResult(bytes32 requestId) external view returns (uint256) {
        return randomResults[requestId];
    }

    /**
     * @notice Get random number in a specific range
     * @param requestId The fulfilled request ID
     * @param min Minimum value (inclusive)
     * @param max Maximum value (inclusive)
     */
    function getRandomInRange(
        bytes32 requestId,
        uint256 min,
        uint256 max
    ) external view returns (uint256) {
        return qrngOracle.getRandomInRange(requestId, min, max);
    }

    // Allow contract to receive ETH
    receive() external payable {}
}

/**
 * USAGE EXAMPLE:
 *
 * // 1. Deploy consumer contract
 * OracleConsumerExample consumer = new OracleConsumerExample(zkOracleAddr, qrngOracleAddr);
 *
 * // 2a. Request ZK proof (pay-per-use)
 * bytes32 proofReqId = consumer.requestProofVerification{value: 0.001 ether}(msg, sig, pk);
 *
 * // 2b. Or subscribe first for discount
 * consumer.subscribeToZKOracle{value: 0.05 ether}(); // 50 proofs prepaid
 * bytes32 proofReqId = consumer.requestProofWithSub(msg, sig, pk);
 *
 * // 3. Wait for callback
 * // handleProof() will be called automatically by oracle
 *
 * // 4. Request quantum random number
 * bytes32 randReqId = consumer.requestRandomNumber{value: 0.0005 ether}(seed);
 *
 * // 5. Wait for callback
 * // handleRandomness() will be called automatically
 *
 * // 6. Use the random number
 * uint256 diceRoll = consumer.getRandomInRange(randReqId, 1, 6);
 */
