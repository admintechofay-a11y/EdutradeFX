import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret';

export const razorpayInstance = new Razorpay({
  key_id,
  key_secret,
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
    // If running in development without live keys, generate mock order response
    if (process.env.NODE_ENV !== 'production' && key_id.includes('placeholder')) {
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
  if (process.env.NODE_ENV !== 'production' && signature === 'mock_payment_signature') {
    return true;
  }

  const generatedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};
