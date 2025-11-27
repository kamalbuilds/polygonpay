# PolygonPay - Stablecoin Payments for Dubai Merchants

## 🚀 Overview

PolygonPay is a revolutionary payment infrastructure that enables Dubai SMBs to accept stablecoin payments (USDC/USDT) with **instant settlement**, **0.4% fees**, and **zero crypto knowledge required**.

### Key Features

- ⚡ **Instant Settlement** - Payments settle in <0.4 seconds on Polygon PoS
- 💰 **0.4% Platform Fee** - 6-9x cheaper than traditional card processors
- ✅ **UAE VAT Compliant** - Automatic 5% VAT calculation and reporting
- 📱 **QR Code Payments** - Simple scan-to-pay with any Web3 wallet
- 🌍 **Arabic + English** - Bilingual interface with RTL design support
- 🚀 **Gasless Transactions** - Merchants never pay gas fees via Account Abstraction

## 🏗️ Architecture

```
PolygonPay/
├── app/                    # Next.js 15 App Router
│   ├── (merchant)/        # Merchant dashboard routes
│   ├── (customer)/        # Customer payment routes
│   ├── api/               # API routes
│   └── providers.tsx      # Wagmi + React Query providers
├── contracts/             # Solidity smart contracts
│   ├── PaymentProcessor.sol      # Core payment logic
│   ├── MerchantRegistry.sol      # Merchant KYB
│   └── FeeManager.sol            # Fee collection
├── lib/
│   ├── blockchain/        # Web3 configuration
│   ├── api/               # API clients
│   └── utils/             # Utilities (QR, formatting)
└── tests/                 # Test suites
    ├── contracts/         # Smart contract tests
    ├── frontend/          # Frontend unit tests
    └── e2e/               # End-to-end tests
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS v4** - Styling
- **Wagmi v2** - React hooks for Ethereum
- **Viem v2** - TypeScript Ethereum library
- **WalletConnect v2** - Wallet connectivity

### Blockchain
- **Polygon PoS** - Layer 2 scaling solution
- **Circle USDC** - USD stablecoin
- **Tether USDT** - USD stablecoin
- **Hardhat** - Smart contract development
- **OpenZeppelin** - Audited contract libraries
- **Biconomy SDK** - Account Abstraction (gasless transactions)

### Testing
- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing
- **Hardhat Tests** - Smart contract testing

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/kamalbuilds/polygonpay
cd polygonpay

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your .env file with:
# - WalletConnect Project ID
# - Alchemy API keys
# - Private keys for contract deployment
```

## 🚀 Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

## 📝 Smart Contract Deployment

```bash
# Compile contracts
npx hardhat compile

# Deploy to Polygon Mumbai (testnet)
npx hardhat run scripts/deploy.ts --network polygonMumbai

# Deploy to Polygon Mainnet
npx hardhat run scripts/deploy.ts --network polygonMainnet

# Verify contracts on Polygonscan
npx hardhat verify --network polygonMainnet DEPLOYED_CONTRACT_ADDRESS
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Smart contract tests
npx hardhat test

# Frontend unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 🌐 Environment Variables

Create a `.env` file with the following variables:

```bash
# Blockchain
PRIVATE_KEY=your_private_key
POLYGON_MUMBAI_RPC=https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY
POLYGON_MAINNET_RPC=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY

# Frontend
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_POLYGON_NETWORK=mumbai # or mainnet

# Deployed Contracts
NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS=0x...
NEXT_PUBLIC_MERCHANT_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_FEE_MANAGER_ADDRESS=0x...
```

## 💡 How It Works

### For Merchants

1. **Sign Up** - 5-minute onboarding with Polygon ID verification
2. **Generate QR Code** - Create payment QR codes for customers
3. **Receive Payments** - Get USDC/USDT instantly with automatic VAT reporting
4. **Convert to AED** (Optional) - Partner exchanges settle to AED within 2 hours

### For Customers

1. **Scan QR Code** - Use your mobile wallet to scan merchant QR
2. **Connect Wallet** - WalletConnect supports 300+ wallets
3. **Confirm Payment** - Approve transaction in your wallet
4. **Instant Receipt** - Get confirmation and receipt immediately

## 🎯 Roadmap

### Week 1-2 (Current)
- ✅ Smart contract deployment (PaymentProcessor, MerchantRegistry, FeeManager)
- ✅ WalletConnect v2 integration
- ✅ QR code payment system
- ✅ Merchant dashboard MVP
- ✅ Customer payment flow

### Week 3-4
- [ ] Biconomy Account Abstraction (gasless transactions)
- [ ] Arabic/English i18n with RTL support
- [ ] Polygon ID integration for KYB
- [ ] The Graph subgraph deployment
- [ ] Alchemy webhook integration

### Week 5
- [ ] Beta launch with 5-10 pilot merchants in Dubai
- [ ] Demo Day presentation
- [ ] Security audit initiation
- [ ] Fiat off-ramp partnerships (BitOasis/Rain)

### Months 2-4
- [ ] 50+ merchant onboarding
- [ ] VARA VASP licensing application
- [ ] Mobile POS app (iOS/Android)
- [ ] Advanced analytics dashboard
- [ ] Pre-seed funding round ($500K)

### Months 5-12
- [ ] Expand to Abu Dhabi, Saudi Arabia, Bahrain
- [ ] E-commerce plugins (Shopify, WooCommerce)
- [ ] Remittance platform launch
- [ ] API platform for developers
- [ ] Series A preparation ($3-5M)

## 🔒 Security

- **Audited Libraries** - Using OpenZeppelin contracts
- **Upgradeable Proxies** - UUPS pattern for safe upgrades
- **Multi-sig Treasury** - Gnosis Safe for platform fees
- **Rate Limiting** - Protection against abuse
- **Input Validation** - Comprehensive sanitization
- **Security Audit** - Planned with OpenZeppelin or Trail of Bits

## 📚 Documentation

- [Smart Contract Architecture](docs/architecture/smart-contracts.md)
- [Frontend Structure](docs/architecture/frontend-structure.md)
- [API Reference](docs/api/reference.md)
- [Testing Strategy](docs/testing/test-strategy.md)
- [Deployment Guide](docs/deployment/guide.md)

## 📄 License

MIT License - see [LICENSE](LICENSE)

## 🙏 Acknowledgments
- **Polygon Labs** - Infrastructure and technical guidance
- **Circle** - USDC stablecoin infrastructure
- **WalletConnect** - Wallet connectivity protocol
- **Biconomy** - Account Abstraction SDK
---

**Built with ❤️ for Dubai's Web3 revolution**

*Powered by Polygon PoS • Circle USDC • WalletConnect v2*
