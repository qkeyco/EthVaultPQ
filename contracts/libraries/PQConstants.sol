// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title PQConstants
/// @notice NIST-compliant parameter sizes for post-quantum cryptographic algorithms
/// @dev Based on NIST PQC standardization (August 2024): ML-DSA (Dilithium) and SLH-DSA (SPHINCS+)
/// @dev FIPS 204 (ML-DSA): https://csrc.nist.gov/pubs/fips/204/final
/// @dev FIPS 205 (SLH-DSA): https://csrc.nist.gov/pubs/fips/205/final
library PQConstants {
    // ============ Dilithium (ML-DSA) Constants ============
    // Updated to NIST FIPS 204 final specification (August 2024)

    /// @notice Dilithium2 (ML-DSA-44) - NIST Security Level 2 (~128-bit)
    uint256 public constant DILITHIUM2_PUBLIC_KEY_SIZE = 1312;
    uint256 public constant DILITHIUM2_SIGNATURE_SIZE = 2420;

    /// @notice Dilithium3 (ML-DSA-65) - NIST Security Level 3 (~192-bit) [RECOMMENDED]
    uint256 public constant DILITHIUM3_PUBLIC_KEY_SIZE = 1952;
    uint256 public constant DILITHIUM3_SIGNATURE_SIZE = 3309; // Updated to NIST FIPS 204 final

    /// @notice Dilithium5 (ML-DSA-87) - NIST Security Level 5 (~256-bit)
    uint256 public constant DILITHIUM5_PUBLIC_KEY_SIZE = 2592;
    uint256 public constant DILITHIUM5_SIGNATURE_SIZE = 4627; // Updated to NIST FIPS 204 final

    // ============ SPHINCS+ (SLH-DSA) Constants ============

    /// @notice SPHINCS+-SHA2-128f - Fast variant, 128-bit security [RECOMMENDED for most use cases]
    uint256 public constant SPHINCS_SHA2_128F_PUBLIC_KEY_SIZE = 32;
    uint256 public constant SPHINCS_SHA2_128F_SIGNATURE_SIZE = 17088;

    /// @notice SPHINCS+-SHA2-128s - Small variant, 128-bit security
    uint256 public constant SPHINCS_SHA2_128S_PUBLIC_KEY_SIZE = 32;
    uint256 public constant SPHINCS_SHA2_128S_SIGNATURE_SIZE = 7856;

    /// @notice SPHINCS+-SHA2-192f - Fast variant, 192-bit security
    uint256 public constant SPHINCS_SHA2_192F_PUBLIC_KEY_SIZE = 48;
    uint256 public constant SPHINCS_SHA2_192F_SIGNATURE_SIZE = 35664;

    /// @notice SPHINCS+-SHA2-192s - Small variant, 192-bit security
    uint256 public constant SPHINCS_SHA2_192S_PUBLIC_KEY_SIZE = 48;
    uint256 public constant SPHINCS_SHA2_192S_SIGNATURE_SIZE = 16224;

    /// @notice SPHINCS+-SHA2-256f - Fast variant, 256-bit security
    uint256 public constant SPHINCS_SHA2_256F_PUBLIC_KEY_SIZE = 64;
    uint256 public constant SPHINCS_SHA2_256F_SIGNATURE_SIZE = 49856;

    /// @notice SPHINCS+-SHA2-256s - Small variant, 256-bit security
    uint256 public constant SPHINCS_SHA2_256S_PUBLIC_KEY_SIZE = 64;
    uint256 public constant SPHINCS_SHA2_256S_SIGNATURE_SIZE = 29792;

    // ============ Validation Functions ============

    /// @notice Check if a public key size is valid for any supported algorithm
    /// @param keySize The public key size in bytes
    /// @return True if the size matches a NIST-compliant parameter set
    function isValidPublicKeySize(uint256 keySize) internal pure returns (bool) {
        return keySize == DILITHIUM2_PUBLIC_KEY_SIZE ||
               keySize == DILITHIUM3_PUBLIC_KEY_SIZE ||
               keySize == DILITHIUM5_PUBLIC_KEY_SIZE ||
               keySize == SPHINCS_SHA2_128F_PUBLIC_KEY_SIZE ||
               keySize == SPHINCS_SHA2_128S_PUBLIC_KEY_SIZE ||
               keySize == SPHINCS_SHA2_192F_PUBLIC_KEY_SIZE ||
               keySize == SPHINCS_SHA2_192S_PUBLIC_KEY_SIZE ||
               keySize == SPHINCS_SHA2_256F_PUBLIC_KEY_SIZE ||
               keySize == SPHINCS_SHA2_256S_PUBLIC_KEY_SIZE;
    }

    /// @notice Check if a signature size is valid for any supported algorithm
    /// @param sigSize The signature size in bytes
    /// @return True if the size matches a NIST-compliant parameter set
    function isValidSignatureSize(uint256 sigSize) internal pure returns (bool) {
        return sigSize == DILITHIUM2_SIGNATURE_SIZE ||
               sigSize == DILITHIUM3_SIGNATURE_SIZE ||
               sigSize == DILITHIUM5_SIGNATURE_SIZE ||
               sigSize == SPHINCS_SHA2_128F_SIGNATURE_SIZE ||
               sigSize == SPHINCS_SHA2_128S_SIGNATURE_SIZE ||
               sigSize == SPHINCS_SHA2_192F_SIGNATURE_SIZE ||
               sigSize == SPHINCS_SHA2_192S_SIGNATURE_SIZE ||
               sigSize == SPHINCS_SHA2_256F_SIGNATURE_SIZE ||
               sigSize == SPHINCS_SHA2_256S_SIGNATURE_SIZE;
    }

    /// @notice Get the algorithm name from public key size
    /// @param keySize The public key size in bytes
    /// @return Algorithm name or "Unknown"
    function getAlgorithmName(uint256 keySize) internal pure returns (string memory) {
        if (keySize == DILITHIUM2_PUBLIC_KEY_SIZE) return "Dilithium2 (ML-DSA-44)";
        if (keySize == DILITHIUM3_PUBLIC_KEY_SIZE) return "Dilithium3 (ML-DSA-65)";
        if (keySize == DILITHIUM5_PUBLIC_KEY_SIZE) return "Dilithium5 (ML-DSA-87)";
        if (keySize == SPHINCS_SHA2_128F_PUBLIC_KEY_SIZE) return "SPHINCS+-SHA2-128f";
        if (keySize == SPHINCS_SHA2_128S_PUBLIC_KEY_SIZE) return "SPHINCS+-SHA2-128s";
        if (keySize == SPHINCS_SHA2_192F_PUBLIC_KEY_SIZE) return "SPHINCS+-SHA2-192f";
        if (keySize == SPHINCS_SHA2_192S_PUBLIC_KEY_SIZE) return "SPHINCS+-SHA2-192s";
        if (keySize == SPHINCS_SHA2_256F_PUBLIC_KEY_SIZE) return "SPHINCS+-SHA2-256f";
        if (keySize == SPHINCS_SHA2_256S_PUBLIC_KEY_SIZE) return "SPHINCS+-SHA2-256s";
        return "Unknown";
    }

    /// @notice Check if key size is Dilithium
    /// @param keySize The public key size in bytes
    /// @return True if it's a Dilithium variant
    function isDilithiumKey(uint256 keySize) internal pure returns (bool) {
        return keySize == DILITHIUM2_PUBLIC_KEY_SIZE ||
               keySize == DILITHIUM3_PUBLIC_KEY_SIZE ||
               keySize == DILITHIUM5_PUBLIC_KEY_SIZE;
    }

    /// @notice Check if key size is SPHINCS+
    /// @param keySize The public key size in bytes
    /// @return True if it's a SPHINCS+ variant
    function isSPHINCSKey(uint256 keySize) internal pure returns (bool) {
        return keySize == SPHINCS_SHA2_128F_PUBLIC_KEY_SIZE ||
               keySize == SPHINCS_SHA2_128S_PUBLIC_KEY_SIZE ||
               keySize == SPHINCS_SHA2_192F_PUBLIC_KEY_SIZE ||
               keySize == SPHINCS_SHA2_192S_PUBLIC_KEY_SIZE ||
               keySize == SPHINCS_SHA2_256F_PUBLIC_KEY_SIZE ||
               keySize == SPHINCS_SHA2_256S_PUBLIC_KEY_SIZE;
    }
}
