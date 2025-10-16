// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {PQWalletFactory} from "../contracts/core/PQWalletFactory.sol";
import {PQValidator} from "../contracts/core/PQValidator.sol";
import {PQVault4626} from "../contracts/vault/PQVault4626.sol";
import {IEntryPoint} from "lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {ERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

/// @title MockToken
/// @notice Mock ERC20 for testnet deployment
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

/// @title DeployTestnet
/// @notice Deployment script for Base Sepolia testnet
contract DeployTestnet is Script {
    // ERC-4337 EntryPoint v0.7 address
    address constant ENTRY_POINT = 0x0000000071727De22E5E9d8BAf0edAc6f37da032;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy PQ Validator
        console.log("Deploying PQValidator...");
        PQValidator validator = new PQValidator();
        console.log("PQValidator deployed at:", address(validator));

        // 2. Deploy Wallet Factory
        console.log("Deploying PQWalletFactory...");
        PQWalletFactory factory = new PQWalletFactory(
            IEntryPoint(ENTRY_POINT),
            validator
        );
        console.log("PQWalletFactory deployed at:", address(factory));

        // 3. Deploy Mock Token (for testnet only)
        console.log("Deploying MockToken...");
        MockToken token = new MockToken();
        console.log("MockToken deployed at:", address(token));

        // 4. Deploy Vault
        console.log("Deploying PQVault4626...");
        PQVault4626 vault = new PQVault4626(
            token,
            "PQ Vault USDC",
            "vUSDC"
        );
        console.log("PQVault4626 deployed at:", address(vault));

        vm.stopBroadcast();

        // Log deployment info
        console.log("\n=== Base Sepolia Deployment ===");
        console.log("Network:", block.chainid);
        console.log("EntryPoint:", ENTRY_POINT);
        console.log("PQValidator:", address(validator));
        console.log("PQWalletFactory:", address(factory));
        console.log("MockToken (MUSDC):", address(token));
        console.log("PQVault4626:", address(vault));
        console.log("==============================\n");

        // Save to file for frontend
        console.log("\nAdd these to dashboard/src/config/contracts.ts:");
        console.log("export const CONTRACTS = {");
        console.log("  pqValidator: '%s',", address(validator));
        console.log("  pqWalletFactory: '%s',", address(factory));
        console.log("  mockToken: '%s',", address(token));
        console.log("  pqVault: '%s',", address(vault));
        console.log("};");
    }
}
