/**
 * Format token amount with proper decimals
 * @param amount Amount in smallest unit (e.g., 1000000 for 1 USDC)
 * @param decimals Token decimals (default 6 for USDC/USDT)
 * @returns Formatted string
 */
export function formatTokenAmount(amount: bigint | string, decimals: number = 6): string {
  const amountBigInt = typeof amount === 'string' ? BigInt(amount) : amount;
  const divisor = BigInt(10 ** decimals);
  const wholePart = amountBigInt / divisor;
  const fractionalPart = amountBigInt % divisor;

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');

  if (trimmedFractional === '') {
    return wholePart.toString();
  }

  return `${wholePart}.${trimmedFractional}`;
}

/**
 * Parse user input to token amount
 * @param input User input string (e.g., "100.50")
 * @param decimals Token decimals
 * @returns Amount in smallest unit
 */
export function parseTokenAmount(input: string, decimals: number = 6): bigint {
  const [whole = '0', fraction = ''] = input.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  const amountStr = whole + paddedFraction;
  return BigInt(amountStr);
}

/**
 * Format AED currency
 * @param amount Amount in AED
 * @returns Formatted string (e.g., "AED 150.00")
 */
export function formatAED(amount: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convert USDC/USDT to AED (assuming 1 USD = 3.67 AED)
 * @param usdAmount Amount in USD
 * @returns Amount in AED
 */
export function convertToAED(usdAmount: number): number {
  const USD_TO_AED_RATE = 3.67;
  return usdAmount * USD_TO_AED_RATE;
}

/**
 * Format wallet address for display
 * @param address Ethereum address
 * @returns Shortened address (e.g., "0x1234...5678")
 */
export function formatAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format transaction hash
 * @param hash Transaction hash
 * @returns Shortened hash
 */
export function formatTxHash(hash: string): string {
  if (hash.length < 10) return hash;
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

/**
 * Format timestamp to human-readable date
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted date string
 */
export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp * 1000));
}

/**
 * Calculate platform fee (0.4%)
 * @param amount Payment amount
 * @returns Fee amount
 */
export function calculateFee(amount: bigint): bigint {
  const FEE_BPS = BigInt(40); // 0.4% = 40 basis points
  const BPS_DENOMINATOR = BigInt(10000);
  return (amount * FEE_BPS) / BPS_DENOMINATOR;
}

/**
 * Calculate merchant receives (amount - fee)
 * @param amount Payment amount
 * @returns Amount merchant receives
 */
export function calculateMerchantAmount(amount: bigint): bigint {
  const fee = calculateFee(amount);
  return amount - fee;
}
