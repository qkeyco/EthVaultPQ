// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {PQWalletFactory} from "../contracts/core/PQWalletFactory.sol";
import {PQValidator} from "../contracts/core/PQValidator.sol";
import {IEntryPoint} from "lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";

/// @title Deploy
/// @notice Deployment script for PQ Wallet contracts
contract Deploy is Script {
    // ERC-4337 EntryPoint v0.7 address (same on all networks)
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

        vm.stopBroadcast();

        // Log deployment info
        console.log("\n=== Deployment Complete ===");
        console.log("Network:", block.chainid);
        console.log("EntryPoint:", ENTRY_POINT);
        console.log("PQValidator:", address(validator));
        console.log("PQWalletFactory:", address(factory));
        console.log("==========================\n");
    }
}
