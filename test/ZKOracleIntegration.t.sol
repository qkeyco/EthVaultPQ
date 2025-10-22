// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {ZKProofOracle} from "../contracts/oracles/ZKProofOracle.sol";

/// @title ZKOracleIntegrationTest
/// @notice Integration tests for deployed ZKProofOracle on Tenderly
contract ZKOracleIntegrationTest is Test {
    // Deployed contract addresses on Tenderly
    address constant GROTH16_VERIFIER = 0x1b7754689d5bDf4618aA52dDD319D809a00B0843;
    address constant ZK_ORACLE = 0x312D098B64e32ef04736662249bd57AEfe053750;

    ZKProofOracle oracle;
    address deployer = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

    function setUp() public {
        // Fork Tenderly network
        string memory rpcUrl = vm.envString("RPC_URL");
        vm.createSelectFork(rpcUrl);

        // Connect to deployed oracle
        oracle = ZKProofOracle(ZK_ORACLE);
    }

    function test_OracleDeployed() public view {
        console.log("Testing ZKProofOracle deployment...");

        // Verify oracle exists
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(ZK_ORACLE)
        }
        assertTrue(codeSize > 0, "Oracle contract should exist");

        console.log("  Oracle exists at:", ZK_ORACLE);
        console.log("  Code size:", codeSize);
    }

    function test_OracleConfiguration() public view {
        console.log("\nTesting Oracle Configuration...");

        // Check verifier address
        address verifier = address(oracle.verifier());
        assertEq(verifier, GROTH16_VERIFIER, "Verifier should match deployed address");
        console.log("  Verifier address:", verifier);

        // Check proof fee
        uint256 fee = oracle.proofFee();
        assertEq(fee, 0.001 ether, "Proof fee should be 0.001 ETH");
        console.log("  Proof fee:", fee, "wei (0.001 ETH)");

        // Check deployer is operator
        bool isOperator = oracle.operators(deployer);
        assertTrue(isOperator, "Deployer should be operator");
        console.log("  Deployer is operator:", isOperator);

        // Check request expiration
        uint256 expiration = oracle.requestExpiration();
        assertEq(expiration, 1 hours, "Expiration should be 1 hour");
        console.log("  Request expiration:", expiration, "seconds (1 hour)");
    }

    function test_RequestProof() public {
        console.log("\nTesting Proof Request...");

        // Prepare test data (valid Dilithium3 sizes)
        bytes memory message = "Test message for ZK proof";
        bytes memory signature = new bytes(3309); // ML-DSA-65 signature size
        bytes memory publicKey = new bytes(1952); // ML-DSA-65 public key size

        // Fill with test data
        for (uint i = 0; i < signature.length; i++) {
            signature[i] = bytes1(uint8(i % 256));
        }
        for (uint i = 0; i < publicKey.length; i++) {
            publicKey[i] = bytes1(uint8((i * 7) % 256));
        }

        // Request proof with payment
        vm.deal(address(this), 1 ether);
        bytes32 requestId = oracle.requestProof{value: 0.001 ether}(
            message,
            signature,
            publicKey
        );

        console.log("  Request ID:", vm.toString(requestId));

        // Verify request was created
        ZKProofOracle.ProofRequest memory request = oracle.getRequest(requestId);

        assertEq(request.requester, address(this), "Requester should be this contract");
        assertEq(request.messageHash, keccak256(message), "Message hash should match");
        assertEq(request.publicKeyHash, keccak256(publicKey), "Public key hash should match");
        assertTrue(request.timestamp > 0, "Timestamp should be set");

        console.log("  Requester:", request.requester);
        console.log("  Message hash:", vm.toString(request.messageHash));
        console.log("  Timestamp:", request.timestamp);

        // Check request status
        bool isFulfilled = oracle.isRequestFulfilled(requestId);
        assertFalse(isFulfilled, "Request should not be fulfilled yet");
        console.log("  Is fulfilled:", isFulfilled);

        console.log("  \u2713 Proof request successful!");
    }

    function test_GasEstimates() public {
        console.log("\nTesting Gas Estimates...");

        bytes memory message = "Gas test message";
        bytes memory signature = new bytes(3309);
        bytes memory publicKey = new bytes(1952);

        vm.deal(address(this), 1 ether);

        uint256 gasBefore = gasleft();
        oracle.requestProof{value: 0.001 ether}(message, signature, publicKey);
        uint256 gasUsed = gasBefore - gasleft();

        console.log("  Gas used for requestProof:", gasUsed);
        console.log("  Estimated cost @ 20 gwei:", (gasUsed * 20 gwei) / 1e9, "gwei");

        // Gas should be reasonable (< 700k) - includes storing signature data
        assertTrue(gasUsed < 700000, "Request should use < 700k gas");
    }

    function test_MultipleRequests() public {
        console.log("\nTesting Multiple Requests...");

        vm.deal(address(this), 1 ether);

        for (uint i = 0; i < 3; i++) {
            bytes memory message = abi.encodePacked("Message ", i);
            bytes memory signature = new bytes(3309);
            bytes memory publicKey = new bytes(1952);

            bytes32 requestId = oracle.requestProof{value: 0.001 ether}(
                message,
                signature,
                publicKey
            );

            console.log("  Request", i, ":", vm.toString(requestId));
        }

        console.log("  \u2713 Multiple requests successful!");
    }

    // Allow receiving ETH
    receive() external payable {}
}
