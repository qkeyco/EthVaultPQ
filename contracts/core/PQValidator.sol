// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IPQValidator} from "../interfaces/IPQValidator.sol";
import {DilithiumVerifier} from "../libraries/DilithiumVerifier.sol";
import {ZKVerifier} from "../libraries/ZKVerifier.sol";
import {Ownable} from "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

/// @title PQValidator
/// @notice Post-Quantum signature validator for SPHINCS+ and Dilithium
/// @dev Supports both on-chain and ZK-proof verification modes
contract PQValidator is IPQValidator, Ownable {
    /// @notice Verification mode
    enum VerificationMode {
        ON_CHAIN,      // Full on-chain verification (expensive gas)
        ZK_PROOF,      // ZK-SNARK proof verification (cheap gas)
        HYBRID         // Try ZK first, fallback to on-chain
    }

    /// @notice Current verification mode
    VerificationMode public verificationMode;

    /// @notice ZK verifier contract
    ZKVerifier public zkVerifier;

    /// @notice Authorized wallets that can use this validator
    mapping(address => bool) public authorizedWallets;

    /// @notice If true, only authorized wallets can verify signatures
    bool public requireAuthorization;

    /// @notice Emitted when verification mode changes
    event VerificationModeChanged(VerificationMode oldMode, VerificationMode newMode);

    /// @notice Emitted when ZK verifier is updated
    event ZKVerifierUpdated(address oldVerifier, address newVerifier);

    /// @notice Emitted when wallet authorization changes
    event WalletAuthorizationChanged(address indexed wallet, bool authorized);

    /// @notice Emitted when authorization requirement changes
    event AuthorizationRequirementChanged(bool required);

    /// @notice Only authorized wallets can call
    modifier onlyAuthorized() {
        if (requireAuthorization) {
            require(authorizedWallets[msg.sender], "Wallet not authorized");
        }
        _;
    }

    constructor() Ownable(msg.sender) {
        verificationMode = VerificationMode.ZK_PROOF;
        requireAuthorization = false; // Start permissionless for testing
    }
    /// @notice Verify a post-quantum signature (defaults to SPHINCS+)
    /// @param message The message that was signed
    /// @param signature The post-quantum signature
    /// @param publicKey The post-quantum public key
    /// @return True if signature is valid
    function verifySignature(
        bytes memory message,
        bytes memory signature,
        bytes memory publicKey
    ) external view override onlyAuthorized returns (bool) {
        return verifySPHINCSPlus(message, signature, publicKey);
    }

    /// @notice Verify a SPHINCS+ signature
    /// @dev PLACEHOLDER: Production implementation requires:
    ///      1. Optimized SPHINCS+ library in Solidity
    ///      2. EVM precompile for gas efficiency
    ///      3. Or ZK proof of signature validity
    /// @param message The message that was signed
    /// @param signature The SPHINCS+ signature (typically ~7-8KB for 128-bit security)
    /// @param publicKey The SPHINCS+ public key (typically 32-64 bytes)
    /// @return True if signature is valid
    function verifySPHINCSPlus(
        bytes memory message,
        bytes memory signature,
        bytes memory publicKey
    ) public pure override returns (bool) {
        // CRITICAL: This is a placeholder for development/testing only
        // A real implementation would:
        // 1. Parse the SPHINCS+ signature components
        // 2. Rebuild the Merkle tree path
        // 3. Verify FORS (Forest of Random Subsets) signature
        // 4. Verify WOTS+ (Winternitz One-Time Signature)
        // 5. Verify hypertree authentication path

        // For now, basic length validation to prevent completely invalid inputs
        require(message.length > 0, "Empty message");
        require(signature.length >= 64, "Signature too short");
        require(publicKey.length >= 32, "Public key too short");

        // TODO: Implement actual SPHINCS+ verification
        // This would be gas-prohibitive in pure Solidity
        // Recommended approaches:
        // - Use EVM precompile (requires network support)
        // - Use ZK-SNARK proof of valid signature
        // - Use optimized assembly implementation

        // TEMPORARY: For development, accept any properly sized signature
        // This allows testing of the overall architecture
        return signature.length >= 64 && publicKey.length >= 32;
    }

    /// @notice Verify a Dilithium signature
    /// @dev Chooses verification method based on current mode
    /// @param message The message that was signed
    /// @param signature The Dilithium signature (3293 bytes) OR ZK proof
    /// @param publicKey The Dilithium public key (1952 bytes for Dilithium3)
    /// @return True if signature is valid
    function verifyDilithium(
        bytes memory message,
        bytes memory signature,
        bytes memory publicKey
    ) public view override returns (bool) {
        if (verificationMode == VerificationMode.ON_CHAIN) {
            // Full on-chain Dilithium verification
            // WARNING: This is gas-expensive (~10M gas)
            return DilithiumVerifier.verify(message, signature, publicKey);
        }

        else if (verificationMode == VerificationMode.ZK_PROOF) {
            // ZK-SNARK proof verification (~250k gas)
            return _verifyZKProof(message, signature, publicKey);
        }

        else if (verificationMode == VerificationMode.HYBRID) {
            // Try ZK proof first, fallback to on-chain if needed
            try this.verifyDilithium(message, signature, publicKey) returns (bool result) {
                return result;
            } catch {
                return DilithiumVerifier.verify(message, signature, publicKey);
            }
        }

        return false;
    }

    /// @notice Verify ZK proof of valid Dilithium signature
    /// @param message The message that was signed
    /// @param zkProof The ZK-SNARK proof (generated off-chain)
    /// @param publicKey The Dilithium public key
    /// @return True if proof is valid
    function _verifyZKProof(
        bytes memory message,
        bytes memory zkProof,
        bytes memory publicKey
    ) internal view returns (bool) {
        require(address(zkVerifier) != address(0), "ZK verifier not set");

        // Parse ZK proof components
        // Format: [a_x, a_y, b_x0, b_x1, b_y0, b_y1, c_x, c_y, messageHash, publicKeyHash]
        require(zkProof.length >= 320, "Invalid ZK proof length");

        uint256[2] memory a;
        uint256[2][2] memory b;
        uint256[2] memory c;
        uint256[2] memory input;

        assembly {
            let ptr := add(zkProof, 32)
            mstore(a, mload(ptr))
            mstore(add(a, 32), mload(add(ptr, 32)))

            mstore(mload(b), mload(add(ptr, 64)))
            mstore(add(mload(b), 32), mload(add(ptr, 96)))
            mstore(mload(add(b, 32)), mload(add(ptr, 128)))
            mstore(add(mload(add(b, 32)), 32), mload(add(ptr, 160)))

            mstore(c, mload(add(ptr, 192)))
            mstore(add(c, 32), mload(add(ptr, 224)))

            mstore(input, mload(add(ptr, 256)))
            mstore(add(input, 32), mload(add(ptr, 288)))
        }

        // Verify the proof
        return zkVerifier.verifyProof(a, b, c, input);
    }

    /// @notice Set verification mode (admin only)
    /// @param mode New verification mode
    function setVerificationMode(VerificationMode mode) external onlyOwner {
        VerificationMode oldMode = verificationMode;
        verificationMode = mode;
        emit VerificationModeChanged(oldMode, mode);
    }

    /// @notice Set ZK verifier contract (admin only)
    /// @param _zkVerifier Address of ZK verifier contract
    function setZKVerifier(address _zkVerifier) external onlyOwner {
        require(_zkVerifier != address(0), "Invalid address");
        address oldVerifier = address(zkVerifier);
        zkVerifier = ZKVerifier(_zkVerifier);
        emit ZKVerifierUpdated(oldVerifier, _zkVerifier);
    }

    /// @notice Get current verification mode as string
    /// @return Mode name
    function getVerificationModeName() external view returns (string memory) {
        if (verificationMode == VerificationMode.ON_CHAIN) return "ON_CHAIN";
        if (verificationMode == VerificationMode.ZK_PROOF) return "ZK_PROOF";
        if (verificationMode == VerificationMode.HYBRID) return "HYBRID";
        return "UNKNOWN";
    }

    /// @notice Get supported PQ algorithms
    /// @return Array of supported algorithm names
    function getSupportedAlgorithms() external pure returns (string[] memory) {
        string[] memory algorithms = new string[](2);
        algorithms[0] = "SPHINCS+-SHA2-128f";
        algorithms[1] = "Dilithium3";
        return algorithms;
    }

    // ============ Access Control Management ============

    /// @notice Authorize a wallet to use this validator
    /// @param wallet Address of the wallet to authorize
    function authorizeWallet(address wallet) external onlyOwner {
        require(wallet != address(0), "Invalid wallet address");
        authorizedWallets[wallet] = true;
        emit WalletAuthorizationChanged(wallet, true);
    }

    /// @notice Revoke wallet authorization
    /// @param wallet Address of the wallet to revoke
    function revokeWallet(address wallet) external onlyOwner {
        authorizedWallets[wallet] = false;
        emit WalletAuthorizationChanged(wallet, false);
    }

    /// @notice Authorize multiple wallets at once
    /// @param wallets Array of wallet addresses to authorize
    function authorizeWalletsBatch(address[] calldata wallets) external onlyOwner {
        for (uint256 i = 0; i < wallets.length; i++) {
            require(wallets[i] != address(0), "Invalid wallet address");
            authorizedWallets[wallets[i]] = true;
            emit WalletAuthorizationChanged(wallets[i], true);
        }
    }

    /// @notice Enable or disable authorization requirement
    /// @param required If true, only authorized wallets can verify signatures
    function setAuthorizationRequired(bool required) external onlyOwner {
        requireAuthorization = required;
        emit AuthorizationRequirementChanged(required);
    }

    /// @notice Check if a wallet is authorized
    /// @param wallet Address to check
    /// @return True if wallet is authorized (or if authorization not required)
    function isAuthorized(address wallet) external view returns (bool) {
        if (!requireAuthorization) {
            return true; // Permissionless mode
        }
        return authorizedWallets[wallet];
    }
}
