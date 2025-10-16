// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {PackedUserOperation} from "lib/account-abstraction/contracts/interfaces/PackedUserOperation.sol";

/// @title IPQWallet
/// @notice Interface for Post-Quantum secure ERC-4337 compatible wallet
interface IPQWallet {
    /// @notice Emitted when a transaction is executed
    event Executed(address indexed target, uint256 value, bytes data);

    /// @notice Emitted when PQ public key is updated
    event PQPublicKeyUpdated(bytes oldKey, bytes newKey);

    /// @notice Returns the post-quantum public key
    function getPQPublicKey() external view returns (bytes memory);

    /// @notice Returns the address of the PQ validator
    function validator() external view returns (address);

    /// @notice Execute a transaction from this wallet
    /// @param target The target contract address
    /// @param value The amount of ETH to send
    /// @param data The calldata to execute
    function execute(address target, uint256 value, bytes calldata data) external;

    /// @notice Execute a batch of transactions
    /// @param targets Array of target addresses
    /// @param values Array of ETH amounts
    /// @param data Array of calldata
    function executeBatch(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata data
    ) external;

    /// @notice Validate a user operation signature
    /// @param userOp The user operation to validate
    /// @param userOpHash Hash of the user operation
    /// @param missingAccountFunds Amount of funds missing to pay for the operation
    /// @return validationData Validation result (0 = success)
    function validateUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external returns (uint256 validationData);
}
