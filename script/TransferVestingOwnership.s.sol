// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";

interface IVestingManager {
    function owner() external view returns (address);
    function transferOwnership(address newOwner) external;
}

contract TransferVestingOwnership is Script {
    address constant VESTING_MANAGER = 0x5833115f8FFC62b708C3fD8287586C2f09Bc7624;
    address constant NEW_OWNER = 0x341AF75662A6632F077259A0630b8bEE7bd2bbB4; // Your wallet

    function run() external {
        // Use Hardhat account #0 private key
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d715bd7a968;

        vm.startBroadcast(deployerPrivateKey);

        IVestingManager vestingManager = IVestingManager(VESTING_MANAGER);

        address currentOwner = vestingManager.owner();
        console.log("Current owner:", currentOwner);
        console.log("Transferring to:", NEW_OWNER);

        vestingManager.transferOwnership(NEW_OWNER);

        console.log("Ownership transferred!");
        console.log("New owner:", vestingManager.owner());

        vm.stopBroadcast();
    }
}
