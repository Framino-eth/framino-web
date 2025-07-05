// Contract addresses for different networks
export const CONTRACTS = {
  // Arbitrum Sepolia (Chain ID: 421614)
  ARBITRUM_SEPOLIA: {
    USDC: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
    FRAMINO_NFT: process.env.NEXT_PUBLIC_FRAMINO_NFT_CONTRACT_ADDRESS || '0x73050b11f0Dd5C48Ed1C05c56236F0D235ba4f57',
    PAYMASTER: process.env.NEXT_PUBLIC_PAYMASTER_V08_ADDRESS || '0x3BA9A96eE3eFf3A69E2B18886AcF52027EFF8966',
  },
} as const;

// Chain IDs
export const CHAIN_IDS = {
  ARBITRUM_SEPOLIA: 421614,
  ETHEREUM_SEPOLIA: 11155111,
} as const;

// Get contract address for current chain
export function getUSDCAddress(chainId: number): string {
  switch (chainId) {
    case CHAIN_IDS.ARBITRUM_SEPOLIA:
      return CONTRACTS.ARBITRUM_SEPOLIA.USDC;
    default:
      throw new Error(`USDC contract not configured for chain ID: ${chainId}`);
  }
}

export function getFraminoNFTAddress(chainId: number): string {
  switch (chainId) {
    case CHAIN_IDS.ARBITRUM_SEPOLIA:
      return CONTRACTS.ARBITRUM_SEPOLIA.FRAMINO_NFT;
    default:
      throw new Error(`Framino NFT contract not configured for chain ID: ${chainId}`);
  }
}
