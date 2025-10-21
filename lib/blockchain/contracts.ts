// Smart Contract ABIs and Addresses
export const PAYMENT_PROCESSOR_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "merchant", "type": "address"},
      {"internalType": "address", "name": "token", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "bytes32", "name": "paymentId", "type": "bytes32"}
    ],
    "name": "processPayment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "paymentId", "type": "bytes32"},
      {"indexed": true, "internalType": "address", "name": "merchant", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "customer", "type": "address"},
      {"indexed": false, "internalType": "address", "name": "token", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "fee", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "PaymentReceived",
    "type": "event"
  }
] as const;

export const MERCHANT_REGISTRY_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "businessName", "type": "string"},
      {"internalType": "string", "name": "vatNumber", "type": "string"},
      {"internalType": "string", "name": "polygonIdDID", "type": "string"}
    ],
    "name": "registerMerchant",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "merchant", "type": "address"}],
    "name": "getMerchant",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "wallet", "type": "address"},
          {"internalType": "string", "name": "businessName", "type": "string"},
          {"internalType": "string", "name": "vatNumber", "type": "string"},
          {"internalType": "string", "name": "polygonIdDID", "type": "string"},
          {"internalType": "bool", "name": "isVerified", "type": "bool"},
          {"internalType": "bool", "name": "isActive", "type": "bool"},
          {"internalType": "uint256", "name": "registeredAt", "type": "uint256"},
          {"internalType": "uint256", "name": "totalTransactions", "type": "uint256"},
          {"internalType": "uint256", "name": "totalVolume", "type": "uint256"}
        ],
        "internalType": "struct MerchantRegistry.Merchant",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Token contracts
export const ERC20_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Contract addresses
const isMainnet = process.env.NEXT_PUBLIC_POLYGON_NETWORK === 'mainnet';

export const CONTRACTS = {
  PAYMENT_PROCESSOR: process.env.NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS || '',
  MERCHANT_REGISTRY: process.env.NEXT_PUBLIC_MERCHANT_REGISTRY_ADDRESS || '',
  FEE_MANAGER: process.env.NEXT_PUBLIC_FEE_MANAGER_ADDRESS || '',

  USDC: isMainnet
    ? '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' // Polygon Mainnet USDC
    : '0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97', // Mumbai USDC

  USDT: isMainnet
    ? '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' // Polygon Mainnet USDT
    : '0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832', // Mumbai USDT
} as const;

// Supported stablecoins
export const STABLECOINS = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: CONTRACTS.USDC,
    decimals: 6,
    logo: '/tokens/usdc.png',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: CONTRACTS.USDT,
    decimals: 6,
    logo: '/tokens/usdt.png',
  },
] as const;
