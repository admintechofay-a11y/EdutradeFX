import crypto from 'crypto';
import { env } from '../config/env';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits recommended for GCM

const getKey = (): Buffer => {
  const secret = env.BROKER_SECRET_KEY || 'edutrade_broker_secret_key_32_chars_min_2026!';
  return crypto.createHash('sha256').update(secret).digest();
};

/**
 * Encrypts a string using AES-256-GCM with authenticated tag
 * Returns format: "iv_hex:tag_hex:ciphertext_hex"
 */
export function encryptBrokerCredential(plaintext: string): string {
  if (!plaintext) return '';
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${tag}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM ciphertext in "iv_hex:tag_hex:ciphertext_hex" format
 */
export function decryptBrokerCredential(ciphertextPayload: string): string {
  if (!ciphertextPayload) return '';
  const parts = ciphertextPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted credential payload format');
  }

  const [ivHex, tagHex, encryptedHex] = parts;
  const key = getKey();
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
