import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';
dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const verifyEmailConnection = async (): Promise<void> => {
  try {
    await transporter.verify();
    logger.info('SMTP Email Transporter verified successfully');
  } catch (error) {
    logger.warn('SMTP connection could not be verified (check credentials in .env):', error);
  }
};
