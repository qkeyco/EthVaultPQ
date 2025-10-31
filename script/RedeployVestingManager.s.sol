// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {VestingManager} from "../contracts/vault/VestingManager.sol";
import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract RedeployVestingManager is Script {
    address constant MQKEY = 0x3FCF82e6CBe2Be63b19b54CA8BF97D47B45E8A76;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying new VestingManager (no onlyOwner restriction)...");

        VestingManager vestingManager = new VestingManager(IERC20(MQKEY));

        console.log("VestingManager deployed at:", address(vestingManager));
        console.log("Token:", address(vestingManager.token()));
        console.log("Owner:", vestingManager.owner());
        console.log("");
        console.log("UPDATE dashboard/src/config/networks.ts:");
        console.log("vestingManager: '", address(vestingManager), "',");

        vm.stopBroadcast();
    }
}
