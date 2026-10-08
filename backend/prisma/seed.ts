import {
  PrismaClient,
  Role,
  ApprovalStatus,
  CourseStatus,
  LessonType,
  SignalDirection,
  SignalStatus,
  BlogStatus,
  BrokerBusinessType,
  BrokerOnboardingStatus,
  BrokerDocType,
  SpreadType,
  OrderExecution,
  GtcMode,
  Prisma,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { encryptBrokerCredential } from '../src/utils/crypto.utils';
import { seedBrokerOptions } from './seed-options';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Recomputes denormalized summary fields and profile completeness % for a broker.
 */
async function recomputeBrokerSummary(brokerId: string) {
  const broker = await prisma.broker.findUnique({
    where: { id: brokerId },
    include: {
      licenses: true,
      accountGroups: true,
      depositMethodItems: true,
      withdrawalMethodItems: true,
      documents: true,
      servers: true,
      boardMembers: true,
      symbolSpecs: true,
      ibPlans: true,
      fundingYears: true,
      clientActivity: true,
      businessAreas: true,
      awards: true,
    },
  });

  if (!broker) return null;

  // 1. Regulations
  const regulation = Array.from(new Set(broker.licenses.map((l) => l.regulatoryBody).filter(Boolean)));

  // 2. Trading Platforms
  const tradingPlatforms = broker.availablePlatforms.length > 0 ? broker.availablePlatforms : ['MetaTrader 4', 'MetaTrader 5'];

  // 3. Account Types
  const accountTypes = broker.accountGroups.map((g) => g.name).filter(Boolean);

  // 4. Min Deposit
  const deposits = broker.accountGroups.map((g) => Number(g.minDeposit)).filter((d) => !isNaN(d));
  const minDeposit = deposits.length > 0 ? Math.min(...deposits) : broker.minDeposit ?? 0;

  // 5. Max Leverage
  let maxLeverage = broker.maxLeverage || '1:500';
  if (broker.accountGroups.length > 0) {
    const highestGroup = [...broker.accountGroups].sort((a, b) => (b.leverageNum || 0) - (a.leverageNum || 0))[0];
    if (highestGroup && highestGroup.leverageUpTo) {
      maxLeverage = highestGroup.leverageUpTo;
    }
  }

  // 6. Spreads From
  let spreadsFrom = broker.spreadsFrom || 'From 0.0 pips';
  if (broker.accountGroups.length > 0) {
    const validSpreads = broker.accountGroups.map((g) => Number(g.spreadFrom)).filter((s) => !isNaN(s));
    if (validSpreads.length > 0) {
      const minSpread = Math.min(...validSpreads);
      spreadsFrom = `From ${minSpread} pips`;
    }
  }

  // 7. Commissions
  let commissions = broker.commissions || '$0 / Zero Commission';
  if (broker.accountGroups.length > 0) {
    const commissionGroups = broker.accountGroups.filter((g) => g.hasCommissionPerLot && g.feesPerLot);
    if (commissionGroups.length > 0) {
      commissions = `$${commissionGroups[0].feesPerLot} per lot`;
    } else {
      commissions = '$0 / Zero Commission';
    }
  }

  // 8. Execution Type
  let executionType = broker.executionType || 'ECN / STP';
  if (broker.accountGroups.length > 0) {
    const executions = broker.accountGroups.map((g) => g.orderExecution);
    if (executions.includes('INSTANT')) {
      executionType = 'Instant / STP';
    } else {
      executionType = 'Market Execution';
    }
  }

  // 9. Deposit & Withdrawal Methods
  const depositMethods = broker.depositMethodItems.map((d) => d.method).filter(Boolean);
  const withdrawMethods = broker.withdrawalMethodItems.map((w) => w.method).filter(Boolean);

  // 10. Instruments
  let instruments = broker.instruments;
  if (!instruments || instruments.length === 0) {
    instruments = ['Forex (60+ pairs)', 'Indices', 'Commodities', 'Metals', 'Cryptos'];
  }

  // 11. Supported countries
  const countries = broker.country ? [broker.country] : broker.countries;

  // 12. Calculate Completeness % across 18 wizard sections:
  let score = 0;
  const totalSections = 18;

  if (broker.companyName && broker.country && broker.city && broker.email && broker.website) score++;
  if (broker.availablePlatforms.length > 0 || broker.servers.length > 0) score++;
  if (broker.isRegulated === false || (broker.isRegulated && broker.licenses.length > 0)) score++;
  if (broker.boardMembers.length > 0 || broker.headquarters) score++;
  if (broker.supportEmail || broker.supportPhone || broker.supportWhatsapp) score++;
  if (broker.fundsSecurity || broker.clientLossPercentage !== null) score++;
  if (broker.accountGroups.length > 0) score++;
  if (broker.ibPlans.length > 0) score++;
  if (broker.depositMethodItems.length > 0) score++;
  if (broker.withdrawalMethodItems.length > 0) score++;
  if (broker.symbolSpecs.length > 0) score++;
  if (broker.liquidityProvider || broker.personalBookSize) score++;
  if (broker.businessAreas.length > 0) score++;
  if (broker.fundingYears.length > 0) score++;
  if (broker.clientActivity) score++;
  if (broker.prosList.length > 0 || broker.consList.length > 0) score++;
  if (broker.awards.length > 0) score++;
  if (broker.documents.length >= 3) score++;

  const completenessPct = Math.min(100, Math.round((score / totalSections) * 100));

  return await prisma.broker.update({
    where: { id: brokerId },
    data: {
      regulation: regulation.length > 0 ? regulation : broker.regulation,
      tradingPlatforms: tradingPlatforms.length > 0 ? tradingPlatforms : broker.tradingPlatforms,
      accountTypes: accountTypes.length > 0 ? accountTypes : broker.accountTypes,
      minDeposit,
      maxLeverage,
      spreadsFrom,
      commissions,
      executionType,
      depositMethods: depositMethods.length > 0 ? depositMethods : broker.depositMethods,
      withdrawMethods: withdrawMethods.length > 0 ? withdrawMethods : broker.withdrawMethods,
      instruments,
      countries: countries.length > 0 ? countries : broker.countries,
      completenessPct,
    },
  });
}

async function main() {
  console.log('🌱 Beginning EdutradeFX database seeding...');

  // 0. Seed Broker Options
  await seedBrokerOptions(prisma);

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

  // 3. Seed Demo Broker 1: Pepperstone Global Markets
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

  const pepperstoneData: Prisma.BrokerUncheckedCreateInput = {
    userId: brokerUser.id,
    companyName: 'Pepperstone Global Markets',
    registeredName: 'Pepperstone Group Limited',
    businessType: BrokerBusinessType.ECN,
    slug: 'pepperstone-global-markets',
    website: 'https://pepperstone.com',
    description:
      'Pepperstone is an internationally regulated Tier-1 Forex and CFD broker offering razor-thin spreads, institutional liquidity, lightning-fast execution under 30ms, and award-winning customer support.',
    platformDescription:
      'Pepperstone provides access to raw interbank pricing across MetaTrader 4, MetaTrader 5, cTrader, and TradingView with institutional-grade low-latency bridge infrastructure hosted at Equinix LD4 London.',
    yearFounded: 2010,
    headquarters: 'Melbourne, Australia',
    address: 'Level 16, Tower 1, 727 Collins Street',
    city: 'Melbourne',
    state: 'Victoria',
    postalCode: '3008',
    country: 'Australia',
    phone: '+61 3 9020 0155',
    email: 'support@pepperstone.com',
    officeContactNumber: '+61 3 9020 0155',
    officeContactEmail: 'corporate@pepperstone.com',
    mtRegisteredCountryRegion: 'Melbourne, Australia',
    isRegulated: true,
    totalTradableSymbols: 1200,
    accountCurrencies: ['USD', 'EUR', 'GBP', 'AUD', 'JPY', 'CHF', 'SGD'],
    negativeBalanceProtection: true,
    availablePlatforms: ['MetaTrader 4', 'MetaTrader 5', 'cTrader', 'TradingView'],
    platformLinks: {
      mt4: 'https://pepperstone.com/en/trading-platforms/mt4',
      mt5: 'https://pepperstone.com/en/trading-platforms/mt5',
      ctrader: 'https://pepperstone.com/en/trading-platforms/ctrader',
      tradingview: 'https://pepperstone.com/en/trading-platforms/tradingview',
    },
    deviceSupport: ['Windows', 'macOS', 'iOS', 'Android', 'Web'],
    countries: ['Australia', 'United Kingdom', 'Cyprus', 'UAE', 'Kenya', 'Germany'],
    countryRestrictions: ['United States', 'North Korea', 'Iran', 'Syria'],
    supportPhone: '+61 3 9020 0155',
    supportWhatsapp: '+61 400 123 456',
    supportEmail: 'support@pepperstone.com',
    supportAvailability: '24/5 Multilingual Support',
    languagesSupported: ['English', 'Spanish', 'German', 'Chinese', 'Arabic', 'Russian', 'French', 'Vietnamese'],
    availableTimeframes: ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1', 'MN'],
    clientLossPercentage: new Prisma.Decimal('75.30'),
    fundsSecurity:
      'Client funds are held in segregated trust accounts at Tier-1 Australian banks (National Australia Bank) and covered by the UK Financial Services Compensation Scheme (FSCS) up to £85,000 where applicable. We maintain full negative balance protection.',
    liquidityProvider: 'Barclays, JPMorgan Chase, Citi, UBS, HSBC, Deutsche Bank',
    personalBookSize: '$50,000,000+ Institutional Reserve Tier',
    prosList: [
      'Raw ECN spreads from 0.0 pips on EUR/USD and major currency pairs',
      'Institutional liquidity with sub-30ms average order execution latency at Equinix LD4',
      'Regulated by top-tier authorities: ASIC, FCA, CySEC, BaFin, and DFSA',
      'Zero fee deposits and withdrawals across all major domestic & international payment gateways',
      'Full unhindered support for Algorithmic Trading, Expert Advisors (EAs), and Scalping',
    ],
    consList: [
      'US residents cannot register due to CFTC regulatory restrictions',
      'No proprietary trading terminal, relies on industry-standard platforms',
    ],
    promoVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    socialLinks: {
      twitter: 'https://twitter.com/PepperstoneFX',
      linkedin: 'https://linkedin.com/company/pepperstone',
      facebook: 'https://facebook.com/PepperstoneFX',
      youtube: 'https://youtube.com/PepperstoneFX',
    },
    regulation: ['FCA', 'ASIC', 'CySEC', 'DFSA', 'BaFin'],
    tradingPlatforms: ['MetaTrader 4', 'MetaTrader 5', 'cTrader', 'TradingView'],
    accountTypes: ['Razor Account', 'Standard Account'],
    minDeposit: 0,
    maxLeverage: '1:500',
    spreadsFrom: 'From 0.0 pips',
    commissions: '$3.50 per lot',
    executionType: 'Market Execution',
    instruments: ['Forex (60+ pairs)', 'Indices', 'Commodities', 'Metals', 'Cryptos', 'Shares'],
    depositMethods: ['Visa / Mastercard', 'Bank Wire Transfer', 'Neteller / Skrill', 'USDT (Tether)'],
    withdrawMethods: ['Visa / Mastercard', 'Bank Wire Transfer', 'Neteller / Skrill'],
    avgRating: 4.8,
    totalReviews: 42,
    totalLeads: 128,
    status: ApprovalStatus.APPROVED,
    onboardingStatus: BrokerOnboardingStatus.VERIFIED,
    isFeatured: true,
    isPremium: true,
    completenessPct: 100,
    submittedAt: new Date('2025-01-10T09:00:00Z'),
    reviewedAt: new Date('2025-01-11T14:30:00Z'),
    reviewNote: 'All regulatory licenses verified with ASIC and FCA registries. Bank segregation documents confirmed.',
  };

  const pepperstone = await prisma.broker.upsert({
    where: { userId: brokerUser.id },
    update: pepperstoneData,
    create: pepperstoneData,
  });

  // Re-seed Pepperstone child tables cleanly
  await prisma.brokerLicense.deleteMany({ where: { brokerId: pepperstone.id } });
  await prisma.brokerServer.deleteMany({ where: { brokerId: pepperstone.id } });
  await prisma.brokerBoardMember.deleteMany({ where: { brokerId: pepperstone.id } });
  await prisma.brokerSymbolSpec.deleteMany({ where: { brokerId: pepperstone.id } });
  await prisma.brokerAccountGroup.deleteMany({ where: { brokerId: pepperstone.id } });
  await prisma.brokerIbPlan.deleteMany({ where: { brokerId: pepperstone.id } });
  await prisma.brokerDepositMethod.deleteMany({ where: { brokerId: pepperstone.id } });
  await prisma.brokerWithdrawalMethod.deleteMany({ where: { brokerId: pepperstone.id } });
  await prisma.brokerFundingYear.deleteMany({ where: { brokerId: pepperstone.id } });
  await prisma.brokerClientActivity.deleteMany({ where: { brokerId: pepperstone.id } });
  await prisma.brokerBusinessArea.deleteMany({ where: { brokerId: pepperstone.id } });
  await prisma.brokerAward.deleteMany({ where: { brokerId: pepperstone.id } });
  await prisma.brokerDocument.deleteMany({ where: { brokerId: pepperstone.id } });

  // 3a. Licenses
  await prisma.brokerLicense.createMany({
    data: [
      {
        brokerId: pepperstone.id,
        regulatoryBody: 'ASIC',
        regulatorCode: 'ASIC',
        licenseNumber: '414530',
        licenseStatus: 'Active',
        companyAddress: 'Level 16, Tower 1, 727 Collins Street, Melbourne VIC 3008, Australia',
        proofLink: 'https://connectonline.asic.gov.au',
        verifiedByAdmin: true,
        verifiedAt: new Date(),
        sortOrder: 0,
      },
      {
        brokerId: pepperstone.id,
        regulatoryBody: 'FCA',
        regulatorCode: 'FCA',
        licenseNumber: '684312',
        licenseStatus: 'Active',
        companyAddress: '70 Gracechurch Street, London EC3V 0HR, United Kingdom',
        proofLink: 'https://register.fca.org.uk',
        verifiedByAdmin: true,
        verifiedAt: new Date(),
        sortOrder: 1,
      },
      {
        brokerId: pepperstone.id,
        regulatoryBody: 'CySEC',
        regulatorCode: 'CYSEC',
        licenseNumber: '388/20',
        licenseStatus: 'Active',
        companyAddress: '195 Makarios III Avenue, Neapolis, Limassol 3030, Cyprus',
        proofLink: 'https://cysec.gov.cy',
        verifiedByAdmin: true,
        verifiedAt: new Date(),
        sortOrder: 2,
      },
      {
        brokerId: pepperstone.id,
        regulatoryBody: 'DFSA',
        regulatorCode: 'DFSA',
        licenseNumber: 'F004356',
        licenseStatus: 'Active',
        companyAddress: 'Al Fattan Currency House, DIFC, Dubai, UAE',
        proofLink: 'https://dfsa.ae',
        verifiedByAdmin: true,
        verifiedAt: new Date(),
        sortOrder: 3,
      },
    ],
  });

  // 3b. Servers
  await prisma.brokerServer.createMany({
    data: [
      {
        brokerId: pepperstone.id,
        name: 'Pepperstone-Live01',
        ip: '198.51.100.12',
        location: 'LD4 London (Equinix)',
        sortOrder: 0,
      },
      {
        brokerId: pepperstone.id,
        name: 'Pepperstone-Live02',
        ip: '198.51.100.15',
        location: 'NY4 New York (Equinix)',
        sortOrder: 1,
      },
      {
        brokerId: pepperstone.id,
        name: 'Pepperstone-Demo01',
        ip: '198.51.100.20',
        location: 'TY3 Tokyo (Equinix)',
        sortOrder: 2,
      },
    ],
  });

  // 3c. Board Members
  await prisma.brokerBoardMember.createMany({
    data: [
      {
        brokerId: pepperstone.id,
        name: 'Tamas Szabo',
        designation: 'Group Chief Executive Officer',
        experience: '25+ years in global capital markets and fintech leadership',
        description: 'Leads Pepperstone global strategic direction and international expansion.',
        sortOrder: 0,
      },
      {
        brokerId: pepperstone.id,
        name: 'Gordon Ketelbey',
        designation: 'Non-Executive Director & Co-Founder',
        experience: '20+ years in financial derivatives & online brokerage',
        description: 'Co-founded Pepperstone with a mission to bring institutional liquidity to retail traders.',
        sortOrder: 1,
      },
      {
        brokerId: pepperstone.id,
        name: 'Fiona Simpson',
        designation: 'Chief Financial Officer',
        experience: '18 years senior financial management and tier-1 banking',
        description: 'Oversees financial governance, capital adequacy, and regulatory treasury.',
        sortOrder: 2,
      },
    ],
  });

  // 3d. Account Groups
  const razorGroup = await prisma.brokerAccountGroup.create({
    data: {
      brokerId: pepperstone.id,
      name: 'Razor Account',
      demoAvailable: true,
      currency: 'USD',
      currencyCode: 'USD',
      spreadTypesLabel: 'Raw Floating Spreads',
      spreadFrom: new Prisma.Decimal('0.0'),
      minDeposit: new Prisma.Decimal('0.00'),
      depositBonusPctUpTo: new Prisma.Decimal('0.00'),
      depositBonusCode: 'BONUS_0',
      depositBonusNum: 0,
      leverageUpTo: '1:500',
      leverageCode: '1:500',
      leverageNum: 500,
      minTradeVolume: new Prisma.Decimal('0.01'),
      hasCommissionPerLot: true,
      feesPerLot: new Prisma.Decimal('3.50'),
      commissionStructureUrl: 'https://pepperstone.com/en/commissions',
      spreadType: SpreadType.FLOATING,
      orderTypes: ['Market', 'Limit', 'Stop', 'Stop-Loss', 'Take-Profit', 'Trailing Stop'],
      swapFree: false,
      orderExecution: OrderExecution.INSTANT,
      gtcMode: GtcMode.AVAILABLE,
      eaAllowed: true,
      hedgingAllowed: true,
      nettingAllowed: false,
      scalpingAllowed: true,
      hasSwapCharges: true,
      slippage: true,
      slippagePoints: '0.1 - 0.3 pips under standard liquidity',
      testLogin: '8839210',
      testPasswordEnc: encryptBrokerCredential('TestRazor@2025!'),
      testServer: 'Pepperstone-Demo01',
      sortOrder: 0,
    },
  });

  await prisma.brokerAccountGroup.create({
    data: {
      brokerId: pepperstone.id,
      name: 'Standard Account',
      demoAvailable: true,
      currency: 'USD',
      currencyCode: 'USD',
      spreadTypesLabel: 'All-inclusive Spreads',
      spreadFrom: new Prisma.Decimal('0.6'),
      minDeposit: new Prisma.Decimal('0.00'),
      depositBonusPctUpTo: new Prisma.Decimal('0.00'),
      depositBonusCode: 'BONUS_0',
      depositBonusNum: 0,
      leverageUpTo: '1:500',
      leverageCode: '1:500',
      leverageNum: 500,
      minTradeVolume: new Prisma.Decimal('0.01'),
      hasCommissionPerLot: false,
      feesPerLot: new Prisma.Decimal('0.00'),
      spreadType: SpreadType.FLOATING,
      orderTypes: ['Market', 'Limit', 'Stop', 'Stop-Loss', 'Take-Profit'],
      swapFree: false,
      orderExecution: OrderExecution.INSTANT,
      gtcMode: GtcMode.AVAILABLE,
      eaAllowed: true,
      hedgingAllowed: true,
      scalpingAllowed: true,
      hasSwapCharges: true,
      testLogin: '7721840',
      testPasswordEnc: encryptBrokerCredential('TestStandard@2025!'),
      testServer: 'Pepperstone-Demo01',
      sortOrder: 1,
    },
  });

  // 3e. IB Plans
  await prisma.brokerIbPlan.createMany({
    data: [
      {
        brokerId: pepperstone.id,
        accountGroupName: 'Razor Account',
        settlement: ['DAILY', 'MONTHLY'],
        rebatePerLot: new Prisma.Decimal('1.50'),
        levelsUpTo: 3,
        customizable: true,
        sortOrder: 0,
      },
      {
        brokerId: pepperstone.id,
        accountGroupName: 'Standard Account',
        settlement: ['DAILY', 'MONTHLY'],
        rebatePerLot: new Prisma.Decimal('3.00'),
        levelsUpTo: 3,
        customizable: true,
        sortOrder: 1,
      },
    ],
  });

  // 3f. Deposit & Withdrawal Methods
  await prisma.brokerDepositMethod.createMany({
    data: [
      {
        brokerId: pepperstone.id,
        method: 'Visa / Mastercard',
        charges: 'Zero / 0%',
        exchangeRate: 'Interbank Live',
        timeTaken: 'Instant',
        extraFacilities: 'Apple Pay & Google Pay supported',
        sortOrder: 0,
      },
      {
        brokerId: pepperstone.id,
        method: 'Bank Wire Transfer',
        charges: 'Zero broker fee',
        exchangeRate: 'Central Bank fixing',
        timeTaken: '1-3 Business Days',
        extraFacilities: 'SEPA & SWIFT supported',
        sortOrder: 1,
      },
      {
        brokerId: pepperstone.id,
        method: 'Neteller / Skrill',
        charges: 'Zero / 0%',
        exchangeRate: 'Live market rate',
        timeTaken: 'Instant',
        extraFacilities: 'VIP fast-track available',
        sortOrder: 2,
      },
      {
        brokerId: pepperstone.id,
        method: 'USDT (Tether)',
        charges: 'Network miner fee only',
        exchangeRate: '1.00 USD peg',
        timeTaken: '10-30 Minutes',
        extraFacilities: 'ERC-20 & TRC-20 supported',
        sortOrder: 3,
      },
    ],
  });

  await prisma.brokerWithdrawalMethod.createMany({
    data: [
      {
        brokerId: pepperstone.id,
        method: 'Visa / Mastercard',
        charges: 'Free / $0',
        exchangeRate: 'Interbank Live',
        timeTaken: '1-3 Business Days',
        extraFacilities: 'Same-day card refund priority',
        delayCompensation: 'Guaranteed 24-hour dispatch or $50 trading credit',
        sortOrder: 0,
      },
      {
        brokerId: pepperstone.id,
        method: 'Bank Wire Transfer',
        charges: 'Free domestic, $20 international',
        exchangeRate: 'Central Bank rate',
        timeTaken: '2-5 Business Days',
        extraFacilities: 'Direct SWIFT tracking MT103',
        delayCompensation: 'Same-day SWIFT broadcast guarantee',
        sortOrder: 1,
      },
      {
        brokerId: pepperstone.id,
        method: 'Neteller / Skrill',
        charges: 'Free / $0',
        exchangeRate: 'Live market rate',
        timeTaken: 'Instant to 2 Hours',
        extraFacilities: 'Priority e-wallet processing',
        delayCompensation: null,
        sortOrder: 2,
      },
    ],
  });

  // 3g. Tradable Symbols (linked to Razor group)
  await prisma.brokerSymbolSpec.createMany({
    data: [
      {
        brokerId: pepperstone.id,
        accountGroupId: razorGroup.id,
        symbol: 'EURUSD',
        digits: 5,
        contractSize: '100000',
        stopLevel: '0',
        stopOutPct: '20%',
        commission: '$3.50/lot',
        spreadType: 'FLOATING',
        spreadFrom: '0.0 pips',
        minVolume: new Prisma.Decimal('0.01'),
        maxVolume: new Prisma.Decimal('100.00'),
        swapLong: '-5.2',
        swapShort: '2.1',
        sortOrder: 0,
      },
      {
        brokerId: pepperstone.id,
        accountGroupId: razorGroup.id,
        symbol: 'GBPUSD',
        digits: 5,
        contractSize: '100000',
        stopLevel: '0',
        stopOutPct: '20%',
        commission: '$3.50/lot',
        spreadType: 'FLOATING',
        spreadFrom: '0.2 pips',
        minVolume: new Prisma.Decimal('0.01'),
        maxVolume: new Prisma.Decimal('100.00'),
        swapLong: '-4.8',
        swapShort: '1.8',
        sortOrder: 1,
      },
      {
        brokerId: pepperstone.id,
        accountGroupId: razorGroup.id,
        symbol: 'USDJPY',
        digits: 3,
        contractSize: '100000',
        stopLevel: '0',
        stopOutPct: '20%',
        commission: '$3.50/lot',
        spreadType: 'FLOATING',
        spreadFrom: '0.1 pips',
        minVolume: new Prisma.Decimal('0.01'),
        maxVolume: new Prisma.Decimal('100.00'),
        swapLong: '8.4',
        swapShort: '-14.2',
        sortOrder: 2,
      },
      {
        brokerId: pepperstone.id,
        accountGroupId: razorGroup.id,
        symbol: 'XAUUSD',
        digits: 2,
        contractSize: '100 oz',
        stopLevel: '0',
        stopOutPct: '20%',
        commission: '$3.50/lot',
        spreadType: 'FLOATING',
        spreadFrom: '0.08 points',
        minVolume: new Prisma.Decimal('0.01'),
        maxVolume: new Prisma.Decimal('50.00'),
        swapLong: '-18.5',
        swapShort: '9.2',
        sortOrder: 3,
      },
      {
        brokerId: pepperstone.id,
        accountGroupId: razorGroup.id,
        symbol: 'BTCUSD',
        digits: 2,
        contractSize: '1 BTC',
        stopLevel: '0',
        stopOutPct: '20%',
        commission: '$0',
        spreadType: 'FLOATING',
        spreadFrom: '15.00 points',
        minVolume: new Prisma.Decimal('0.01'),
        maxVolume: new Prisma.Decimal('10.00'),
        swapLong: '-22.0',
        swapShort: '-15.0',
        sortOrder: 4,
      },
    ],
  });

  // 3h. Funding Years & Financial Turnover (Confidential)
  await prisma.brokerFundingYear.createMany({
    data: [
      {
        brokerId: pepperstone.id,
        year: 2022,
        netDepositUsd: new Prisma.Decimal('154000000.00'),
        netWithdrawUsd: new Prisma.Decimal('98000000.00'),
        netLots: new Prisma.Decimal('12500000.00'),
        sortOrder: 0,
      },
      {
        brokerId: pepperstone.id,
        year: 2023,
        netDepositUsd: new Prisma.Decimal('210000000.00'),
        netWithdrawUsd: new Prisma.Decimal('135000000.00'),
        netLots: new Prisma.Decimal('18200000.00'),
        sortOrder: 1,
      },
      {
        brokerId: pepperstone.id,
        year: 2024,
        netDepositUsd: new Prisma.Decimal('285000000.00'),
        netWithdrawUsd: new Prisma.Decimal('178000000.00'),
        netLots: new Prisma.Decimal('24600000.00'),
        sortOrder: 2,
      },
    ],
  });

  // 3i. Client Activity
  await prisma.brokerClientActivity.create({
    data: {
      brokerId: pepperstone.id,
      avgNewClientDeposit: new Prisma.Decimal('2500.00'),
      avgExistingClientDeposit: new Prisma.Decimal('14500.00'),
      avgNewClientWithdrawal: new Prisma.Decimal('1800.00'),
      avgExistingClientWithdrawal: new Prisma.Decimal('9200.00'),
    },
  });

  // 3j. Business Areas
  await prisma.brokerBusinessArea.createMany({
    data: [
      {
        brokerId: pepperstone.id,
        countryOrRegion: 'Europe & United Kingdom',
        clientsNote: 'Over 85,000 active retail and professional clients protected under FCA & CySEC investor compensation regimes.',
        sortOrder: 0,
      },
      {
        brokerId: pepperstone.id,
        countryOrRegion: 'Asia-Pacific & Australia',
        clientsNote: 'Headquartered in Melbourne with regional support hubs in Sydney and Singapore serving retail & institutional traders.',
        sortOrder: 1,
      },
      {
        brokerId: pepperstone.id,
        countryOrRegion: 'Middle East & Africa',
        clientsNote: 'DIFC Dubai entity licensed by DFSA, plus CMA-authorized retail operations across East Africa.',
        sortOrder: 2,
      },
    ],
  });

  // 3k. Awards
  await prisma.brokerAward.createMany({
    data: [
      {
        brokerId: pepperstone.id,
        year: 2024,
        awardFor: 'Best Overall Global Forex Broker',
        expo: 'Ultimate Fintech Awards',
        expoLocation: 'London, United Kingdom',
        expoDate: new Date('2024-06-18'),
        sortOrder: 0,
      },
      {
        brokerId: pepperstone.id,
        year: 2023,
        awardFor: 'Best ECN Broker & Lowest Spreads',
        expo: 'Finance Magnates London Summit',
        expoLocation: 'London, United Kingdom',
        expoDate: new Date('2023-11-21'),
        sortOrder: 1,
      },
      {
        brokerId: pepperstone.id,
        year: 2022,
        awardFor: 'Best Customer Service Provider',
        expo: 'Investment Trends Report',
        expoLocation: 'Sydney, Australia',
        expoDate: new Date('2022-10-15'),
        sortOrder: 2,
      },
    ],
  });

  // 3l. Documents
  await prisma.brokerDocument.createMany({
    data: [
      {
        brokerId: pepperstone.id,
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
        fileName: 'ASIC_AFSL_414530_License_Certificate.pdf',
        fileType: 'application/pdf',
        docType: BrokerDocType.REGULATORY_LICENSE,
        isPrivate: false,
        verifiedByAdmin: true,
      },
      {
        brokerId: pepperstone.id,
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
        fileName: 'FCA_Firm_Reference_684312_Certificate.pdf',
        fileType: 'application/pdf',
        docType: BrokerDocType.REGULATORY_LICENSE,
        isPrivate: false,
        verifiedByAdmin: true,
      },
      {
        brokerId: pepperstone.id,
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
        fileName: 'PwC_Audited_Client_Fund_Segregation_2024.pdf',
        fileType: 'application/pdf',
        docType: BrokerDocType.POLICY_CLIENT,
        isPrivate: false,
        verifiedByAdmin: true,
      },
      {
        brokerId: pepperstone.id,
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
        fileName: 'AML_CTF_Corporate_Governance_Policy.pdf',
        fileType: 'application/pdf',
        docType: BrokerDocType.POLICY_AML,
        isPrivate: false,
        verifiedByAdmin: true,
      },
      {
        brokerId: pepperstone.id,
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
        fileName: 'Order_Execution_Policy_RTS27_RTS28.pdf',
        fileType: 'application/pdf',
        docType: BrokerDocType.POLICY_OTHER,
        isPrivate: false,
        verifiedByAdmin: true,
      },
    ],
  });

  await recomputeBrokerSummary(pepperstone.id);
  console.log('✅ Demo Broker 1 seeded with 100% complete dossier: Pepperstone Global Markets');

  // 4. Seed Demo Broker 2: IC Markets Global
  const icMarketsUserEmail = 'broker@icmarkets-demo.com';
  const icMarketsUser = await prisma.user.upsert({
    where: { email: icMarketsUserEmail },
    update: {},
    create: {
      name: 'IC Markets Institutional Rep',
      email: icMarketsUserEmail,
      password: await bcrypt.hash('Broker@1234!', 12),
      role: Role.BROKER,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const icMarketsData: Prisma.BrokerUncheckedCreateInput = {
    userId: icMarketsUser.id,
    companyName: 'IC Markets Global',
    registeredName: 'Raw Trading Ltd',
    businessType: BrokerBusinessType.RETAIL,
    slug: 'ic-markets-global',
    website: 'https://icmarkets.com',
    description:
      "IC Markets is one of the world's premier True ECN Forex and CFD providers, offering raw spreads from 0.0 pips, institutional liquidity from 25+ providers, and ultra-fast optical fiber connectivity to the NY4 and LD4 financial exchanges.",
    platformDescription:
      'Engineered specifically for day traders, scalpers, and algorithmic EA strategies with direct fiber links to Equinix NY4 and LD4 financial data centers.',
    yearFounded: 2007,
    headquarters: 'Sydney, Australia',
    address: 'Level 6, 309 Kent Street',
    city: 'Sydney',
    state: 'NSW',
    postalCode: '2000',
    country: 'Australia',
    phone: '+61 2 8014 4280',
    email: 'support@icmarkets.com',
    officeContactNumber: '+61 2 8014 4280',
    officeContactEmail: 'corporate@icmarkets.com',
    mtRegisteredCountryRegion: 'Sydney, Australia',
    isRegulated: true,
    totalTradableSymbols: 2250,
    accountCurrencies: ['USD', 'AUD', 'EUR', 'GBP', 'SGD', 'NZD', 'JPY', 'CHF'],
    negativeBalanceProtection: true,
    availablePlatforms: ['MetaTrader 4', 'MetaTrader 5', 'cTrader'],
    platformLinks: {
      mt4: 'https://icmarkets.com/en/trading-platforms/mt4',
      mt5: 'https://icmarkets.com/en/trading-platforms/mt5',
      ctrader: 'https://icmarkets.com/en/trading-platforms/ctrader',
    },
    deviceSupport: ['Windows', 'macOS', 'iOS', 'Android', 'Web'],
    countries: ['Australia', 'Cyprus', 'Seychelles', 'Bahamas'],
    countryRestrictions: ['United States', 'Canada', 'Iran', 'North Korea'],
    supportPhone: '+61 2 8014 4280',
    supportWhatsapp: '+61 400 987 654',
    supportEmail: 'support@icmarkets.com',
    supportAvailability: '24/7 Dedicated Client Support',
    languagesSupported: ['English', 'Chinese', 'Spanish', 'Portuguese', 'Arabic', 'Russian', 'Italian'],
    clientLossPercentage: new Prisma.Decimal('74.00'),
    fundsSecurity:
      'Client money is held in segregated client trust accounts at Tier-1 Australian banks (National Australia Bank and Westpac Banking Corporation). ASIC regulatory oversight with strict net capital compliance.',
    liquidityProvider: 'BNP Paribas, Goldman Sachs, Morgan Stanley, Citadel, Virtu Financial',
    personalBookSize: '$40,000,000+ Liquidity Buffer',
    prosList: [
      'True ECN trading environment with 0.0 pip spreads on major currency pairs',
      'High leverage up to 1:500 available for non-EU/AU eligible entities',
      'Massive liquidity aggregated from over 25 Tier-1 tier banks and dark pools',
      'Diverse selection of advanced platforms: MT4, MT5, and cTrader',
    ],
    consList: [
      'Minimum deposit of $200 required to activate live trading account',
      'Proprietary mobile application not available, relies on MetaQuotes & Spotware',
    ],
    promoVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    socialLinks: {
      twitter: 'https://twitter.com/ICMarkets',
      linkedin: 'https://linkedin.com/company/ic-markets',
      facebook: 'https://facebook.com/ICMarkets',
    },
    regulation: ['ASIC', 'CySEC', 'FSA'],
    tradingPlatforms: ['MetaTrader 4', 'MetaTrader 5', 'cTrader'],
    accountTypes: ['Raw Spread', 'Standard Account'],
    minDeposit: 200,
    maxLeverage: '1:500',
    spreadsFrom: 'From 0.0 pips',
    commissions: '$3.50 per lot',
    executionType: 'Market Execution',
    instruments: ['Forex (61 pairs)', 'Commodities', 'Indices', 'Bonds', 'Cryptos', 'Futures'],
    depositMethods: ['Visa / Mastercard', 'Bank Wire', 'PayPal', 'Neteller / Skrill'],
    withdrawMethods: ['Visa / Mastercard', 'Bank Wire', 'PayPal', 'Neteller / Skrill'],
    avgRating: 4.7,
    totalReviews: 35,
    totalLeads: 110,
    status: ApprovalStatus.APPROVED,
    onboardingStatus: BrokerOnboardingStatus.VERIFIED,
    isFeatured: true,
    isPremium: false,
    completenessPct: 100,
    submittedAt: new Date('2025-01-12T10:00:00Z'),
    reviewedAt: new Date('2025-01-13T11:00:00Z'),
    reviewNote: 'ASIC AFSL 335692 verified. Bank trust letters validated.',
  };

  const icMarkets = await prisma.broker.upsert({
    where: { userId: icMarketsUser.id },
    update: icMarketsData,
    create: icMarketsData,
  });

  // Re-seed IC Markets child tables cleanly
  await prisma.brokerLicense.deleteMany({ where: { brokerId: icMarkets.id } });
  await prisma.brokerServer.deleteMany({ where: { brokerId: icMarkets.id } });
  await prisma.brokerBoardMember.deleteMany({ where: { brokerId: icMarkets.id } });
  await prisma.brokerSymbolSpec.deleteMany({ where: { brokerId: icMarkets.id } });
  await prisma.brokerAccountGroup.deleteMany({ where: { brokerId: icMarkets.id } });
  await prisma.brokerIbPlan.deleteMany({ where: { brokerId: icMarkets.id } });
  await prisma.brokerDepositMethod.deleteMany({ where: { brokerId: icMarkets.id } });
  await prisma.brokerWithdrawalMethod.deleteMany({ where: { brokerId: icMarkets.id } });
  await prisma.brokerFundingYear.deleteMany({ where: { brokerId: icMarkets.id } });
  await prisma.brokerClientActivity.deleteMany({ where: { brokerId: icMarkets.id } });
  await prisma.brokerBusinessArea.deleteMany({ where: { brokerId: icMarkets.id } });
  await prisma.brokerAward.deleteMany({ where: { brokerId: icMarkets.id } });
  await prisma.brokerDocument.deleteMany({ where: { brokerId: icMarkets.id } });

  // 4a. Licenses
  await prisma.brokerLicense.createMany({
    data: [
      {
        brokerId: icMarkets.id,
        regulatoryBody: 'ASIC',
        licenseNumber: '335692',
        licenseStatus: 'Active',
        companyAddress: 'Level 6, 309 Kent Street, Sydney NSW 2000, Australia',
        proofLink: 'https://connectonline.asic.gov.au',
        verifiedByAdmin: true,
        verifiedAt: new Date(),
        sortOrder: 0,
      },
      {
        brokerId: icMarkets.id,
        regulatoryBody: 'CySEC',
        licenseNumber: '362/18',
        licenseStatus: 'Active',
        companyAddress: 'Omonoias 141, The Maritime Centre, Block B, 1st Floor, 3045 Limassol, Cyprus',
        proofLink: 'https://cysec.gov.cy',
        verifiedByAdmin: true,
        verifiedAt: new Date(),
        sortOrder: 1,
      },
      {
        brokerId: icMarkets.id,
        regulatoryBody: 'FSA',
        licenseNumber: 'SD018',
        licenseStatus: 'Active',
        companyAddress: 'Eden Plaza, Office 209, Eden Island, Seychelles',
        proofLink: 'https://fsaseychelles.sc',
        verifiedByAdmin: true,
        verifiedAt: new Date(),
        sortOrder: 2,
      },
    ],
  });

  // 4b. Servers
  await prisma.brokerServer.createMany({
    data: [
      {
        brokerId: icMarkets.id,
        name: 'ICMarketsSC-Live01',
        ip: '198.51.100.30',
        location: 'LD4 London (Equinix)',
        sortOrder: 0,
      },
      {
        brokerId: icMarkets.id,
        name: 'ICMarketsSC-Live02',
        ip: '198.51.100.32',
        location: 'NY4 New York (Equinix)',
        sortOrder: 1,
      },
      {
        brokerId: icMarkets.id,
        name: 'ICMarketsSC-Demo01',
        ip: '198.51.100.40',
        location: 'LD4 London (Equinix)',
        sortOrder: 2,
      },
    ],
  });

  // 4c. Board Members
  await prisma.brokerBoardMember.createMany({
    data: [
      {
        brokerId: icMarkets.id,
        name: 'Andrew Budzinski',
        designation: 'Executive Director & Founder',
        experience: '22+ years in financial services, FX trading infrastructure, and institutional brokerage',
        description: 'Founded IC Markets in 2007 with the vision of closing the gap between retail and institutional traders.',
        sortOrder: 0,
      },
      {
        brokerId: icMarkets.id,
        name: 'Angus Walker',
        designation: 'Chief Risk Officer',
        experience: '17 years risk governance, derivatives settlement, and regulatory reporting',
        description: 'Supervises risk policies, capital adequacy ratios, and market abuse surveillance.',
        sortOrder: 1,
      },
    ],
  });

  // 4d. Account Groups
  const icRawGroup = await prisma.brokerAccountGroup.create({
    data: {
      brokerId: icMarkets.id,
      name: 'Raw Spread',
      demoAvailable: true,
      currency: 'USD',
      spreadTypesLabel: 'Raw ECN Spreads',
      spreadFrom: new Prisma.Decimal('0.0'),
      minDeposit: new Prisma.Decimal('200.00'),
      depositBonusPctUpTo: new Prisma.Decimal('0.00'),
      leverageUpTo: '1:500',
      leverageNum: 500,
      minTradeVolume: new Prisma.Decimal('0.01'),
      hasCommissionPerLot: true,
      feesPerLot: new Prisma.Decimal('3.50'),
      commissionStructureUrl: 'https://icmarkets.com/en/pricing',
      spreadType: SpreadType.FLOATING,
      orderTypes: ['Market', 'Limit', 'Stop', 'Stop-Loss', 'Take-Profit'],
      swapFree: false,
      orderExecution: OrderExecution.INSTANT,
      gtcMode: GtcMode.AVAILABLE,
      eaAllowed: true,
      hedgingAllowed: true,
      nettingAllowed: false,
      scalpingAllowed: true,
      hasSwapCharges: true,
      slippage: true,
      slippagePoints: '0.1 - 0.2 pips',
      testLogin: '9928371',
      testPasswordEnc: encryptBrokerCredential('TestRaw@2025!'),
      testServer: 'ICMarketsSC-Demo01',
      sortOrder: 0,
    },
  });

  await prisma.brokerAccountGroup.create({
    data: {
      brokerId: icMarkets.id,
      name: 'Standard Account',
      demoAvailable: true,
      currency: 'USD',
      spreadTypesLabel: 'Standard Floating Spreads',
      spreadFrom: new Prisma.Decimal('0.8'),
      minDeposit: new Prisma.Decimal('200.00'),
      depositBonusPctUpTo: new Prisma.Decimal('0.00'),
      leverageUpTo: '1:500',
      leverageNum: 500,
      minTradeVolume: new Prisma.Decimal('0.01'),
      hasCommissionPerLot: false,
      feesPerLot: new Prisma.Decimal('0.00'),
      spreadType: SpreadType.FLOATING,
      orderTypes: ['Market', 'Limit', 'Stop', 'Stop-Loss', 'Take-Profit'],
      swapFree: false,
      orderExecution: OrderExecution.INSTANT,
      gtcMode: GtcMode.AVAILABLE,
      eaAllowed: true,
      hedgingAllowed: true,
      scalpingAllowed: true,
      hasSwapCharges: true,
      testLogin: '9928372',
      testPasswordEnc: encryptBrokerCredential('TestStd@2025!'),
      testServer: 'ICMarketsSC-Demo01',
      sortOrder: 1,
    },
  });

  // 4e. IB Plans
  await prisma.brokerIbPlan.createMany({
    data: [
      {
        brokerId: icMarkets.id,
        accountGroupName: 'Raw Spread',
        settlement: ['DAILY'],
        rebatePerLot: new Prisma.Decimal('1.50'),
        levelsUpTo: 2,
        customizable: true,
        sortOrder: 0,
      },
      {
        brokerId: icMarkets.id,
        accountGroupName: 'Standard Account',
        settlement: ['DAILY'],
        rebatePerLot: new Prisma.Decimal('3.00'),
        levelsUpTo: 2,
        customizable: true,
        sortOrder: 1,
      },
    ],
  });

  // 4f. Deposit & Withdrawal Methods
  await prisma.brokerDepositMethod.createMany({
    data: [
      {
        brokerId: icMarkets.id,
        method: 'Visa / Mastercard',
        charges: 'Free / 0%',
        exchangeRate: 'Live market rate',
        timeTaken: 'Instant',
        extraFacilities: 'Instant credit card verification',
        sortOrder: 0,
      },
      {
        brokerId: icMarkets.id,
        method: 'Bank Wire',
        charges: 'Free broker side',
        exchangeRate: 'Central bank fixing',
        timeTaken: '2-3 Business Days',
        extraFacilities: 'Multi-currency international wire',
        sortOrder: 1,
      },
      {
        brokerId: icMarkets.id,
        method: 'PayPal',
        charges: 'Free / 0%',
        exchangeRate: 'Live market rate',
        timeTaken: 'Instant',
        extraFacilities: 'One-click wallet authorization',
        sortOrder: 2,
      },
      {
        brokerId: icMarkets.id,
        method: 'Neteller / Skrill',
        charges: 'Free / 0%',
        exchangeRate: 'Live market rate',
        timeTaken: 'Instant',
        extraFacilities: 'Fast-track e-wallet funding',
        sortOrder: 3,
      },
    ],
  });

  await prisma.brokerWithdrawalMethod.createMany({
    data: [
      {
        brokerId: icMarkets.id,
        method: 'Visa / Mastercard',
        charges: 'Free / 0%',
        exchangeRate: 'Live market rate',
        timeTaken: '1-3 Business Days',
        extraFacilities: 'Original funding source return',
        delayCompensation: null,
        sortOrder: 0,
      },
      {
        brokerId: icMarkets.id,
        method: 'Bank Wire',
        charges: 'AUD 20 for international wires',
        exchangeRate: 'Central bank fixing',
        timeTaken: '2-4 Business Days',
        extraFacilities: 'Swift confirmation MT103',
        delayCompensation: null,
        sortOrder: 1,
      },
      {
        brokerId: icMarkets.id,
        method: 'PayPal',
        charges: 'Free / 0%',
        exchangeRate: 'Live market rate',
        timeTaken: 'Instant to 24 Hours',
        extraFacilities: 'Direct PayPal balance transfer',
        delayCompensation: null,
        sortOrder: 2,
      },
    ],
  });

  // 4g. Tradable Symbols
  await prisma.brokerSymbolSpec.createMany({
    data: [
      {
        brokerId: icMarkets.id,
        accountGroupId: icRawGroup.id,
        symbol: 'EURUSD',
        digits: 5,
        contractSize: '100000',
        stopLevel: '0',
        stopOutPct: '50%',
        commission: '$3.50/lot',
        spreadType: 'FLOATING',
        spreadFrom: '0.0 pips',
        minVolume: new Prisma.Decimal('0.01'),
        maxVolume: new Prisma.Decimal('100.00'),
        swapLong: '-5.1',
        swapShort: '2.0',
        sortOrder: 0,
      },
      {
        brokerId: icMarkets.id,
        accountGroupId: icRawGroup.id,
        symbol: 'GBPUSD',
        digits: 5,
        contractSize: '100000',
        stopLevel: '0',
        stopOutPct: '50%',
        commission: '$3.50/lot',
        spreadType: 'FLOATING',
        spreadFrom: '0.1 pips',
        minVolume: new Prisma.Decimal('0.01'),
        maxVolume: new Prisma.Decimal('100.00'),
        swapLong: '-4.6',
        swapShort: '1.7',
        sortOrder: 1,
      },
      {
        brokerId: icMarkets.id,
        accountGroupId: icRawGroup.id,
        symbol: 'USDJPY',
        digits: 3,
        contractSize: '100000',
        stopLevel: '0',
        stopOutPct: '50%',
        commission: '$3.50/lot',
        spreadType: 'FLOATING',
        spreadFrom: '0.1 pips',
        minVolume: new Prisma.Decimal('0.01'),
        maxVolume: new Prisma.Decimal('100.00'),
        swapLong: '8.2',
        swapShort: '-14.0',
        sortOrder: 2,
      },
      {
        brokerId: icMarkets.id,
        accountGroupId: icRawGroup.id,
        symbol: 'XAUUSD',
        digits: 2,
        contractSize: '100 oz',
        stopLevel: '0',
        stopOutPct: '50%',
        commission: '$3.50/lot',
        spreadType: 'FLOATING',
        spreadFrom: '0.09 points',
        minVolume: new Prisma.Decimal('0.01'),
        maxVolume: new Prisma.Decimal('50.00'),
        swapLong: '-18.1',
        swapShort: '8.9',
        sortOrder: 3,
      },
    ],
  });

  // 4h. Funding Years
  await prisma.brokerFundingYear.createMany({
    data: [
      {
        brokerId: icMarkets.id,
        year: 2022,
        netDepositUsd: new Prisma.Decimal('180000000.00'),
        netWithdrawUsd: new Prisma.Decimal('115000000.00'),
        netLots: new Prisma.Decimal('15000000.00'),
        sortOrder: 0,
      },
      {
        brokerId: icMarkets.id,
        year: 2023,
        netDepositUsd: new Prisma.Decimal('240000000.00'),
        netWithdrawUsd: new Prisma.Decimal('150000000.00'),
        netLots: new Prisma.Decimal('21000000.00'),
        sortOrder: 1,
      },
      {
        brokerId: icMarkets.id,
        year: 2024,
        netDepositUsd: new Prisma.Decimal('310000000.00'),
        netWithdrawUsd: new Prisma.Decimal('195000000.00'),
        netLots: new Prisma.Decimal('29000000.00'),
        sortOrder: 2,
      },
    ],
  });

  // 4i. Client Activity
  await prisma.brokerClientActivity.create({
    data: {
      brokerId: icMarkets.id,
      avgNewClientDeposit: new Prisma.Decimal('1800.00'),
      avgExistingClientDeposit: new Prisma.Decimal('9500.00'),
      avgNewClientWithdrawal: new Prisma.Decimal('1200.00'),
      avgExistingClientWithdrawal: new Prisma.Decimal('6800.00'),
    },
  });

  // 4j. Business Areas
  await prisma.brokerBusinessArea.createMany({
    data: [
      {
        brokerId: icMarkets.id,
        countryOrRegion: 'Australia & New Zealand',
        clientsNote: 'Regulated under ASIC AFSL 335692 with local tier-1 bank custody.',
        sortOrder: 0,
      },
      {
        brokerId: icMarkets.id,
        countryOrRegion: 'European Union',
        clientsNote: 'CySEC regulated entity under license 362/18.',
        sortOrder: 1,
      },
    ],
  });

  // 4k. Awards
  await prisma.brokerAward.createMany({
    data: [
      {
        brokerId: icMarkets.id,
        year: 2023,
        awardFor: 'Best True ECN Forex Broker',
        expo: 'Global Forex Awards',
        expoLocation: 'Limassol, Cyprus',
        expoDate: new Date('2023-09-20'),
        sortOrder: 0,
      },
      {
        brokerId: icMarkets.id,
        year: 2022,
        awardFor: 'Best Execution Broker',
        expo: 'Finance Magnates Summit',
        expoLocation: 'London, UK',
        expoDate: new Date('2022-11-20'),
        sortOrder: 1,
      },
    ],
  });

  // 4l. Documents
  await prisma.brokerDocument.createMany({
    data: [
      {
        brokerId: icMarkets.id,
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
        fileName: 'ASIC_AFSL_335692_Certificate.pdf',
        fileType: 'application/pdf',
        docType: BrokerDocType.REGULATORY_LICENSE,
        isPrivate: false,
        verifiedByAdmin: true,
      },
      {
        brokerId: icMarkets.id,
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
        fileName: 'CySEC_CIF_362_18_Certificate.pdf',
        fileType: 'application/pdf',
        docType: BrokerDocType.REGULATORY_LICENSE,
        isPrivate: false,
        verifiedByAdmin: true,
      },
      {
        brokerId: icMarkets.id,
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
        fileName: 'Client_Money_Handling_Policy_2024.pdf',
        fileType: 'application/pdf',
        docType: BrokerDocType.POLICY_AML,
        isPrivate: false,
        verifiedByAdmin: true,
      },
    ],
  });

  await recomputeBrokerSummary(icMarkets.id);
  console.log('✅ Demo Broker 2 seeded with 100% complete dossier: IC Markets Global');

  // 5. Backfill Existing Approved Brokers
  console.log('🔄 Backfilling existing approved brokers...');
  const existingBrokers = await prisma.broker.findMany({
    where: {
      status: ApprovalStatus.APPROVED,
      NOT: {
        id: { in: [pepperstone.id, icMarkets.id] },
      },
    },
    include: {
      accountGroups: true,
      licenses: true,
      servers: true,
      depositMethodItems: true,
      withdrawalMethodItems: true,
    },
  });

  for (const b of existingBrokers) {
    // If broker has no account group, synthesize a standard group from their top-level fields
    if (b.accountGroups.length === 0) {
      await prisma.brokerAccountGroup.create({
        data: {
          brokerId: b.id,
          name: b.accountTypes[0] || 'Standard Account',
          demoAvailable: true,
          currency: 'USD',
          spreadTypesLabel: 'Standard Spreads',
          spreadFrom: new Prisma.Decimal(b.spreadsFrom?.match(/\d+(\.\d+)?/)?.[0] || '1.0'),
          minDeposit: new Prisma.Decimal(b.minDeposit || 100),
          leverageUpTo: b.maxLeverage || '1:500',
          leverageNum: 500,
          minTradeVolume: new Prisma.Decimal('0.01'),
          hasCommissionPerLot: false,
          feesPerLot: new Prisma.Decimal('0.00'),
          spreadType: SpreadType.FLOATING,
          orderTypes: ['Market', 'Limit', 'Stop'],
          orderExecution: OrderExecution.INSTANT,
          gtcMode: GtcMode.AVAILABLE,
          sortOrder: 0,
        },
      });
    }

    // If broker has no licenses and has regulations listed, add a license entry
    if (b.licenses.length === 0 && b.regulation && b.regulation.length > 0) {
      for (let i = 0; i < b.regulation.length; i++) {
        const reg = b.regulation[i];
        await prisma.brokerLicense.create({
          data: {
            brokerId: b.id,
            regulatoryBody: reg,
            licenseNumber: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
            licenseStatus: 'Active',
            companyAddress: b.headquarters || b.address || 'Corporate Headquarters',
            verifiedByAdmin: true,
            verifiedAt: new Date(),
            sortOrder: i,
          },
        });
      }
    }

    // If broker has no servers, add a default live server
    if (b.servers.length === 0) {
      await prisma.brokerServer.create({
        data: {
          brokerId: b.id,
          name: `${b.companyName.replace(/\s+/g, '')}-Live`,
          location: 'Equinix LD4 London',
          sortOrder: 0,
        },
      });
    }

    // If broker has deposit methods as string array, populate depositMethodItems
    if (b.depositMethodItems.length === 0 && b.depositMethods && b.depositMethods.length > 0) {
      for (let i = 0; i < b.depositMethods.length; i++) {
        await prisma.brokerDepositMethod.create({
          data: {
            brokerId: b.id,
            method: b.depositMethods[i],
            charges: 'Free / 0%',
            timeTaken: 'Instant',
            sortOrder: i,
          },
        });
      }
    }

    // If broker has withdrawal methods as string array, populate withdrawalMethodItems
    if (b.withdrawalMethodItems.length === 0 && b.withdrawMethods && b.withdrawMethods.length > 0) {
      for (let i = 0; i < b.withdrawMethods.length; i++) {
        await prisma.brokerWithdrawalMethod.create({
          data: {
            brokerId: b.id,
            method: b.withdrawMethods[i],
            charges: 'Free / $0',
            timeTaken: '1-3 Business Days',
            sortOrder: i,
          },
        });
      }
    }

    // Ensure onboardingStatus is VERIFIED and businessType/registeredName are set
    await prisma.broker.update({
      where: { id: b.id },
      data: {
        onboardingStatus: BrokerOnboardingStatus.VERIFIED,
        businessType: b.businessType || BrokerBusinessType.ECN,
        registeredName: b.registeredName || b.companyName,
        isRegulated: b.isRegulated ?? (b.regulation && b.regulation.length > 0),
        negativeBalanceProtection: b.negativeBalanceProtection ?? true,
      },
    });

    // Recompute summary caches and completeness percentage
    await recomputeBrokerSummary(b.id);
  }
  console.log(`✅ Backfilled ${existingBrokers.length} existing approved brokers.`);

  // 6. Seed Demo Tutor & Course
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

  const existingSections = await prisma.courseSection.findMany({ where: { courseId: course.id } });
  if (existingSections.length === 0) {
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
  }
  console.log('✅ Demo Course seeded with curriculum.');

  // 7. Seed Demo Signal Provider
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

  const existingSignals = await prisma.signal.findMany({ where: { signalProviderId: sp.id } });
  if (existingSignals.length === 0) {
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
  }
  console.log('✅ Demo Signal Provider and active trade signal seeded.');

  // 8. Seed Demo Blog Post
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
