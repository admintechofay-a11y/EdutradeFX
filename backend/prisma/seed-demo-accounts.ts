import {
  PrismaClient,
  Role,
  ApprovalStatus,
  BrokerBusinessType,
  BrokerOnboardingStatus,
  AmEntityType,
  OnboardingStatus,
  CourseStatus,
  ProviderStatus,
  ProviderVerificationStatus,
  ProviderAccountType,
  ProviderCategoryStatus,
  ProductStatus,
  ProductAvailability,
  PricingVisibility,
  ModerationStatus,
  ProviderEnquiryType,
  ProviderEnquiryStatus,
  NotificationType,
  AgreementAudience,
  AddressType,
  SocialPlatform,
  DocumentVisibility,
  TeamProfileVisibility,
  ProductMediaKind,
  ProviderReviewEntityType,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import assert from 'assert';
import { DEMO_PASSWORD } from '../src/config/demo-accounts.config';
import { buildAnswerSchema } from '../src/modules/provider-forms/form.engine';
import { providerPublishService } from '../src/modules/service-providers/provider.publish.service';

dotenv.config();
const prisma = new PrismaClient();

async function seedDemoAccounts() {
  console.log('🚀 Seeding comprehensive verified demo accounts for all roles...');

  // 0. Safety Guards & Prerequisites Check
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error(
      'FATAL: Demo account seeding is disabled in production. Set ALLOW_DEMO_SEED=true to override explicitly.'
    );
  }

  const [catCount, optionListCount, agreementCount] = await Promise.all([
    prisma.providerCategory.count(),
    prisma.providerOptionList.count(),
    prisma.partnerAgreement.count({ where: { audience: AgreementAudience.SERVICE_PROVIDER } }),
  ]);

  if (catCount < 10 || optionListCount < 1 || agreementCount < 1) {
    throw new Error(
      `FATAL: Missing prerequisites for demo seeding (found ${catCount} categories, ${optionListCount} option lists, ${agreementCount} provider agreements). Run seed-provider-forms first!`
    );
  }

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 12);

  // 1. ADMIN DEMO ACCOUNT
  const adminEmail = 'admin@edutradefx.com';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: Role.ADMIN,
      isActive: true,
      isEmailVerified: true,
      isDemoAccount: true,
    },
    create: {
      name: 'EdutradeFX Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: Role.ADMIN,
      isActive: true,
      isEmailVerified: true,
      isDemoAccount: true,
    },
  });
  console.log(`✅ Admin Demo Account ready: ${admin.email}`);

  // 2. BROKER DEMO ACCOUNTS
  // a) Pepperstone Broker
  const pepperstoneEmail = 'broker@pepperstone-demo.com';
  await prisma.user.upsert({
    where: { email: pepperstoneEmail },
    update: {
      password: hashedPassword,
      role: Role.BROKER,
      isActive: true,
      isEmailVerified: true,
      isDemoAccount: true,
    },
    create: {
      name: 'Pepperstone Markets Representative',
      email: pepperstoneEmail,
      password: hashedPassword,
      role: Role.BROKER,
      isActive: true,
      isEmailVerified: true,
      isDemoAccount: true,
    },
  });

  // b) Primary broker@edutradefx.com
  const brokerPrimaryEmail = 'broker@edutradefx.com';
  const brokerUser = await prisma.user.upsert({
    where: { email: brokerPrimaryEmail },
    update: {
      password: hashedPassword,
      role: Role.BROKER,
      isActive: true,
      isEmailVerified: true,
      isDemoAccount: true,
    },
    create: {
      name: 'Alpha Capital Broker Rep',
      email: brokerPrimaryEmail,
      password: hashedPassword,
      role: Role.BROKER,
      isActive: true,
      isEmailVerified: true,
      isDemoAccount: true,
    },
  });

  const existingBroker = await prisma.broker.findUnique({
    where: { userId: brokerUser.id },
  });

  if (!existingBroker) {
    await prisma.broker.create({
      data: {
        userId: brokerUser.id,
        companyName: 'Edutrade Prime Markets',
        registeredName: 'Edutrade Prime Markets Ltd',
        slug: 'edutrade-prime-markets',
        businessType: BrokerBusinessType.ECN,
        website: 'https://edutradeprime.demo',
        description: 'Institutional grade liquidity provider with ultra-low raw spreads and regulated multi-tier segregated accounts.',
        yearFounded: 2018,
        headquarters: 'London, United Kingdom',
        countries: ['United Kingdom', 'Germany', 'Australia', 'United Arab Emirates'],
        regulation: ['FCA', 'ASIC', 'CySEC'],
        tradingPlatforms: ['MetaTrader 5', 'cTrader', 'TradingView'],
        accountTypes: ['Raw ECN', 'Standard STP', 'Institutional VIP'],
        minDeposit: 100,
        maxLeverage: '1:500',
        spreadsFrom: '0.0 pips',
        commissions: '$3.50 per lot',
        instruments: ['Forex', 'Indices', 'Commodities', 'Metals', 'Crypto'],
        depositMethods: ['Wire Transfer', 'Visa', 'Mastercard', 'Crypto (USDT)'],
        withdrawMethods: ['Wire Transfer', 'Crypto (USDT)'],
        status: ApprovalStatus.APPROVED,
        onboardingStatus: BrokerOnboardingStatus.VERIFIED,
        isFeatured: true,
        isPremium: true,
        avgRating: 4.85,
        totalReviews: 24,
      },
    });
  } else {
    await prisma.broker.update({
      where: { id: existingBroker.id },
      data: {
        status: ApprovalStatus.APPROVED,
        onboardingStatus: BrokerOnboardingStatus.VERIFIED,
      },
    });
  }
  console.log(`✅ Broker Demo Accounts ready: ${brokerPrimaryEmail} & ${pepperstoneEmail}`);

  // 3. ACCOUNT MANAGER DEMO ACCOUNTS
  // a) accountmanager@demo.com
  const amDemoEmail = 'accountmanager@demo.com';
  await prisma.user.upsert({
    where: { email: amDemoEmail },
    update: {
      password: hashedPassword,
      role: Role.ACCOUNT_MANAGER,
      isActive: true,
      isEmailVerified: true,
      isDemoAccount: true,
    },
    create: {
      name: 'Marcus Vance',
      email: amDemoEmail,
      password: hashedPassword,
      role: Role.ACCOUNT_MANAGER,
      isActive: true,
      isEmailVerified: true,
      isDemoAccount: true,
    },
  });

  // b) accountmanager@edutradefx.com
  const amPrimaryEmail = 'accountmanager@edutradefx.com';
  const amUser = await prisma.user.upsert({
    where: { email: amPrimaryEmail },
    update: {
      password: hashedPassword,
      role: Role.ACCOUNT_MANAGER,
      isActive: true,
      isEmailVerified: true,
      isDemoAccount: true,
    },
    create: {
      name: 'Elena Rostova (Apex PAMM)',
      email: amPrimaryEmail,
      password: hashedPassword,
      role: Role.ACCOUNT_MANAGER,
      isActive: true,
      isEmailVerified: true,
      isDemoAccount: true,
    },
  });

  const existingAM = await prisma.accountManager.findUnique({
    where: { userId: amUser.id },
  });

  if (!existingAM) {
    await prisma.accountManager.create({
      data: {
        userId: amUser.id,
        fullName: 'Elena Rostova',
        slug: 'elena-rostova-apex-pamm',
        entityType: AmEntityType.INDIVIDUAL,
        tagline: 'Systematic Macro & Multi-Currency PAMM Portfolio Manager',
        bio: 'Over 10 years of algorithmic execution in institutional FX and precious metals with strict drawdown controls.',
        status: ApprovalStatus.APPROVED,
        onboardingStatus: OnboardingStatus.SUBMITTED,
        regulatoryVerified: true,
        avgRating: 4.9,
        totalReviews: 38,
        minInvestment: 500,
        yearsExperience: 10,
        profitSharingPercent: 20,
        historicalPerformance: '34.2% audited annualized net return with 8.4% max drawdown',
      },
    });
  } else {
    await prisma.accountManager.update({
      where: { id: existingAM.id },
      data: {
        status: ApprovalStatus.APPROVED,
      },
    });
  }
  console.log(`✅ Account Manager Demo Accounts ready: ${amPrimaryEmail} & ${amDemoEmail}`);

  // 4. SIGNAL PROVIDER DEMO ACCOUNTS
  // a) signals@alphatrades.com
  const spDemoEmail = 'signals@alphatrades.com';
  await prisma.user.upsert({
    where: { email: spDemoEmail },
    update: {
      password: hashedPassword,
      role: Role.SIGNAL_PROVIDER,
      isActive: true,
      isEmailVerified: true,
      isDemoAccount: true,
    },
    create: {
      name: 'AlphaWave Signals Team',
      email: spDemoEmail,
      password: hashedPassword,
      role: Role.SIGNAL_PROVIDER,
      isActive: true,
      isEmailVerified: true,
      isDemoAccount: true,
    },
  });

  // b) signals@edutradefx.com
  const spPrimaryEmail = 'signals@edutradefx.com';
  const spUser = await prisma.user.upsert({
    where: { email: spPrimaryEmail },
    update: {
      password: hashedPassword,
      role: Role.SIGNAL_PROVIDER,
      isActive: true,
      isEmailVerified: true,
      isDemoAccount: true,
    },
    create: {
      name: 'Quantum Edge Signals',
      email: spPrimaryEmail,
      password: hashedPassword,
      role: Role.SIGNAL_PROVIDER,
      isActive: true,
      isEmailVerified: true,
      isDemoAccount: true,
    },
  });

  const existingSP = await prisma.signalProvider.findUnique({
    where: { userId: spUser.id },
  });

  if (!existingSP) {
    await prisma.signalProvider.create({
      data: {
        userId: spUser.id,
        displayName: 'Quantum Edge Institutional FX',
        slug: 'quantum-edge-fx',
        bio: 'Precision algorithmic signals for EURUSD, GBPUSD, XAUUSD, and USDJPY with 1:3 risk-to-reward minimum.',
        status: ApprovalStatus.APPROVED,
        avgRating: 4.88,
        totalReviews: 42,
        winRate: 74.5,
        totalSignals: 310,
      },
    });
  } else {
    await prisma.signalProvider.update({
      where: { id: existingSP.id },
      data: {
        status: ApprovalStatus.APPROVED,
      },
    });
  }
  console.log(`✅ Signal Provider Demo Accounts ready: ${spPrimaryEmail} & ${spDemoEmail}`);

  // 5. TUTOR DEMO ACCOUNT
  const tutorEmail = 'tutor@edutradefx.com';
  const tutorUser = await prisma.user.upsert({
    where: { email: tutorEmail },
    update: {
      password: hashedPassword,
      role: Role.TUTOR,
      isActive: true,
      isEmailVerified: true,
      isDemoAccount: true,
    },
    create: {
      name: 'Alexander Sterling, CMT',
      email: tutorEmail,
      password: hashedPassword,
      role: Role.TUTOR,
      isActive: true,
      isEmailVerified: true,
      isDemoAccount: true,
    },
  });

  const existingTutor = await prisma.tutor.findUnique({
    where: { userId: tutorUser.id },
  });

  if (!existingTutor) {
    await prisma.tutor.create({
      data: {
        userId: tutorUser.id,
        slug: 'alexander-sterling',
        bio: 'Chartered Market Technician with 14 years of trading institutional FX orders and training hedge fund analysts.',
        expertise: ['Price Action', 'Order Flow', 'Smart Money Concepts', 'Macroeconomics'],
        avgRating: 4.95,
        status: ApprovalStatus.APPROVED,
      },
    });
  }
  console.log(`✅ Tutor Demo Account ready: ${tutorEmail}`);

  // 6. STUDENT / TRADER DEMO ACCOUNT
  const studentEmail = 'student@edutradefx.com';
  const traderEmail = 'trader@edutradefx.com';

  for (const email of [studentEmail, traderEmail]) {
    const studentUser = await prisma.user.upsert({
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

    const firstCourse = await prisma.course.findFirst({
      where: { status: CourseStatus.PUBLISHED },
    });

    if (firstCourse) {
      await prisma.enrollment.upsert({
        where: {
          courseId_userId: {
            userId: studentUser.id,
            courseId: firstCourse.id,
          },
        },
        update: {},
        create: {
          userId: studentUser.id,
          courseId: firstCourse.id,
          progress: 45,
        },
      });
    }

    const firstBroker = await prisma.broker.findFirst({
      where: { status: ApprovalStatus.APPROVED },
    });

    if (firstBroker) {
      await prisma.savedBroker.upsert({
        where: {
          userId_brokerId: {
            userId: studentUser.id,
            brokerId: firstBroker.id,
          },
        },
        update: {},
        create: {
          userId: studentUser.id,
          brokerId: firstBroker.id,
        },
      });
    }
  }
  console.log(`✅ Student / Trader Demo Accounts ready: ${studentEmail} & ${traderEmail}`);

  // 7. SOLUTIONS PROVIDER DEMO ACCOUNT ("Demo Solutions Ltd")
  console.log('\n--- Seeding Unified Solutions Provider Demo Account ---');
  const solutionsEmail = 'solutions@edutradefx.com';
  const legacySolutionsEmail = 'provider@solutionsdemo.com';

  // Create or update primary solutions demo user
  const solutionsUser = await prisma.user.upsert({
    where: { email: solutionsEmail },
    update: {
      password: hashedPassword,
      name: 'Demo Solutions Representative',
      role: Role.SERVICE_PROVIDER,
      isActive: true,
      isEmailVerified: true,
      isDemoAccount: true,
    },
    create: {
      name: 'Demo Solutions Representative',
      email: solutionsEmail,
      password: hashedPassword,
      role: Role.SERVICE_PROVIDER,
      isActive: true,
      isEmailVerified: true,
      isDemoAccount: true,
    },
  });

  // Keep legacy solutions email working as alias
  await prisma.user.upsert({
    where: { email: legacySolutionsEmail },
    update: {
      password: hashedPassword,
      role: Role.SERVICE_PROVIDER,
      isActive: true,
      isEmailVerified: true,
      isDemoAccount: true,
    },
    create: {
      name: 'Demo Solutions (Legacy Alias)',
      email: legacySolutionsEmail,
      password: hashedPassword,
      role: Role.SERVICE_PROVIDER,
      isActive: true,
      isEmailVerified: true,
      isDemoAccount: true,
    },
  });

  // Safely find or create Demo Solutions Ltd provider record
  const existingProvider = await prisma.serviceProvider.findFirst({
    where: {
      OR: [
        { userId: solutionsUser.id },
        { slug: 'demo-solutions-ltd' },
      ],
    },
  });

  const providerPayload = {
    userId: solutionsUser.id,
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
    overview: '<p>Demo Solutions Ltd provides audited bridge technology, liquidity aggregation, and CRM infrastructure for institutional brokers and proprietary trading firms worldwide.</p>',
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
    supportDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
    timezone: 'Europe/London',
    logo: '/demo/demo-provider-logo.svg',
    coverImage: '/demo/demo-provider-cover.svg',
    completionPercent: 100,
    avgRating: 4.8,
    totalReviews: 4,
  };

  const demoProvider = existingProvider
    ? await prisma.serviceProvider.update({
        where: { id: existingProvider.id },
        data: providerPayload,
      })
    : await prisma.serviceProvider.create({
        data: providerPayload,
      });

  // Contacts: Primary contact is PRIVATE
  await prisma.providerContact.deleteMany({ where: { providerId: demoProvider.id } });
  await prisma.providerContact.create({
    data: {
      providerId: demoProvider.id,
      fullName: 'Oliver Vance',
      jobTitle: 'VP of Institutional Partnerships',
      email: 'oliver.vance@demo-solutions.example.com',
      phone: '+442079460123',
      isPrimary: true,
      isPublic: false, // Critical privacy requirement
    },
  });

  // Addresses: HQ public, Registered private
  await prisma.providerAddress.deleteMany({ where: { providerId: demoProvider.id } });
  await prisma.providerAddress.createMany({
    data: [
      {
        providerId: demoProvider.id,
        type: AddressType.HEADQUARTERS,
        line1: '100 Bishopsgate',
        city: 'London',
        postalCode: 'EC2N 4AG',
        countryCode: 'GB',
        isPrivate: false,
      },
      {
        providerId: demoProvider.id,
        type: AddressType.REGISTERED,
        line1: '45 Moorfields',
        city: 'London',
        postalCode: 'EC2Y 9AE',
        countryCode: 'GB',
        isPrivate: true, // Registered address private
      },
    ],
  });

  // Social Links
  await prisma.providerSocialLink.deleteMany({ where: { providerId: demoProvider.id } });
  await prisma.providerSocialLink.createMany({
    data: [
      {
        providerId: demoProvider.id,
        platform: SocialPlatform.LINKEDIN,
        url: 'https://linkedin.example.com/company/demo-solutions',
      },
      {
        providerId: demoProvider.id,
        platform: SocialPlatform.X,
        url: 'https://x.example.com/demosolutions',
      },
    ],
  });

  // Categories Setup: 01 (APPROVED), 03 (APPROVED), 06 (CHANGES_REQUESTED)
  const [cat1Rec, cat3Rec, cat6Rec] = await Promise.all([
    prisma.providerCategory.findUnique({ where: { number: 1 } }),
    prisma.providerCategory.findUnique({ where: { number: 3 } }),
    prisma.providerCategory.findUnique({ where: { number: 6 } }),
  ]);

  if (!cat1Rec || !cat3Rec || !cat6Rec) {
    throw new Error('Categories 1, 3, or 6 missing in DB!');
  }

  // Fetch form fields to construct and validate real answers
  const [fieldsCat1, fieldsCat3, fieldsCat6] = await Promise.all([
    prisma.categoryFormField.findMany({ where: { section: { categoryId: cat1Rec.id }, isActive: true } }),
    prisma.categoryFormField.findMany({ where: { section: { categoryId: cat3Rec.id }, isActive: true } }),
    prisma.categoryFormField.findMany({ where: { section: { categoryId: cat6Rec.id }, isActive: true } }),
  ]);

  // Construct Answers for Category 01
  const answersCat1: Record<string, any> = {
    serviceTypes: ['LIQUIDITY_BRIDGE', 'LIQUIDITY_AGGREGATOR', 'RISK_MANAGEMENT_SOFTWARE'],
    productArchitecture: ['PROPRIETARY_ENGINE', 'CLOUD_BASED'],
    supportedTradingPlatforms: ['MetaTrader 4', 'MetaTrader 5', 'cTrader'],
    connectivityProtocols: ['FIX_4_4', 'REST_API', 'WEBSOCKET'],
    lpConnectivityModel: 'DIRECT_AND_AGGREGATED',
    supportedLps: ['LMAX_EXCHANGE', 'IS_PRIME', 'FINALTO', 'SAXO_BANK'],
    liquidityPoolsSupported: 35,
    customLpIntegrationSupported: true,
    averageIntegrationTimeWeeks: 2,
    maxConcurrentConnections: 10000,
    crossConnectAvailable: true,
    directMarketAccessAvailable: true,
    syntheticOrderTypes: ['ICEBERG', 'TWAP', 'TRAILING_STOP'],
    executionCapabilities: ['A_BOOK_ROUTING', 'B_BOOK_WAREHOUSING', 'HYBRID_RISK_ALLOCATION'],
    riskCapabilities: ['REAL_TIME_MARGIN_MONITORING', 'PRE_TRADE_LIMITS', 'AUTO_HEDGING'],
    deploymentModel: 'DEDICATED_CLOUD_INSTANCE',
    historicalUptimePercent: 99.99,
    slaGuaranteed: true,
    reportingFrequency: 'REAL_TIME',
    auditLogRetentionDays: 2555,
    disasterRecoverySite: true,
    coLocationFacilities: ['EQUINIX_LD4', 'EQUINIX_NY4', 'EQUINIX_TY3'],
    regulatoryCompliance: ['MIFID_II', 'SOC_2_TYPE_II'],
  };

  // Construct Answers for Category 03
  const answersCat3: Record<string, any> = {
    productType: ['FOREX_CRM', 'BROKER_CRM', 'CLIENT_PORTAL'],
    deployment: 'CLOUD_SAAS',
    tradingPlatformIntegrations: ['MetaTrader 4', 'MetaTrader 5', 'cTrader'],
    pspAndPaymentGatewayIntegrations: ['CREDIT_CARDS', 'WIRE_TRANSFER', 'CRYPTO_GATEWAYS'],
    kycAndComplianceIntegrations: ['SUMSUB', 'SHUFTIPRO'],
    clientPortalAndIbFeatures: ['MULTI_TIER_IB_TREE', 'REBATE_CALCULATOR', 'AUTOMATED_WITHDRAWALS'],
    securityAndDataSovereignty: ['GDPR_COMPLIANT', 'END_TO_END_ENCRYPTION', 'ROLE_BASED_ACCESS'],
  };

  // Construct Answers for Category 06
  const answersCat6: Record<string, any> = {
    hostingType: ['VPS', 'DEDICATED_SERVER', 'CLOUD_HOSTING'],
    hostingDeployment: 'DEDICATED',
    dataCentreLocations: ['LONDON_LD4', 'NEW_YORK_NY4'],
    operatingSystems: ['WINDOWS_SERVER', 'LINUX_UBUNTU'],
    uptimeAndSupportSLA: '99.95% uptime SLA with 24/7 emergency hardware replacement',
  };

  // Verify and Validate Answers against form engine schema in submit mode
  const schemaCat1 = buildAnswerSchema(fieldsCat1, { mode: 'submit' });
  const schemaCat3 = buildAnswerSchema(fieldsCat3, { mode: 'submit' });
  const schemaCat6 = buildAnswerSchema(fieldsCat6, { mode: 'submit' });

  schemaCat1.parse(answersCat1);
  schemaCat3.parse(answersCat3);
  schemaCat6.parse(answersCat6);
  console.log('✅ Form engine answer schema validation passed for Categories 01, 03, and 06 in submit mode!');

  // Upsert Category Selections
  await prisma.providerCategorySelection.deleteMany({ where: { providerId: demoProvider.id } });

  await prisma.providerCategorySelection.create({
    data: {
      providerId: demoProvider.id,
      categoryId: cat1Rec.id,
      status: ProviderCategoryStatus.APPROVED,
      isSelected: true,
      completionPercent: 100,
      answers: answersCat1,
    },
  });

  await prisma.providerCategorySelection.create({
    data: {
      providerId: demoProvider.id,
      categoryId: cat3Rec.id,
      status: ProviderCategoryStatus.APPROVED,
      isSelected: true,
      completionPercent: 100,
      answers: answersCat3,
    },
  });

  await prisma.providerCategorySelection.create({
    data: {
      providerId: demoProvider.id,
      categoryId: cat6Rec.id,
      status: ProviderCategoryStatus.CHANGES_REQUESTED,
      isSelected: true,
      completionPercent: 100,
      changesRequestedNote: 'Please provide additional technical documentation for server isolation.',
      answers: answersCat6,
    },
  });

  // Verifiable Claims: 1 verified, 1 unverified
  await prisma.providerVerification.deleteMany({ where: { providerId: demoProvider.id } });
  await prisma.providerVerification.create({
    data: {
      providerId: demoProvider.id,
      status: ProviderVerificationStatus.PARTIALLY_VERIFIED,
      note: 'Verified corporate registration and technical infrastructure SLA audit.',
      actorId: admin.id,
    },
  });

  // Seed Products:
  // Product A: Demo Bridge Pro (Cat 01, APPROVED, STARTING_PRICE)
  // Product B: Demo CRM Suite (Cat 03, APPROVED, CUSTOM_QUOTE)
  // Product C: Demo VPS Cloud (Cat 06, DRAFT)
  await prisma.serviceProviderProduct.deleteMany({ where: { providerId: demoProvider.id } });

  const prodA = await prisma.serviceProviderProduct.create({
    data: {
      providerId: demoProvider.id,
      slug: 'demo-bridge-pro',
      name: 'Demo Bridge Pro',
      productType: 'BRIDGE_GATEWAY',
      shortDescription: 'Ultra-low latency institutional bridge & order routing engine',
      fullDescription: '<p>High-performance bridge connecting MT4, MT5, and cTrader to over 30 tier-1 liquidity venues with microsecond order execution.</p>',
      availability: ProductAvailability.AVAILABLE,
      status: ProductStatus.APPROVED,
      officialUrl: 'https://demo-solutions.example.com/bridge-pro',
      version: '4.8.2',
    },
  });

  await prisma.productCategoryLink.create({
    data: {
      productId: prodA.id,
      categoryId: cat1Rec.id,
      subcategoryKey: 'BRIDGE_ENGINE',
      isPrimary: true,
    },
  });

  await prisma.productPricing.create({
    data: {
      productId: prodA.id,
      visibility: PricingVisibility.STARTING_PRICE,
      currency: 'USD',
      price: 1500,
      monthlyFee: { mode: 'AMOUNT', amount: 1500 },
      setupFee: { mode: 'AMOUNT', amount: 1000 },
      freeTrial: true,
      trialDays: 14,
    },
  });

  await prisma.productTechnicalSpec.create({
    data: {
      productId: prodA.id,
      architecture: 'Cloud Multi-Tenant',
      deploymentModel: 'DEDICATED_INSTANCE',
      hardwareRequirements: 'Distributed microservices architecture with automatic horizontal scaling.',
      securityFeatures: ['SOC2', 'TLS_1_3', 'IP_ALLOWLISTING'],
      implementationTime: '2-4 weeks',
    },
  });

  await prisma.productIntegration.create({
    data: {
      productId: prodA.id,
      supportedPlatforms: ['MetaTrader 4', 'MetaTrader 5', 'cTrader'],
      methods: ['FIX 4.4', 'FIX 5.0', 'REST API', 'WebSockets'],
    },
  });

  await prisma.productMedia.create({
    data: {
      productId: prodA.id,
      kind: ProductMediaKind.IMAGE,
      mediaType: 'image/svg+xml',
      url: '/demo/demo-product-bridge.svg',
      title: 'Demo Bridge Pro Console',
      reviewStatus: ModerationStatus.APPROVED,
      isCover: true,
    },
  });

  await prisma.productDocument.create({
    data: {
      productId: prodA.id,
      docType: 'SPECIFICATION',
      name: 'Demo Bridge Pro Technical Specification',
      fileUrl: 'https://demo-solutions.example.com/docs/bridge-spec.pdf',
      publicId: 'bridge-spec-demo',
      visibility: DocumentVisibility.PUBLIC,
      reviewStatus: ModerationStatus.APPROVED,
    },
  });

  // Product B: Demo CRM Suite (Cat 03, APPROVED, CUSTOM_QUOTE)
  const prodB = await prisma.serviceProviderProduct.create({
    data: {
      providerId: demoProvider.id,
      slug: 'demo-crm-suite',
      name: 'Demo CRM Suite',
      productType: 'SOFTWARE',
      shortDescription: 'Comprehensive CRM and IB management portal for regulated brokers',
      fullDescription: '<p>Complete multi-tiered IB portal, automated onboarding, KYC integration, and real-time deposits/withdrawals tracking.</p>',
      availability: ProductAvailability.AVAILABLE,
      status: ProductStatus.APPROVED,
      officialUrl: 'https://demo-solutions.example.com/crm-suite',
      version: '3.4.0',
    },
  });

  await prisma.productCategoryLink.create({
    data: {
      productId: prodB.id,
      categoryId: cat3Rec.id,
      subcategoryKey: 'FOREX_CRM',
      isPrimary: true,
    },
  });

  await prisma.productPricing.create({
    data: {
      productId: prodB.id,
      visibility: PricingVisibility.CUSTOM_QUOTE,
      currency: 'USD',
    },
  });

  await prisma.productTechnicalSpec.create({
    data: {
      productId: prodB.id,
      architecture: 'Hybrid / Dedicated Cloud',
      deploymentModel: 'SAAS',
      securityFeatures: ['GDPR', 'SOC2_TYPE_II'],
      implementationTime: '1-2 weeks',
    },
  });

  await prisma.productIntegration.create({
    data: {
      productId: prodB.id,
      supportedPlatforms: ['MetaTrader 4', 'MetaTrader 5', 'cTrader', 'TradingView'],
      methods: ['REST API', 'Webhooks'],
    },
  });

  await prisma.productMedia.create({
    data: {
      productId: prodB.id,
      kind: ProductMediaKind.IMAGE,
      mediaType: 'image/svg+xml',
      url: '/demo/demo-product-crm.svg',
      title: 'Broker CRM Dashboard Overview',
      reviewStatus: ModerationStatus.APPROVED,
      isCover: true,
    },
  });

  // Product C: Demo VPS Cloud (Cat 06, DRAFT)
  const prodC = await prisma.serviceProviderProduct.create({
    data: {
      providerId: demoProvider.id,
      slug: 'demo-vps-cloud',
      name: 'Demo VPS Cloud',
      productType: 'HOSTING_INFRASTRUCTURE',
      shortDescription: 'Low-latency co-located VPS servers in Equinix LD4 and NY4',
      fullDescription: '<p>Direct cross-connected private VPS virtualized environments for high frequency EA traders.</p>',
      availability: ProductAvailability.UNDER_DEVELOPMENT,
      status: ProductStatus.DRAFT, // Draft mode
    },
  });

  await prisma.productCategoryLink.create({
    data: {
      productId: prodC.id,
      categoryId: cat6Rec.id,
      subcategoryKey: 'VPS',
      isPrimary: true,
    },
  });

  // Team Members
  await prisma.providerTeamMember.deleteMany({ where: { providerId: demoProvider.id } });
  await prisma.providerTeamMember.createMany({
    data: [
      {
        providerId: demoProvider.id,
        fullName: 'Arthur Pendelton',
        jobTitle: 'Co-Founder & CEO',
        bio: 'Over 18 years in quantitative trading and institutional exchange technology.',
        profileVisibility: TeamProfileVisibility.COMPANY_PROFILE_ONLY,
        reviewStatus: ModerationStatus.APPROVED,
        ownershipPercentage: null, // Private ownership
      },
      {
        providerId: demoProvider.id,
        fullName: 'Dr. Elena Rostova',
        jobTitle: 'Chief Technology Officer',
        bio: 'PhD in Computer Engineering, specialized in distributed trading matching engines.',
        profileVisibility: TeamProfileVisibility.PRIVATE_ADMIN,
        reviewStatus: ModerationStatus.APPROVED,
      },
    ],
  });

  // Documents (Metadata-only placeholders)
  await prisma.providerDocument.deleteMany({ where: { providerId: demoProvider.id } });
  await prisma.providerDocument.createMany({
    data: [
      {
        providerId: demoProvider.id,
        docType: 'CERTIFICATE_OF_INCORPORATION',
        name: 'Demo_Solutions_Certificate_of_Incorporation_2014.pdf',
        fileUrl: 'placeholder://private/demo-certificate.pdf',
        visibility: DocumentVisibility.PRIVATE,
        reviewStatus: ModerationStatus.APPROVED,
      },
      {
        providerId: demoProvider.id,
        docType: 'PRODUCT_DOCUMENTATION',
        name: 'Demo_Solutions_Enterprise_Whitepaper_2026.pdf',
        fileUrl: 'https://demo-solutions.example.com/docs/whitepaper.pdf',
        visibility: DocumentVisibility.PUBLIC,
        reviewStatus: ModerationStatus.APPROVED,
      },
    ],
  });

  // Partner Agreement Acceptances
  const activeAgreements = await prisma.partnerAgreement.findMany({
    where: { audience: AgreementAudience.SERVICE_PROVIDER, isActive: true },
  });
  for (const ag of activeAgreements) {
    await prisma.partnerAgreementAcceptance.upsert({
      where: {
        partnerId_agreementKey_version: {
          partnerId: demoProvider.id,
          agreementKey: ag.key,
          version: ag.version,
        },
      },
      update: { acceptedAt: new Date() },
      create: {
        partnerId: demoProvider.id,
        userId: solutionsUser.id,
        partnerType: AgreementAudience.SERVICE_PROVIDER,
        agreementKey: ag.key,
        version: ag.version,
        agreementId: ag.id,
      },
    });
  }

  // Activity: 3 Enquiries
  await prisma.providerEnquiry.deleteMany({ where: { providerId: demoProvider.id } });
  await prisma.providerEnquiry.createMany({
    data: [
      {
        providerId: demoProvider.id,
        productId: prodA.id,
        type: ProviderEnquiryType.QUOTE,
        status: ProviderEnquiryStatus.NEW,
        isRead: false, // Unread enquiry for demo showcase
        name: 'Marcus Sterling',
        email: 'm.sterling@sterlingfx.example.com',
        companyName: 'Sterling FX Global',
        roleTitle: 'Chief Operating Officer',
        country: 'GB',
        budgetRange: '$5,000 - $10,000 / month',
        timeline: 'Immediate (within 30 days)',
        message: 'Requesting bridge throughput and institutional pricing for 5,000 daily active accounts.',
        consentToShare: true,
      },
      {
        providerId: demoProvider.id,
        productId: prodB.id,
        type: ProviderEnquiryType.DEMO,
        status: ProviderEnquiryStatus.CONTACTED,
        isRead: true,
        name: 'Sarah Jenkins',
        email: 's.jenkins@alpinetrading.example.com',
        companyName: 'Alpine Prop Firm',
        roleTitle: 'Head of Technology',
        country: 'CH',
        message: 'Would like to arrange a sandbox demo of the CRM IB portal with simulated volume.',
        consentToShare: true,
      },
      {
        providerId: demoProvider.id,
        type: ProviderEnquiryType.GENERAL,
        status: ProviderEnquiryStatus.CLOSED,
        isRead: true,
        name: 'Liam Chang',
        email: 'l.chang@propfund.example.com',
        companyName: 'Chang Capital',
        roleTitle: 'Managing Partner',
        country: 'SG',
        message: 'General enquiry regarding API documentation and integration timeline.',
        consentToShare: true,
      },
    ],
  });

  // Activity: 5 Reviews (4 Approved, 1 Pending for Admin queue)
  await prisma.providerReview.deleteMany({ where: { providerId: demoProvider.id } });
  await prisma.providerReview.createMany({
    data: [
      {
        providerId: demoProvider.id,
        productId: prodA.id,
        userId: brokerUser.id,
        rating: 5,
        title: 'Rock solid bridge latency',
        comment: 'Migrated our primary liquidity routing to Bridge Pro and saw our slippage drop by 40%. The technical team handled the cutover seamlessly.',
        status: ModerationStatus.APPROVED,
      },
      {
        providerId: demoProvider.id,
        productId: prodA.id,
        userId: amUser.id,
        rating: 5,
        title: 'Outstanding institutional support',
        comment: '24/7 technical desk helped us resolve a complex FIX gateway configuration issue in under 15 minutes. Highly recommended.',
        status: ModerationStatus.APPROVED,
      },
      {
        providerId: demoProvider.id,
        productId: prodB.id,
        userId: spUser.id,
        rating: 4,
        title: 'Excellent CRM and IB management features',
        comment: 'The IB portal is intuitive and reduced our onboarding cycle from days to hours. Reporting analytics are clean.',
        status: ModerationStatus.APPROVED,
      },
      {
        providerId: demoProvider.id,
        userId: tutorUser.id,
        rating: 5,
        title: 'Highly reliable infrastructure',
        comment: 'We have experienced zero downtime in 12 consecutive months of high volume trading operations.',
        status: ModerationStatus.APPROVED,
      },
      {
        providerId: demoProvider.id,
        productId: prodA.id,
        userId: admin.id,
        rating: 5,
        title: 'Seamless prop firm challenge integration',
        comment: 'Currently validating the risk engine for synthetic prop challenge accounts. Waiting for compliance moderation.',
        status: ModerationStatus.PENDING, // Pending review in Admin queue
      },
    ],
  });

  // 30 Days of Daily Stats for Analytics
  await prisma.providerDailyStat.deleteMany({ where: { providerId: demoProvider.id } });
  const statsToInsert = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const baseViews = 50 + Math.floor(Math.sin(i / 3) * 25) + (i % 7) * 5;
    const baseProdViews = Math.floor(baseViews * 0.6);
    const baseEnq = (i % 8 === 0) ? 1 : 0;
    const baseClicks = 5 + (i % 5);

    statsToInsert.push({
      providerId: demoProvider.id,
      date: d,
      profileViews: baseViews,
      productViews: baseProdViews,
      enquiries: baseEnq,
      websiteClicks: baseClicks,
      brochureDownloads: Math.floor(baseClicks * 0.4),
    });
  }
  await prisma.providerDailyStat.createMany({ data: statsToInsert });

  // Notifications
  await prisma.notification.deleteMany({ where: { userId: solutionsUser.id } });
  await prisma.notification.createMany({
    data: [
      {
        userId: solutionsUser.id,
        type: NotificationType.SUCCESS,
        title: 'Category 01 Approved',
        message: 'Your application for Category 01: Trading Technology has been approved by compliance.',
        link: '/dashboard/service-provider/categories',
      },
      {
        userId: solutionsUser.id,
        type: NotificationType.INFO,
        title: 'New Institutional Enquiry',
        message: 'Marcus Sterling (Sterling FX Global) submitted a new Quote Request for Demo Bridge Pro.',
        link: '/dashboard/service-provider/enquiries',
      },
      {
        userId: solutionsUser.id,
        type: NotificationType.SUCCESS,
        title: 'New Client Review Published',
        message: 'A verified broker client left a 5-star review for Demo Bridge Pro.',
        link: '/dashboard/service-provider/reviews',
      },
    ],
  });

  // Review Event Audit Trail
  await prisma.providerReviewEvent.create({
    data: {
      providerId: demoProvider.id,
      entityType: ProviderReviewEntityType.COMPANY,
      entityId: demoProvider.id,
      action: 'APPROVE',
      fromStatus: 'SUBMITTED',
      toStatus: 'APPROVED',
      note: 'Verified corporate registration and compliance criteria approved for initial demo launch.',
      actorId: admin.id,
    },
  });

  // 8. PUBLICATION VIA REAL SERVICE (NO HANDWRITTEN SNAPSHOTS)
  console.log('Publishing Demo Solutions Ltd via real providerPublishService...');
  const published = await providerPublishService.rebuildPublishedProvider(demoProvider.id);
  assert(published !== null, 'Failed to publish provider via providerPublishService');

  // Verify Publication Assertions in Code
  const publishedRow = await prisma.publishedProvider.findUnique({
    where: { providerId: demoProvider.id },
  });
  assert(publishedRow !== null, 'PublishedProvider row does not exist');
  assert(
    publishedRow.categoryNumbers.includes(1) && publishedRow.categoryNumbers.includes(3),
    'PublishedProvider must contain approved categories 1 and 3'
  );
  assert(
    !publishedRow.categoryNumbers.includes(6),
    'Category 06 must NOT appear in published categories because its status is CHANGES_REQUESTED'
  );

  const publishedProds = await prisma.publishedProduct.findMany({
    where: { providerId: demoProvider.id },
  });
  assert(publishedProds.length === 2, `Expected exactly 2 published products (A and B), got ${publishedProds.length}`);
  const prodBSnapshot = publishedProds.find((p) => p.slug === 'demo-crm-suite')?.snapshot as any;
  assert(prodBSnapshot !== undefined, 'Product B snapshot must exist');
  assert(
    prodBSnapshot.pricing?.price === undefined || prodBSnapshot.pricing?.price === null,
    'Product B with CUSTOM_QUOTE must NOT leak pricing numbers in public snapshot'
  );

  console.log('✅ Real publication verified: Category 01 & 03 published, Category 06 excluded, privacy verified.');

  // 9. PENDING DEMO PROVIDER (For Admin Review Queue)
  console.log('\n--- Seeding Pending Demo Provider for Admin Review Queue ---');
  const pendingUserEmail = 'solutions-pending@edutradefx.com';
  const pendingUser = await prisma.user.upsert({
    where: { email: pendingUserEmail },
    update: {
      password: hashedPassword,
      name: 'Pending Demo Representative',
      role: Role.SERVICE_PROVIDER,
      isActive: true,
      isEmailVerified: true,
      isDemoAccount: true,
    },
    create: {
      name: 'Pending Demo Representative',
      email: pendingUserEmail,
      password: hashedPassword,
      role: Role.SERVICE_PROVIDER,
      isActive: true,
      isEmailVerified: true,
      isDemoAccount: true,
    },
  });

  const cat2Rec = await prisma.providerCategory.findUnique({ where: { number: 2 } });
  const existingPendingProvider = await prisma.serviceProvider.findFirst({
    where: {
      OR: [
        { userId: pendingUser.id },
        { slug: 'pending-tech-solutions' },
      ],
    },
  });

  const pendingPayload = {
    userId: pendingUser.id,
    legalName: 'Pending Demo Provider Ltd',
    brandName: 'Pending Tech Solutions',
    slug: 'pending-tech-solutions',
    accountType: ProviderAccountType.REGISTERED_COMPANY,
    status: ProviderStatus.SUBMITTED, // Under admin queue
    verificationStatus: ProviderVerificationStatus.PENDING_REVIEW,
    providerCode: 'ETP-PENDING01',
    applicationRef: 'APP-2026-PENDING01',
    tagline: 'Institutional liquidity and connectivity provider currently undergoing verification',
    overview: '<p>Pending provider awaiting compliance audit and review of liquidity aggregation capabilities.</p>',
    headquartersCountryCode: 'SG',
    companyEmail: 'compliance@pendingtech.example.com',
    completionPercent: 85,
  };

  const pendingProvider = existingPendingProvider
    ? await prisma.serviceProvider.update({
        where: { id: existingPendingProvider.id },
        data: pendingPayload,
      })
    : await prisma.serviceProvider.create({
        data: pendingPayload,
      });

  if (cat2Rec) {
    await prisma.providerCategorySelection.upsert({
      where: {
        providerId_categoryId: {
          providerId: pendingProvider.id,
          categoryId: cat2Rec.id,
        },
      },
      update: {
        status: ProviderCategoryStatus.SUBMITTED,
        isSelected: true,
        completionPercent: 100,
      },
      create: {
        providerId: pendingProvider.id,
        categoryId: cat2Rec.id,
        status: ProviderCategoryStatus.SUBMITTED,
        isSelected: true,
        completionPercent: 100,
        answers: {
          liquidityOfferings: ['TIER_1_BANKS', 'NON_BANK_MARKET_MAKERS'],
          supportedAssetClasses: ['SPOT_FX', 'METALS', 'INDICES'],
        },
      },
    });
  }
  console.log(`✅ Pending Demo Provider ready for Admin review: ${pendingUserEmail}`);

  console.log('\n🎉 ALL DEMO ACCOUNTS SEEDED SUCCESSFULLY!');
  console.log('============================================================');
  console.log(`Universal Demo Password:   ${DEMO_PASSWORD}`);
  console.log('============================================================');
  console.log(`👑 ADMIN:              admin@edutradefx.com`);
  console.log(`🏢 BROKER:             broker@edutradefx.com (or broker@pepperstone-demo.com)`);
  console.log(`💼 ACCOUNT MANAGER:    accountmanager@edutradefx.com (or accountmanager@demo.com)`);
  console.log(`📡 SIGNAL PROVIDER:    signals@edutradefx.com (or signals@alphatrades.com)`);
  console.log(`🛠️ SOLUTIONS PROVIDER: solutions@edutradefx.com (or provider@solutionsdemo.com)`);
  console.log(`🎓 COURSE TUTOR:       tutor@edutradefx.com`);
  console.log(`📈 TRADER / STUDENT:   trader@edutradefx.com (or student@edutradefx.com)`);
  console.log(`⏳ PENDING PROVIDER:   solutions-pending@edutradefx.com (for demo admin review)`);
  console.log('============================================================\n');
}

seedDemoAccounts()
  .catch((e) => {
    console.error('❌ Error seeding demo accounts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
