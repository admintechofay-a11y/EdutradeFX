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
import { Role, ApprovalStatus } from '@prisma/client';

export class AuthService {
  /**
   * Helper to exclude sensitive password and token fields from user response
   */
  private sanitizeUser(user: any) {
    const { password, emailVerifyToken, resetToken, twoFactorSecret, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Register a new public user (Strictly defaults to STUDENT, role elevation impossible)
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new AppError('An account with this email address already exists.', StatusCodes.CONFLICT);
    }

    const hashedPassword = await hashPassword(data.password);
    const verificationRawToken = generateSecureToken();
    const hashedVerificationToken = hashToken(verificationRawToken);
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: Role.STUDENT, // Strictly enforced: public registration always creates STUDENT
        phone: data.phone,
        emailVerifyToken: hashedVerificationToken,
        emailVerifyExpiry: verificationExpiry,
        isEmailVerified: false,
      },
    });

    // Send verification email in background
    sendVerificationEmail(user.email, user.name, verificationRawToken).catch(() => {});
    sendWelcomeEmail(user.email, user.name, user.role).catch(() => {});

    return {
      user: this.sanitizeUser(user),
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  /**
   * Register a partner account (BROKER, SIGNAL_PROVIDER, TUTOR, ACCOUNT_MANAGER).
   * User is created with partner role, but profile is strictly set to PENDING verification.
   * ADMIN role is NEVER allowed.
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
  }) {
    // Defense-in-depth: Never allow ADMIN or STUDENT role via partner registration
    if (data.role === Role.ADMIN || data.role === Role.STUDENT) {
      throw new AppError('Unauthorized role specified for partner registration.', StatusCodes.FORBIDDEN);
    }

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new AppError('An account with this email address already exists.', StatusCodes.CONFLICT);
    }

    const hashedPassword = await hashPassword(data.password);
    const verificationRawToken = generateSecureToken();
    const hashedVerificationToken = hashToken(verificationRawToken);
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: data.role,
        phone: data.phone,
        emailVerifyToken: hashedVerificationToken,
        emailVerifyExpiry: verificationExpiry,
        isEmailVerified: false,
      },
    });

    const slug = `${(data.companyName || data.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    // Create corresponding partner profile in PENDING verification status
    if (data.role === Role.BROKER) {
      await prisma.broker.create({
        data: {
          userId: user.id,
          companyName: data.companyName || data.name,
          slug,
          website: data.website || null,
          description: data.bio || null,
          status: ApprovalStatus.PENDING,
        },
      });
    } else if (data.role === Role.SIGNAL_PROVIDER) {
      await prisma.signalProvider.create({
        data: {
          userId: user.id,
          displayName: data.companyName || data.name,
          slug,
          bio: data.bio || null,
          status: ApprovalStatus.PENDING,
        },
      });
    } else if (data.role === Role.TUTOR) {
      await prisma.tutor.create({
        data: {
          userId: user.id,
          slug,
          bio: data.bio || null,
          status: ApprovalStatus.PENDING,
        },
      });
    } else if (data.role === Role.ACCOUNT_MANAGER) {
      await prisma.accountManager.create({
        data: {
          userId: user.id,
          fullName: data.name,
          slug,
          bio: data.bio || null,
          status: ApprovalStatus.PENDING,
        },
      });
    }

    sendVerificationEmail(user.email, user.name, verificationRawToken).catch(() => {});
    sendWelcomeEmail(user.email, user.name, user.role).catch(() => {});

    return {
      user: this.sanitizeUser(user),
      message: 'Partner application submitted. Your profile is pending administrative compliance verification.',
    };
  }

  /**
   * Admin-only user creation (Can assign any role including ADMIN, for internal admin management)
   */
  async adminCreateUser(data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    phone?: string;
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

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: data.role,
        phone: data.phone,
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
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanId.toLowerCase() },
          { phone: cleanId },
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
   * Refresh expired access token with automatic Refresh Token Rotation (RTR)
   */
  async refreshToken(rawRefreshToken: string) {
    if (!rawRefreshToken) {
      throw new AppError('Refresh token is required.', StatusCodes.UNAUTHORIZED);
    }

    verifyRefreshToken(rawRefreshToken);
    const hashed = hashToken(rawRefreshToken);

    const tokenDoc = await prisma.refreshToken.findUnique({
      where: { token: hashed },
      include: { user: true },
    });

    if (!tokenDoc) {
      throw new AppError('Invalid refresh token. Please sign in again.', StatusCodes.UNAUTHORIZED);
    }

    // Token Reuse Detection: If an already-revoked token is used, suspect credential theft
    if (tokenDoc.isRevoked) {
      // Invalidate all tokens for this compromised account immediately
      await prisma.refreshToken.updateMany({
        where: { userId: tokenDoc.userId },
        data: { isRevoked: true },
      });
      throw new AppError('Security alert: Revoked refresh token reuse detected. All active sessions invalidated.', StatusCodes.UNAUTHORIZED);
    }

    if (tokenDoc.expiresAt < new Date()) {
      throw new AppError('Refresh token has expired. Please sign in again.', StatusCodes.UNAUTHORIZED);
    }

    if (!tokenDoc.user.isActive) {
      throw new AppError('Account is currently deactivated.', StatusCodes.FORBIDDEN);
    }

    // 1. Invalidate the current refresh token (Rotation)
    await prisma.refreshToken.update({
      where: { id: tokenDoc.id },
      data: { isRevoked: true },
    });

    // 2. Issue new access token
    const newAccessToken = generateAccessToken({
      userId: tokenDoc.user.id,
      role: tokenDoc.user.role,
    });

    // 3. Issue and persist new refresh token
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
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Don't disclose whether email exists
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

    sendPasswordResetEmail(user.email, user.name, rawToken).catch(() => {});

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
   * Verify email address
   */
  async verifyEmail(rawToken: string) {
    const hashed = hashToken(rawToken);
    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: hashed,
        emailVerifyExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new AppError('Verification link is invalid or has expired.', StatusCodes.BAD_REQUEST);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpiry: null,
      },
    });

    return { message: 'Email address verified successfully!' };
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

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      }),
      prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true },
      }),
    ]);

    return { message: 'Password changed successfully. All previous sessions have been logged out.' };
  }

  /**
   * Get current authenticated user details
   */
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        broker: true,
        accountManager: true,
        signalProvider: true,
        tutor: true,
      },
    });

    if (!user) {
      throw new AppError('User profile not found.', StatusCodes.NOT_FOUND);
    }

    return this.sanitizeUser(user);
  }
}

export const authService = new AuthService();
