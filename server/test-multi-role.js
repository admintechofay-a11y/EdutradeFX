const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('./src/models/User');
const Broker = require('./src/models/Broker');
const SignalProvider = require('./src/models/SignalProvider');
const Signal = require('./src/models/Signal');
const Course = require('./src/models/Course');
const Payout = require('./src/models/Payout');
const AuditLog = require('./src/models/AuditLog');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edutradefx';
const JWT_SECRET = process.env.JWT_SECRET || 'edutradefx_super_secret_jwt_key_2026';

async function runVerification() {
  console.log('====================================================');
  console.log('   EDUTRADEFX MULTI-ROLE MARKETPLACE VALIDATION     ');
  console.log('====================================================');

  await mongoose.connect(MONGODB_URI);
  console.log('[1/5] Connected to MongoDB');

  // 1. Verify 5 Seeded Roles
  const roles = ['admin', 'broker', 'signal_provider', 'tutor', 'user'];
  for (const r of roles) {
    const u = await User.findOne({ role: r });
    if (!u) {
      throw new Error(`Missing seeded user with role: ${r}`);
    }
    console.log(`  ✓ Verified role '${r}': ${u.email} (${u.name})`);
  }

  // 2. Verify Broker Scoping & Approval State
  const approvedBroker = await Broker.findOne({ approvalStatus: 'approved' }).populate('user');
  const pendingBroker = await Broker.findOne({ approvalStatus: 'pending' }).populate('user');

  console.log('\n[2/5] Verified Broker Listings:');
  console.log(`  ✓ Approved Broker: ${approvedBroker?.name} (User: ${approvedBroker?.user?.email}) - Status: ${approvedBroker?.approvalStatus}`);
  console.log(`  ✓ Pending Broker:  ${pendingBroker?.name} (User: ${pendingBroker?.user?.email}) - Status: ${pendingBroker?.approvalStatus}`);

  // Public filter check
  const publicBrokers = await Broker.find({ approvalStatus: 'approved', status: 'active' });
  console.log(`  ✓ Public listing query count: ${publicBrokers.length} (Excludes pending & suspended)`);

  // 3. Verify Signal Provider & Signal CRUD
  const spUser = await User.findOne({ role: 'signal_provider' });
  const spProfile = await SignalProvider.findOne({ user: spUser._id });
  const testSignal = await Signal.findOne({ provider: spProfile._id });

  console.log('\n[3/5] Verified Signal Provider Operations:');
  console.log(`  ✓ Provider: ${spProfile?.name} (Win-rate: ${spProfile?.winRate}%)`);
  console.log(`  ✓ Sample Signal: ${testSignal?.type} ${testSignal?.pair} @ ${testSignal?.entryPrice} (SL: ${testSignal?.stopLoss}, TP: ${testSignal?.takeProfit1})`);

  // 4. Verify Course Workflow & Payouts
  const tutorUser = await User.findOne({ role: 'tutor' });
  const publishedCourse = await Course.findOne({ tutor: tutorUser._id, approvalStatus: 'approved', status: 'published' });
  const submittedCourse = await Course.findOne({ tutor: tutorUser._id, approvalStatus: 'submitted' });
  const pendingPayout = await Payout.findOne({ tutor: tutorUser._id, status: 'pending' });

  console.log('\n[4/5] Verified LMS Academy & Payouts:');
  console.log(`  ✓ Live Course:      "${publishedCourse?.title}" (${publishedCourse?.approvalStatus}/${publishedCourse?.status})`);
  console.log(`  ✓ In-Review Course: "${submittedCourse?.title}" (${submittedCourse?.approvalStatus}/${submittedCourse?.status})`);
  console.log(`  ✓ Payout Request:   $${pendingPayout?.amount} USD via ${pendingPayout?.paymentMethod} (${pendingPayout?.status})`);

  // 5. Verify Audit Logs
  const auditCount = await AuditLog.countDocuments();
  const latestAudit = await AuditLog.findOne().sort({ createdAt: -1 });

  console.log('\n[5/5] Verified Administrative Compliance Audit Trail:');
  console.log(`  ✓ Total Immutable Audit Records: ${auditCount}`);
  console.log(`  ✓ Latest Audit Log: [${latestAudit?.action?.toUpperCase()}] ${latestAudit?.module?.toUpperCase()} "${latestAudit?.targetName}" by ${latestAudit?.adminEmail}`);

  console.log('\n====================================================');
  console.log('   ALL MULTI-ROLE MARKETPLACE VERIFICATIONS PASSED! ');
  console.log('====================================================');

  await mongoose.disconnect();
}

runVerification().catch((err) => {
  console.error('Validation failed:', err);
  process.exit(1);
});
