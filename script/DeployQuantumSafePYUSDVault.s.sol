// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "forge-std/Script.sol";
import "../contracts/vault/PQVault4626QuantumSafe.sol";
import "../contracts/oracles/PythPriceOracle.sol";

/**
 * @title Deploy Quantum-Safe PYUSD Vault
 * @notice Deploys a quantum-resistant vault for PYUSD tax withholding
 */
contract DeployQuantumSafePYUSDVault is Script {

    // PYUSD contract address (Ethereum mainnet / Tenderly fork)
    address constant PYUSD = 0x6c3ea9036406852006290770BEdFcAbA0e23A0e8;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("========================================");
        console.log("DEPLOYING QUANTUM-SAFE PYUSD VAULT");
        console.log("========================================");
        console.log("Deployer:", deployer);
        console.log("Network:", block.chainid);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Pyth Price Oracle (if not already deployed)
        address pythAddress = _getPythAddress();
        console.log("1. Deploying Pyth Price Oracle...");
        PythPriceOracle pythOracle = new PythPriceOracle(pythAddress, deployer);
        console.log("   PythPriceOracle:", address(pythOracle));

        // Configure PYUSD price feed
        bytes32 pyusdPriceId = 0x492e751d61c10d95575377a2f4e0e69b39ccdda55c2c7f0c8e0d4950a50df141;
        pythOracle.setPriceId(PYUSD, pyusdPriceId);
        console.log("   Configured PYUSD price feed");
        console.log("");

        // 2. Get PQValidator address (must be already deployed)
        address pqValidator = vm.envAddress("PQ_VALIDATOR_ADDRESS");
        require(pqValidator != address(0), "PQValidator not deployed");
        console.log("2. Using PQValidator:", pqValidator);
        console.log("");

        // 3. Set tax treasury
        address taxTreasury = vm.envOr("TAX_TREASURY", deployer);
        console.log("3. Tax Treasury:", taxTreasury);
        console.log("");

        // 4. Deploy Quantum-Safe PYUSD Vault
        console.log("4. Deploying PQVault4626QuantumSafe...");
        PQVault4626QuantumSafe vault = new PQVault4626QuantumSafe(
            IERC20(PYUSD),
            "Quantum-Safe PYUSD Tax Vault",
            "qsPYUSD-Tax",
            6, // PYUSD has 6 decimals
            address(pythOracle),
            taxTreasury,
            pqValidator
        );
        console.log("   PQVault4626QuantumSafe:", address(vault));
        console.log("");

        // 5. Verify deployment
        console.log("========================================");
        console.log("DEPLOYMENT COMPLETE");
        console.log("========================================");
        console.log("");
        console.log("Contract Addresses:");
        console.log("-------------------");
        console.log("PYUSD:                  ", PYUSD);
        console.log("PythPriceOracle:        ", address(pythOracle));
        console.log("PQValidator:            ", pqValidator);
        console.log("QuantumSafeVault:       ", address(vault));
        console.log("TaxTreasury:            ", taxTreasury);
        console.log("");

        console.log("Vault Configuration:");
        console.log("-------------------");
        console.log("Asset:                  PYUSD");
        console.log("Decimals:               6");
        console.log("Quantum-Safe:           YES (PQWallet required)");
        console.log("Tax Withholding:        Enabled");
        console.log("IRS 83(b) Tracking:     Enabled");
        console.log("");

        console.log("Security Features:");
        console.log("-------------------");
        console.log("- Only PQWallet deposits allowed");
        console.log("- Only PQWallet withdrawals allowed");
        console.log("- Dilithium3/SPHINCS+ signature verification");
        console.log("- Quantum-resistant cryptography");
        console.log("- Future-proof against quantum computers");
        console.log("");

        console.log("Next Steps:");
        console.log("-------------------");
        console.log("1. Verify contracts on block explorer");
        console.log("2. Register PQWallets with registerPQWallet()");
        console.log("3. Employees deposit PYUSD for future tax payments");
        console.log("4. Test quantum-safe withdrawals");
        console.log("");

        vm.stopBroadcast();

        // Save deployment addresses
        _saveDeployment(address(vault), address(pythOracle), pqValidator);
    }

    function _getPythAddress() internal view returns (address) {
        uint256 chainId = block.chainid;

        // Ethereum mainnet
        if (chainId == 1) {
            return 0x4305FB66699C3B2702D4d05CF36551390A4c69C6;
        }
        // Sepolia testnet
        else if (chainId == 11155111) {
            return 0xDd24F84d36BF92C65F92307595335bdFab5Bbd21;
        }
        // Tenderly fork (use mainnet address)
        else {
            return 0x4305FB66699C3B2702D4d05CF36551390A4c69C6;
        }
    }

    function _saveDeployment(
        address vault,
        address oracle,
        address validator
    ) internal {
        string memory json = "deployment";
        vm.serializeAddress(json, "quantumSafeVault", vault);
        vm.serializeAddress(json, "pythOracle", oracle);
        vm.serializeAddress(json, "pqValidator", validator);
        vm.serializeAddress(json, "pyusd", PYUSD);

        string memory finalJson = vm.serializeUint(json, "timestamp", block.timestamp);

        string memory file = string.concat(
            "deployments/quantum-safe-vault-",
            vm.toString(block.chainid),
            ".json"
        );
        vm.writeJson(finalJson, file);

        console.log("Deployment saved to:", file);
    }
}
