export const TENDERLY_VIRTUAL_TESTNET = {
  chainId: 1,
  name: 'Tenderly Virtual TestNet',
  rpcUrl: 'https://virtual.mainnet.eu.rpc.tenderly.co/b2790e5f-a59e-49d7-aed1-5f2e1ad28f3d',
  blockExplorer: 'https://dashboard.tenderly.co/',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  contracts: {
    entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    pqWalletFactory: '0xf527846F3219A6949A8c8241BB5d4ecf2244CadF',
    pqValidator: '0xF8e9E6B341d897Fce3bD9FF426aBaBE4c52ce288',
    pqVault: '0xc351De5746211E2B7688D7650A8bF7D91C809c0D',
    mockToken: '0x5895dAbE895b0243B345CF30df9d7070F478C47F',
    vestingManager: '0x8e043C8DF2c7ef48FE713DC4129D1b06A0644C21',
  },
} as const;

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
const networkEnv = import.meta.env.VITE_NETWORK;
export const NETWORK =
  networkEnv === 'mainnet' ? BASE_MAINNET_CONFIG :
  networkEnv === 'tenderly' ? TENDERLY_VIRTUAL_TESTNET :
  BASE_SEPOLIA_CONFIG;
