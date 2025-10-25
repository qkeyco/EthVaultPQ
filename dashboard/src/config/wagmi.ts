// RainbowKit config replaced with plain wagmi config to avoid WalletConnect projectId requirement
// import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { defineChain } from 'viem';

// Define Tenderly Ethereum Virtual TestNet as a custom chain
export const tenderlyEthereumTestnet = defineChain({
  id: 73571, // Tenderly Virtual TestNet ID
  name: 'EthPQtest2',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_TENDERLY_RPC_URL || 'https://virtual.mainnet.us-west.rpc.tenderly.co/8d34857c-35dd-4e13-b36d-2688a4377b1f'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Tenderly Explorer',
      url: 'https://dashboard.tenderly.co/valisqkey/project/testnet/d1b6a33e-587b-424c-ad58-d20e6e22307a'
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
