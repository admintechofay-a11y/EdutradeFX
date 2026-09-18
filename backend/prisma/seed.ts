import { PrismaClient, Role, ApprovalStatus, CourseStatus, LessonType, SignalDirection, SignalStatus, BlogStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Beginning EdutradeFX database seeding...');

  // 1. Seed Default Site Settings
  const defaultSettings = [
    { key: 'platformCommission', value: '20' },
    { key: 'minPayout', value: '500' },
    { key: 'maintenanceMode', value: 'false' },
    { key: 'featuredListingPrice', value: '4999' },
    { key: 'contactEmail', value: 'support@edutradefx.com' },
  ];

  for (const s of defaultSettings) {
    await prisma.siteSettings.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log('✅ Site settings seeded.');

  // 2. Seed Admin User
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@edutradefx.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@1234!';
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedAdminPassword,
      role: Role.ADMIN,
      isActive: true,
      isEmailVerified: true,
    },
    create: {
      name: 'EdutradeFX Administrator',
      email: adminEmail,
      password: hashedAdminPassword,
      role: Role.ADMIN,
      isActive: true,
      isEmailVerified: true,
    },
  });
  console.log(`✅ Admin account created: ${admin.email}`);

  // 3. Seed Demo Broker
  const brokerUserEmail = 'broker@pepperstone-demo.com';
  const brokerUser = await prisma.user.upsert({
    where: { email: brokerUserEmail },
    update: {},
    create: {
      name: 'Pepperstone Markets Representative',
      email: brokerUserEmail,
      password: await bcrypt.hash('Broker@1234!', 12),
      role: Role.BROKER,
      isActive: true,
      isEmailVerified: true,
    },
  });

  await prisma.broker.upsert({
    where: { userId: brokerUser.id },
    update: {},
    create: {
      userId: brokerUser.id,
      companyName: 'Pepperstone Global Markets',
      slug: 'pepperstone-global-markets',
      website: 'https://pepperstone.com',
      description:
        'Pepperstone is an internationally regulated Tier-1 Forex and CFD broker offering razor-thin spreads, institutional liquidity, lightning-fast execution, and award-winning customer support.',
      yearFounded: 2010,
      headquarters: 'Melbourne, Australia',
      countries: ['Australia', 'United Kingdom', 'Cyprus', 'UAE', 'Kenya'],
      regulation: ['FCA', 'ASIC', 'CySEC', 'DFSA', 'BaFin'],
      tradingPlatforms: ['MetaTrader 4', 'MetaTrader 5', 'cTrader', 'TradingView'],
      accountTypes: ['Razor Account', 'Standard Account'],
      minDeposit: 0,
      maxLeverage: '1:500',
      spreadsFrom: '0.0 pips',
      commissions: '$3.50 per lot',
      instruments: ['Forex (60+ pairs)', 'Indices', 'Commodities', 'Cryptos', 'Shares'],
      depositMethods: ['Visa/Mastercard', 'Bank Transfer', 'Neteller', 'Skrill', 'UPI'],
      withdrawMethods: ['Bank Wire', 'Credit Card', 'Neteller', 'Skrill'],
      avgRating: 4.8,
      totalReviews: 42,
      totalLeads: 128,
      status: ApprovalStatus.APPROVED,
      isFeatured: true,
      isPremium: true,
    },
  });
  console.log('✅ Demo Broker seeded: Pepperstone Global Markets');

  // 4. Seed Demo Tutor & Course
  const tutorUserEmail = 'tutor@edutradefx.com';
  const tutorUser = await prisma.user.upsert({
    where: { email: tutorUserEmail },
    update: {},
    create: {
      name: 'Alexander Sterling, CMT',
      email: tutorUserEmail,
      password: await bcrypt.hash('Tutor@1234!', 12),
      role: Role.TUTOR,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const tutor = await prisma.tutor.upsert({
    where: { userId: tutorUser.id },
    update: {},
    create: {
      userId: tutorUser.id,
      slug: 'alexander-sterling',
      bio: 'Chartered Market Technician with 14 years of institutional prop-trading experience. Specializes in Price Action, Order Flow dynamics, and institutional liquidity concepts.',
      expertise: ['Price Action', 'Order Flow', 'Risk Management', 'Technical Analysis'],
      status: ApprovalStatus.APPROVED,
    },
  });

  const course = await prisma.course.upsert({
    where: { slug: 'mastering-forex-price-action-and-liquidity' },
    update: {},
    create: {
      tutorId: tutor.id,
      title: 'Mastering Forex Price Action & Liquidity Pools',
      slug: 'mastering-forex-price-action-and-liquidity',
      shortDescription:
        'A comprehensive institutional blueprint for reading market structure, spotting smart money setups, and executing high-probability trades.',
      description:
        'Transform your trading from guessing retail patterns to reading actual institutional order flow. This masterclass covers candlestick psychology, breaker blocks, fair value gaps (FVG), stop hunt mechanics, and rigorous 1:3+ risk-to-reward execution models.',
      category: 'Price Action',
      level: 'All Levels',
      price: 1999,
      discountPrice: 999,
      currency: 'INR',
      learningOutcomes: [
        'Identify institutional liquidity sweeps and stop runs',
        'Master multi-timeframe market structure mapping',
        'Execute disciplined 1:3 and 1:5 risk-to-reward trade plans',
        'Avoid common retail traps around trendlines and support/resistance',
      ],
      totalLessons: 4,
      totalDuration: 180,
      totalEnrollments: 254,
      avgRating: 4.9,
      totalReviews: 38,
      status: CourseStatus.PUBLISHED,
      isFeatured: true,
    },
  });

  const section = await prisma.courseSection.create({
    data: {
      courseId: course.id,
      title: 'Module 1: Market Structure & Institutional Concepts',
      order: 1,
    },
  });

  await prisma.lesson.createMany({
    data: [
      {
        sectionId: section.id,
        title: 'Understanding Liquidity Pools & Stop Runs',
        type: LessonType.VIDEO,
        description: 'Deep dive into why retail stop losses are hunted and how to position alongside liquidity providers.',
        duration: 45,
        order: 1,
        isFree: true,
      },
      {
        sectionId: section.id,
        title: 'Fair Value Gaps (FVG) and Imbalance Fills',
        type: LessonType.VIDEO,
        description: 'How price rebalances inefficiencies across higher-timeframe order blocks.',
        duration: 50,
        order: 2,
        isFree: false,
      },
    ],
  });
  console.log('✅ Demo Course seeded with curriculum.');

  // 5. Seed Demo Signal Provider
  const spUserEmail = 'signals@alphatrades.com';
  const spUser = await prisma.user.upsert({
    where: { email: spUserEmail },
    update: {},
    create: {
      name: 'AlphaWave Signals Team',
      email: spUserEmail,
      password: await bcrypt.hash('Signals@1234!', 12),
      role: Role.SIGNAL_PROVIDER,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const sp = await prisma.signalProvider.upsert({
    where: { userId: spUser.id },
    update: {},
    create: {
      userId: spUser.id,
      displayName: 'AlphaWave Institutional FX',
      slug: 'alphawave-institutional-fx',
      bio: 'Quantitative intraday & swing FX signals focusing on London and New York session breakouts.',
      instruments: ['EUR/USD', 'GBP/USD', 'XAU/USD', 'USD/JPY'],
      strategy: 'London Session Breakout & Mean Reversion',
      riskCategory: 'MEDIUM',
      winRate: 74.5,
      totalSignals: 184,
      avgRating: 4.7,
      totalReviews: 29,
      verificationStatus: true,
      status: ApprovalStatus.APPROVED,
      isFeatured: true,
    },
  });

  await prisma.signal.create({
    data: {
      signalProviderId: sp.id,
      title: 'EUR/USD Bullish NY Momentum Entry',
      instrument: 'EUR/USD',
      direction: SignalDirection.BUY,
      entryPrice: 1.0845,
      takeProfit: 1.092,
      stopLoss: 1.0815,
      description: 'H4 Bullish Market Structure Shift following liquidity sweep under Asian session lows.',
      status: SignalStatus.ACTIVE,
    },
  });
  console.log('✅ Demo Signal Provider and active trade signal seeded.');

  // 6. Seed Demo Blog Post
  await prisma.blogPost.upsert({
    where: { slug: 'how-to-choose-the-best-regulated-forex-broker-in-2025' },
    update: {},
    create: {
      authorId: admin.id,
      title: 'How to Choose the Best Regulated Forex Broker in 2025',
      slug: 'how-to-choose-the-best-regulated-forex-broker-in-2025',
      excerpt: 'Key criteria every trader must check: Tier-1 regulatory licenses, segregated client bank accounts, spread transparency, and withdrawal reliability.',
      content: `<h2>1. Regulation is Non-Negotiable</h2><p>Never deposit funds with an unregulated offshore entity. Look for licenses from ASIC (Australia), FCA (United Kingdom), CySEC (Cyprus), or BaFin (Germany). These authorities require segregated client accounts, negative balance protection, and strict capital adequacy standards.</p><h2>2. Total Cost of Trading: Spreads vs. Commissions</h2><p>A broker advertising 'zero commission' typically widens their spreads to 1.5 - 2.0 pips. On high-volume trading, a Razor or ECN account charging a raw spread (0.0 - 0.2 pips) with a fixed $3.50 commission per lot saves thousands of dollars annually.</p><h2>3. Execution Speed and Slippage</h2><p>Ensure your broker connects directly to Tier-1 liquidity providers with execution latency below 50 milliseconds to minimize negative slippage during high-impact news releases.</p>`,
      category: 'Broker Education',
      tags: ['Forex Brokers', 'Regulation', 'Trading Safety', 'Risk Management'],
      status: BlogStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });
  console.log('✅ Demo Blog article seeded.');

  console.log('🎉 Seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
