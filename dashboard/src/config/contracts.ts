// Contract addresses for different networks

export const TENDERLY_CONTRACTS = {
  entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  groth16Verifier: '0x1b7754689d5bDf4618aA52dDD319D809a00B0843',
  pqValidator: '0xaa38b98b510781C6c726317FEb12610BEe90aE20',
  pqWalletFactory: '0xdFedc33d4Ae2923926b4f679379f0960d62B0182',
  mockToken: '0x3BB798Ecf5dF703A5F00C6987c42e6Da1Cea3730',
  pqVault: '0x634b095371e4E45FEeD94c1A45C37798E173eA50', // Alias for pqVault4626
  pqVault4626: '0x634b095371e4E45FEeD94c1A45C37798E173eA50',
  pqVault4626Demo: '0x05060D66d43897Bf93922e8bF8819126dfcc96AF',
  zkProofOracle: '0x55fa5F3797fB732bEe5a147b9429eAE4B083B75B',
  qrngOracle: '0xF631eb60D0A403499A8Df8CBd22935e0c0406D72',
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
