import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';
import { defineChain } from 'viem';

// Define Tenderly Ethereum Virtual TestNet as a custom chain
export const tenderlyEthereumTestnet = defineChain({
  id: 1, // Ethereum mainnet fork
  name: 'Tenderly Ethereum Virtual TestNet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_TENDERLY_RPC_URL || 'https://virtual.mainnet.eu.rpc.tenderly.co/b2790e5f-a59e-49d7-aed1-5f2e1ad28f3d'],
    },
  },
  blockExplorers: {
    default: { name: 'Tenderly', url: 'https://dashboard.tenderly.co/' },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'EthVaultPQ',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '7c4a86c8fa62b59af8e83a0e8fb8b85e', // Temporary public ID
  chains: [tenderlyEthereumTestnet, sepolia, mainnet],
  ssr: false,
});
