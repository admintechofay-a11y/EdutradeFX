const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const {
  User,
  Broker,
  SignalProvider,
  Signal,
  Course,
  Lesson,
  Quiz,
  Complaint,
  Review,
  Payout,
  AuditLog,
} = require('./models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edutradefx';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected to MongoDB');

    // Clean existing collections
    await Promise.all([
      User.deleteMany({}),
      Broker.deleteMany({}),
      SignalProvider.deleteMany({}),
      Signal.deleteMany({}),
      Course.deleteMany({}),
      Lesson.deleteMany({}),
      Quiz.deleteMany({}),
      Complaint.deleteMany({}),
      Review.deleteMany({}),
      Payout.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log('[Seed] Cleared existing data');

    // 1. Create Users for all 5 roles
    const salt = await bcrypt.genSalt(10);
    const hash = (pass) => bcrypt.hash(pass, salt);

    const admin = await User.create({
      name: 'Super Administrator',
      email: 'admin@edutradefx.com',
      passwordHash: await hash('Admin@123456'),
      role: 'admin',
      mobile: '+44 20 7946 0001',
      isVerified: true,
      status: 'active',
    });

    const brokerUser = await User.create({
      name: 'IC Markets Institutional Desk',
      email: 'broker@icmarkets.com',
      passwordHash: await hash('Broker@123456'),
      role: 'broker',
      mobile: '+61 2 8014 4280',
      isVerified: true,
      status: 'active',
    });

    const providerUser = await User.create({
      name: 'Apex Quantitative Feeds',
      email: 'provider@apexsignals.com',
      passwordHash: await hash('Signal@123456'),
      role: 'signal_provider',
      mobile: '+1 212 555 0199',
      isVerified: true,
      status: 'active',
    });

    const tutorUser = await User.create({
      name: 'David Sutherland',
      email: 'tutor@edutradefx.com',
      passwordHash: await hash('Tutor@123456'),
      role: 'tutor',
      mobile: '+44 20 7946 0192',
      isVerified: true,
      status: 'active',
    });

    const traderUser = await User.create({
      name: 'Michael Vance',
      email: 'trader@edutradefx.com',
      passwordHash: await hash('Trader@123456'),
      role: 'user',
      mobile: '+1 555 234 5678',
      isVerified: true,
      status: 'active',
    });

    console.log('[Seed] 5 Core Multi-Role Users seeded');

    // 2. Create Brokers
    const icBroker = await Broker.create({
      user: brokerUser._id,
      name: 'IC Markets',
      country: 'Australia',
      regulation: 'Tier-1 Regulated (ASIC, CySEC, FSA)',
      regulators: ['ASIC', 'CySEC', 'FSA', 'SCB'],
      leverage: '1:500',
      minDeposit: 200,
      spreads: 'Raw ECN from 0.0 pips',
      execution: 'ECN',
      platforms: ['MetaTrader 4', 'MetaTrader 5', 'cTrader', 'TradingView'],
      accountTypes: [
        { name: 'Raw Spread (cTrader)', minDeposit: 200, leverage: '1:500', spread: '0.0 pips', commission: '$3.00 / lot' },
        { name: 'Standard Account', minDeposit: 200, leverage: '1:500', spread: '0.8 pips', commission: 'Zero Commission' },
      ],
      paymentMethods: ['Bank Wire', 'Visa/Mastercard', 'PayPal', 'Neteller', 'Crypto'],
      website: 'https://icmarkets.com',
      contactEmail: 'broker@icmarkets.com',
      description: 'IC Markets is one of the most renowned Forex CFD providers worldwide with direct tier-1 liquidity access and Equinix NY4 cross-connects.',
      disclaimer: 'CFDs are complex instruments and come with a high risk of losing money rapidly due to leverage.',
      isFeatured: true,
      approvalStatus: 'approved',
      status: 'active',
      documents: [
        { name: 'ASIC Financial Services License', url: 'https://example.com/docs/asic-license.pdf', docType: 'Regulatory License' },
        { name: 'Certificate of Corporate Incorporation', url: 'https://example.com/docs/incorp.pdf', docType: 'Corporate Registry' },
      ],
    });

    const pendingBroker = await Broker.create({
      name: 'Vantage Prime Markets',
      country: 'Cayman Islands',
      regulation: 'CIMA Regulated',
      regulators: ['CIMA', 'VFSC'],
      leverage: '1:1000',
      minDeposit: 100,
      spreads: 'From 0.2 pips',
      execution: 'STP',
      platforms: ['MetaTrader 5', 'TradingView'],
      accountTypes: [
        { name: 'Pro STP', minDeposit: 100, leverage: '1:1000', spread: '0.2 pips', commission: '$2.00 / lot' },
      ],
      paymentMethods: ['Wire Transfer', 'USDT', 'Credit Card'],
      website: 'https://vantageprimemarkets-example.com',
      contactEmail: 'compliance@vantageprime.example.com',
      description: 'Global multi-asset brokerage applying for listing on EduTradeFX marketplace.',
      isFeatured: false,
      approvalStatus: 'pending',
      status: 'active',
      documents: [
        { name: 'CIMA Operating Authorization', url: 'https://example.com/docs/cima-auth.pdf', docType: 'Regulatory License' },
      ],
    });

    console.log('[Seed] Brokers seeded (1 Approved, 1 Pending)');

    // 3. Create Signal Providers & Signals
    const apexSignals = await SignalProvider.create({
      user: providerUser._id,
      name: 'Apex Quantitative Feeds',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      strategy: 'Institutional Price Action & Market Structure Breakouts',
      markets: ['EUR/USD', 'GBP/USD', 'XAU/USD', 'USD/JPY'],
      subscriptionPrice: 49,
      historicalPerformance: {
        winRate: 82.5,
        monthlyRoi: 18.2,
        maxDrawdown: 5.8,
        totalSignals: 420,
        avgPipsPerMonth: 950,
      },
      riskInfo: 'Strict 1:2.5 minimum Risk-to-Reward ratio with mandatory 25-pip stop loss and dual take-profit targets.',
      description: 'Systematic algorithmic signals derived from London/New York session overlaps with zero Martingale and zero Grid.',
      website: 'https://apexsignals.example.com',
      contactEmail: 'provider@apexsignals.com',
      approvalStatus: 'approved',
      status: 'active',
      isFeatured: true,
    });

    const pendingSignals = await SignalProvider.create({
      name: 'London Breakout Sniper',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      strategy: 'Frankfurt & London Opening Range Expansion',
      markets: ['GBP/JPY', 'EUR/JPY'],
      subscriptionPrice: 79,
      historicalPerformance: {
        winRate: 76.0,
        monthlyRoi: 14.5,
        maxDrawdown: 7.2,
        totalSignals: 180,
      },
      riskInfo: 'Tight 15-pip stop loss on all European cross scalps.',
      description: 'High-momentum breakout strategy capturing morning session directional expansion.',
      website: 'https://londonbreakout.example.com',
      contactEmail: 'sniper@londonbreakout.example.com',
      approvalStatus: 'pending',
      status: 'active',
    });

    // Seed Signals for Apex
    await Signal.create([
      {
        provider: apexSignals._id,
        user: providerUser._id,
        pair: 'EUR/USD',
        type: 'BUY',
        timeframe: 'H1',
        entryPrice: 1.0850,
        stopLoss: 1.0825,
        takeProfit1: 1.0900,
        takeProfit2: 1.0950,
        status: 'active',
        result: 'pending',
        notes: 'Bullish order block reaction at London session open. Target daily liquidity pool.',
      },
      {
        provider: apexSignals._id,
        user: providerUser._id,
        pair: 'XAU/USD',
        type: 'BUY',
        timeframe: 'H4',
        entryPrice: 2340.0,
        stopLoss: 2325.0,
        takeProfit1: 2370.0,
        takeProfit2: 2400.0,
        status: 'closed',
        result: 'profit',
        resultPips: 300,
        closedPrice: 2370.0,
        closedAt: new Date(),
        notes: 'TP1 reached cleanly. +300 pips banked.',
      },
      {
        provider: apexSignals._id,
        user: providerUser._id,
        pair: 'GBP/USD',
        type: 'SELL',
        timeframe: 'M15',
        entryPrice: 1.2950,
        stopLoss: 1.2975,
        takeProfit1: 1.2900,
        status: 'closed',
        result: 'loss',
        resultPips: -25,
        closedPrice: 1.2975,
        closedAt: new Date(),
        notes: 'Stop loss hit after US PPI release spiked high.',
      },
    ]);

    console.log('[Seed] Signal Providers & Signals seeded');

    // 4. Create Courses and Lessons
    const approvedCourse = await Course.create({
      title: 'Institutional Smart Money Concepts (SMC) Masterclass',
      description: 'A comprehensive curriculum teaching retail traders how banks and institutional liquidity providers engineer price delivery in the global Forex market.',
      tutor: tutorUser._id,
      price: 199,
      category: 'Advanced Strategy',
      level: 'advanced',
      approvalStatus: 'approved',
      status: 'published',
      enrolledCount: 142,
    });

    const lesson1 = await Lesson.create({
      course: approvedCourse._id,
      title: 'Market Structure & Liquidity Voids',
      order: 1,
      duration: 22,
      videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      content: 'In this lesson, we explore institutional order blocks, liquidity voids, and fair value gaps.',
    });

    const lesson2 = await Lesson.create({
      course: approvedCourse._id,
      title: 'Risk Management & Position Sizing Framework',
      order: 2,
      duration: 30,
      videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      content: 'Mathematical framework for calculating lots per pip and strictly limiting account drawdown to 1% per setup.',
    });

    approvedCourse.lessons = [lesson1._id, lesson2._id];
    await approvedCourse.save();

    const submittedCourse = await Course.create({
      title: 'Forex Foundations & Technical Analysis for Beginners',
      description: 'Step-by-step beginner guide to understanding currency quotes, leverage, order types, and candlestick charting patterns.',
      tutor: tutorUser._id,
      price: 49,
      category: 'Forex Basics',
      level: 'beginner',
      lessons: [lesson1._id],
      approvalStatus: 'submitted',
      status: 'draft',
      enrolledCount: 0,
    });

    // Seed Payout for Tutor
    await Payout.create({
      tutor: tutorUser._id,
      amount: 450,
      currency: 'USD',
      paymentMethod: 'crypto_usdt',
      accountDetails: 'TRC20: TXYZ99887766554433221100AABBCC',
      status: 'pending',
    });

    console.log('[Seed] Courses & Lessons seeded (1 Approved & Published, 1 Submitted)');

    // 5. Create Reviews
    await Review.create([
      {
        targetType: 'broker',
        targetModel: 'Broker',
        targetId: icBroker._id,
        user: traderUser._id,
        rating: 5,
        comment: 'Consistently tight spreads on EUR/USD and zero issues withdrawing via wire transfer. Superior latency for automated EAs.',
        status: 'approved',
        reply: {
          comment: 'Thank you Michael. Our Equinix NY4 server infrastructure ensures institutional execution for all clients.',
          repliedAt: new Date(),
          authorRole: 'broker',
          authorName: 'IC Markets',
        },
      },
      {
        targetType: 'course',
        targetModel: 'Course',
        targetId: approvedCourse._id,
        user: traderUser._id,
        rating: 5,
        comment: 'David explains institutional order flow clearer than any YouTube tutorial. The risk sizing matrix alone is worth 10x the price.',
        status: 'approved',
      },
    ]);

    // 6. Create Initial Audit Logs
    await AuditLog.create([
      {
        action: 'approve',
        module: 'broker',
        targetId: icBroker._id.toString(),
        targetName: 'IC Markets',
        admin: admin._id,
        adminName: admin.name,
        adminEmail: admin.email,
        details: 'Approved regulatory documents and live broker profile verification.',
      },
      {
        action: 'approve',
        module: 'signal_provider',
        targetId: apexSignals._id.toString(),
        targetName: 'Apex Quantitative Feeds',
        admin: admin._id,
        adminName: admin.name,
        adminEmail: admin.email,
        details: 'Verified audited historical performance and approved signal provider profile.',
      },
      {
        action: 'approve',
        module: 'course',
        targetId: approvedCourse._id.toString(),
        targetName: approvedCourse.title,
        admin: admin._id,
        adminName: admin.name,
        adminEmail: admin.email,
        details: 'Reviewed curriculum lessons and video modules. Course approved and published live.',
      },
    ]);

    console.log('[Seed] Audit Logs & Reviews seeded');
    console.log('====================================================');
    console.log('       EDUTRADEFX MULTI-ROLE MARKETPLACE SEED       ');
    console.log('====================================================');
    console.log('Admin:           admin@edutradefx.com    / Admin@123456');
    console.log('Broker:          broker@icmarkets.com    / Broker@123456');
    console.log('Signal Provider: provider@apexsignals.com / Signal@123456');
    console.log('Tutor:           tutor@edutradefx.com    / Tutor@123456');
    console.log('Trader (User):   trader@edutradefx.com   / Trader@123456');
    console.log('====================================================');

    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedData();
