import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../config/database';
import {
  hashPassword,
  comparePassword,
  generateSecureToken,
  hashToken,
} from '../../utils/bcrypt.utils';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt.utils';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from '../../utils/email.utils';
import { AppError } from '../../middleware/error.middleware';
import { Role, ApprovalStatus, BrokerOnboardingStatus } from '@prisma/client';
import { logger } from '../../utils/logger';
import { normalizeToE164 } from '../../utils/phone.utils';

export class AuthService {
  /**
   * Helper to exclude sensitive password and token fields from user response
   */
  private sanitizeUser(user: any) {
    const { password, emailVerifyToken, resetToken, twoFactorSecret, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Check if email address is available (not in User or PendingRegistration)
   */
  async checkEmail(email: string) {
    const normalized = (email || '').trim().toLowerCase();
    if (!normalized) {
      return { available: false };
    }

    const [existingUser, existingPending] = await Promise.all([
      prisma.user.findFirst({
        where: { email: normalized },
        select: { id: true },
      }),
      prisma.pendingRegistration.findFirst({
        where: {
          email: normalized,
          expiresAt: { gt: new Date() },
        },
        select: { id: true },
      }),
    ]);

    return { available: !existingUser && !existingPending };
  }

  /**
   * Register a new trader (A5: Verify before account is created).
   * Stores credentials in PendingRegistration and sends a verification link.
   * User record is NOT created until email is verified.
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    consent?: boolean;
    consentAt?: string;
    consentVersion?: string;
  }) {
    const email = data.email.trim().toLowerCase();
    const phone = data.phone ? normalizeToE164(data.phone) || data.phone.trim() : null;

    // Check existing User table
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });
    if (existingUser) {
      throw new AppError('An account with this email address already exists.', StatusCodes.CONFLICT);
    }

    // Check existing PendingRegistration
    const existingPending = await prisma.pendingRegistration.findUnique({
      where: { email },
    });
    if (existingPending && existingPending.expiresAt > new Date()) {
      throw new AppError(
        'A registration is already pending for this email. Please check your inbox for the verification link.',
        StatusCodes.CONFLICT
      );
    } else if (existingPending) {
      // Remove stale/expired pending record
      await prisma.pendingRegistration.delete({ where: { email } }).catch(() => {});
    }

    const hashedPassword = await hashPassword(data.password);
    const verificationRawToken = generateSecureToken();
    const hashedVerificationToken = hashToken(verificationRawToken);
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.pendingRegistration.create({
      data: {
        email,
        name: data.name.trim(),
        passwordHash: hashedPassword,
        phone,
        role: Role.STUDENT,
        payload: {
          consentAt: data.consentAt || new Date().toISOString(),
          consentVersion: data.consentVersion || '1.0',
        },
        tokenHash: hashedVerificationToken,
        expiresAt: verificationExpiry,
      },
    });

    try {
      await sendVerificationEmail(email, data.name.trim(), verificationRawToken);
    } catch (err: any) {
      logger.error('Failed to send registration verification email:', err);
      await prisma.pendingRegistration.delete({ where: { email } }).catch(() => {});
      throw new AppError(
        'Failed to dispatch verification email. Please check SMTP configuration or try again later.',
        StatusCodes.SERVICE_UNAVAILABLE
      );
    }

    return {
      message: 'Check your email to complete registration. We have sent a verification link to your inbox.',
      email,
    };
  }

  /**
   * Register a partner account (BROKER, SIGNAL_PROVIDER, TUTOR, ACCOUNT_MANAGER).
   * Also uses PendingRegistration flow (A5).
   */
  async registerPartner(data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    phone?: string;
    companyName?: string;
    bio?: string;
    website?: string;
    consent?: boolean;
    consentAt?: string;
    consentVersion?: string;
  }) {
    if (data.role === Role.ADMIN || data.role === Role.STUDENT) {
      throw new AppError('Unauthorized role specified for partner registration.', StatusCodes.FORBIDDEN);
    }

    const email = data.email.trim().toLowerCase();
    const phone = data.phone ? normalizeToE164(data.phone) || data.phone.trim() : null;

    const existingUser = await prisma.user.findFirst({
      where: { email },
    });
    if (existingUser) {
      throw new AppError('An account with this email address already exists.', StatusCodes.CONFLICT);
    }

    const existingPending = await prisma.pendingRegistration.findUnique({
      where: { email },
    });
    if (existingPending && existingPending.expiresAt > new Date()) {
      throw new AppError(
        'A partner application is already pending verification for this email. Please check your inbox.',
        StatusCodes.CONFLICT
      );
    } else if (existingPending) {
      await prisma.pendingRegistration.delete({ where: { email } }).catch(() => {});
    }

    const hashedPassword = await hashPassword(data.password);
    const verificationRawToken = generateSecureToken();
    const hashedVerificationToken = hashToken(verificationRawToken);
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.pendingRegistration.create({
      data: {
        email,
        name: data.name.trim(),
        passwordHash: hashedPassword,
        phone,
        role: data.role,
        payload: {
          companyName: data.companyName?.trim() || data.name.trim(),
          bio: data.bio?.trim() || null,
          website: data.website?.trim() || null,
          consentAt: data.consentAt || new Date().toISOString(),
          consentVersion: data.consentVersion || '1.0',
        },
        tokenHash: hashedVerificationToken,
        expiresAt: verificationExpiry,
      },
    });

    try {
      await sendVerificationEmail(email, data.name.trim(), verificationRawToken);
    } catch (err: any) {
      logger.error('Failed to send partner registration verification email:', err);
      await prisma.pendingRegistration.delete({ where: { email } }).catch(() => {});
      throw new AppError(
        'Failed to dispatch verification email. Please check SMTP configuration or try again later.',
        StatusCodes.SERVICE_UNAVAILABLE
      );
    }

    return {
      message: 'Check your email to complete registration. We have sent a verification link to your inbox.',
      email,
    };
  }

  /**
   * Resend verification email for pending registration or unverified user
   */
  async resendVerification(email: string) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return { message: 'If an unverified account exists with that email, a verification link has been sent.' };
    }

    // 1. Check PendingRegistration first
    const pending = await prisma.pendingRegistration.findUnique({
      where: { email: cleanEmail },
    });

    if (pending) {
      const newRawToken = generateSecureToken();
      const newHashed = hashToken(newRawToken);
      const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.pendingRegistration.update({
        where: { id: pending.id },
        data: {
          tokenHash: newHashed,
          expiresAt: newExpiry,
        },
      });

      try {
        await sendVerificationEmail(pending.email, pending.name, newRawToken);
      } catch (err) {
        logger.error('Failed to resend verification email to pending:', err);
      }

      return { message: 'If an unverified account exists with that email, a verification link has been sent.' };
    }

    // 2. Check unverified legacy User
    const user = await prisma.user.findFirst({
      where: { email: cleanEmail, isEmailVerified: false },
    });

    if (user) {
      const newRawToken = generateSecureToken();
      const newHashed = hashToken(newRawToken);
      const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerifyToken: newHashed,
          emailVerifyExpiry: newExpiry,
        },
      });

      try {
        await sendVerificationEmail(user.email, user.name, newRawToken);
      } catch (err) {
        logger.error('Failed to resend verification email to user:', err);
      }
    }

    return { message: 'If an unverified account exists with that email, a verification link has been sent.' };
  }

  /**
   * Admin-only user creation (Can assign any role including ADMIN, for internal admin management)
   */
  async adminCreateUser(data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    phone?: string | null;
    isActive?: boolean;
    isEmailVerified?: boolean;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new AppError('An account with this email address already exists.', StatusCodes.CONFLICT);
    }

    const hashedPassword = await hashPassword(data.password);
    const normalizedPhone = data.phone ? normalizeToE164(data.phone) || data.phone : null;

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: data.role,
        phone: normalizedPhone,
        isActive: data.isActive !== undefined ? data.isActive : true,
        isEmailVerified: data.isEmailVerified !== undefined ? data.isEmailVerified : true,
      },
    });

    return {
      user: this.sanitizeUser(user),
      message: `User created successfully with role ${data.role}.`,
    };
  }

  /**
   * Login existing user with email or mobile phone
   */
  async login(identifier: string, password: string) {
    const cleanId = (identifier || '').trim();
    const normalizedPhone = normalizeToE164(cleanId) || cleanId;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanId.toLowerCase() },
          { phone: cleanId },
          { phone: normalizedPhone },
        ],
      },
    });

    if (!user) {
      throw new AppError('Invalid email/mobile or password credentials.', StatusCodes.UNAUTHORIZED);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', StatusCodes.FORBIDDEN);
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password credentials.', StatusCodes.UNAUTHORIZED);
    }

    // Require email verification
    if (!user.isEmailVerified) {
      throw new AppError(
        'Please verify your email address to access your account. Check your inbox for the verification link.',
        StatusCodes.FORBIDDEN
      );
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
    });

    const refreshTokenString = generateRefreshToken({ userId: user.id });
    const hashedRefreshToken = hashToken(refreshTokenString);
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: hashedRefreshToken,
        expiresAt: refreshTokenExpiry,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken: refreshTokenString,
    };
  }

  /**
   * Refresh expired access token using valid refresh token
   */
  async refreshToken(rawRefreshToken: string) {
    if (!rawRefreshToken) {
      throw new AppError('Refresh token required.', StatusCodes.UNAUTHORIZED);
    }

    const decoded = verifyRefreshToken(rawRefreshToken);
    if (!decoded) {
      throw new AppError('Invalid or expired refresh token.', StatusCodes.UNAUTHORIZED);
    }

    const hashedToken = hashToken(rawRefreshToken);
    const tokenDoc = await prisma.refreshToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (!tokenDoc || tokenDoc.isRevoked || tokenDoc.expiresAt < new Date()) {
      throw new AppError('Refresh token revoked or expired.', StatusCodes.UNAUTHORIZED);
    }

    if (!tokenDoc.user || !tokenDoc.user.isActive) {
      throw new AppError('User account associated with this token is inactive.', StatusCodes.UNAUTHORIZED);
    }

    // Rotate refresh token
    await prisma.refreshToken.update({
      where: { id: tokenDoc.id },
      data: { isRevoked: true },
    });

    const newAccessToken = generateAccessToken({
      userId: tokenDoc.user.id,
      role: tokenDoc.user.role,
    });

    const newRefreshTokenString = generateRefreshToken({ userId: tokenDoc.user.id });
    const newHashed = hashToken(newRefreshTokenString);
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: tokenDoc.user.id,
        token: newHashed,
        expiresAt: newExpiry,
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenString,
      user: this.sanitizeUser(tokenDoc.user),
    };
  }

  /**
   * Revoke refresh token on logout
   */
  async logout(rawRefreshToken: string) {
    if (!rawRefreshToken) return;
    const hashed = hashToken(rawRefreshToken);
    await prisma.refreshToken.updateMany({
      where: { token: hashed },
      data: { isRevoked: true },
    });
  }

  /**
   * Initiate forgot password flow
   */
  async forgotPassword(email: string) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // Don't disclose whether email exists for anti-enumeration
    if (!user) {
      return { message: 'If an account exists with that email, a password reset link has been dispatched.' };
    }

    const rawToken = generateSecureToken();
    const hashed = hashToken(rawToken);
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashed,
        resetTokenExpiry: expiry,
      },
    });

    try {
      await sendPasswordResetEmail(user.email, user.name, rawToken);
    } catch (err) {
      logger.error('Failed to send password reset email:', err);
      throw new AppError(
        'Failed to dispatch password reset email. Please try again later.',
        StatusCodes.SERVICE_UNAVAILABLE
      );
    }

    return { message: 'If an account exists with that email, a password reset link has been dispatched.' };
  }

  /**
   * Complete password reset using secure token
   */
  async resetPassword(token: string, newPassword: string) {
    const hashed = hashToken(token);
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashed,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new AppError('Password reset link is invalid or has expired.', StatusCodes.BAD_REQUEST);
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      }),
      // Invalidate all active sessions on password reset
      prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { isRevoked: true },
      }),
    ]);

    return { message: 'Password has been successfully updated. You can now log in with your new credentials.' };
  }

  /**
   * Verify email address (A5)
   * Idempotent: Handles PendingRegistration creation into User, and handles already verified clicks cleanly.
   */
  async verifyEmail(rawToken: string) {
    const hashed = hashToken(rawToken);

    // 1. Check PendingRegistration (Standard v3 registration flow)
    const pending = await prisma.pendingRegistration.findFirst({
      where: { tokenHash: hashed },
    });

    if (pending) {
      if (pending.expiresAt < new Date()) {
        throw new AppError(
          'Verification link has expired. Please register again or request a new link.',
          StatusCodes.GONE
        );
      }

      // Check if user already exists (idempotency guard)
      const existingUser = await prisma.user.findUnique({
        where: { email: pending.email.toLowerCase() },
      });

      if (existingUser) {
        // User already created (concurrent or duplicate request)
        await prisma.pendingRegistration.delete({ where: { id: pending.id } }).catch(() => {});
        return {
          message: 'Your email address is already verified. You can log in.',
          user: this.sanitizeUser(existingUser),
        };
      }

      const payload = (pending.payload as any) || {};

      // Create User and partner profile in a single atomic transaction
      const newUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: pending.name,
            email: pending.email.toLowerCase(),
            password: pending.passwordHash,
            role: pending.role,
            phone: pending.phone,
            isEmailVerified: true,
            consentAt: payload.consentAt ? new Date(payload.consentAt) : new Date(),
            consentVersion: payload.consentVersion || '1.0',
          },
        });

        // If partner role, create corresponding profile in PENDING status
        if (pending.role === Role.BROKER) {
          const companyName = payload.companyName || user.name;
          const slug = `${companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
          await tx.broker.create({
            data: {
              userId: user.id,
              companyName,
              registeredName: companyName,
              slug,
              website: payload.website || null,
              description: payload.bio || null,
              status: ApprovalStatus.PENDING,
              onboardingStatus: BrokerOnboardingStatus.DRAFT,
            },
          });
        } else if (pending.role === Role.SIGNAL_PROVIDER) {
          const displayName = payload.companyName || user.name;
          const slug = `${displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
          await tx.signalProvider.create({
            data: {
              userId: user.id,
              displayName,
              slug,
              bio: payload.bio || null,
              status: ApprovalStatus.PENDING,
            },
          });
        } else if (pending.role === Role.TUTOR) {
          const slug = `${user.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
          await tx.tutor.create({
            data: {
              userId: user.id,
              slug,
              bio: payload.bio || null,
              status: ApprovalStatus.PENDING,
            },
          });
        } else if (pending.role === Role.ACCOUNT_MANAGER) {
          const slug = `${user.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
          await tx.accountManager.create({
            data: {
              userId: user.id,
              fullName: user.name,
              slug,
              bio: payload.bio || null,
              status: ApprovalStatus.PENDING,
            },
          });
        }

        // Delete pending record
        await tx.pendingRegistration.delete({ where: { id: pending.id } });

        return user;
      });

      sendWelcomeEmail(newUser.email, newUser.name, newUser.role).catch(() => {});

      return {
        message: 'Email address verified successfully! Your account is active.',
        user: this.sanitizeUser(newUser),
      };
    }

    // 2. Fallback: Check legacy unverified User record
    const legacyUser = await prisma.user.findFirst({
      where: {
        emailVerifyToken: hashed,
        emailVerifyExpiry: { gt: new Date() },
      },
    });

    if (legacyUser) {
      await prisma.user.update({
        where: { id: legacyUser.id },
        data: {
          isEmailVerified: true,
          emailVerifyToken: null,
          emailVerifyExpiry: null,
        },
      });

      return {
        message: 'Email address verified successfully! You can now log in.',
        user: this.sanitizeUser(legacyUser),
      };
    }

    // 3. Idempotent check: If token is already used and account is active, give friendly message
    throw new AppError('Verification link is invalid or has already been used.', StatusCodes.BAD_REQUEST);
  }

  /**
   * Change password while logged in
   */
  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found.', StatusCodes.NOT_FOUND);
    }

    const isMatch = await comparePassword(currentPass, user.password);
    if (!isMatch) {
      throw new AppError('Current password is incorrect.', StatusCodes.BAD_REQUEST);
    }

    const hashedPassword = await hashPassword(newPass);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully.' };
  }

  /**
   * Get current authenticated user details
   */
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        broker: {
          select: {
            id: true,
            companyName: true,
            status: true,
            onboardingStatus: true,
            slug: true,
            logo: true,
          },
        },
        accountManager: { select: { id: true, fullName: true, status: true, slug: true } },
        signalProvider: { select: { id: true, displayName: true, status: true, slug: true } },
        tutor: { select: { id: true, status: true, slug: true } },
      },
    });

    if (!user) {
      throw new AppError('User not found.', StatusCodes.NOT_FOUND);
    }

    return this.sanitizeUser(user);
  }
}

export const authService = new AuthService();
