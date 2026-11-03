import bcrypt from 'bcryptjs';
import {
  Role,
  ApprovalStatus,
  BrokerBusinessType,
  OnboardingStatus,
  ProviderStatus,
  ProviderVerificationStatus,
  ProviderAccountType,
} from '@prisma/client';
import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';
import {
  DEMO_PASSWORD,
  DEMO_ACCOUNTS,
  isDemoLoginEnabled,
} from '../../config/demo-accounts.config';

let cachedHashedPassword = '';

async function getHashedDemoPassword(): Promise<string> {
  if (!cachedHashedPassword) {
    cachedHashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
  }
  return cachedHashedPassword;
}

/**
 * Idempotently ensure a specific demo account exists along with its primary role entity.
 */
export async function ensureDemoAccountByEmail(rawEmail: string): Promise<any> {
  if (!isDemoLoginEnabled()) {
    return null;
  }

  const email = (rawEmail || '').trim().toLowerCase();
  const hashedPassword = await getHashedDemoPassword();

  // 1. Admin
  if (email === 'admin@edutradefx.com') {
    return await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: Role.ADMIN,
        isActive: true,
        isEmailVerified: true,
        isDemoAccount: true,
      },
      create: {
        name: 'EdutradeFX Administrator',
        email,
        password: hashedPassword,
        role: Role.ADMIN,
        isActive: true,
        isEmailVerified: true,
        isDemoAccount: true,
      },
    });
  }

  // 2. Broker
  if (email === 'broker@edutradefx.com' || email === 'broker@pepperstone-demo.com') {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: Role.BROKER,
        isActive: true,
        isEmailVerified: true,
        isDemoAccount: true,
      },
      create: {
        name: 'Pepperstone Markets Representative',
        email,
        password: hashedPassword,
        role: Role.BROKER,
        isActive: true,
        isEmailVerified: true,
        isDemoAccount: true,
      },
    });

    const existingBroker = await prisma.broker.findFirst({
      where: { OR: [{ userId: user.id }, { slug: 'pepperstone-markets-demo' }] },
    });

    if (!existingBroker) {
      await prisma.broker.create({
        data: {
          userId: user.id,
          companyName: 'Pepperstone Markets (Demo)',
          registeredName: 'Pepperstone Markets Limited',
          slug: 'pepperstone-markets-demo',
          website: 'https://pepperstone-demo.example.com',
          description: 'Multi-regulated institutional forex and CFD broker demo sandbox.',
          businessType: BrokerBusinessType.ECN,
          status: ApprovalStatus.APPROVED,
          isFeatured: true,
          avgRating: 4.85,
          totalReviews: 42,
          countries: ['United Kingdom', 'Australia', 'Cyprus', 'United Arab Emirates'],
          regulation: ['FCA', 'ASIC', 'CySEC', 'DFSA'],
        },
      });
    }

    return user;
  }

  // 3. Account Manager
  if (email === 'accountmanager@edutradefx.com' || email === 'accountmanager@demo.com') {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: Role.ACCOUNT_MANAGER,
        isActive: true,
        isEmailVerified: true,
        isDemoAccount: true,
      },
      create: {
        name: 'Marcus Vance (Apex Wealth)',
        email,
        password: hashedPassword,
        role: Role.ACCOUNT_MANAGER,
        isActive: true,
        isEmailVerified: true,
        isDemoAccount: true,
      },
    });

    const existingAm = await prisma.accountManager.findFirst({
      where: { OR: [{ userId: user.id }, { slug: 'marcus-vance-apex' }] },
    });

    if (!existingAm) {
      await prisma.accountManager.create({
        data: {
          userId: user.id,
          fullName: 'Marcus Vance',
          slug: 'marcus-vance-apex',
          bio: 'Institutional AUM portfolio manager specializing in quantitative trend following.',
          strategy: 'Apex Quant Macro Trend',
          status: ApprovalStatus.APPROVED,
          onboardingStatus: OnboardingStatus.SUBMITTED,
          avgRating: 4.88,
          totalReviews: 29,
        },
      });
    }

    return user;
  }

  // 4. Signal Provider
  if (email === 'signals@edutradefx.com' || email === 'signals@alphatrades.com') {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: Role.SIGNAL_PROVIDER,
        isActive: true,
        isEmailVerified: true,
        isDemoAccount: true,
      },
      create: {
        name: 'Alpha Trades FX Signals',
        email,
        password: hashedPassword,
        role: Role.SIGNAL_PROVIDER,
        isActive: true,
        isEmailVerified: true,
        isDemoAccount: true,
      },
    });

    const existingSp = await prisma.signalProvider.findFirst({
      where: { OR: [{ userId: user.id }, { slug: 'alpha-trades-fx-demo' }] },
    });

    if (!existingSp) {
      await prisma.signalProvider.create({
        data: {
          userId: user.id,
          displayName: 'Alpha Trades FX Signals',
          slug: 'alpha-trades-fx-demo',
          bio: 'Automated algorithmic intraday breakouts on EURUSD and GBPUSD.',
          strategy: 'Alpha Intraday Breakouts',
          status: ApprovalStatus.APPROVED,
          onboardingStatus: OnboardingStatus.SUBMITTED,
          avgRating: 4.8,
          totalReviews: 31,
          totalSignals: 148,
          winRate: 76.5,
        },
      });
    }

    return user;
  }

  // 5. Solutions Provider
  if (email === 'solutions@edutradefx.com' || email === 'provider@solutionsdemo.com') {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: Role.SERVICE_PROVIDER,
        isActive: true,
        isEmailVerified: true,
        isDemoAccount: true,
      },
      create: {
        name: 'Demo Solutions Representative',
        email,
        password: hashedPassword,
        role: Role.SERVICE_PROVIDER,
        isActive: true,
        isEmailVerified: true,
        isDemoAccount: true,
      },
    });

    const existingProvider = await prisma.serviceProvider.findFirst({
      where: { OR: [{ userId: user.id }, { slug: 'demo-solutions-ltd' }] },
    });

    if (!existingProvider) {
      const createdProvider = await prisma.serviceProvider.create({
        data: {
          userId: user.id,
          legalName: 'Demo Solutions Ltd',
          brandName: 'Demo Solutions',
          slug: 'demo-solutions-ltd',
          accountType: ProviderAccountType.REGISTERED_COMPANY,
          registrationNumber: 'GB-12345678',
          yearEstablished: 2014,
          status: ProviderStatus.APPROVED,
          verificationStatus: ProviderVerificationStatus.PARTIALLY_VERIFIED,
          verifiedAt: new Date(),
          providerCode: 'ETP-DEMO01',
          applicationRef: 'APP-2026-DEMO01',
          tagline: 'Enterprise multi-asset trading technology, bridges & risk systems',
          overview:
            '<p>Demo Solutions Ltd provides audited bridge technology, liquidity aggregation, and CRM infrastructure for institutional brokers and proprietary trading firms worldwide.</p>',
          website: 'https://demo-solutions.example.com',
          companyEmail: 'hello@demo-solutions.example.com',
          headquartersCountryCode: 'GB',
          operatingRegions: ['UK_EUROPE_EEA', 'MIDDLE_EAST', 'SOUTH_ASIA', 'NORTH_AMERICA'],
          companySize: '51_200',
          customerTypes: ['RETAIL_FOREX_BROKERS', 'INSTITUTIONAL_BROKERS', 'PROP_TRADING_FIRMS', 'LIQUIDITY_PROVIDERS'],
          languages: ['en', 'fr', 'ar', 'de'],
          supportAvailability: '24_7',
          supportChannels: ['BUSINESS_EMAIL', 'LIVE_CHAT', 'SUPPORT_TICKET', 'TELEPHONE'],
          publicContactPreference: 'MULTIPLE_METHODS',
          timezone: 'Europe/London',
          logo: '/demo/demo-provider-logo.svg',
          completionPercent: 100,
          avgRating: 4.8,
          totalReviews: 4,
        },
      });

      await prisma.providerContact.create({
        data: {
          providerId: createdProvider.id,
          fullName: 'Oliver Vance',
          jobTitle: 'VP of Institutional Partnerships',
          email: 'oliver.vance@demo-solutions.example.com',
          phone: '+442079460123',
          isPrimary: true,
          isPublic: false,
        },
      });
    }

    return user;
  }

  // 6. Tutor
  if (email === 'tutor@edutradefx.com') {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: Role.TUTOR,
        isActive: true,
        isEmailVerified: true,
        isDemoAccount: true,
      },
      create: {
        name: 'Alexander Sterling (Tutor)',
        email,
        password: hashedPassword,
        role: Role.TUTOR,
        isActive: true,
        isEmailVerified: true,
        isDemoAccount: true,
      },
    });

    const existingTutor = await prisma.tutor.findFirst({
      where: { OR: [{ userId: user.id }, { slug: 'alexander-sterling' }] },
    });

    if (!existingTutor) {
      await prisma.tutor.create({
        data: {
          userId: user.id,
          slug: 'alexander-sterling',
          bio: 'Chartered Market Technician with 14 years of trading institutional FX orders and training hedge fund analysts.',
          expertise: ['Price Action', 'Order Flow', 'Smart Money Concepts', 'Macroeconomics'],
          avgRating: 4.95,
          status: ApprovalStatus.APPROVED,
        },
      });
    }

    return user;
  }

  // 7. Trader / Student
  if (email === 'trader@edutradefx.com' || email === 'student@edutradefx.com') {
    return await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: Role.STUDENT,
        isActive: true,
        isEmailVerified: true,
        isDemoAccount: true,
      },
      create: {
        name: 'Alex Mercer (Trader)',
        email,
        password: hashedPassword,
        role: Role.STUDENT,
        isActive: true,
        isEmailVerified: true,
        isDemoAccount: true,
      },
    });
  }

  return null;
}

/**
 * Idempotently ensure all standard demo accounts are ready.
 */
export async function ensureAllDemoAccounts(): Promise<void> {
  if (!isDemoLoginEnabled()) {
    return;
  }

  try {
    for (const acc of DEMO_ACCOUNTS) {
      await ensureDemoAccountByEmail(acc.email);
      if (acc.aliases) {
        for (const alias of acc.aliases) {
          await ensureDemoAccountByEmail(alias);
        }
      }
    }
    logger.info('✅ All 7 standard demo accounts verified & auto-provisioned successfully.');
  } catch (error) {
    logger.warn('Failed auto-provisioning demo accounts:', error);
  }
}
