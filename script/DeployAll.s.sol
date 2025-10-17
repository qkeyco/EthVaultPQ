// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {PQWalletFactory} from "../contracts/core/PQWalletFactory.sol";
import {PQValidator} from "../contracts/core/PQValidator.sol";
import {PQVault4626} from "../contracts/vault/PQVault4626.sol";
import {PQVault4626Demo} from "../contracts/vault/PQVault4626Demo.sol";
import {ZKProofOracle} from "../contracts/oracles/ZKProofOracle.sol";
import {QRNGOracle} from "../contracts/oracles/QRNGOracle.sol";
import {ZKVerifier} from "../contracts/libraries/ZKVerifier.sol";
import {IEntryPoint} from "lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {ERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

/// @title MockToken
/// @notice Mock ERC20 for testing
contract MockToken is ERC20 {
    constructor() ERC20("Mock USDC", "MUSDC") {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}

/// @title DeployAll
/// @notice Comprehensive deployment script for all EthVaultPQ contracts
/// @dev Deploys all 8 contracts in the correct order
contract DeployAll is Script {
    // ERC-4337 EntryPoint v0.7 address
    address constant ENTRY_POINT = 0x0000000071727De22E5E9d8BAf0edAc6f37da032;

    function run() external {
        // Get deployer from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("==========================================================");
        console.log("  EthVaultPQ - Complete Deployment");
        console.log("==========================================================");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("Block Number:", block.number);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy ZKVerifier
        console.log("[1/8] Deploying ZKVerifier...");
        ZKVerifier verifier = new ZKVerifier();
        console.log("      ZKVerifier:", address(verifier));
        console.log("");

        // 2. Deploy PQValidator
        console.log("[2/8] Deploying PQValidator...");
        PQValidator validator = new PQValidator();
        console.log("      PQValidator:", address(validator));
        console.log("      Supported algorithms:", validator.getSupportedAlgorithms()[0]);
        console.log("");

        // 3. Deploy PQWalletFactory
        console.log("[3/8] Deploying PQWalletFactory...");
        PQWalletFactory factory = new PQWalletFactory(
            IEntryPoint(ENTRY_POINT),
            validator
        );
        console.log("      PQWalletFactory:", address(factory));
        console.log("");

        // 4. Deploy MockToken
        console.log("[4/8] Deploying MockToken (MUSDC)...");
        MockToken token = new MockToken();
        console.log("      MockToken:", address(token));
        console.log("      Initial supply:", token.totalSupply() / 10**6, "MUSDC");
        console.log("");

        // 5. Deploy PQVault4626 (Regular)
        console.log("[5/8] Deploying PQVault4626...");
        PQVault4626 vault = new PQVault4626(
            IERC20(address(token)),
            "PQ Vault USDC",
            "vUSDC"
        );
        console.log("      PQVault4626:", address(vault));
        console.log("");

        // 6. Deploy PQVault4626Demo (60x acceleration)
        console.log("[6/8] Deploying PQVault4626Demo (60x faster)...");
        PQVault4626Demo vaultDemo = new PQVault4626Demo(
            IERC20(address(token)),
            "PQ Vault USDC Demo",
            "vUSDC-Demo"
        );
        console.log("      PQVault4626Demo:", address(vaultDemo));
        console.log("      Acceleration Factor:", vaultDemo.ACCELERATION_FACTOR());
        console.log("      Description:", vaultDemo.DEMO_DESCRIPTION());
        console.log("");

        // 7. Deploy ZKProofOracle
        console.log("[7/8] Deploying ZKProofOracle...");
        ZKProofOracle zkOracle = new ZKProofOracle(address(verifier));
        console.log("      ZKProofOracle:", address(zkOracle));
        console.log("      Linked to verifier:", address(verifier));
        console.log("");

        // 8. Deploy QRNGOracle
        console.log("[8/8] Deploying QRNGOracle...");
        QRNGOracle qrngOracle = new QRNGOracle();
        console.log("      QRNGOracle:", address(qrngOracle));
        console.log("");

        vm.stopBroadcast();

        // Deployment Summary
        console.log("==========================================================");
        console.log("  Deployment Complete! ");
        console.log("==========================================================");
        console.log("");
        console.log("Network Info:");
        console.log("  Chain ID:", block.chainid);
        console.log("  Block:", block.number);
        console.log("  Timestamp:", block.timestamp);
        console.log("");
        console.log("Contract Addresses:");
        console.log("  EntryPoint:        ", ENTRY_POINT);
        console.log("  ZKVerifier:        ", address(verifier));
        console.log("  PQValidator:       ", address(validator));
        console.log("  PQWalletFactory:   ", address(factory));
        console.log("  MockToken:         ", address(token));
        console.log("  PQVault4626:       ", address(vault));
        console.log("  PQVault4626Demo:   ", address(vaultDemo));
        console.log("  ZKProofOracle:     ", address(zkOracle));
        console.log("  QRNGOracle:        ", address(qrngOracle));
        console.log("");

        // Dashboard config output
        console.log("==========================================================");
        console.log("  Update dashboard/src/config/contracts.ts:");
        console.log("==========================================================");
        console.log("");
        console.log("export const TENDERLY_CONTRACTS = {");
        console.log("  entryPoint: '%s',", ENTRY_POINT);
        console.log("  zkVerifier: '%s',", address(verifier));
        console.log("  pqValidator: '%s',", address(validator));
        console.log("  pqWalletFactory: '%s',", address(factory));
        console.log("  mockToken: '%s',", address(token));
        console.log("  pqVault4626: '%s',", address(vault));
        console.log("  pqVault4626Demo: '%s',", address(vaultDemo));
        console.log("  zkProofOracle: '%s',", address(zkOracle));
        console.log("  qrngOracle: '%s',", address(qrngOracle));
        console.log("} as const;");
        console.log("");

        // Create test wallet
        console.log("==========================================================");
        console.log("  Creating Test Wallet...");
        console.log("==========================================================");

        bytes memory testPqPublicKey = hex"a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2";

        vm.broadcast(deployerPrivateKey);
        address testWallet = factory.createWallet(testPqPublicKey, 0);

        console.log("  Test Wallet:", testWallet);
        console.log("  PQ Public Key:", vm.toString(testPqPublicKey));
        console.log("");

        // Final notes
        console.log("==========================================================");
        console.log("  Next Steps:");
        console.log("==========================================================");
        console.log("");
        console.log("1. Update dashboard/src/config/contracts.ts with above addresses");
        console.log("2. Open dashboard: cd dashboard && npm run dev");
        console.log("3. Navigate to Deploy tab to see deployed contracts");
        console.log("4. Test vesting with PQVault4626Demo (1 month = 30 min!)");
        console.log("");
        console.log("Tenderly Dashboard:");
        console.log("  https://dashboard.tenderly.co/");
        console.log("");
        console.log("==========================================================");
    }
}
