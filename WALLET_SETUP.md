# RainbowKit Setup Instructions

## What's Been Implemented

✅ **RainbowKit Wallet Connection**
- Complete wallet connection with support for MetaMask, WalletConnect, and other popular wallets
- Custom wallet connect button with chain switching
- Proper theme integration (light/dark mode support)

✅ **NFT Badge Minting**
- Smart contract integration hook (`useMintBadge`)
- Mint badge NFTs directly to connected wallet
- Transaction status tracking (pending, confirming, success, error)
- Blockchain explorer links for successful transactions

✅ **Updated Badge Gallery**
- "Mint to Wallet" functionality in badge modal
- Real-time wallet connection status
- Success/error state handling

## Required Setup

### 1. Get WalletConnect Project ID
1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy your Project ID
4. Replace `YOUR_PROJECT_ID` in:
   - `/src/lib/wagmi.ts`

### 2. Deploy Badge NFT Contract
1. Deploy an ERC721 contract with a `mintBadge` function
2. Update the contract address in `/src/hooks/useMintBadge.ts`
3. Replace `BADGE_CONTRACT_ADDRESS` with your deployed contract address

### 3. Set Up Metadata URIs
Update the metadata URI generation in the `handleMintBadge` function to point to your actual metadata endpoints.

## Features

- **Multi-Chain Support**: Mainnet, Polygon, Optimism, Arbitrum, Base (+ Sepolia for development)
- **Wallet Connection**: Connect/disconnect wallet with chain switching
- **Theme Integration**: Works with your existing light/dark theme
- **NFT Minting**: Mint badge NFTs directly from the UI
- **Transaction Tracking**: Real-time status updates during minting
- **Explorer Links**: Direct links to view transactions on block explorers

## Usage

1. **Connect Wallet**: Click the wallet connect button in the navigation
2. **Browse Badges**: Navigate through badge carousel
3. **Mint Badge**: Click on any badge → Click "Mint Badge NFT"
4. **View Transaction**: After successful mint, click "View on Explorer"

## Next Steps

1. Deploy your badge NFT smart contract
2. Set up metadata hosting (IPFS recommended)
3. Configure your WalletConnect Project ID
4. Customize badge earning conditions
5. Add real badge verification logic

The foundation is now in place for a complete Web3 hiking badge system!
