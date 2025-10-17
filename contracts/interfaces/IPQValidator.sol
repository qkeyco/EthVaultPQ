// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title IPQValidator
/// @notice Interface for Post-Quantum signature validation
interface IPQValidator {
    /// @notice Verify a post-quantum signature
    /// @param message The message that was signed
    /// @param signature The post-quantum signature
    /// @param publicKey The post-quantum public key
    /// @return True if signature is valid
    function verifySignature(
        bytes memory message,
        bytes memory signature,
        bytes memory publicKey
    ) external view returns (bool);

    /// @notice Verify a SPHINCS+ signature
    /// @param message The message that was signed
    /// @param signature The SPHINCS+ signature
    /// @param publicKey The SPHINCS+ public key
    /// @return True if signature is valid
    function verifySPHINCSPlus(
        bytes memory message,
        bytes memory signature,
        bytes memory publicKey
    ) external pure returns (bool);

    /// @notice Verify a Dilithium signature
    /// @param message The message that was signed
    /// @param signature The Dilithium signature
    /// @param publicKey The Dilithium public key
    /// @return True if signature is valid
    function verifyDilithium(
        bytes memory message,
        bytes memory signature,
        bytes memory publicKey
    ) external view returns (bool);
}
