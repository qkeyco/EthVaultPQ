export const BASE_SEPOLIA_CONFIG = {
  chainId: 84532,
  name: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org',
  blockExplorer: 'https://sepolia.basescan.org',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  contracts: {
    entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032', // ERC-4337 v0.7
    pqWalletFactory: '0x...', // TODO: Fill after deployment
    pqValidator: '0x...', // TODO: Fill after deployment
    pqVault: '0x...', // TODO: Fill after deployment
    mockToken: '0x...', // TODO: Fill after deployment
  },
  faucets: {
    eth: 'https://www.coinbase.com/faucets/base-ethereum-goerli-faucet',
  },
} as const;

export const BASE_MAINNET_CONFIG = {
  chainId: 8453,
  name: 'Base',
  rpcUrl: 'https://mainnet.base.org',
  blockExplorer: 'https://basescan.org',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  contracts: {
    entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    pqWalletFactory: '0x...', // TODO: Fill after deployment
    pqValidator: '0x...', // TODO: Fill after deployment
    pqVault: '0x...', // TODO: Fill after deployment
  },
} as const;

// Select network based on environment
const isMainnet = import.meta.env.VITE_NETWORK === 'mainnet';
export const NETWORK = isMainnet ? BASE_MAINNET_CONFIG : BASE_SEPOLIA_CONFIG;
