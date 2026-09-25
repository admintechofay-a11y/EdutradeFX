import { transporter } from '../config/email';
import { logger } from './logger';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@edutradefx.com';
const FROM_NAME = process.env.FROM_NAME || 'EdutradeFX Platform';

const baseEmailLayout = (title: string, bodyContent: string): string => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      body { margin: 0; padding: 0; background-color: #0A0F1E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F9FAFB; }
      .container { max-width: 600px; margin: 30px auto; background-color: #111827; border: 1px solid #2D3748; border-radius: 8px; overflow: hidden; }
      .header { background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%); padding: 30px; text-align: center; }
      .header h1 { margin: 0; color: #FFFFFF; font-size: 26px; font-weight: 800; letter-spacing: 0.5px; }
      .header p { margin: 6px 0 0 0; color: #E0E7FF; font-size: 14px; }
      .content { padding: 36px 30px; color: #E5E7EB; line-height: 1.6; font-size: 15px; }
      .btn { display: inline-block; padding: 14px 28px; background-color: #3B82F6; color: #FFFFFF !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 24px 0; text-align: center; }
      .btn:hover { background-color: #2563EB; }
      .footer { background-color: #0F172A; padding: 24px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #1E293B; }
      .badge { display: inline-block; padding: 4px 10px; background-color: #1E293B; border: 1px solid #374151; border-radius: 4px; color: #F59E0B; font-weight: bold; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>EdutradeFX</h1>
        <p>Global Forex Marketplace, Education & Trading Ecosystem</p>
      </div>
      <div class="content">
        ${bodyContent}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} EdutradeFX Global. All rights reserved.</p>
        <p>You received this email because you have an account or active inquiry on EdutradeFX.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

export const escapeHtml = (text: string | null | undefined): string => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const sendMailSafely = async (to: string, subject: string, html: string, text: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      text,
      html,
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    logger.warn(`Failed to dispatch email to ${to}:`, error);
  }
};

export const sendVerificationEmail = async (email: string, name: string, token: string): Promise<void> => {
  const safeName = escapeHtml(name);
  const verifyUrl = `${FRONTEND_URL}/verify-email/${encodeURIComponent(token)}`;
  const subject = 'Verify your EdutradeFX account';
  const html = baseEmailLayout(
    subject,
    `
    <h2>Welcome to EdutradeFX, ${safeName}!</h2>
    <p>Thank you for signing up for the premier forex marketplace and learning ecosystem. Please confirm your email address by clicking the button below:</p>
    <div style="text-align: center;">
      <a href="${verifyUrl}" class="btn">Verify Email Address</a>
    </div>
    <p style="font-size: 13px; color: #9CA3AF;">This verification link will expire in 24 hours. If the button above doesn't work, copy and paste this URL into your browser:</p>
    <p style="word-break: break-all; color: #60A5FA; font-size: 12px;">${verifyUrl}</p>
    `
  );
  await sendMailSafely(email, subject, html, `Verify your EdutradeFX account by visiting: ${verifyUrl}`);
};

export const sendPasswordResetEmail = async (email: string, name: string, token: string): Promise<void> => {
  const safeName = escapeHtml(name);
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
  const subject = 'Reset your EdutradeFX password';
  const html = baseEmailLayout(
    subject,
    `
    <h2>Password Reset Request</h2>
    <p>Hello ${safeName},</p>
    <p>We received a request to reset your password. Click the secure link below to choose a new password:</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </div>
    <p style="font-size: 13px; color: #9CA3AF;"><strong>Notice:</strong> This password reset link is valid for 1 hour. If you did not initiate this request, you can safely disregard this email.</p>
    <p style="word-break: break-all; color: #60A5FA; font-size: 12px;">${resetUrl}</p>
    `
  );
  await sendMailSafely(email, subject, html, `Reset your password at: ${resetUrl}`);
};

export const sendWelcomeEmail = async (email: string, name: string, role: string): Promise<void> => {
  const safeName = escapeHtml(name);
  const safeRole = escapeHtml(role);
  const subject = 'Welcome to the EdutradeFX Trading Network';
  const html = baseEmailLayout(
    subject,
    `
    <h2>Welcome, ${safeName}!</h2>
    <p>Your account as a <span class="badge">${safeRole}</span> is now active on EdutradeFX.</p>
    <p>Explore institutional and retail broker comparisons, learn through high-impact courses, connect with verified account managers and professional signal providers.</p>
    <div style="text-align: center;">
      <a href="${FRONTEND_URL}/dashboard" class="btn">Go to Dashboard</a>
    </div>
    `
  );
  await sendMailSafely(email, subject, html, `Welcome to EdutradeFX! Access your dashboard at ${FRONTEND_URL}/dashboard`);
};

export const sendApprovalEmail = async (email: string, name: string, type: string): Promise<void> => {
  const safeName = escapeHtml(name);
  const safeType = escapeHtml(type);
  const subject = `Your EdutradeFX ${safeType} Profile has been Approved!`;
  const html = baseEmailLayout(
    subject,
    `
    <h2 style="color: #10B981;">Congratulations, ${safeName}!</h2>
    <p>Your application and profile for <strong>${safeType}</strong> has been officially reviewed and approved by our compliance team.</p>
    <p>Your listing is now live across the EdutradeFX directory and visible to thousands of traders globally.</p>
    <div style="text-align: center;">
      <a href="${FRONTEND_URL}/dashboard" class="btn">Manage Your Listing</a>
    </div>
    `
  );
  await sendMailSafely(email, subject, html, `Your ${type} profile has been approved on EdutradeFX!`);
};

export const sendRejectionEmail = async (email: string, name: string, type: string, reason?: string): Promise<void> => {
  const safeName = escapeHtml(name);
  const safeType = escapeHtml(type);
  const safeReason = escapeHtml(reason);
  const subject = `Update regarding your EdutradeFX ${safeType} Application`;
  const html = baseEmailLayout(
    subject,
    `
    <h2>Application Status Update</h2>
    <p>Hello ${safeName},</p>
    <p>Thank you for submitting your ${safeType} application. After reviewing your credentials and submitted documents, our verification team was unable to approve your application at this time.</p>
    ${safeReason ? `<div style="background-color: #1F2937; padding: 16px; border-left: 4px solid #EF4444; margin: 16px 0;"><strong>Reason:</strong> ${safeReason}</div>` : ''}
    <p>You can update your profile information and re-submit your verification documents from your dashboard.</p>
    <div style="text-align: center;">
      <a href="${FRONTEND_URL}/dashboard" class="btn">Review Dashboard</a>
    </div>
    `
  );
  await sendMailSafely(email, subject, html, `Update on your EdutradeFX application: ${reason || 'Application not approved'}`);
};

export const sendEnrollmentConfirmation = async (email: string, name: string, courseName: string): Promise<void> => {
  const safeName = escapeHtml(name);
  const safeCourse = escapeHtml(courseName);
  const subject = `Enrollment Confirmed: ${safeCourse}`;
  const html = baseEmailLayout(
    subject,
    `
    <h2>You're Enrolled!</h2>
    <p>Hello ${safeName},</p>
    <p>Your enrollment in <strong>${safeCourse}</strong> is confirmed. You now have full access to all curriculum modules, downloadable resources, and progress tracking.</p>
    <div style="text-align: center;">
      <a href="${FRONTEND_URL}/dashboard/enrollments" class="btn">Start Learning Now</a>
    </div>
    `
  );
  await sendMailSafely(email, subject, html, `You're enrolled in ${courseName}. Start learning at ${FRONTEND_URL}/dashboard/enrollments`);
};

export const sendPayoutProcessed = async (email: string, name: string, amount: number): Promise<void> => {
  const safeName = escapeHtml(name);
  const subject = 'Your Payout has been Processed';
  const html = baseEmailLayout(
    subject,
    `
    <h2>Payout Processed Successfully</h2>
    <p>Hello ${safeName},</p>
    <p>We have processed your payout request of <strong>₹${amount.toLocaleString('en-IN')}</strong>.</p>
    <p>The funds will reflect in your registered bank account according to standard settlement timelines (typically 1-3 business days).</p>
    <div style="text-align: center;">
      <a href="${FRONTEND_URL}/dashboard/payouts" class="btn">View Payout History</a>
    </div>
    `
  );
  await sendMailSafely(email, subject, html, `Your payout of ₹${amount} has been processed.`);
};
