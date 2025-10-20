// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../contracts/verifiers/Groth16VerifierReal.sol";

/**
 * @title DeployGroth16Verifier
 * @notice Deploys the real ZK-SNARK verifier for Dilithium signatures
 */
contract DeployGroth16Verifier is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying Groth16 Verifier (Real ZK-SNARK)...");
        console.log("Deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the verifier
        Groth16Verifier verifier = new Groth16Verifier();

        console.log("Groth16Verifier deployed at:", address(verifier));

        vm.stopBroadcast();

        console.log("\n=== Deployment Summary ===");
        console.log("Groth16Verifier:", address(verifier));
        console.log("Network: Tenderly Ethereum Virtual TestNet");
        console.log("\nNext steps:");
        console.log("1. Test ZK proof verification");
        console.log("2. Update ZKProofOracle to use new verifier");
        console.log("3. Generate and verify real proofs");
    }
}
