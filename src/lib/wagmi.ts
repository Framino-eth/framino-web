import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';
import { defineChain } from 'viem';

// Custom Arbitrum Sepolia chain definition
export const arbitrumSepolia = defineChain({
  id: 421614,
  name: 'Arbitrum Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://arbitrum-sepolia.drpc.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arbiscan Sepolia',
      url: 'https://sepolia.arbiscan.io',
    },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'Framino - Web3 Hiking Platform',
  projectId: 'YOUR_PROJECT_ID', // You'll need to get this from WalletConnect Cloud
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    ...(process.env.NODE_ENV === 'development' ? [sepolia, arbitrumSepolia] : []),
  ],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
