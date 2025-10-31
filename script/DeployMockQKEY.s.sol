// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "forge-std/Script.sol";
import "../contracts/examples/MockQKEY.sol";

/**
 * @title DeployMockQKEY
 * @notice Deploys Mock QKEY token for testing
 */
contract DeployMockQKEY is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying MockQKEY...");
        console.log("Deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy MockQKEY with 10 million initial supply
        MockQKEY token = new MockQKEY(
            "Mock QKEY",           // name
            "MQKEY",               // symbol
            6,                     // decimals (like USDC)
            10_000_000 * 10**6     // 10 million tokens
        );

        console.log("MockQKEY deployed at:", address(token));
        console.log("Initial supply:", token.totalSupply() / 10**6, "MQKEY");
        console.log("Deployer balance:", token.balanceOf(deployer) / 10**6, "MQKEY");

        vm.stopBroadcast();

        console.log("\n=== Deployment Complete ===");
        console.log("Token Address:", address(token));
        console.log("Update dashboard/src/config/networks.ts with this address!");
    }
}
