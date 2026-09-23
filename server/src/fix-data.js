const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const { Broker, Course, AccountManager, SignalProvider } = require('./models');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutradefx');
    console.log('Connected to MongoDB');

    // 1. Approve all existing brokers and ensure slug/fields
    const brokers = await Broker.find({});
    for (const b of brokers) {
      b.approvalStatus = 'approved';
      b.status = 'active';
      if (!b.slug) {
        b.slug = b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      if (!b.regulators || b.regulators.length === 0) {
        b.regulators = typeof b.regulation === 'string'
          ? b.regulation.split(',').map(s => s.trim())
          : ['ASIC', 'FCA'];
      }
      await b.save();
    }
    console.log(`Approved & standardized ${brokers.length} brokers`);

    // 2. Approve all existing courses and ensure slug/thumbnail/level
    const courses = await Course.find({});
    for (const c of courses) {
      c.approvalStatus = 'approved';
      c.status = 'published';
      if (!c.slug) {
        c.slug = c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + c._id.toString().slice(-4);
      }
      if (!c.thumbnail) {
        c.thumbnail = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80';
      }
      if (!c.rating) {
        c.rating = 4.8;
      }
      if (!c.studentsEnrolled && !c.enrolledCount) {
        c.enrolledCount = 120;
      }
      await c.save();
    }
    console.log(`Approved & published ${courses.length} courses`);

    // 3. Seed Account Managers if 0
    const amCount = await AccountManager.countDocuments();
    if (amCount === 0) {
      await AccountManager.create([
        {
          name: 'Marcus Vance',
          company: 'Aurelius Capital PAMM',
          profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&auto=format&fit=crop&q=80',
          experience: '9+ years',
          strategy: 'Institutional SMC Liquidity & Order Flow',
          minInvestment: 1000,
          historicalPerformance: {
            monthlyReturn: 14.8,
            maxDrawdown: 6.2,
            winRate: 78.5,
            totalPips: 8400,
            trackRecordUrl: 'https://myfxbook.com',
          },
          riskInfo: 'Maximum 1.5% capital risk per trade. Zero Martingale, mandatory stop losses on all orders.',
          tradingStyle: 'Day Trading',
          description: 'Institutional macro order flow manager focusing on London and New York overlaps across major pairs.',
          contactEmail: 'marcus@aurelius.example.com',
          isFeatured: true,
          status: 'active',
        },
        {
          name: 'Elena Rostova',
          company: 'QuantEdge Alpha Fund',
          profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&auto=format&fit=crop&q=80',
          experience: '7+ years',
          strategy: 'Algorithmic Mean-Reversion & Statistical Arbitrage',
          minInvestment: 2500,
          historicalPerformance: {
            monthlyReturn: 11.2,
            maxDrawdown: 4.5,
            winRate: 82.0,
            totalPips: 12500,
            trackRecordUrl: 'https://myfxbook.com',
          },
          riskInfo: 'Dynamic portfolio volatility parity model with automatic circuit-breaker cutoff at 5% drawdown.',
          tradingStyle: 'Algorithmic',
          description: 'Former quantitative analyst operating low-latency statistical arbitrage EAs on ECN cross-connects.',
          contactEmail: 'elena@quantedge.example.com',
          isFeatured: true,
          status: 'active',
        },
        {
          name: 'Jonathan Sterling',
          company: 'Highfield Global Wealth',
          profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&auto=format&fit=crop&q=80',
          experience: '12+ years',
          strategy: 'Multi-Week Macro Swing & FX Carry Trade',
          minInvestment: 5000,
          historicalPerformance: {
            monthlyReturn: 9.6,
            maxDrawdown: 7.1,
            winRate: 74.0,
            totalPips: 9800,
            trackRecordUrl: 'https://myfxbook.com',
          },
          riskInfo: 'Conservative swing positions aligned with central bank rate differentials and structural trend models.',
          tradingStyle: 'Swing Trading',
          description: 'Long-term FX portfolio manager delivering steady non-correlated alpha for high net worth clients.',
          contactEmail: 'j.sterling@highfield.example.com',
          isFeatured: true,
          status: 'active',
        },
      ]);
      console.log('Seeded 3 Account Managers');
    }

    process.exit(0);
  } catch (err) {
    console.error('Data fix error:', err);
    process.exit(1);
  }
};

run();
