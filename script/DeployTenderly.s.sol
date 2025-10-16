// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {PQWalletFactory} from "../contracts/core/PQWalletFactory.sol";
import {PQValidator} from "../contracts/core/PQValidator.sol";
import {PQVault4626} from "../contracts/vault/PQVault4626.sol";
import {VestingManager} from "../contracts/vault/VestingManager.sol";
import {IEntryPoint} from "lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {ERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

/// @title MockToken
/// @notice Mock ERC20 for Tenderly deployment
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

/// @title DeployTenderly
/// @notice Deployment script for Tenderly Virtual TestNets
/// @dev Supports Tenderly's mainnet forks and virtual testnets
contract DeployTenderly is Script {
    // ERC-4337 EntryPoint v0.7 address (deployed on most networks)
    address constant ENTRY_POINT = 0x0000000071727De22E5E9d8BAf0edAc6f37da032;

    function run() external {
        // Get deployer from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=================================");
        console.log("Deploying to Tenderly Virtual TestNet");
        console.log("=================================");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("Block Number:", block.number);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy PQ Validator
        console.log("1/5 Deploying PQValidator...");
        PQValidator validator = new PQValidator();
        console.log("    PQValidator deployed at:", address(validator));
        console.log("    Supported algorithms:", validator.getSupportedAlgorithms()[0]);
        console.log("");

        // 2. Deploy Wallet Factory
        console.log("2/5 Deploying PQWalletFactory...");
        PQWalletFactory factory = new PQWalletFactory(
            IEntryPoint(ENTRY_POINT),
            validator
        );
        console.log("    PQWalletFactory deployed at:", address(factory));
        console.log("");

        // 3. Deploy Mock Token
        console.log("3/5 Deploying MockToken (MUSDC)...");
        MockToken token = new MockToken();
        console.log("    MockToken deployed at:", address(token));
        console.log("    Token balance of deployer:", token.balanceOf(deployer));
        console.log("");

        // 4. Deploy Vault
        console.log("4/5 Deploying PQVault4626...");
        PQVault4626 vault = new PQVault4626(
            token,
            "PQ Vault USDC",
            "vUSDC"
        );
        console.log("    PQVault4626 deployed at:", address(vault));
        console.log("");

        // 5. Deploy Vesting Manager
        console.log("5/5 Deploying VestingManager...");
        VestingManager vestingManager = new VestingManager(token);
        console.log("    VestingManager deployed at:", address(vestingManager));
        console.log("");

        vm.stopBroadcast();

        // Log final deployment summary
        console.log("=================================");
        console.log("Deployment Complete!");
        console.log("=================================");
        console.log("");
        console.log("Network Information:");
        console.log("  Chain ID:", block.chainid);
        console.log("  Block Number:", block.number);
        console.log("  Timestamp:", block.timestamp);
        console.log("");
        console.log("Contract Addresses:");
        console.log("  EntryPoint:", ENTRY_POINT);
        console.log("  PQValidator:", address(validator));
        console.log("  PQWalletFactory:", address(factory));
        console.log("  MockToken (MUSDC):", address(token));
        console.log("  PQVault4626:", address(vault));
        console.log("  VestingManager:", address(vestingManager));
        console.log("");
        console.log("=================================");
        console.log("Update dashboard/src/config/contracts.ts:");
        console.log("=================================");
        console.log("");
        console.log("export const TENDERLY_CONTRACTS = {");
        console.log("  entryPoint: '%s',", ENTRY_POINT);
        console.log("  pqValidator: '%s',", address(validator));
        console.log("  pqWalletFactory: '%s',", address(factory));
        console.log("  mockToken: '%s',", address(token));
        console.log("  pqVault: '%s',", address(vault));
        console.log("  vestingManager: '%s',", address(vestingManager));
        console.log("};");
        console.log("");

        // Create a test wallet to verify deployment
        console.log("=================================");
        console.log("Creating Test Wallet...");
        console.log("=================================");

        bytes memory testPqPublicKey = hex"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

        vm.broadcast(deployerPrivateKey);
        address testWallet = factory.createWallet(testPqPublicKey, 0);

        console.log("  Test PQ Wallet created at:", testWallet);
        console.log("  PQ Public Key:", vm.toString(testPqPublicKey));
        console.log("");
        console.log("=================================");
        console.log("Tenderly Dashboard Links:");
        console.log("=================================");
        console.log("");
        console.log("View transactions and contracts in Tenderly:");
        console.log("https://dashboard.tenderly.co/");
        console.log("");
        console.log("NOTE: Add this virtual testnet to your MetaMask:");
        console.log("  - Network Name: Tenderly Virtual TestNet");
        console.log("  - RPC URL: [From Tenderly Dashboard]");
        console.log("  - Chain ID:", block.chainid);
        console.log("  - Currency Symbol: ETH");
        console.log("");
    }
}
