// RainbowKit config replaced with plain wagmi config to avoid WalletConnect projectId requirement
// import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { defineChain } from 'viem';

// Define Tenderly Ethereum Virtual TestNet as a custom chain
export const tenderlyEthereumTestnet = defineChain({
  id: 73571, // Tenderly Virtual TestNet ID
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
    default: {
      name: 'Tenderly Explorer',
      url: 'https://dashboard.tenderly.co/explorer/vnet/b2790e5f-a59e-49d7-aed1-5f2e1ad28f3d'
    },
  },
  testnet: true,
});

// Plain wagmi config without RainbowKit/WalletConnect
export const config = createConfig({
  chains: [tenderlyEthereumTestnet, sepolia, mainnet],
  transports: {
    [tenderlyEthereumTestnet.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
});
