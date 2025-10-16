// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {PQVault4626} from "../contracts/vault/PQVault4626.sol";
import {ERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

/// @title MockERC20
/// @notice Mock ERC20 token for testing
contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MOCK") {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

/// @title PQVault4626Test
/// @notice Unit tests for PQVault4626 contract
contract PQVault4626Test is Test {
    PQVault4626 public vault;
    MockERC20 public token;

    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public owner = address(this);

    function setUp() public {
        // Deploy mock token
        token = new MockERC20();

        // Deploy vault
        vault = new PQVault4626(token, "PQ Vault Token", "vPQT");

        // Setup users with tokens
        token.mint(user1, 1000 ether);
        token.mint(user2, 1000 ether);

        vm.prank(user1);
        token.approve(address(vault), type(uint256).max);

        vm.prank(user2);
        token.approve(address(vault), type(uint256).max);
    }

    function test_DepositWithVesting() public {
        uint256 depositAmount = 100 ether;
        uint256 vestingDuration = 365 days;
        uint256 cliffDuration = 30 days;

        vm.prank(user1);
        uint256 shares = vault.depositWithVesting(
            depositAmount,
            user1,
            vestingDuration,
            cliffDuration
        );

        assertTrue(shares > 0);

        (uint256 totalShares,,, uint256 cliffTime, uint256 vestingEnd) = vault.getVestingInfo(user1);

        assertEq(totalShares, shares);
        assertEq(cliffTime, block.timestamp + cliffDuration);
        assertEq(vestingEnd, block.timestamp + vestingDuration);
    }

    function test_WithdrawBeforeCliff() public {
        uint256 depositAmount = 100 ether;
        uint256 vestingDuration = 365 days;
        uint256 cliffDuration = 30 days;

        vm.prank(user1);
        vault.depositWithVesting(depositAmount, user1, vestingDuration, cliffDuration);

        // Try to withdraw before cliff
        vm.warp(block.timestamp + 15 days);

        vm.prank(user1);
        vm.expectRevert("Insufficient vested shares");
        vault.withdrawVested(1 ether);
    }

    function test_WithdrawAfterCliff() public {
        uint256 depositAmount = 100 ether;
        uint256 vestingDuration = 365 days;
        uint256 cliffDuration = 30 days;

        vm.startPrank(user1);
        uint256 shares = vault.depositWithVesting(
            depositAmount,
            user1,
            vestingDuration,
            cliffDuration
        );

        // Advance time to halfway through vesting
        vm.warp(block.timestamp + (vestingDuration / 2));

        // Should be able to withdraw approximately half
        (, uint256 vestedShares, uint256 withdrawnShares,,) = vault.getVestingInfo(user1);

        uint256 withdrawable = vestedShares - withdrawnShares;
        assertTrue(withdrawable > 0);
        assertTrue(withdrawable < shares);

        vault.withdrawVested(withdrawable);
        vm.stopPrank();
    }

    function test_WithdrawFullyVested() public {
        uint256 depositAmount = 100 ether;
        uint256 vestingDuration = 365 days;
        uint256 cliffDuration = 30 days;

        vm.startPrank(user1);
        uint256 shares = vault.depositWithVesting(
            depositAmount,
            user1,
            vestingDuration,
            cliffDuration
        );

        // Advance time past vesting end
        vm.warp(block.timestamp + vestingDuration + 1 days);

        // Should be able to withdraw everything
        vault.withdrawVested(shares);
        vm.stopPrank();

        (, uint256 vestedShares, uint256 withdrawnShares,,) = vault.getVestingInfo(user1);
        assertEq(vestedShares, withdrawnShares);
    }

    function test_RegularDeposit() public {
        uint256 depositAmount = 100 ether;

        vm.prank(user1);
        uint256 shares = vault.deposit(depositAmount, user1);

        assertEq(vault.balanceOf(user1), shares);
    }

    function test_Pause() public {
        vault.pause();

        vm.prank(user1);
        vm.expectRevert();
        vault.deposit(100 ether, user1);
    }

    function test_Unpause() public {
        vault.pause();
        vault.unpause();

        vm.prank(user1);
        vault.deposit(100 ether, user1);
    }
}
