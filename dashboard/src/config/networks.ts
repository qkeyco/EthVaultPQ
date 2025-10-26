// Tenderly Ethereum Virtual TestNet (PRIMARY TEST NETWORK)
export const TENDERLY_ETHEREUM_TESTNET = {
  chainId: 73571, // Tenderly Virtual TestNet ID
  name: 'EthPQtest2',
  rpcUrl: import.meta.env.VITE_TENDERLY_RPC_URL || 'https://virtual.mainnet.us-west.rpc.tenderly.co/8d34857c-35dd-4e13-b36d-2688a4377b1f',
  blockExplorer: 'https://dashboard.tenderly.co/valisqkey/project/testnet/d1b6a33e-587b-424c-ad58-d20e6e22307a',
  // Tenderly is a fork of mainnet, so we can use mainnet Blockscout for reference
  // Note: Only mainnet contracts (like EntryPoint) will have data; Tenderly-deployed contracts won't
  blockscoutUrl: 'https://eth.blockscout.com', // Use mainnet Blockscout for reference
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  contracts: {
    entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    groth16Verifier: '0x6F5EA935F9b876d0e5E95DA5e414562B56cb3e48', // Deployed
    pqValidator: '0xf527846F3219A6949A8c8241BB5d4ecf2244CadF', // Deployed
    pqWalletFactory: '0x5895dAbE895b0243B345CF30df9d7070F478C47F', // Deployed
    zkProofOracle: '0x3651e610a22f063e194128ff9b8c3694c793dc83', // Deployed
    qrngOracle: '0xee1afbbcc8a5e0815b0e93e3f7e2e567ec8ec959', // Deployed
    mockToken: '0x4E94A1765779fe999638d26afC71b8A049a5164d', // MUSDC Deployed
    vestingManager: '0x290d5b2F55866d2357cbf0a31724850091dF5dd5', // Deployed
    pqVault4626: '', // To be deployed
    pqVault4626Demo: '', // To be deployed (fast-forward vesting)
  },
} as const;

// Sepolia Testnet (after Tenderly validation)
export const SEPOLIA_CONFIG = {
  chainId: 11155111,
  name: 'Sepolia Testnet',
  rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  blockExplorer: 'https://sepolia.etherscan.io',
  blockscoutUrl: 'https://eth-sepolia.blockscout.com', // Sepolia Blockscout
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  contracts: {
    entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    groth16Verifier: '', // To be deployed
    pqValidator: '', // To be deployed
    pqWalletFactory: '', // To be deployed
    pqVault4626: '', // To be deployed
    zkProofOracle: '', // To be deployed
    qrngOracle: '', // To be deployed
  },
} as const;

// Ethereum Mainnet (REQUIRES PROFESSIONAL AUDIT)
export const ETHEREUM_MAINNET_CONFIG = {
  chainId: 1,
  name: 'Ethereum Mainnet',
  rpcUrl: import.meta.env.VITE_MAINNET_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
  blockExplorer: 'https://etherscan.io',
  blockscoutUrl: 'https://eth.blockscout.com', // Ethereum Mainnet Blockscout
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  contracts: {
    entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    groth16Verifier: '', // To be deployed after audit
    pqValidator: '', // To be deployed after audit
    pqWalletFactory: '', // To be deployed after audit
    pqVault4626: '', // To be deployed after audit
    zkProofOracle: '', // To be deployed after audit
    qrngOracle: '', // To be deployed after audit
  },
  disabled: true, // Disabled until professional audit
} as const;

// Select network based on environment
const networkEnv = import.meta.env.VITE_NETWORK || 'tenderly';
export const NETWORK =
  networkEnv === 'mainnet' ? ETHEREUM_MAINNET_CONFIG :
  networkEnv === 'sepolia' ? SEPOLIA_CONFIG :
  TENDERLY_ETHEREUM_TESTNET; // Default to Tenderly

export const SUPPORTED_NETWORKS = [
  TENDERLY_ETHEREUM_TESTNET,
  SEPOLIA_CONFIG,
  ETHEREUM_MAINNET_CONFIG,
] as const;
