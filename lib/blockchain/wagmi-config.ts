import { http, createConfig } from 'wagmi';
import { polygon, polygonMumbai } from 'wagmi/chains';
import { walletConnect } from 'wagmi/connectors';

// Get environment variables
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';
const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '';
const isProduction = process.env.NEXT_PUBLIC_POLYGON_NETWORK === 'mainnet';

export const config = createConfig({
  chains: isProduction ? [polygon] : [polygonMumbai],
  connectors: [
    walletConnect({
      projectId,
      metadata: {
        name: 'PolygonPay',
        description: 'Stablecoin payments for Dubai merchants',
        url: 'https://polygonpay.io',
        icons: ['https://polygonpay.io/logo.png'],
      },
      showQrModal: true,
    }),
  ],
  transports: {
    [polygon.id]: http(`https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`),
    [polygonMumbai.id]: http(`https://polygon-mumbai.g.alchemy.com/v2/${alchemyKey}`),
  },
});
