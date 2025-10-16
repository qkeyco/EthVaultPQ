import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia, mainnet } from 'wagmi/chains';
import { defineChain } from 'viem';

// Define Tenderly Virtual TestNet as a custom chain
export const tenderlyVirtualTestnet = defineChain({
  id: 1,
  name: 'Tenderly Virtual TestNet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://virtual.mainnet.eu.rpc.tenderly.co/b2790e5f-a59e-49d7-aed1-5f2e1ad28f3d'],
    },
  },
  blockExplorers: {
    default: { name: 'Tenderly', url: 'https://dashboard.tenderly.co/' },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'PQ Wallet',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Get from https://cloud.walletconnect.com
  chains: [tenderlyVirtualTestnet, baseSepolia, base, mainnet],
  ssr: false,
});
