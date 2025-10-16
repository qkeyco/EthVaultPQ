// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IPQWallet} from "../interfaces/IPQWallet.sol";
import {IPQValidator} from "../interfaces/IPQValidator.sol";
import {PackedUserOperation} from "lib/account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import {IAccount} from "lib/account-abstraction/contracts/interfaces/IAccount.sol";
import {IEntryPoint} from "lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {ReentrancyGuard} from "lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

/// @title PQWallet
/// @notice Post-Quantum secure ERC-4337 compatible smart contract wallet
/// @dev Uses SPHINCS+ or Dilithium for signature validation
contract PQWallet is IPQWallet, IAccount, ReentrancyGuard {
    /// @notice The EntryPoint contract (ERC-4337 singleton)
    IEntryPoint public immutable entryPoint;

    /// @notice The PQ signature validator contract
    IPQValidator private immutable _validator;

    /// @notice Returns the address of the PQ validator
    function validator() external view override returns (address) {
        return address(_validator);
    }

    /// @notice The post-quantum public key for this wallet
    bytes public pqPublicKey;

    /// @notice Nonce for replay protection
    uint256 public nonce;

    /// @notice ERC-4337 signature validation failed magic value
    uint256 private constant SIG_VALIDATION_FAILED = 1;

    /// @notice Only allow calls from EntryPoint
    modifier onlyEntryPoint() {
        require(msg.sender == address(entryPoint), "Only EntryPoint");
        _;
    }

    /// @notice Only allow calls from this wallet or EntryPoint
    modifier onlyOwner() {
        require(msg.sender == address(this) || msg.sender == address(entryPoint), "Only owner");
        _;
    }

    /// @notice Constructor
    /// @param _entryPoint The ERC-4337 EntryPoint address
    /// @param _validator The PQ validator address
    /// @param _pqPublicKey The initial post-quantum public key
    constructor(
        IEntryPoint _entryPoint,
        IPQValidator _validator,
        bytes memory _pqPublicKey
    ) {
        require(address(_entryPoint) != address(0), "Invalid EntryPoint");
        require(address(_validator) != address(0), "Invalid validator");
        require(_pqPublicKey.length >= 32, "Invalid PQ public key");

        entryPoint = _entryPoint;
        _validator = _validator;
        pqPublicKey = _pqPublicKey;
    }

    /// @notice Receive ETH
    receive() external payable {}

    /// @notice Returns the post-quantum public key
    function getPQPublicKey() external view override returns (bytes memory) {
        return pqPublicKey;
    }

    /// @notice Execute a transaction from this wallet
    /// @param target The target contract address
    /// @param value The amount of ETH to send
    /// @param data The calldata to execute
    function execute(
        address target,
        uint256 value,
        bytes calldata data
    ) external override onlyOwner nonReentrant {
        _execute(target, value, data);
    }

    /// @notice Execute a batch of transactions
    /// @param targets Array of target addresses
    /// @param values Array of ETH amounts
    /// @param datas Array of calldata
    function executeBatch(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata datas
    ) external override onlyOwner nonReentrant {
        require(targets.length == values.length, "Length mismatch");
        require(targets.length == datas.length, "Length mismatch");

        for (uint256 i = 0; i < targets.length; i++) {
            _execute(targets[i], values[i], datas[i]);
        }
    }

    /// @notice Internal execute function
    /// @param target The target contract address
    /// @param value The amount of ETH to send
    /// @param data The calldata to execute
    function _execute(address target, uint256 value, bytes calldata data) internal {
        require(target != address(0), "Invalid target");

        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }

        emit Executed(target, value, data);
    }

    /// @notice Validate a user operation (ERC-4337)
    /// @param userOp The user operation to validate
    /// @param userOpHash Hash of the user operation
    /// @param missingAccountFunds Amount of funds missing to pay for the operation
    /// @return validationData 0 if valid, 1 if invalid
    function validateUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external override(IAccount, IPQWallet) onlyEntryPoint returns (uint256 validationData) {
        // Verify the signature using PQ validator
        bytes memory signature = userOp.signature;
        bytes32 hash = _getEthSignedMessageHash(userOpHash);

        bool isValid = _validator.verifySignature(
            abi.encodePacked(hash),
            signature,
            pqPublicKey
        );

        // Pay the EntryPoint if needed
        if (missingAccountFunds > 0) {
            (bool success,) = payable(msg.sender).call{value: missingAccountFunds}("");
            require(success, "Payment failed");
        }

        return isValid ? 0 : SIG_VALIDATION_FAILED;
    }

    /// @notice Get the hash in the Ethereum signed message format
    /// @param _messageHash The message hash
    /// @return The Ethereum signed message hash
    function _getEthSignedMessageHash(bytes32 _messageHash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }

    /// @notice Update the post-quantum public key (only callable by wallet itself)
    /// @param newPqPublicKey The new PQ public key
    function updatePQPublicKey(bytes memory newPqPublicKey) external onlyOwner {
        require(newPqPublicKey.length >= 32, "Invalid PQ public key");

        bytes memory oldKey = pqPublicKey;
        pqPublicKey = newPqPublicKey;

        emit PQPublicKeyUpdated(oldKey, newPqPublicKey);
    }

    /// @notice Get the nonce for this wallet
    /// @return The current nonce
    function getNonce() external view returns (uint256) {
        return entryPoint.getNonce(address(this), 0);
    }
}
