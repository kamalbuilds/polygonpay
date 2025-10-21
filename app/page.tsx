import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
            PolygonPay
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-4">
            Stablecoin Payments for Dubai Merchants
          </p>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Accept USDC & USDT with instant settlement, 0.4% fees, and zero crypto knowledge required
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mb-20">
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg text-lg"
            >
              Merchant Dashboard
            </Link>
            <a
              href="https://github.com/polygonpay/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-purple-600 text-purple-600 dark:text-purple-400 font-semibold px-8 py-4 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-lg"
            >
              Documentation
            </a>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {[
              {
                title: 'Instant Settlement',
                description: 'Payments settle in <0.4 seconds on Polygon PoS',
                icon: '⚡',
              },
              {
                title: '0.4% Platform Fee',
                description: '6-9x cheaper than traditional card processors',
                icon: '💰',
              },
              {
                title: 'UAE VAT Compliant',
                description: 'Automatic 5% VAT calculation and reporting',
                icon: '✅',
              },
              {
                title: 'QR Code Payments',
                description: 'Simple scan-to-pay with any Web3 wallet',
                icon: '📱',
              },
              {
                title: 'Arabic + English',
                description: 'Bilingual interface with RTL design support',
                icon: '🌍',
              },
              {
                title: 'Gasless Transactions',
                description: 'Merchants never pay gas fees via Account Abstraction',
                icon: '🚀',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-12">Built on Polygon PoS</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { label: 'Transaction Cost', value: '$0.001' },
                { label: 'Block Time', value: '0.37s' },
                { label: 'Carbon Neutral', value: '✓' },
                { label: 'TVL Secured', value: '$1B+' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-purple-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-20">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  title: 'Merchant Signs Up',
                  description: '5-minute onboarding with Polygon ID verification',
                },
                {
                  step: '2',
                  title: 'Customer Scans QR',
                  description: 'Pay with MetaMask, Trust Wallet, or any Web3 wallet',
                },
                {
                  step: '3',
                  title: 'Instant Settlement',
                  description: 'Merchant receives USDC/USDT instantly - or converts to AED',
                },
              ].map((item) => (
                <div key={item.step} className="text-left">
                  <div className="inline-block bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 mb-4">
            Built for the Hadron Payments & RWA Accelerator - Dubai 2025
          </p>
          <p className="text-sm text-gray-500">
            Powered by Polygon PoS • Circle USDC • WalletConnect v2
          </p>
        </div>
      </footer>
    </div>
  );
}
