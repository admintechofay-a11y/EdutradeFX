import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env files from both backend directory and monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('5000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required and cannot be empty'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters long for cryptographic security'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long for cryptographic security'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  ALLOW_MOCK_PAYMENTS: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

export const validateEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errorDetails = result.error.errors
      .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n');
    console.error('\n❌ FATAL: Environment variable validation failed on startup:\n' + errorDetails + '\n');
    throw new Error('Environment validation failed. Server startup aborted.');
  }

  const validated = result.data;

  // Strict production startup gate
  if (validated.NODE_ENV === 'production') {
    const missingProdVars: string[] = [];

    if (!validated.RAZORPAY_KEY_ID || validated.RAZORPAY_KEY_ID.includes('placeholder')) {
      missingProdVars.push('RAZORPAY_KEY_ID (live key required in production)');
    }
    if (!validated.RAZORPAY_KEY_SECRET || validated.RAZORPAY_KEY_SECRET.includes('placeholder')) {
      missingProdVars.push('RAZORPAY_KEY_SECRET (live secret required in production)');
    }
    if (!validated.CLOUDINARY_CLOUD_NAME || validated.CLOUDINARY_CLOUD_NAME.includes('placeholder')) {
      missingProdVars.push('CLOUDINARY_CLOUD_NAME');
    }
    if (!validated.CLOUDINARY_API_KEY || validated.CLOUDINARY_API_KEY.includes('placeholder')) {
      missingProdVars.push('CLOUDINARY_API_KEY');
    }
    if (!validated.CLOUDINARY_API_SECRET || validated.CLOUDINARY_API_SECRET.includes('placeholder')) {
      missingProdVars.push('CLOUDINARY_API_SECRET');
    }

    if (missingProdVars.length > 0) {
      console.error(
        '\n❌ FATAL: Production startup gate failed. Missing or placeholder values for required services:\n' +
          missingProdVars.map((v) => `  - ${v}`).join('\n') +
          '\n'
      );
      throw new Error(`Production startup gate failed: ${missingProdVars.join(', ')}`);
    }
  }

  return validated;
};

export const env = validateEnv();
