'use client';

import { use, useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, keccak256, toBytes } from 'viem';
import { PAYMENT_PROCESSOR_ABI, ERC20_ABI, CONTRACTS, STABLECOINS } from '@/lib/blockchain/contracts';
import { formatAED, convertToAED, formatTokenAmount, calculateFee, calculateMerchantAmount } from '@/lib/utils/format';

export default function PaymentPage({
  params,
}: {
  params: Promise<{ merchantAddress: string }>;
}) {
  const resolvedParams = use(params);
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState<'USDC' | 'USDT'>('USDC');
  const [step, setStep] = useState<'input' | 'approve' | 'pay' | 'success'>('input');

  const { writeContract: approveToken, data: approveHash } = useWriteContract();
  const { writeContract: processPayment, data: paymentHash } = useWriteContract();

  const { isLoading: isApproving, isSuccess: approveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isLoading: isPaying, isSuccess: paymentSuccess } = useWaitForTransactionReceipt({
    hash: paymentHash,
  });

  // Auto-advance steps
  useEffect(() => {
    if (approveSuccess && step === 'approve') {
      setStep('pay');
    }
  }, [approveSuccess, step]);

  useEffect(() => {
    if (paymentSuccess && step === 'pay') {
      setStep('success');
    }
  }, [paymentSuccess, step]);

  const handlePayment = async () => {
    if (!amount || !isConnected || !address) return;

    const token = STABLECOINS.find(t => t.symbol === selectedToken);
    if (!token) return;

    const amountWei = parseUnits(amount, token.decimals);
    const paymentId = keccak256(toBytes(`${address}-${Date.now()}`));

    // Step 1: Approve token spending
    setStep('approve');
    approveToken({
      address: token.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACTS.PAYMENT_PROCESSOR as `0x${string}`, amountWei],
    });
  };

  useEffect(() => {
    if (step === 'pay' && approveSuccess) {
      const token = STABLECOINS.find(t => t.symbol === selectedToken);
      if (!token || !amount) return;

      const amountWei = parseUnits(amount, token.decimals);
      const paymentId = keccak256(toBytes(`${address}-${Date.now()}`));

      // Step 2: Process payment
      processPayment({
        address: CONTRACTS.PAYMENT_PROCESSOR as `0x${string}`,
        abi: PAYMENT_PROCESSOR_ABI,
        functionName: 'processPayment',
        args: [
          resolvedParams.merchantAddress as `0x${string}`,
          token.address as `0x${string}`,
          amountWei,
          paymentId,
        ],
      });
    }
  }, [step, approveSuccess, selectedToken, amount, address, processPayment, resolvedParams.merchantAddress]);

  const amountNum = parseFloat(amount) || 0;
  const aedAmount = convertToAED(amountNum);
  const fee = calculateFee(parseUnits(amount || '0', 6));
  const merchantReceives = calculateMerchantAmount(parseUnits(amount || '0', 6));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Pay with Crypto
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Instant settlement • 0.4% fee
          </p>
        </div>

        {step === 'input' && (
          <div className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 text-2xl font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                  USD
                </span>
              </div>
              {amountNum > 0 && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  ≈ {formatAED(aedAmount)}
                </p>
              )}
            </div>

            {/* Token Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Payment Token
              </label>
              <div className="grid grid-cols-2 gap-3">
                {STABLECOINS.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => setSelectedToken(token.symbol as 'USDC' | 'USDT')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedToken === token.symbol
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 dark:text-white">{token.symbol}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{token.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fee Breakdown */}
            {amountNum > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Platform Fee (0.4%)</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatTokenAmount(fee)} {selectedToken}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-gray-900 dark:text-white">Merchant Receives</span>
                  <span className="text-green-600 dark:text-green-400">
                    {formatTokenAmount(merchantReceives)} {selectedToken}
                  </span>
                </div>
              </div>
            )}

            {/* Pay Button */}
            {!isConnected ? (
              <w3m-button />
            ) : (
              <button
                onClick={handlePayment}
                disabled={!amount || amountNum <= 0}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                Pay {amount} {selectedToken}
              </button>
            )}
          </div>
        )}

        {(step === 'approve' || step === 'pay') && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {step === 'approve' ? 'Approving Token...' : 'Processing Payment...'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please confirm the transaction in your wallet
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Payment Successful!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your payment has been processed instantly
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Transaction Hash:</p>
              <p className="font-mono text-xs text-gray-900 dark:text-white mt-1 break-all">
                {paymentHash}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
