// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "forge-std/Script.sol";
import "../contracts/oracles/PythPriceOracle.sol";
import "../contracts/vault/PQVault4626WithPricing.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DeployPythOracle
 * @notice Deployment script for Pyth Network integration
 *
 * Usage:
 *   forge script script/DeployPythOracle.s.sol:DeployPythOracle --rpc-url $RPC_URL --broadcast
 *
 * Prize Eligibility: Pyth Network Integration
 */
contract DeployPythOracle is Script {
    // Pyth contract addresses per chain
    // See: https://docs.pyth.network/price-feeds/contract-addresses/evm
    address constant PYTH_MAINNET = 0x4305FB66699C3B2702D4d05CF36551390A4c69C6;
    address constant PYTH_SEPOLIA = 0xDd24F84d36BF92C65F92307595335bdFab5Bbd21;
    address constant PYTH_TENDERLY = PYTH_MAINNET; // Use mainnet fork

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying Pyth Oracle integration...");
        console.log("Deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy PythPriceOracle
        PythPriceOracle priceOracle = new PythPriceOracle(
            PYTH_TENDERLY, // Pyth contract address
            deployer       // Owner
        );

        console.log("PythPriceOracle deployed at:", address(priceOracle));

        // Configure price feeds for common tokens
        _configurePriceFeeds(priceOracle);

        // Example: Deploy PQVault4626WithPricing
        // Uncomment when you have a token to test with
        /*
        address tokenAddress = 0xYourTokenAddress;
        PQVault4626WithPricing vault = new PQVault4626WithPricing(
            IERC20(tokenAddress),
            "PQ Vesting Vault - USDC",
            "vUSDC-PQ",
            6,  // USDC decimals
            address(priceOracle)
        );
        console.log("PQVault4626WithPricing deployed at:", address(vault));
        */

        vm.stopBroadcast();

        console.log("\n=== Deployment Summary ===");
        console.log("PythPriceOracle:", address(priceOracle));
        console.log("Network: Tenderly Ethereum Virtual TestNet");
        console.log("\nNext steps:");
        console.log("1. Verify contracts on Tenderly");
        console.log("2. Test price feeds with live data");
        console.log("3. Deploy vesting vault with pricing");
        console.log("4. Submit for Pyth Network prize eligibility");
    }

    function _configurePriceFeeds(PythPriceOracle oracle) internal {
        console.log("\nConfiguring price feeds...");

        // Configure major crypto assets
        // Price IDs from https://pyth.network/developers/price-feed-ids

        // ETH/USD
        oracle.setPriceId(
            0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, // WETH address
            0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace
        );
        console.log("Configured ETH/USD price feed");

        // BTC/USD (WBTC)
        oracle.setPriceId(
            0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599, // WBTC address
            0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43
        );
        console.log("Configured BTC/USD price feed");

        // USDC/USD
        oracle.setPriceId(
            0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48, // USDC address
            0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a
        );
        console.log("Configured USDC/USD price feed");

        // USDT/USD
        oracle.setPriceId(
            0xdAC17F958D2ee523a2206206994597C13D831ec7, // USDT address
            0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b
        );
        console.log("Configured USDT/USD price feed");

        // DAI/USD
        oracle.setPriceId(
            0x6B175474E89094C44Da98b954EedeAC495271d0F, // DAI address
            0xb0948a5e5313200c632b51bb5ca32f6de0d36e9950a942d19751e833f70dabfd
        );
        console.log("Configured DAI/USD price feed");

        console.log("Price feed configuration complete!");
    }
}
