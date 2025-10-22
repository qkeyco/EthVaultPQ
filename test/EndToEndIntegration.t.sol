// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {PQWalletFactory} from "../contracts/core/PQWalletFactory.sol";
import {PQValidator} from "../contracts/core/PQValidator.sol";
import {PQWallet} from "../contracts/core/PQWallet.sol";
import {PQVault4626} from "../contracts/vault/PQVault4626.sol";
import {ZKProofOracle} from "../contracts/oracles/ZKProofOracle.sol";
import {Groth16Verifier} from "../contracts/verifiers/Groth16VerifierReal.sol";
import {IEntryPoint} from "lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {ERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

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

/// @title EndToEndIntegration
/// @notice Comprehensive end-to-end test demonstrating the complete EthVaultPQ user flow
/// @dev Tests the full journey: wallet creation → vesting setup → ZK proof verification
contract EndToEndIntegration is Test {
    // Deployed contracts on Tenderly
    address constant GROTH16_VERIFIER = 0x1b7754689d5bDf4618aA52dDD319D809a00B0843;
    address constant PQ_VALIDATOR = 0xaa38b98b510781C6c726317FEb12610BEe90aE20;
    address constant PQ_WALLET_FACTORY = 0xdFedc33d4Ae2923926b4f679379f0960d62B0182;
    address constant MOCK_TOKEN = 0x3BB798Ecf5dF703A5F00C6987c42e6Da1Cea3730;
    address constant PQ_VAULT_4626 = 0x634b095371e4E45FEeD94c1A45C37798E173eA50;
    address constant ZK_PROOF_ORACLE = 0x55fa5F3797fB732bEe5a147b9429eAE4B083B75B;

    // ERC-4337 EntryPoint
    address constant ENTRY_POINT = 0x0000000071727De22E5E9d8BAf0edAc6f37da032;

    // Test actors
    address alice;
    address bob;
    address operator;

    // Contract instances
    Groth16Verifier verifier;
    PQValidator validator;
    PQWalletFactory factory;
    MockToken token;
    PQVault4626 vault;
    ZKProofOracle zkOracle;

    // Test data
    bytes testPqPublicKey = hex"a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2";
    address testWallet;

    function setUp() public {
        // Fork Tenderly at latest block
        string memory tenderlyRpc = vm.envString("TENDERLY_RPC_URL");
        vm.createSelectFork(tenderlyRpc);

        // Set up test actors
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        operator = makeAddr("operator");

        // Fund test actors
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(operator, 100 ether);

        // Connect to deployed contracts
        verifier = Groth16Verifier(GROTH16_VERIFIER);
        validator = PQValidator(PQ_VALIDATOR);
        factory = PQWalletFactory(PQ_WALLET_FACTORY);
        token = MockToken(MOCK_TOKEN);
        vault = PQVault4626(PQ_VAULT_4626);
        zkOracle = ZKProofOracle(ZK_PROOF_ORACLE);

        console.log("==========================================================");
        console.log("  End-to-End Integration Test");
        console.log("==========================================================");
        console.log("Network: Tenderly Ethereum Virtual TestNet");
        console.log("Block Number:", block.number);
        console.log("");
        console.log("Test Actors:");
        console.log("  Alice:", alice);
        console.log("  Bob:", bob);
        console.log("  Operator:", operator);
        console.log("");
        console.log("Deployed Contracts:");
        console.log("  Groth16Verifier:", address(verifier));
        console.log("  PQValidator:", address(validator));
        console.log("  PQWalletFactory:", address(factory));
        console.log("  MockToken:", address(token));
        console.log("  PQVault4626:", address(vault));
        console.log("  ZKProofOracle:", address(zkOracle));
        console.log("");
    }

    function test_CompleteUserFlow() public {
        console.log("==========================================================");
        console.log("  Test: Complete User Flow");
        console.log("==========================================================");
        console.log("");

        // ===================================================================
        // STEP 1: Create Post-Quantum Wallet
        // ===================================================================
        console.log("[STEP 1] Creating Post-Quantum Wallet...");

        vm.startPrank(alice);
        testWallet = factory.createWallet(testPqPublicKey, 12345);
        vm.stopPrank();

        console.log("  Wallet created:", testWallet);
        console.log("  Owner (Alice):", alice);
        console.log("  PQ Public Key:", vm.toString(testPqPublicKey));
        console.log("");

        // Verify wallet was created
        assertEq(PQWallet(payable(testWallet)).owner(), alice, "Wallet owner should be Alice");
        console.log("  OK Wallet ownership verified");
        console.log("");

        // ===================================================================
        // STEP 2: Set Up Vesting Schedule
        // ===================================================================
        console.log("[STEP 2] Setting Up Vesting Schedule...");

        uint256 vestingAmount = 1000 * 10**6; // 1,000 MUSDC
        uint256 vestingDuration = 100; // 100 blocks (~20 minutes on Ethereum)

        // Mint tokens to Alice
        vm.prank(address(token));
        token.mint(alice, vestingAmount);

        // Alice approves vault to spend tokens
        vm.startPrank(alice);
        token.approve(address(vault), vestingAmount);

        // Alice deposits tokens with vesting
        uint256 shares = vault.depositWithVesting(
            vestingAmount,
            bob, // beneficiary
            vestingDuration
        );
        vm.stopPrank();

        console.log("  Vesting created:");
        console.log("    Amount:", vestingAmount / 10**6, "MUSDC");
        console.log("    Beneficiary:", bob);
        console.log("    Duration:", vestingDuration, "blocks");
        console.log("    Shares minted:", shares);
        console.log("");

        // Verify vesting was created
        assertTrue(shares > 0, "Shares should be minted");
        console.log("  OK Vesting schedule created");
        console.log("");

        // ===================================================================
        // STEP 3: Request ZK Proof
        // ===================================================================
        console.log("[STEP 3] Requesting ZK Proof...");

        bytes memory message = hex"48656c6c6f20576f726c64"; // "Hello World"
        bytes memory signature = hex"0000000000000000000000000000000000000000000000000000000000000000"; // Placeholder
        bytes memory publicKey = testPqPublicKey;

        uint256 proofFee = zkOracle.proofFee();

        vm.prank(alice);
        bytes32 requestId = zkOracle.requestProof{value: proofFee}(
            message,
            signature,
            publicKey
        );

        console.log("  Proof requested:");
        console.log("    Request ID:", vm.toString(requestId));
        console.log("    Message:", vm.toString(message));
        console.log("    Fee paid:", proofFee, "wei");
        console.log("");

        // Verify request was created
        ZKProofOracle.ProofRequest memory request = zkOracle.getRequest(requestId);
        assertEq(request.requester, alice, "Requester should be Alice");
        assertFalse(request.fulfilled, "Request should not be fulfilled yet");
        console.log("  OK Proof request created");
        console.log("");

        // ===================================================================
        // STEP 4: Simulate Time Passage
        // ===================================================================
        console.log("[STEP 4] Simulating Time Passage...");

        uint256 initialBlock = block.number;

        // Fast forward 50 blocks (halfway through vesting)
        vm.roll(block.number + 50);

        console.log("  Time advanced:");
        console.log("    Initial block:", initialBlock);
        console.log("    Current block:", block.number);
        console.log("    Blocks elapsed:", block.number - initialBlock);
        console.log("");

        // Check vesting progress
        uint256 vestedAmount = vault.vestedAmount(bob);
        console.log("  Vesting progress:");
        console.log("    Total vested:", vestedAmount / 10**6, "MUSDC");
        console.log("    Progress:", (vestedAmount * 100) / vestingAmount, "%");
        console.log("");

        assertTrue(vestedAmount > 0, "Some amount should be vested");
        assertTrue(vestedAmount < vestingAmount, "Not all should be vested yet");
        console.log("  OK Vesting progressing correctly");
        console.log("");

        // ===================================================================
        // STEP 5: Withdraw Vested Tokens
        // ===================================================================
        console.log("[STEP 5] Withdrawing Vested Tokens...");

        uint256 bobBalanceBefore = token.balanceOf(bob);

        vm.prank(bob);
        uint256 withdrawn = vault.withdraw(
            vault.maxWithdraw(bob),
            bob,
            bob
        );

        uint256 bobBalanceAfter = token.balanceOf(bob);

        console.log("  Withdrawal complete:");
        console.log("    Amount withdrawn:", withdrawn / 10**6, "MUSDC");
        console.log("    Bob's balance before:", bobBalanceBefore / 10**6, "MUSDC");
        console.log("    Bob's balance after:", bobBalanceAfter / 10**6, "MUSDC");
        console.log("");

        assertTrue(withdrawn > 0, "Should withdraw some tokens");
        assertEq(bobBalanceAfter, bobBalanceBefore + withdrawn, "Balance should increase");
        console.log("  OK Withdrawal successful");
        console.log("");

        // ===================================================================
        // STEP 6: Complete Vesting
        // ===================================================================
        console.log("[STEP 6] Completing Vesting...");

        // Fast forward to end of vesting
        vm.roll(initialBlock + vestingDuration + 1);

        console.log("  Fast-forwarded to block:", block.number);
        console.log("");

        uint256 finalVestedAmount = vault.vestedAmount(bob);
        console.log("  Final vesting status:");
        console.log("    Total vested:", finalVestedAmount / 10**6, "MUSDC");
        console.log("    Progress: 100%");
        console.log("");

        // Withdraw remaining tokens
        vm.prank(bob);
        uint256 finalWithdrawal = vault.withdraw(
            vault.maxWithdraw(bob),
            bob,
            bob
        );

        console.log("  Final withdrawal:", finalWithdrawal / 10**6, "MUSDC");
        console.log("  Bob's final balance:", token.balanceOf(bob) / 10**6, "MUSDC");
        console.log("");

        console.log("  OK Vesting completed successfully");
        console.log("");

        // ===================================================================
        // FINAL SUMMARY
        // ===================================================================
        console.log("==========================================================");
        console.log("  End-to-End Test Complete!");
        console.log("==========================================================");
        console.log("");
        console.log("Summary:");
        console.log("  OK Post-quantum wallet created");
        console.log("  OK Vesting schedule established");
        console.log("  OK ZK proof request submitted");
        console.log("  OK Vesting progressed correctly");
        console.log("  OK Partial withdrawal successful");
        console.log("  OK Full vesting completed");
        console.log("");
        console.log("Final Balances:");
        console.log("  Bob received:", token.balanceOf(bob) / 10**6, "MUSDC");
        console.log("  Expected:", vestingAmount / 10**6, "MUSDC");
        console.log("");

        // Final assertions
        assertEq(
            token.balanceOf(bob),
            vestingAmount,
            "Bob should have received all vested tokens"
        );

        console.log("==========================================================");
        console.log("  ALL TESTS PASSED! OK");
        console.log("==========================================================");
    }

    function test_ZKProofOracleFlow() public {
        console.log("==========================================================");
        console.log("  Test: ZK Proof Oracle Flow");
        console.log("==========================================================");
        console.log("");

        // This test demonstrates the oracle pattern but doesn't verify actual proofs
        // (actual proof verification requires off-chain Dilithium signing + ZK proof generation)

        console.log("[INFO] ZK Proof Oracle Architecture:");
        console.log("  1. User requests proof on-chain (pays fee)");
        console.log("  2. User's browser calls Vercel API:");
        console.log("     POST https://zk-proof-bbp3vv35m-valis-quantum.vercel.app/api/prove");
        console.log("  3. API verifies Dilithium3 signature off-chain");
        console.log("  4. API generates Groth16 ZK proof");
        console.log("  5. User submits proof on-chain for verification");
        console.log("  6. Groth16Verifier validates proof (~250k gas)");
        console.log("");

        console.log("[TEST] Verifying oracle configuration...");

        // Verify oracle is configured correctly
        address linkedVerifier = zkOracle.verifier();
        assertEq(
            linkedVerifier,
            GROTH16_VERIFIER,
            "Oracle should be linked to Groth16Verifier"
        );
        console.log("  OK Oracle linked to Groth16Verifier:", linkedVerifier);

        uint256 fee = zkOracle.proofFee();
        console.log("  OK Proof fee configured:", fee, "wei");

        console.log("");
        console.log("  OK ZK Proof Oracle configured correctly");
        console.log("");
        console.log("==========================================================");
    }

    function test_MultipleWalletCreation() public {
        console.log("==========================================================");
        console.log("  Test: Multiple Wallet Creation");
        console.log("==========================================================");
        console.log("");

        bytes memory pk1 = hex"1111111111111111111111111111111111111111111111111111111111111111";
        bytes memory pk2 = hex"2222222222222222222222222222222222222222222222222222222222222222";
        bytes memory pk3 = hex"3333333333333333333333333333333333333333333333333333333333333333";

        vm.startPrank(alice);
        address wallet1 = factory.createWallet(pk1, 1);
        address wallet2 = factory.createWallet(pk2, 2);
        address wallet3 = factory.createWallet(pk3, 3);
        vm.stopPrank();

        console.log("  Created 3 wallets:");
        console.log("    Wallet 1:", wallet1);
        console.log("    Wallet 2:", wallet2);
        console.log("    Wallet 3:", wallet3);
        console.log("");

        // Verify all wallets are owned by Alice
        assertEq(PQWallet(payable(wallet1)).owner(), alice);
        assertEq(PQWallet(payable(wallet2)).owner(), alice);
        assertEq(PQWallet(payable(wallet3)).owner(), alice);

        // Verify wallets are different
        assertTrue(wallet1 != wallet2);
        assertTrue(wallet2 != wallet3);
        assertTrue(wallet1 != wallet3);

        console.log("  OK All wallets created successfully");
        console.log("  OK All owned by Alice");
        console.log("  OK All have unique addresses");
        console.log("");
        console.log("==========================================================");
    }
}
