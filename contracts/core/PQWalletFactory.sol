// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {PQWallet} from "./PQWallet.sol";
import {IPQValidator} from "../interfaces/IPQValidator.sol";
import {IEntryPoint} from "lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {Create2} from "lib/openzeppelin-contracts/contracts/utils/Create2.sol";
import {Ownable} from "lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import {PQConstants} from "../libraries/PQConstants.sol";

/// @title PQWalletFactory
/// @notice Factory for deploying Post-Quantum secure wallets using CREATE2
/// @dev Allows deterministic wallet addresses for counterfactual deployment
contract PQWalletFactory is Ownable {
    /// @notice The EntryPoint contract
    IEntryPoint public immutable entryPoint;

    /// @notice The PQ validator contract
    IPQValidator private immutable _validator;

    /// @notice Returns the PQ validator address
    function validator() external view returns (address) {
        return address(_validator);
    }

    /// @notice Emitted when a new wallet is created
    event WalletCreated(
        address indexed wallet,
        bytes pqPublicKey,
        uint256 salt
    );

    /// @notice Constructor
    /// @param _entryPoint The ERC-4337 EntryPoint address
    /// @param _validator The PQ validator address
    constructor(IEntryPoint _entryPoint, IPQValidator _validator) Ownable(msg.sender) {
        require(address(_entryPoint) != address(0), "Invalid EntryPoint");
        require(address(_validator) != address(0), "Invalid validator");

        entryPoint = _entryPoint;
        _validator = _validator;
    }

    /// @notice Create a new PQ wallet
    /// @param pqPublicKey The post-quantum public key for the wallet
    /// @param salt Salt for CREATE2 (allows multiple wallets per PQ key)
    /// @return wallet The address of the created wallet
    function createWallet(
        bytes memory pqPublicKey,
        uint256 salt
    ) external returns (address wallet) {
        // NIST-compliant PQ key size validation
        require(
            PQConstants.isValidPublicKeySize(pqPublicKey.length),
            "Invalid PQ public key size - must be NIST-compliant"
        );

        // Enhance salt with additional entropy to prevent predictable addresses
        require(salt != 0, "Salt cannot be zero");
        bytes32 enhancedSalt = keccak256(abi.encodePacked(
            msg.sender,
            block.timestamp,
            block.prevrandao, // Post-Merge randomness
            salt,
            pqPublicKey
        ));

        // Get the predicted address
        address predictedAddress = getAddress(pqPublicKey, uint256(enhancedSalt));

        // Check if wallet already exists
        if (predictedAddress.code.length > 0) {
            return predictedAddress;
        }

        // Deploy wallet using CREATE2
        bytes32 create2Salt = _getSalt(pqPublicKey, uint256(enhancedSalt));
        wallet = address(
            new PQWallet{salt: create2Salt}(
                entryPoint,
                _validator,
                pqPublicKey
            )
        );

        require(wallet == predictedAddress, "Address mismatch");

        emit WalletCreated(wallet, pqPublicKey, salt);
    }

    /// @notice Get the counterfactual address for a wallet
    /// @param pqPublicKey The post-quantum public key
    /// @param salt Salt for CREATE2
    /// @return The predicted wallet address
    function getAddress(
        bytes memory pqPublicKey,
        uint256 salt
    ) public view returns (address) {
        bytes32 create2Salt = _getSalt(pqPublicKey, salt);
        bytes memory bytecode = _getWalletBytecode(pqPublicKey);

        return Create2.computeAddress(create2Salt, keccak256(bytecode));
    }

    /// @notice Get the creation bytecode for a wallet
    /// @param pqPublicKey The post-quantum public key
    /// @return The bytecode for deploying the wallet
    function _getWalletBytecode(bytes memory pqPublicKey) internal view returns (bytes memory) {
        return abi.encodePacked(
            type(PQWallet).creationCode,
            abi.encode(entryPoint, _validator, pqPublicKey)
        );
    }

    /// @notice Get the CREATE2 salt
    /// @param pqPublicKey The post-quantum public key
    /// @param salt User-provided salt
    /// @return The CREATE2 salt
    function _getSalt(bytes memory pqPublicKey, uint256 salt) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(pqPublicKey, salt));
    }

    /// @notice Add stake to EntryPoint (for factory reputation)
    /// @param unstakeDelaySec Unstake delay in seconds
    function addStake(uint32 unstakeDelaySec) external payable onlyOwner {
        require(msg.value > 0, "Must stake non-zero amount");
        entryPoint.addStake{value: msg.value}(unstakeDelaySec);
    }

    /// @notice Unlock stake from EntryPoint
    function unlockStake() external onlyOwner {
        entryPoint.unlockStake();
    }

    /// @notice Withdraw stake from EntryPoint
    /// @param withdrawAddress Address to receive the stake
    function withdrawStake(address payable withdrawAddress) external onlyOwner {
        require(withdrawAddress != address(0), "Invalid withdraw address");
        entryPoint.withdrawStake(withdrawAddress);
    }
}
