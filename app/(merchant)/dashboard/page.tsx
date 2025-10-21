'use client';

import { useAccount } from 'wagmi';
import { useState } from 'react';
import { generatePaymentQR, type PaymentQRData } from '@/lib/utils/qr-generator';
import { formatAED, convertToAED, formatAddress } from '@/lib/utils/format';

export default function MerchantDashboard() {
  const { address, isConnected } = useAccount();
  const [qrCode, setQrCode] = useState<string>('');
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [qrAmount, setQrAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState<'USDC' | 'USDT'>('USDC');

  // Mock data - replace with actual blockchain queries
  const stats = {
    today: { transactions: 12, volume: 1850, aed: convertToAED(1850) },
    week: { transactions: 78, volume: 12400, aed: convertToAED(12400) },
    month: { transactions: 324, volume: 52600, aed: convertToAED(52600) },
  };

  const recentPayments = [
    { id: '1', customer: '0x1234...5678', amount: 150, token: 'USDC', timestamp: Date.now() - 300000 },
    { id: '2', customer: '0x8765...4321', amount: 75.50, token: 'USDT', timestamp: Date.now() - 600000 },
    { id: '3', customer: '0xabcd...efgh', amount: 220, token: 'USDC', timestamp: Date.now() - 900000 },
  ];

  const handleGenerateQR = async () => {
    if (!address) return;

    const qrData: PaymentQRData = {
      merchantAddress: address,
      amount: qrAmount || undefined,
      token: selectedToken,
      paymentId: `qr-${Date.now()}`,
      merchantName: 'Your Business',
    };

    const qrDataUrl = await generatePaymentQR(qrData);
    setQrCode(qrDataUrl);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Merchant Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Connect your wallet to access the merchant dashboard
          </p>
          <w3m-button />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                PolygonPay Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Merchant: {formatAddress(address)}
              </p>
            </div>
            <w3m-button />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Today', data: stats.today },
            { label: 'This Week', data: stats.week },
            { label: 'This Month', data: stats.month },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
                {stat.label}
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${stat.data.volume.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatAED(stat.data.aed)}
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.data.transactions} transactions
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Generator */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Payment QR Code
            </h2>

            {!showQRGenerator ? (
              <button
                onClick={() => setShowQRGenerator(true)}
                className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition"
              >
                Generate New QR Code
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (optional)
                  </label>
                  <input
                    type="number"
                    value={qrAmount}
                    onChange={(e) => setQrAmount(e.target.value)}
                    placeholder="Leave empty for any amount"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Token
                  </label>
                  <select
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value as 'USDC' | 'USDT')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="USDC">USDC</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerateQR}
                  className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition"
                >
                  Generate QR Code
                </button>

                {qrCode && (
                  <div className="mt-4 text-center">
                    <img src={qrCode} alt="Payment QR Code" className="mx-auto rounded-lg shadow-lg" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                      Customers can scan this QR code to pay
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Payments */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Recent Payments
            </h2>

            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      ${payment.amount} {payment.token}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      from {formatAddress(payment.customer)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(payment.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
