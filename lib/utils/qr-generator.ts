import QRCode from 'qrcode';

export interface PaymentQRData {
  merchantAddress: string;
  amount?: string; // Optional pre-filled amount
  token: 'USDC' | 'USDT';
  paymentId: string;
  merchantName: string;
}

/**
 * Generate payment QR code for customer scanning
 * @param data Payment data to encode
 * @returns Promise<string> Base64 QR code image
 */
export async function generatePaymentQR(data: PaymentQRData): Promise<string> {
  // Create payment URL with encoded data
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://polygonpay.io';
  const paymentUrl = `${baseUrl}/pay/${data.merchantAddress}?${new URLSearchParams({
    token: data.token,
    amount: data.amount || '',
    paymentId: data.paymentId,
    merchant: data.merchantName,
  }).toString()}`;

  try {
    // Generate QR code with high error correction
    const qrCodeDataUrl = await QRCode.toDataURL(paymentUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error('Failed to generate payment QR code');
  }
}

/**
 * Generate WalletConnect deep link QR code
 * @param wcUri WalletConnect URI
 * @returns Promise<string> Base64 QR code image
 */
export async function generateWalletConnectQR(wcUri: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(wcUri, {
      errorCorrectionLevel: 'M',
      width: 300,
      margin: 1,
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('WalletConnect QR generation failed:', error);
    throw new Error('Failed to generate WalletConnect QR code');
  }
}

/**
 * Create printable QR code for merchant table tents
 * @param data Payment data
 * @returns Promise<Blob> PNG blob for printing
 */
export async function generatePrintableQR(data: PaymentQRData): Promise<Blob> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://polygonpay.io';
  const paymentUrl = `${baseUrl}/pay/${data.merchantAddress}?${new URLSearchParams({
    token: data.token,
    merchant: data.merchantName,
  }).toString()}`;

  try {
    // Generate high-resolution QR for printing (1200x1200)
    const canvas = document.createElement('canvas');
    await QRCode.toCanvas(canvas, paymentUrl, {
      errorCorrectionLevel: 'H',
      width: 1200,
      margin: 4,
    });

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create QR blob'));
        }
      }, 'image/png');
    });
  } catch (error) {
    console.error('Printable QR generation failed:', error);
    throw new Error('Failed to generate printable QR code');
  }
}
