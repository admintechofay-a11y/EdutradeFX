import { PrismaClient, Role, ApprovalStatus, BrokerBusinessType, BrokerOnboardingStatus, AmEntityType, OnboardingStatus, CourseStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

const DEMO_PASSWORD = 'Demo@1234!';

async function seedDemoAccounts() {
  console.log('🚀 Seeding comprehensive verified demo accounts for all roles...');
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
    },
    create: {
      name: 'EdutradeFX Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: Role.ADMIN,
      isActive: true,
      isEmailVerified: true,
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
    },
    create: {
      name: 'Pepperstone Markets Representative',
      email: pepperstoneEmail,
      password: hashedPassword,
      role: Role.BROKER,
      isActive: true,
      isEmailVerified: true,
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
    },
    create: {
      name: 'Alpha Capital Broker Rep',
      email: brokerPrimaryEmail,
      password: hashedPassword,
      role: Role.BROKER,
      isActive: true,
      isEmailVerified: true,
    },
  });

  // Ensure broker profile exists for brokerUser
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
    },
    create: {
      name: 'Marcus Vance',
      email: amDemoEmail,
      password: hashedPassword,
      role: Role.ACCOUNT_MANAGER,
      isActive: true,
      isEmailVerified: true,
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
    },
    create: {
      name: 'Elena Rostova (Apex PAMM)',
      email: amPrimaryEmail,
      password: hashedPassword,
      role: Role.ACCOUNT_MANAGER,
      isActive: true,
      isEmailVerified: true,
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
    },
    create: {
      name: 'AlphaWave Signals Team',
      email: spDemoEmail,
      password: hashedPassword,
      role: Role.SIGNAL_PROVIDER,
      isActive: true,
      isEmailVerified: true,
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
    },
    create: {
      name: 'Quantum Edge Signals',
      email: spPrimaryEmail,
      password: hashedPassword,
      role: Role.SIGNAL_PROVIDER,
      isActive: true,
      isEmailVerified: true,
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
    },
    create: {
      name: 'Alexander Sterling, CMT',
      email: tutorEmail,
      password: hashedPassword,
      role: Role.TUTOR,
      isActive: true,
      isEmailVerified: true,
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
      },
      create: {
        name: 'Alex Mercer (Trader)',
        email,
        password: hashedPassword,
        role: Role.STUDENT,
        isActive: true,
        isEmailVerified: true,
      },
    });

    // Enroll in the first available course if not already enrolled
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

    // Save a broker if available
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

  // 7. Make sure user registered account has Demo@1234!
  const userRegisteredEmail = 'bhumitvaghela7111@gmail.com';
  const existingUser = await prisma.user.findUnique({
    where: { email: userRegisteredEmail },
  });
  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        password: hashedPassword,
        isEmailVerified: true,
        isActive: true,
      },
    });
    console.log(`✅ User registered account updated with Demo@1234!: ${userRegisteredEmail}`);
  }

  console.log('\n🎉 ALL DEMO ACCOUNTS SEEDED SUCCESSFULLY!');
  console.log('============================================================');
  console.log(`Universal Demo Password:   ${DEMO_PASSWORD}`);
  console.log('============================================================');
  console.log(`👑 ADMIN:           admin@edutradefx.com`);
  console.log(`🏢 BROKER:          broker@edutradefx.com (or broker@pepperstone-demo.com)`);
  console.log(`💼 ACCOUNT MANAGER: accountmanager@edutradefx.com (or accountmanager@demo.com)`);
  console.log(`📡 SIGNAL PROVIDER: signals@edutradefx.com (or signals@alphatrades.com)`);
  console.log(`🎓 COURSE TUTOR:    tutor@edutradefx.com`);
  console.log(`📈 TRADER / USER:   trader@edutradefx.com (or student@edutradefx.com)`);
  console.log(`👤 YOUR ACCOUNT:    ${userRegisteredEmail}`);
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
