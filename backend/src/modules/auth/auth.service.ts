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
import {
  Role,
  ApprovalStatus,
  BrokerOnboardingStatus,
  OnboardingStatus,
  ProviderAccountType,
  ProviderStatus,
  ProviderVerificationStatus,
} from '@prisma/client';
import { PARTNER_ROLES } from '../../config/constants';
import { logger } from '../../utils/logger';
import { normalizeToE164 } from '../../utils/phone.utils';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export class AuthService {
  getPartnerRoles(): string[] {
    return [...PARTNER_ROLES];
  }
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

    // Clean up any stale pending registration if present
    await prisma.pendingRegistration.deleteMany({ where: { email } }).catch(() => {});

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        password: hashedPassword,
        phone,
        role: Role.STUDENT,
        isEmailVerified: true,
        consentAt: data.consentAt ? new Date(data.consentAt) : new Date(),
        consentVersion: data.consentVersion || '1.0',
      },
    });

    sendWelcomeEmail(user.email, user.name, user.role).catch(() => {});

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
      isDemoAccount: user.isDemoAccount,
    });
    const refreshToken = generateRefreshToken({ userId: user.id });
    const hashedRefresh = hashToken(refreshToken);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: hashedRefresh,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      message: 'Registration successful! Your account is active.',
      email: user.email,
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Register a partner account (BROKER, SIGNAL_PROVIDER, TUTOR, ACCOUNT_MANAGER, SERVICE_PROVIDER).
   * Also uses PendingRegistration flow (A5).
   */
  async registerPartner(
    data: {
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
      accountType?: ProviderAccountType;
      accountTypeOther?: string;
      legalEntityName?: string;
      contactFullName?: string;
      contactFirstName?: string;
      contactLastName?: string;
      contactTitle?: string;
      primaryEmail?: string;
      country?: string;
      consentTerms?: boolean;
      consentPrivacy?: boolean;
    },
    meta?: { ipAddress?: string; userAgent?: string }
  ) {
    if (!PARTNER_ROLES.includes(data.role as any)) {
      throw new AppError(`Invalid partner role. Allowed: ${PARTNER_ROLES.join(", ")}`, StatusCodes.BAD_REQUEST);
    }

    const email = data.email.trim().toLowerCase();
    const phone = data.phone ? normalizeToE164(data.phone) || data.phone.trim() : null;

    const existingUser = await prisma.user.findFirst({
      where: { email },
    });
    if (existingUser) {
      throw new AppError('An account with this email address already exists.', StatusCodes.CONFLICT);
    }

    await prisma.pendingRegistration.deleteMany({ where: { email } }).catch(() => {});

    const hashedPassword = await hashPassword(data.password);

    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: data.name.trim(),
          email,
          password: hashedPassword,
          role: data.role,
          phone,
          isEmailVerified: true,
          consentAt: data.consentAt ? new Date(data.consentAt) : new Date(),
          consentVersion: data.consentVersion || '1.0',
        },
      });

      if (data.role === Role.BROKER) {
        const companyName = data.companyName?.trim() || data.legalEntityName?.trim() || createdUser.name;
        const slug = `${companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
        await tx.broker.create({
          data: {
            userId: createdUser.id,
            companyName,
            registeredName: companyName,
            slug,
            website: data.website?.trim() || null,
            description: data.bio?.trim() || null,
            status: ApprovalStatus.PENDING,
          },
        });
      } else if (data.role === Role.SIGNAL_PROVIDER) {
        const displayName = data.companyName?.trim() || createdUser.name;
        const slug = `${displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
        await tx.signalProvider.create({
          data: {
            userId: createdUser.id,
            displayName,
            slug,
            bio: data.bio?.trim() || null,
            status: ApprovalStatus.PENDING,
            onboardingStatus: OnboardingStatus.DRAFT,
          },
        });
      } else if (data.role === Role.TUTOR) {
        const slug = `${createdUser.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
        await tx.tutor.create({
          data: {
            userId: createdUser.id,
            slug,
            bio: data.bio?.trim() || null,
            status: ApprovalStatus.PENDING,
          },
        });
      } else if (data.role === Role.ACCOUNT_MANAGER) {
        const slug = `${createdUser.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
        await tx.accountManager.create({
          data: {
            userId: createdUser.id,
            fullName: createdUser.name,
            slug,
            bio: data.bio?.trim() || null,
            status: ApprovalStatus.PENDING,
            onboardingStatus: OnboardingStatus.DRAFT,
          },
        });
      } else if (data.role === Role.SERVICE_PROVIDER) {
        const companyName = data.legalEntityName?.trim() || data.companyName?.trim() || createdUser.name;
        const rawSlug = `${companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
        const slug = rawSlug.replace(/^-+|-+$/g, '') || `provider-${Date.now().toString().slice(-6)}`;

        const contactEmail = (data.primaryEmail?.trim() || createdUser.email).toLowerCase();
        const emailDomain = contactEmail.split('@')[1] || '';
        const freeMailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'zoho.com', 'protonmail.com', 'mail.com', 'yandex.com', 'gmx.com'];
        const hasFreeMailWarning = freeMailDomains.includes(emailDomain);
        const reviewFlags = hasFreeMailWarning ? { freeMailWarning: true, freeMailDomain: emailDomain } : {};

        const provider = await tx.serviceProvider.create({
          data: {
            userId: createdUser.id,
            legalName: data.legalEntityName?.trim() || (data.accountType === ProviderAccountType.INDIVIDUAL_PROVIDER ? createdUser.name : companyName),
            brandName: data.companyName?.trim() || companyName,
            slug,
            accountType: (data.accountType as ProviderAccountType) || ProviderAccountType.REGISTERED_COMPANY,
            website: data.website?.trim() || null,
            companyEmail: contactEmail,
            headquartersCountryCode: data.country?.trim() || createdUser.country || null,
            status: ProviderStatus.DRAFT,
            verificationStatus: ProviderVerificationStatus.NOT_SUBMITTED,
            reviewFlags,
            completionPercent: 0,
          },
        });

        const contactName = data.contactFullName?.trim() ||
          ((data.contactFirstName && data.contactLastName)
            ? `${data.contactFirstName} ${data.contactLastName}`.trim()
            : (data.contactFirstName?.trim() || createdUser.name));

        await tx.providerContact.create({
          data: {
            providerId: provider.id,
            fullName: contactName,
            jobTitle: data.contactTitle?.trim() || (data.accountType === ProviderAccountType.INDIVIDUAL_PROVIDER ? 'Freelancer / Owner' : 'Primary Contact'),
            email: contactEmail,
            phone: data.phone || createdUser.phone || null,
            isPrimary: true,
            isPublic: false,
          },
        });
      }

      return createdUser;
    });

    sendWelcomeEmail(newUser.email, newUser.name, newUser.role).catch(() => {});

    const accessToken = generateAccessToken({
      userId: newUser.id,
      role: newUser.role,
    });
    const refreshToken = generateRefreshToken({ userId: newUser.id });
    const hashedRefresh = hashToken(refreshToken);
    await prisma.refreshToken.create({
      data: {
        userId: newUser.id,
        token: hashedRefresh,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      message: 'Partner registration successful! Your account is active.',
      email: newUser.email,
      user: this.sanitizeUser(newUser),
      accessToken,
      refreshToken,
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

      return {
        message: 'If an unverified account exists with that email, a verification link has been sent.',
        ...(process.env.NODE_ENV === 'development' && {
          devVerificationUrl: `${FRONTEND_URL}/verify-email/${encodeURIComponent(newRawToken)}`,
        }),
      };
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

      return {
        message: 'If an unverified account exists with that email, a verification link has been sent.',
        ...(process.env.NODE_ENV === 'development' && {
          devVerificationUrl: `${FRONTEND_URL}/verify-email/${encodeURIComponent(newRawToken)}`,
        }),
      };
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

    if (user.isDemoAccount) {
      const isProd = process.env.NODE_ENV === 'production';
      const demoLoginEnabled = isProd
        ? process.env.DEMO_LOGIN_ENABLED === 'true'
        : process.env.DEMO_LOGIN_ENABLED !== 'false';

      if (!demoLoginEnabled) {
        throw new AppError('Invalid email or password credentials.', StatusCodes.UNAUTHORIZED);
      }

      if (user.role === Role.ADMIN) {
        const demoAdminAllowed = isProd
          ? process.env.DEMO_ALLOW_ADMIN === 'true'
          : true;
        if (!demoAdminAllowed) {
          throw new AppError('Invalid email or password credentials.', StatusCodes.UNAUTHORIZED);
        }
      }
    }
    if (!isMatch) {
      throw new AppError('Invalid email or password credentials.', StatusCodes.UNAUTHORIZED);
    }

    // Auto-verify if an unverified user exists
    if (!user.isEmailVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      });
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
      isDemoAccount: user.isDemoAccount,
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
              onboardingStatus: OnboardingStatus.DRAFT,
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
              onboardingStatus: OnboardingStatus.DRAFT,
            },
          });
        } else if (pending.role === Role.SERVICE_PROVIDER) {
          const companyName = payload.legalEntityName || payload.companyName || user.name;
          const rawSlug = `${companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
          const slug = rawSlug.replace(/^-+|-+$/g, '') || `provider-${Date.now().toString().slice(-6)}`;

          const contactEmail = (payload.primaryEmail || user.email).toLowerCase();
          const emailDomain = contactEmail.split('@')[1] || '';
          const freeMailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'zoho.com', 'protonmail.com', 'mail.com', 'yandex.com', 'gmx.com'];
          const hasFreeMailWarning = freeMailDomains.includes(emailDomain);
          const reviewFlags: any = hasFreeMailWarning ? { freeMailWarning: true, freeMailDomain: emailDomain } : {};

          const provider = await tx.serviceProvider.create({
            data: {
              userId: user.id,
              legalName: payload.legalEntityName || (payload.accountType === ProviderAccountType.INDIVIDUAL_PROVIDER ? user.name : companyName),
              brandName: payload.companyName || companyName,
              slug,
              accountType: (payload.accountType as ProviderAccountType) || ProviderAccountType.REGISTERED_COMPANY,
              website: payload.website || null,
              companyEmail: contactEmail,
              headquartersCountryCode: payload.country || user.country || null,
              status: ProviderStatus.DRAFT,
              verificationStatus: ProviderVerificationStatus.NOT_SUBMITTED,
              reviewFlags,
              completionPercent: 0,
            },
          });

          const contactName = payload.contactFullName ||
            ((payload.contactFirstName && payload.contactLastName)
            ? `${payload.contactFirstName} ${payload.contactLastName}`.trim()
            : (payload.contactFirstName || user.name));

          await tx.providerContact.create({
            data: {
              providerId: provider.id,
              fullName: contactName,
              jobTitle: payload.contactTitle || (payload.accountType === ProviderAccountType.INDIVIDUAL_PROVIDER ? 'Freelancer / Owner' : 'Primary Contact'),
              email: contactEmail,
              phone: payload.phone || user.phone || null,
              isPrimary: true,
              isPublic: false,
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

    if (user.isDemoAccount) {
      throw new AppError(
        'This action is restricted for demo accounts.',
        StatusCodes.FORBIDDEN,
        'DEMO_ACCOUNT_RESTRICTED'
      );
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
        serviceProvider: {
          select: {
            id: true,
            legalName: true,
            brandName: true,
            status: true,
            slug: true,
            logo: true,
            providerCode: true,
            completionPercent: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found.', StatusCodes.NOT_FOUND);
    }

    return this.sanitizeUser(user);
  }
}

export const authService = new AuthService();
