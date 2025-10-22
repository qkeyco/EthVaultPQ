// Tenderly Ethereum Virtual TestNet (PRIMARY TEST NETWORK)
export const TENDERLY_ETHEREUM_TESTNET = {
  chainId: 1, // Ethereum mainnet fork
  name: 'Tenderly Ethereum Virtual TestNet',
  rpcUrl: import.meta.env.VITE_TENDERLY_RPC_URL || 'https://virtual.mainnet.eu.rpc.tenderly.co/b2790e5f-a59e-49d7-aed1-5f2e1ad28f3d',
  blockExplorer: 'https://dashboard.tenderly.co/',
  blockscoutUrl: 'https://eth.blockscout.com', // Ethereum Mainnet Blockscout
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
    pqVault4626Demo: '', // To be deployed (fast-forward vesting)
    zkProofOracle: '', // To be deployed
    qrngOracle: '', // To be deployed
    mockToken: '', // To be deployed for testing
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
