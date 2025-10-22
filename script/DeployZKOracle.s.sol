// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../contracts/oracles/ZKProofOracle.sol";

/**
 * @title DeployZKOracle
 * @notice Deploys ZKProofOracle with existing Groth16VerifierReal
 */
contract DeployZKOracle is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // Groth16VerifierReal address from previous deployment
        address verifierAddress = 0x1b7754689d5bDf4618aA52dDD319D809a00B0843;

        console.log("Deploying ZKProofOracle...");
        console.log("Deployer:", deployer);
        console.log("Using Groth16VerifierReal at:", verifierAddress);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy ZKProofOracle
        ZKProofOracle zkOracle = new ZKProofOracle(verifierAddress);

        console.log("ZKProofOracle deployed at:", address(zkOracle));
        console.log("Proof fee:", zkOracle.proofFee(), "wei (0.001 ETH)");
        console.log("Deployer is operator:", zkOracle.operators(deployer));

        vm.stopBroadcast();

        console.log("\n=== Deployment Summary ===");
        console.log("ZKProofOracle:", address(zkOracle));
        console.log("Groth16VerifierReal:", verifierAddress);
        console.log("\nNext steps:");
        console.log("1. Add to .env: ZK_ORACLE_ADDRESS=%s", address(zkOracle));
        console.log("2. Test proof request/fulfill workflow");
        console.log("3. Verify gas costs");
    }
}
