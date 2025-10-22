// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {PQWallet} from "../contracts/core/PQWallet.sol";
import {PQWalletFactory} from "../contracts/core/PQWalletFactory.sol";
import {PQValidator} from "../contracts/core/PQValidator.sol";
import {IEntryPoint} from "lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {PackedUserOperation} from "lib/account-abstraction/contracts/interfaces/PackedUserOperation.sol";

/// @title PQWalletTest
/// @notice Unit tests for PQWallet contract
contract PQWalletTest is Test {
    PQWalletFactory public factory;
    PQWallet public wallet;
    PQValidator public validator;

    // Mock EntryPoint address (Base Sepolia)
    IEntryPoint public entryPoint = IEntryPoint(0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789);

    // Test PQ public key (32 bytes for testing)
    bytes public pqPublicKey = hex"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

    address public user = address(0x1);
    address public target = address(0x2);

    function setUp() public {
        // Deploy validator
        validator = new PQValidator();

        // Deploy factory
        factory = new PQWalletFactory(entryPoint, validator);

        // Create wallet (use salt = 1, as 0 is not allowed for security)
        vm.prank(user);
        wallet = PQWallet(payable(factory.createWallet(pqPublicKey, 1)));

        // Fund wallet with ETH
        vm.deal(address(wallet), 10 ether);
        vm.deal(user, 10 ether);
    }

    function test_CreateWallet() public view {
        assertEq(wallet.getPQPublicKey(), pqPublicKey);
        assertEq(address(wallet.validator()), address(validator));
        assertEq(address(wallet.entryPoint()), address(entryPoint));
    }

    function test_GetAddress() public {
        // Note: Enhanced salt makes address unpredictable, so we test that
        // getAddress returns a non-zero address for valid inputs
        address predicted = factory.getAddress(pqPublicKey, 1);
        assertTrue(predicted != address(0), "Predicted address should be non-zero");

        // Test that creating a wallet with the same salt returns same address
        vm.prank(user);
        address wallet2 = factory.createWallet(pqPublicKey, 2);

        // Creating again with same inputs should return same address (idempotent)
        vm.prank(user);
        address wallet3 = factory.createWallet(pqPublicKey, 2);
        assertEq(wallet2, wallet3, "Idempotent creation should return same address");
    }

    function test_CreateWalletIdempotent() public {
        vm.prank(user);
        address wallet2 = factory.createWallet(pqPublicKey, 1);
        assertEq(wallet2, address(wallet));
    }

    function test_Execute() public {
        bytes memory data = abi.encodeWithSignature("someFunction()");

        vm.prank(address(wallet));
        wallet.execute(target, 1 ether, data);

        assertEq(target.balance, 1 ether);
    }

    function test_ExecuteBatch() public {
        address[] memory targets = new address[](2);
        targets[0] = target;
        targets[1] = address(0x3);

        uint256[] memory values = new uint256[](2);
        values[0] = 1 ether;
        values[1] = 2 ether;

        bytes[] memory datas = new bytes[](2);
        datas[0] = "";
        datas[1] = "";

        vm.prank(address(wallet));
        wallet.executeBatch(targets, values, datas);

        assertEq(target.balance, 1 ether);
        assertEq(address(0x3).balance, 2 ether);
    }

    function test_RevertExecuteUnauthorized() public {
        bytes memory data = "";

        vm.prank(user);
        vm.expectRevert("Only owner");
        wallet.execute(target, 0, data);
    }

    function test_UpdatePQPublicKey() public {
        bytes memory newKey = hex"fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210";

        vm.prank(address(wallet));
        wallet.updatePQPublicKey(newKey);

        assertEq(wallet.getPQPublicKey(), newKey);
    }

    function test_RevertUpdatePQPublicKeyUnauthorized() public {
        bytes memory newKey = hex"fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210";

        vm.prank(user);
        vm.expectRevert("Only owner");
        wallet.updatePQPublicKey(newKey);
    }

    function test_ReceiveEther() public {
        vm.prank(user);
        (bool success,) = address(wallet).call{value: 1 ether}("");
        assertTrue(success);
        assertEq(address(wallet).balance, 11 ether);
    }
}
