// Contract addresses for different networks

export const TENDERLY_CONTRACTS = {
  entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  pqValidator: '0xF8e9E6B341d897Fce3bD9FF426aBaBE4c52ce288',
  pqWalletFactory: '0xf527846F3219A6949A8c8241BB5d4ecf2244CadF',
  mockToken: '0x5895dAbE895b0243B345CF30df9d7070F478C47F',
  pqVault: '0xc351De5746211E2B7688D7650A8bF7D91C809c0D',
  vestingManager: '0x8e043C8DF2c7ef48FE713DC4129D1b06A0644C21',
} as const;

export const BASE_SEPOLIA_CONTRACTS = {
  entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  pqValidator: '', // TODO: Deploy to Base Sepolia
  pqWalletFactory: '',
  mockToken: '',
  pqVault: '',
  vestingManager: '',
} as const;

export const BASE_MAINNET_CONTRACTS = {
  entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  pqValidator: '', // TODO: Deploy to Base Mainnet
  pqWalletFactory: '',
  pqVault: '',
  vestingManager: '',
} as const;

// Select contracts based on environment
const network = import.meta.env.VITE_NETWORK;

export const CONTRACTS =
  network === 'mainnet' ? BASE_MAINNET_CONTRACTS :
  network === 'tenderly' ? TENDERLY_CONTRACTS :
  BASE_SEPOLIA_CONTRACTS;
