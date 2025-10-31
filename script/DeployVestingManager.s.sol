// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../contracts/vault/VestingManager.sol";
import "../contracts/examples/MockQKEY.sol";

contract DeployVestingManager is Script {
    function run() external {
        // Use the deployer key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address mqkeyToken = vm.envAddress("MQKEY_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy VestingManager with MQKEY token
        VestingManager vestingManager = new VestingManager(IERC20(mqkeyToken));

        console.log("VestingManager deployed at:", address(vestingManager));
        console.log("Token:", mqkeyToken);

        vm.stopBroadcast();
    }
}
