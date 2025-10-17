// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../DilithiumVerifier.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ZKProofOracle
 * @notice On-chain oracle for off-chain ZK-SNARK proof generation (Dilithium signatures)
 * @dev Similar to Chainlink VRF but for ZK proof generation
 *
 * Usage Flow:
 * 1. Consumer contract calls requestProof() with payment
 * 2. Oracle operator listens for ProofRequested event
 * 3. Operator generates proof off-chain via Vercel API
 * 4. Operator submits proof via fulfillProof()
 * 5. Proof is verified on-chain using Groth16Verifier
 * 6. Consumer's callback is triggered with verified proof
 */
contract ZKProofOracle is Ownable, ReentrancyGuard, Pausable {
    // ============ State Variables ============

    Groth16Verifier public immutable verifier;

    /// @notice Fee per proof request (in wei)
    uint256 public proofFee = 0.001 ether;

    /// @notice Minimum confirmations before fulfilling (for multi-operator future)
    uint256 public requiredConfirmations = 1;

    /// @notice Oracle operators authorized to fulfill proofs
    mapping(address => bool) public operators;

    /// @notice Request tracking
    mapping(bytes32 => ProofRequest) public requests;

    /// @notice Subscription balances (prepaid model)
    mapping(address => uint256) public subscriptions;

    /// @notice Whitelisted addresses that can use oracle for free
    mapping(address => bool) public freeUsers;

    /// @notice Used request IDs for replay protection
    mapping(bytes32 => bool) public usedRequestIds;

    /// @notice Request expiration time (default 1 hour)
    uint256 public requestExpiration = 1 hours;

    /// @notice Revenue collected
    uint256 public totalRevenue;

    // ============ Structs & Enums ============

    enum ProofStatus {
        Pending,
        Fulfilled,
        Failed
    }

    struct ProofRequest {
        address requester;
        bytes32 messageHash;
        bytes32 publicKeyHash;
        bytes message;
        bytes signature;
        bytes publicKey;
        uint256 timestamp;
        ProofStatus status;
        bytes proof;
        uint256[3] publicSignals;
    }

    // ============ Events ============

    event ProofRequested(
        bytes32 indexed requestId,
        address indexed requester,
        bytes32 messageHash,
        bytes32 publicKeyHash
    );

    event ProofFulfilled(
        bytes32 indexed requestId,
        address indexed requester,
        bytes proof,
        uint256[3] publicSignals
    );

    event ProofFailed(bytes32 indexed requestId, string reason);

    event OperatorAdded(address indexed operator);
    event OperatorRemoved(address indexed operator);
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event SubscriptionDeposit(address indexed subscriber, uint256 amount);
    event SubscriptionWithdrawal(address indexed subscriber, uint256 amount);
    event FreeUserAdded(address indexed user);
    event FreeUserRemoved(address indexed user);

    // ============ Errors ============

    error InsufficientPayment();
    error InvalidRequest();
    error UnauthorizedOperator();
    error ProofVerificationFailed();
    error InvalidProofStatus();
    error InsufficientSubscription();

    // ============ Constructor ============

    constructor(address _verifier) Ownable(msg.sender) {
        verifier = Groth16Verifier(_verifier);
        operators[msg.sender] = true;
    }

    // ============ Core Functions ============

    /**
     * @notice Request a ZK proof for a Dilithium signature (pay-per-use)
     * @param message The message that was signed
     * @param signature The Dilithium signature bytes
     * @param publicKey The Dilithium public key bytes
     * @return requestId Unique identifier for this proof request
     */
    function requestProof(
        bytes memory message,
        bytes memory signature,
        bytes memory publicKey
    ) external payable nonReentrant whenNotPaused returns (bytes32 requestId) {
        // Check if user is whitelisted for free usage
        if (!freeUsers[msg.sender]) {
            if (msg.value < proofFee) revert InsufficientPayment();
            totalRevenue += proofFee;
        }

        requestId = keccak256(
            abi.encodePacked(
                msg.sender,
                block.timestamp,
                block.number,
                message,
                signature
            )
        );

        if (requests[requestId].timestamp != 0) revert InvalidRequest();

        requests[requestId] = ProofRequest({
            requester: msg.sender,
            messageHash: keccak256(message),
            publicKeyHash: keccak256(publicKey),
            message: message,
            signature: signature,
            publicKey: publicKey,
            timestamp: block.timestamp,
            status: ProofStatus.Pending,
            proof: "",
            publicSignals: [uint256(0), uint256(0), uint256(0)]
        });

        emit ProofRequested(
            requestId,
            msg.sender,
            keccak256(message),
            keccak256(publicKey)
        );

        // Refund excess payment
        if (msg.value > proofFee) {
            payable(msg.sender).transfer(msg.value - proofFee);
        }

        return requestId;
    }

    /**
     * @notice Request proof using prepaid subscription balance
     * @param message The message that was signed
     * @param signature The Dilithium signature bytes
     * @param publicKey The Dilithium public key bytes
     * @return requestId Unique identifier for this proof request
     */
    function requestProofWithSubscription(
        bytes memory message,
        bytes memory signature,
        bytes memory publicKey
    ) external nonReentrant whenNotPaused returns (bytes32 requestId) {
        if (subscriptions[msg.sender] < proofFee) revert InsufficientSubscription();

        subscriptions[msg.sender] -= proofFee;
        totalRevenue += proofFee;

        requestId = keccak256(
            abi.encodePacked(
                msg.sender,
                block.timestamp,
                block.number,
                message,
                signature
            )
        );

        requests[requestId] = ProofRequest({
            requester: msg.sender,
            messageHash: keccak256(message),
            publicKeyHash: keccak256(publicKey),
            message: message,
            signature: signature,
            publicKey: publicKey,
            timestamp: block.timestamp,
            status: ProofStatus.Pending,
            proof: "",
            publicSignals: [uint256(0), uint256(0), uint256(0)]
        });

        emit ProofRequested(
            requestId,
            msg.sender,
            keccak256(message),
            keccak256(publicKey)
        );

        return requestId;
    }

    /**
     * @notice Fulfill a proof request (called by oracle operator)
     * @param requestId The request ID to fulfill
     * @param _pA Proof point A
     * @param _pB Proof point B
     * @param _pC Proof point C
     * @param _pubSignals Public signals [message_hash, public_key_hash, is_valid]
     */
    function fulfillProof(
        bytes32 requestId,
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[3] calldata _pubSignals
    ) external nonReentrant {
        if (!operators[msg.sender]) revert UnauthorizedOperator();

        ProofRequest storage request = requests[requestId];
        if (request.status != ProofStatus.Pending) revert InvalidProofStatus();

        // Replay protection
        require(!usedRequestIds[requestId], "Request already fulfilled");

        // Expiration check
        require(
            block.timestamp < request.timestamp + requestExpiration,
            "Request expired"
        );

        usedRequestIds[requestId] = true;

        // Verify the proof on-chain
        bool valid = verifier.verifyProof(_pA, _pB, _pC, _pubSignals);
        if (!valid) revert ProofVerificationFailed();

        // Encode proof for storage
        bytes memory proofBytes = abi.encode(_pA, _pB, _pC);

        request.proof = proofBytes;
        request.publicSignals = _pubSignals;
        request.status = ProofStatus.Fulfilled;

        emit ProofFulfilled(requestId, request.requester, proofBytes, _pubSignals);

        // Callback to consumer contract (if it implements the interface)
        try IProofConsumer(request.requester).handleProof(requestId, proofBytes, _pubSignals) {
            // Success
        } catch {
            // Consumer doesn't implement callback, that's ok
        }
    }

    /**
     * @notice Mark a proof request as failed
     * @param requestId The request ID to mark as failed
     * @param reason Why the proof generation failed
     */
    function markProofFailed(bytes32 requestId, string calldata reason) external {
        if (!operators[msg.sender]) revert UnauthorizedOperator();

        ProofRequest storage request = requests[requestId];
        if (request.status != ProofStatus.Pending) revert InvalidProofStatus();

        request.status = ProofStatus.Failed;

        emit ProofFailed(requestId, reason);

        // Refund the fee to requester
        payable(request.requester).transfer(proofFee);
    }

    // ============ Subscription Management ============

    /**
     * @notice Deposit funds for subscription-based usage
     */
    function subscribe() external payable {
        subscriptions[msg.sender] += msg.value;
        emit SubscriptionDeposit(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw unused subscription balance
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
     * @notice Add an oracle operator
     * @param operator Address to authorize
     */
    function addOperator(address operator) external onlyOwner {
        operators[operator] = true;
        emit OperatorAdded(operator);
    }

    /**
     * @notice Remove an oracle operator
     * @param operator Address to remove
     */
    function removeOperator(address operator) external onlyOwner {
        operators[operator] = false;
        emit OperatorRemoved(operator);
    }

    /**
     * @notice Update the proof fee
     * @param newFee New fee in wei
     */
    function setProofFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1 ether, "Fee too high"); // Max 1 ETH
        uint256 oldFee = proofFee;
        proofFee = newFee;
        emit FeeUpdated(oldFee, newFee);
    }

    /**
     * @notice Update request expiration time
     * @param newExpiration New expiration in seconds
     */
    function setRequestExpiration(uint256 newExpiration) external onlyOwner {
        require(newExpiration >= 5 minutes, "Expiration too short");
        require(newExpiration <= 24 hours, "Expiration too long");
        requestExpiration = newExpiration;
    }

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

    /**
     * @notice Withdraw collected revenue
     * @param amount Amount to withdraw
     */
    function withdrawRevenue(uint256 amount) external onlyOwner {
        require(amount <= totalRevenue, "Insufficient revenue");
        totalRevenue -= amount;
        payable(owner()).transfer(amount);
    }

    /**
     * @notice Pause the oracle in case of emergency
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the oracle
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ View Functions ============

    /**
     * @notice Get request details
     * @param requestId The request ID
     * @return request The full request struct
     */
    function getRequest(bytes32 requestId) external view returns (ProofRequest memory) {
        return requests[requestId];
    }

    /**
     * @notice Check if a request is fulfilled
     * @param requestId The request ID
     * @return fulfilled True if fulfilled
     */
    function isRequestFulfilled(bytes32 requestId) external view returns (bool) {
        return requests[requestId].status == ProofStatus.Fulfilled;
    }
}

/**
 * @title IProofConsumer
 * @notice Interface for contracts that consume ZK proofs
 */
interface IProofConsumer {
    /**
     * @notice Callback function called when proof is ready
     * @param requestId The request ID
     * @param proof The serialized proof
     * @param publicSignals The public signals [message_hash, pk_hash, is_valid]
     */
    function handleProof(
        bytes32 requestId,
        bytes memory proof,
        uint256[3] memory publicSignals
    ) external;
}
