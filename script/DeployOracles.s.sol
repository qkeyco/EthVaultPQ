// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/DilithiumVerifier.sol";
import "../contracts/oracles/ZKProofOracle.sol";
import "../contracts/oracles/QRNGOracle.sol";

/**
 * @title DeployOracles
 * @notice Deploy ZKProofOracle and QRNGOracle contracts
 *
 * Usage (Tenderly):
 * forge script script/DeployOracles.s.sol:DeployOracles --rpc-url $TENDERLY_RPC_URL --broadcast --slow
 *
 * Usage (Mainnet):
 * forge script script/DeployOracles.s.sol:DeployOracles --rpc-url $RPC_URL --broadcast --verify
 */
contract DeployOracles is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying oracles with account:", deployer);
        console.log("Account balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Groth16 Verifier
        console.log("\n1. Deploying Groth16Verifier...");
        Groth16Verifier verifier = new Groth16Verifier();
        console.log("Groth16Verifier deployed at:", address(verifier));

        // 2. Deploy ZK Proof Oracle
        console.log("\n2. Deploying ZKProofOracle...");
        ZKProofOracle zkOracle = new ZKProofOracle(address(verifier));
        console.log("ZKProofOracle deployed at:", address(zkOracle));
        console.log("Proof fee:", zkOracle.proofFee() / 1e15, "finney (0.001 ETH)");

        // 3. Deploy QRNG Oracle
        console.log("\n3. Deploying QRNGOracle...");
        QRNGOracle qrngOracle = new QRNGOracle();
        console.log("QRNGOracle deployed at:", address(qrngOracle));
        console.log("Randomness fee:", qrngOracle.randomnessFee() / 1e15, "finney (0.0005 ETH)");

        vm.stopBroadcast();

        // Output deployment addresses for easy copy/paste
        console.log("\n===========================================");
        console.log("DEPLOYMENT SUMMARY");
        console.log("===========================================");
        console.log("Groth16Verifier:", address(verifier));
        console.log("ZKProofOracle:", address(zkOracle));
        console.log("QRNGOracle:", address(qrngOracle));
        console.log("===========================================\n");

        console.log("Add these to oracle-service/.env:");
        console.log("ZK_ORACLE_ADDRESS=%s", address(zkOracle));
        console.log("QRNG_ORACLE_ADDRESS=%s", address(qrngOracle));

        // Verification commands
        console.log("\nVerify contracts with:");
        console.log("forge verify-contract %s Groth16Verifier --chain-id 11155111", address(verifier));
        console.log("forge verify-contract %s ZKProofOracle --chain-id 11155111 --constructor-args $(cast abi-encode \"constructor(address)\" %s)", address(zkOracle), address(verifier));
        console.log("forge verify-contract %s QRNGOracle --chain-id 11155111", address(qrngOracle));
    }
}
