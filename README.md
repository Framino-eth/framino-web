# Framino - Web3 Hiking Platform 🏔️

<p align="center">
  <img width="350" alt="Frame 3" src="https://github.com/user-attachments/assets/398d740a-e944-46fb-9991-1d5aebf13b8b" />
</p>

> A revolutionary platform that combines outdoor hiking adventures with blockchain technology, rewarding hikers with crypto tokens for their trail completions and enabling a decentralized hiking ecosystem.

## 🌟 Overview

Framino transforms the hiking experience by integrating Web3 technology with outdoor adventures. Hikers can discover trails, complete challenges, earn cryptocurrency rewards, and participate in a community-driven ecosystem that promotes outdoor activities and environmental conservation.

## 🚀 Features

### 🥾 Core Hiking Features
- **Trail Discovery**: Explore curated, community-verified hiking trails with detailed information
- **Interactive Maps**: Mapbox-powered trail visualization with elevation profiles
- **QR Code Checkpoints**: Scan trail markers to verify completion and progress

### 🌐 Web3 Integration
- **Wallet Connection**: MetaMask and WalletConnect support for seamless crypto integration
- **NFT Rewards**: Mint unique trail completion badges as ERC-721 tokens
- **Token Economy**: Earn FRAMINO tokens for trail completions and community participation
- **Gasless Transactions**: Account abstraction with paymaster for user-friendly experience

### 👥 Community Features
- **Hiker Profiles**: Showcase achievements, completed trails, and collected badges
- **Social Sharing**: Connect with fellow hikers and share trail experiences
- **Trail Verification**: Community-driven trail validation system

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Maps**: Mapbox GL JS

### Backend & APIs
- **API Routes**: Next.js App Router API endpoints

### Web3 & Blockchain
- **Smart Contracts**: Solidity contracts for NFT minting and token distribution
- **Web3 Library**: Wagmi + Viem for blockchain interactions
- **Wallet Integration**: RainbowKit for wallet connection
- **Account Abstraction**: Biconomy SDK for gasless transactions
- **Token Standards**: ERC-721 (NFTs), ERC-20 (utility tokens)


## 📁 Project Structure

```
framino-web/
├── public/                     # Static assets
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Landing page
│   │   ├── admin/             # Shop admin interface
│   │   │   └── page.tsx       # Item selection
│   │   ├── hiker/             # Hiker dashboard
│   │   │   └── page.tsx       # Profile & achievements
│   │   ├── church/            # Church admin interface
│   │   │   └── page.tsx       # Mark journey Complete
│   │   └── api/               # Backend API routes
│   │       └── framino/       # Blockchain integration APIs
│   ├── components/            # React components
│   │   ├── ui/               # Shadcn/ui base components
│   │   ├── BadgeGallery.tsx  # NFT collection display
│   │   ├── CameraScannerNew.tsx # QR code scanning
│   │   ├── MapboxMap.tsx     # Interactive maps
│   │   ├── MapSection.tsx    # Map integration
│   │   ├── QRDonationScanner.tsx # Donation scanning
│   │   └── WalletConnectButton.tsx # Web3 connection
│   └── lib/                  # Utility libraries
│       ├── abi/              # Smart contract ABIs
│       ├── models/           # Data models
│       ├── services/         # Business logic
│       ├── utils/            # Helper functions
│       ├── constants.ts      # App constants
│       ├── utils.ts          # Shared utilities
│       └── wagmi.ts          # Web3 configuration

```

## 🎨 Design System

### Color Palette
```css
/* Nature-inspired color scheme */
:root {
  --forest-green: #2d5a3d;
  --sage-green: #87a96b;
  --earth-brown: #8b4513;
  --sky-blue: #87ceeb;
  --stone-gray: #696969;
  --sunrise-orange: #ff7f50;
}
```

### Component Architecture
- **Atomic Design**: Components organized by complexity (atoms → molecules → organisms)
- **Shadcn/ui Base**: Consistent, accessible component foundation
- **Custom Extensions**: Hiking-specific components (BadgeGallery, MapSection, QRScanner)
- **Responsive Design**: Mobile-first approach with progressive enhancement

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager
- MetaMask or compatible Web3 wallet
- Mapbox account (for maps integration)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/framino-web.git
   cd framino-web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   # Mapbox Configuration
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
   
   # Blockchain Configuration
   NEXT_PUBLIC_CHAIN_ID=84532  # Base Sepolia testnet
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
   
   # Biconomy Account Abstraction
   NEXT_PUBLIC_BICONOMY_PAYMASTER_API_KEY=your_api_key
   NEXT_PUBLIC_BUNDLER_URL=your_bundler_url
   
   # IPFS Configuration (for NFT metadata)
   PINATA_API_KEY=your_pinata_key
   PINATA_SECRET_API_KEY=your_pinata_secret
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
```

## 🔧 Configuration

### Mapbox Setup
1. Create account at [Mapbox](https://mapbox.com)
2. Generate access token
3. Add token to environment variables
4. Configure map styles in `src/lib/constants.ts`

### Web3 Configuration
1. Configure supported chains in `src/lib/wagmi.ts`
2. Set up contract addresses in `src/lib/constants.ts`

## 🎯 Roadmap

### Phase 1: Foundation
- [x] Basic hiking trail interface
- [x] Web3 wallet integration
- [x] NFT badge minting system
- [x] QR code scanning functionality
- [x] Shop redemption system

### Phase 2: Enhancement
- [ ] Trail discovery with advanced filtering
- [ ] User profile system with statistics
- [ ] Social features and community
- [ ] Mobile app development
- [ ] Advanced tokenomics implementation

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Contributions
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following our coding standards
4. Write tests for new functionality
5. Submit a pull request

### Code Standards
- **TypeScript**: Strict mode enabled, no `any` types
- **ESLint**: Follow the configured rules
- **Prettier**: Auto-format on save
- **Commit Messages**: Use conventional commits format

### Trail Data Contributions
- Submit new trail data via GitHub issues
- Include GPS coordinates, difficulty rating, and photos
- Verify trail information accuracy
- Follow our trail data schema

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
