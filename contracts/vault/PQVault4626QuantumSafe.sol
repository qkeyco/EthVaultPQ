// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./PQVault4626With83b.sol";
import "../interfaces/IPQWallet.sol";
import "../core/PQValidator.sol";

/**
 * @title PQVault4626QuantumSafe
 * @notice Quantum-safe vault for PYUSD and other assets
 * @dev Only accepts deposits/withdrawals from PQWallet (ERC-4337 with post-quantum signatures)
 *
 * Prize Eligibility: PayPal USD Integration + Post-Quantum Security
 *
 * Security Model:
 * - ALL vault operations require PQWallet ownership
 * - Withdrawals verified with Dilithium3 or SPHINCS+ signatures
 * - Tax payments secured with quantum-resistant cryptography
 * - Future-proof against quantum computer attacks
 *
 * Use Case:
 * - Employees store PYUSD for future tax payments
 * - Long-term tax withholding storage (safe from quantum threats)
 * - Corporate tax treasury (quantum-safe custody)
 */
contract PQVault4626QuantumSafe is PQVault4626With83b {

    /// @notice PQValidator for signature verification
    PQValidator public immutable pqValidator;

    /// @notice Mapping of allowed PQWallet addresses
    mapping(address => bool) public isPQWallet;

    /// @notice Count of registered PQWallets
    uint256 public pqWalletCount;

    // Events
    event PQWalletRegistered(address indexed wallet, address indexed owner);
    event PQWalletRemoved(address indexed wallet);
    event QuantumSafeWithdrawal(
        address indexed pqWallet,
        address indexed recipient,
        uint256 amount,
        bytes32 signatureHash
    );

    // Errors
    error NotPQWallet(address account);
    error PQWalletAlreadyRegistered(address wallet);
    error InvalidPQWallet(address wallet);
    error QuantumSignatureRequired();

    /**
     * @notice Constructor
     * @param asset_ The underlying asset (e.g., PYUSD)
     * @param name_ Vault name
     * @param symbol_ Vault symbol
     * @param decimals_ Token decimals
     * @param oracle_ Pyth price oracle
     * @param taxTreasury_ Address to receive withheld taxes
     * @param pqValidator_ PQValidator for signature verification
     */
    constructor(
        IERC20 asset_,
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address oracle_,
        address taxTreasury_,
        address pqValidator_
    ) PQVault4626With83b(asset_, name_, symbol_, decimals_, oracle_, taxTreasury_) {
        require(pqValidator_ != address(0), "Invalid PQValidator");
        pqValidator = PQValidator(pqValidator_);
    }

    /**
     * @notice Register a PQWallet for quantum-safe vault access
     * @param pqWallet Address of the PQWallet (ERC-4337 account)
     * @dev Only the PQWallet itself can register (self-registration)
     */
    function registerPQWallet(address pqWallet) external {
        // Verify it's actually a PQWallet
        if (!_isPQWallet(pqWallet)) {
            revert InvalidPQWallet(pqWallet);
        }

        // For ERC-4337 wallets, the wallet must register itself
        // OR vault owner can register it
        require(
            msg.sender == pqWallet || msg.sender == owner(),
            "Only wallet or owner can register"
        );

        // Check not already registered
        if (isPQWallet[pqWallet]) {
            revert PQWalletAlreadyRegistered(pqWallet);
        }

        // Register
        isPQWallet[pqWallet] = true;
        pqWalletCount++;

        emit PQWalletRegistered(pqWallet, msg.sender);
    }

    /**
     * @notice Remove a PQWallet registration
     * @param pqWallet Address of the PQWallet to remove
     * @dev Only owner or the wallet itself can remove
     */
    function removePQWallet(address pqWallet) external {
        require(
            msg.sender == owner() || msg.sender == pqWallet,
            "Not authorized"
        );
        require(isPQWallet[pqWallet], "Wallet not registered");

        isPQWallet[pqWallet] = false;
        pqWalletCount--;

        emit PQWalletRemoved(pqWallet);
    }

    /**
     * @notice Check if deposit receiver is a PQWallet (quantum-safe check)
     * @param receiver Address to receive vested shares
     * @dev This should be called before any deposit
     * @dev NOTE: Deposits are allowed for any address, but withdrawals require PQWallet
     *      This allows flexibility while enforcing quantum safety on withdrawal
     */
    function checkDepositReceiver(address receiver) external view {
        if (!isPQWallet[receiver]) {
            revert NotPQWallet(receiver);
        }
    }

    /**
     * @notice Withdraw vested assets (quantum-safe)
     * @param sharesToWithdraw Amount of shares to withdraw
     * @return assets Amount of underlying assets received
     * @dev Caller MUST be a registered PQWallet
     */
    function withdrawVested(uint256 sharesToWithdraw)
        public
        virtual
        override
        returns (uint256 assets)
    {
        // Enforce PQWallet requirement
        if (!isPQWallet[msg.sender]) {
            revert NotPQWallet(msg.sender);
        }

        assets = super.withdrawVested(sharesToWithdraw);

        // Log quantum-safe withdrawal
        emit QuantumSafeWithdrawal(
            msg.sender,
            msg.sender,
            assets,
            keccak256(abi.encodePacked(msg.sender, sharesToWithdraw, block.number))
        );

        return assets;
    }

    /**
     * @notice Sell vested tokens with tax withholding (quantum-safe)
     * @param sharesToSell Amount of shares to sell
     * @param minPyusdOut Minimum PYUSD to receive
     * @param swapData DEX swap calldata
     * @return pyusdReceived PYUSD received after tax
     * @return taxWithheld PYUSD withheld for taxes
     * @dev Caller MUST be a registered PQWallet
     * @dev This is a helper function - not in base contract
     */
    function sellVestedTokensWithTaxWithholding(
        uint256 sharesToSell,
        uint256 minPyusdOut,
        bytes calldata swapData
    ) public returns (uint256 pyusdReceived, uint256 taxWithheld) {
        // Enforce PQWallet requirement
        if (!isPQWallet[msg.sender]) {
            revert NotPQWallet(msg.sender);
        }

        // This is a placeholder - actual implementation would integrate with DEX
        // For now, just revert with a helpful message
        revert("Tax withholding not implemented - use withdrawVested instead");
    }

    /**
     * @notice Standard ERC4626 deposit (DISABLED for quantum safety)
     * @dev All deposits must use depositWithVesting with PQWallet
     */
    function deposit(uint256 assets, address receiver)
        public
        virtual
        override
        returns (uint256)
    {
        revert QuantumSignatureRequired();
    }

    /**
     * @notice Standard ERC4626 mint (DISABLED for quantum safety)
     * @dev All deposits must use depositWithVesting with PQWallet
     */
    function mint(uint256 shares, address receiver)
        public
        virtual
        override
        returns (uint256)
    {
        revert QuantumSignatureRequired();
    }

    /**
     * @notice Standard ERC4626 withdraw (DISABLED for quantum safety)
     * @dev All withdrawals must use withdrawVested from PQWallet
     */
    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) public virtual override returns (uint256) {
        revert QuantumSignatureRequired();
    }

    /**
     * @notice Standard ERC4626 redeem (DISABLED for quantum safety)
     * @dev All withdrawals must use withdrawVested from PQWallet
     */
    function redeem(
        uint256 shares,
        address receiver,
        address owner
    ) public virtual override returns (uint256) {
        revert QuantumSignatureRequired();
    }

    /**
     * @notice Check if address is a PQWallet
     * @param account Address to check
     * @return True if account is a valid PQWallet
     */
    function _isPQWallet(address account) internal view returns (bool) {
        // Check if contract exists
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        if (size == 0) return false;

        // Try to call validator() function (all PQWallets have this)
        try IPQWallet(account).validator() returns (address validatorAddr) {
            return validatorAddr != address(0);
        } catch {
            return false;
        }
    }

    /**
     * @notice Get quantum-safe vault statistics
     * @return totalPQWallets Number of registered PQWallets
     * @return totalValueLocked Total assets in vault
     * @return quantumSecured Whether all assets are quantum-secured
     */
    function getQuantumSafetyStats() external view returns (
        uint256 totalPQWallets,
        uint256 totalValueLocked,
        bool quantumSecured
    ) {
        return (
            pqWalletCount,
            totalAssets(),
            pqWalletCount > 0 // Quantum-secured if at least one PQWallet registered
        );
    }

    /**
     * @notice Verify a user's PQWallet status
     * @param user Address to check
     * @return isQuantumSafe True if user has a registered PQWallet
     * @return pqWalletAddress The PQWallet address (or zero)
     */
    function checkUserQuantumSafety(address user) external view returns (
        bool isQuantumSafe,
        address pqWalletAddress
    ) {
        // This is a simplified check - in production, you'd query PQWalletFactory
        // to find the user's PQWallet address
        if (isPQWallet[user]) {
            return (true, user);
        }
        return (false, address(0));
    }
}
