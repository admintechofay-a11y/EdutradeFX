import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID || '';
const key_secret = process.env.RAZORPAY_KEY_SECRET || '';

if (process.env.NODE_ENV === 'production') {
  if (!key_id || key_id.includes('placeholder')) {
    throw new Error('FATAL: RAZORPAY_KEY_ID is missing or contains placeholder in production environment.');
  }
  if (!key_secret || key_secret.includes('placeholder')) {
    throw new Error('FATAL: RAZORPAY_KEY_SECRET is missing or contains placeholder in production environment.');
  }
}

export const razorpayInstance = new Razorpay({
  key_id: key_id || 'dev_key_dummy',
  key_secret: key_secret || 'dev_secret_dummy',
});

export interface CreateOrderParams {
  amount: number; // in lowest denomination, e.g. paise
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export const createRazorpayOrder = async (params: CreateOrderParams) => {
  try {
    const options = {
      amount: Math.round(params.amount * 100), // Convert INR to paise
      currency: params.currency || 'INR',
      receipt: params.receipt || `rcpt_${Date.now()}`,
      notes: params.notes || {},
    };
    return await razorpayInstance.orders.create(options);
  } catch (error: any) {
    // ONLY allow mock order generation when explicitly in development AND ALLOW_MOCK_PAYMENTS=true
    if (
      process.env.NODE_ENV === 'development' &&
      process.env.ALLOW_MOCK_PAYMENTS === 'true' &&
      (!key_id || key_id.includes('placeholder'))
    ) {
      return {
        id: `order_${Date.now()}_mock`,
        entity: 'order',
        amount: Math.round(params.amount * 100),
        amount_paid: 0,
        amount_due: Math.round(params.amount * 100),
        currency: params.currency || 'INR',
        receipt: params.receipt || `rcpt_${Date.now()}`,
        status: 'created',
        created_at: Math.floor(Date.now() / 1000),
      };
    }
    throw error;
  }
};

export const verifyRazorpaySignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  // Mock signature bypass is strictly prohibited in production and staging environments.
  // It can ONLY ever trigger when NODE_ENV === 'development' AND an explicit ALLOW_MOCK_PAYMENTS=true env var is set.
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.ALLOW_MOCK_PAYMENTS === 'true' &&
    signature === 'mock_payment_signature'
  ) {
    return true;
  }

  if (!key_secret) {
    throw new Error('RAZORPAY_KEY_SECRET is not configured.');
  }

  const generatedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};
