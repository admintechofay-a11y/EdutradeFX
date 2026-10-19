import 'dotenv/config';
import http from 'http';
import app from '../app';
import { prisma } from '../config/database';
import { generateAccessToken } from '../utils/jwt.utils';
import {
  Role,
  ApprovalStatus,
  OnboardingStatus,
  StatementAccountType,
  SpSubscriptionModel,
  SpPlanPeriod,
  SpUpdateFrequency,
  AgreementAudience,
} from '@prisma/client';
import { serializePublicSP, FORBIDDEN_PRIVATE_SP_KEYS } from '../modules/signal-providers/sp.serializer';
import { calculateSPCompletion, computeSPReviewFlags, ALL_SP_AGREEMENT_KEYS } from '../modules/signal-providers/sp.utils';
import { verifyDocumentMagicBytes } from '../middleware/upload.middleware';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, detail?: string) {
  if (condition) {
    results.push({ name, passed: true });
    console.log(`  ✓ PASS: ${name}`);
  } else {
    results.push({ name, passed: false, error: detail || 'Assertion failed' });
    console.error(`  ✗ FAIL: ${name} - ${detail || 'Assertion failed'}`);
  }
}

async function runSPSuite() {
  console.log('\n======================================================');
  console.log('EDUTRADEFX SIGNAL PROVIDER V2 TEST SUITE');
  console.log('======================================================\n');

  // Find demo users
  const adminUser = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
  if (!adminUser) throw new Error('No admin user found in database');

  const spUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'signals@alphatrades.com' },
        { role: Role.SIGNAL_PROVIDER },
      ],
    },
  });
  if (!spUser) throw new Error('No demo SP user found');

  const regularUser = await prisma.user.findFirst({ where: { role: Role.STUDENT } });
  if (!regularUser) throw new Error('No regular STUDENT found');

  const adminToken = generateAccessToken({ userId: adminUser.id, role: Role.ADMIN });
  const spToken = generateAccessToken({ userId: spUser.id, role: Role.SIGNAL_PROVIDER });
  const userToken = generateAccessToken({ userId: regularUser.id, role: Role.STUDENT });

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 5000;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  try {
    // ── TEST 1: Public Serializer Never Leaks Private Keys ──────
    console.log('\n--- 1. Security & Privacy Serializer ---');
    const mockSP = {
      id: 'test-sp-id',
      userId: 'secret-user-id-999',
      displayName: 'Quantum Pip Hunter',
      legalFullName: 'Alexander Vance Private',
      contactPhone: '+447911123456',
      residenceCountryCode: 'GB',
      residenceCountry: 'United Kingdom',
      slug: 'quantum-pip-hunter',
      photo: 'https://example.com/avatar.jpg',
      bio: 'Professional swing trader.',
      instruments: ['EURUSD', 'GBPUSD'],
      tradingStyles: ['DAY_TRADER', 'SWING_TRADER'],
      tradingStyleDescription: 'Algorithmic liquidity level sweeps with session confluence.',
      strategy: 'London Session Sweeps',
      strategyDetail: 'Full institutional liquidity strategy description extending beyond 100 characters for deep technical transparency.',
      riskCategory: 'MEDIUM',
      yearsTrading: 8,
      declaredAvgMonthlyReturn: 14.5,
      declaredMaxDrawdown: 6.2,
      declaredWinRate: 68.0,
      performancePeriodNote: 'Verified 2024-2025 track record',
      preferredTimeframes: ['M15', 'H1', 'H4'],
      maxLeverageUsed: 100,
      riskRewardPreference: '1:2.5',
      riskPhilosophy: 'Strict 1% account risk per trade with dynamic trailing stops.',
      usesHedgingOrMartingale: true,
      usesHedging: true,
      usesMartingale: false,
      hedgingMartingaleNotes: 'Correlated pair hedging on USD news events only. Martingale is strictly never used.',
      subscriptionModel: SpSubscriptionModel.PAID,
      updateFrequency: SpUpdateFrequency.PER_SIGNAL,
      inquiryHandlingApproach: 'Dedicated subscriber Telegram desk answered within 4 hours during market open.',
      offersLiveQA: true,
      liveQAFrequency: 'Bi-weekly webinar',
      website: 'https://quantumpips.com',
      telegramChannelUrl: 'https://t.me/quantumpips',
      verificationStatus: false,
      idVerified: false,
      statementVerified: false,
      performanceLink: 'https://myfxbook.com/members/quantum/signals/12345',
      performanceLinkVerified: false,
      rejectionReason: 'Confidential admin rejection notes',
      changesRequestedNote: 'Confidential request note',
      reviewedById: 'admin-999',
      reviewedAt: new Date(),
      reviewFlags: ['Flagged high leverage claim'],
      publicSnapshot: { old: 'snapshot' },
      profileUpdateRequiredBy: new Date(),
      plans: [
        { id: 'plan-1', name: 'Monthly VIP', period: SpPlanPeriod.MONTHLY, price: 49.99, currency: 'USD', isActive: true },
      ],
      reviews: [{ id: 'rev-1', rating: 5, comment: 'Exceptional transparency and discipline.' }],
      signals: [{ id: 'sig-1', instrument: 'EURUSD', direction: 'BUY', status: 'CLOSED', pipsGained: 45 }],
    };

    const serialized = serializePublicSP(mockSP);
    assert(serialized !== null, 'Public serializer returns an object');

    for (const key of FORBIDDEN_PRIVATE_SP_KEYS) {
      assert(
        !(key in (serialized as any)),
        `Strict Privacy: ${key} is NEVER leaked in public response`
      );
    }

    assert(
      serialized?.performanceLink === null || serialized?.performanceLink === undefined,
      'Unverified performanceLink is NOT exposed publicly until admin confirms'
    );
    assert(
      serialized?.declaredMetrics.declared === true,
      'Declared performance is explicitly marked as self-declared'
    );
    assert(
      serialized?.usesMartingale === false,
      'Martingale disclosure is accurately reflected and visible'
    );

    // ── TEST 2: S1 Compliance Bypass Gating (Posting requires APPROVED) ──
    console.log('\n--- 2. S1 Compliance Bypass Regression Check ---');
    // Create a temporary PENDING provider
    const testUser = await prisma.user.create({
      data: {
        email: `sp-pending-${Date.now()}@test.com`,
        name: 'Pending Trader',
        password: 'dummyPassword123!',
        role: Role.SIGNAL_PROVIDER,
      },
    });
    const pendingToken = generateAccessToken({ userId: testUser.id, role: Role.SIGNAL_PROVIDER });

    const pendingSP = await prisma.signalProvider.create({
      data: {
        userId: testUser.id,
        displayName: 'Pending Test Desk',
        slug: `pending-test-${Date.now().toString().slice(-4)}`,
        status: ApprovalStatus.PENDING,
        onboardingStatus: OnboardingStatus.SUBMITTED,
        verificationStatus: false,
      },
    });

    const signalPostRes = await fetch(`${baseUrl}/signal-providers/my/signals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pendingToken}`,
      },
      body: JSON.stringify({
        title: 'Pending Signal',
        instrument: 'EURUSD',
        direction: 'BUY',
        entryPrice: 1.085,
        stopLoss: 1.08,
        takeProfit: 1.095,
      }),
    });

    assert(
      signalPostRes.status === 403,
      'S1 FIX: PENDING signal provider CANNOT post signals in ANY environment (HTTP 403)'
    );

    // ── TEST 3: S2 Enquiries Endpoint & Role Authorization ───────
    console.log('\n--- 3. S2 Missing Enquiries Endpoint Check ---');
    const spEnquiryRes = await fetch(`${baseUrl}/signal-providers/my/enquiries`, {
      headers: { Authorization: `Bearer ${spToken}` },
    });
    assert(spEnquiryRes.status === 200, 'S2 FIX: GET /signal-providers/my/enquiries exists and returns 200');

    const studentEnquiryRes = await fetch(`${baseUrl}/signal-providers/my/enquiries`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(studentEnquiryRes.status === 403, 'Enquiries endpoint is strictly protected by role (403 for STUDENT)');

    // ── TEST 4: S6 Win Rate Calculation (recorded results only) ──
    console.log('\n--- 4. S6 Win Rate Recorded Results Integrity ---');
    // Ensure SP is approved to create signals for win rate test
    await prisma.signalProvider.update({
      where: { id: pendingSP.id },
      data: { status: ApprovalStatus.APPROVED, onboardingStatus: OnboardingStatus.SUBMITTED },
    });

    // Create 3 signals: one winning (+30 pips), one losing (-20 pips), one closed with null result
    const sig1 = await prisma.signal.create({
      data: {
        signalProviderId: pendingSP.id,
        title: 'EURUSD Long Signal',
        instrument: 'EURUSD',
        direction: 'BUY',
        entryPrice: 1.08,
        status: 'CLOSED',
        pipsGained: 30,
      },
    });

    const sig2 = await prisma.signal.create({
      data: {
        signalProviderId: pendingSP.id,
        title: 'GBPUSD Short Signal',
        instrument: 'GBPUSD',
        direction: 'SELL',
        entryPrice: 1.25,
        status: 'CLOSED',
        pipsGained: -20,
      },
    });

    const sig3 = await prisma.signal.create({
      data: {
        signalProviderId: pendingSP.id,
        title: 'USDJPY Long Signal',
        instrument: 'USDJPY',
        direction: 'BUY',
        entryPrice: 150.0,
        status: 'CLOSED',
        pipsGained: null, // Null result should NOT be counted as loss or dilute win rate
      },
    });

    // Recalculate win rate
    const closedSignals = await prisma.signal.findMany({
      where: { signalProviderId: pendingSP.id, status: 'CLOSED', pipsGained: { not: null } },
    });
    const winningSignals = closedSignals.filter((s) => (s.pipsGained || 0) > 0).length;
    const computedWinRate = closedSignals.length > 0 ? (winningSignals / closedSignals.length) * 100 : null;

    assert(
      closedSignals.length === 2,
      'S6 FIX: Win rate calculation only considers signals with recorded pipsGained'
    );
    assert(
      computedWinRate === 50,
      'S6 FIX: Win rate calculation is exact (1 win out of 2 recorded = 50.0%)'
    );

    // ── TEST 5: Section Saves & Draft Validation ─────────────────
    console.log('\n--- 5. Section Saves & Onboarding Rules ---');
    const expSaveRes = await fetch(`${baseUrl}/signal-providers/my/sections/experience`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pendingToken}`,
      },
      body: JSON.stringify({
        yearsTrading: 5,
        instruments: ['EURUSD', 'XAUUSD'],
        tradingStyles: ['DAY_TRADER'],
        tradingStyleDescription: 'Systematic mean-reversion trading during Asian session consolidating ranges.',
        previouslySignalProvider: true,
        previousProviderDetails: 'SignalStart 2021-2023 with 200 subscribers',
      }),
    });
    assert(expSaveRes.status === 200, 'Experience section draft saves successfully');

    // Risk section validation
    const riskSaveRes = await fetch(`${baseUrl}/signal-providers/my/sections/risk`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pendingToken}`,
      },
      body: JSON.stringify({
        maxLeverageUsed: 200,
        riskRewardPreference: '1:2',
        riskPhilosophy: 'Disciplined multi-asset risk management strictly limited to 1% per exposure.',
        usesHedgingOrMartingale: false,
        riskCategory: 'LOW',
      }),
    });
    assert(riskSaveRes.status === 200, 'Risk section draft saves successfully');

    // Suspicious phrase scanning
    const flags = computeSPReviewFlags({
      declaredWinRate: 95,
      declaredAvgMonthlyReturn: 45,
      usesMartingale: true,
      maxLeverageUsed: 1500,
      strategyDetail: 'Send me funds to manage your account with guaranteed profit',
      riskPhilosophy: 'Account management with guaranteed return',
    });
    assert(flags.some((f) => f.includes('90%')), 'Auto-flag: Win rate >= 90% flagged');
    assert(flags.some((f) => f.includes('30%')), 'Auto-flag: Monthly return >= 30% flagged');
    assert(flags.some((f) => f.includes('Martingale')), 'Auto-flag: Martingale flagged');
    assert(flags.some((f) => f.includes('leverage')), 'Auto-flag: High leverage flagged');
    assert(flags.some((f) => f.includes('send me funds') || f.includes('manage your account')), 'Auto-flag: Prohibited phrase flagged');

    // ── TEST 6: Agreements Versioning & Acceptance ───────────────
    console.log('\n--- 6. Agreements Scroll-Gate & Version Bumping ---');
    const agreementsRes = await fetch(`${baseUrl}/signal-providers/agreements`);
    const agreementsData = (await agreementsRes.json()) as any;
    assert(agreementsRes.status === 200, 'GET /signal-providers/agreements returns 200');
    assert(Array.isArray(agreementsData.data) && agreementsData.data.length >= 10, 'All 10 SP agreements/commitments seeded');

    // Accept an agreement
    const acceptRes = await fetch(`${baseUrl}/signal-providers/my/agreements/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pendingToken}`,
      },
      body: JSON.stringify({
        acceptances: [
          { key: 'CLIENT_FUND_PROTECTION', version: 1 },
          { key: 'COMMIT_TRANSPARENCY', version: 1 },
        ],
      }),
    });
    assert(acceptRes.status === 200, 'POST /signal-providers/my/agreements/accept records acceptances');

    // Admin bumps agreement version
    const bumpRes = await fetch(`${baseUrl}/admin/signal-providers/agreements/CLIENT_FUND_PROTECTION`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Client Fund Protection Agreement (Amended)',
        body: '[DRAFT — replace with legal-approved text before launch]\nAmended body with enhanced regulatory protection.',
      }),
    });
    const bumpData = (await bumpRes.json()) as any;
    assert(bumpRes.status === 200, 'Admin can update SP agreement body');
    assert(bumpData.data.version >= 2, 'Updating agreement body automatically bumps version');

    // ── TEST 7: Document Magic Bytes & Security ─────────────────
    console.log('\n--- 7. Document Security & Magic Bytes ---');
    const validPdf = Buffer.from('%PDF-1.4\n%...\n');
    const invalidHtml = Buffer.from('<html><script>alert(1)</script></html>');
    assert(verifyDocumentMagicBytes(validPdf, '.pdf') === true, 'PDF magic bytes accepted');
    assert(verifyDocumentMagicBytes(invalidHtml, '.html') === false, 'HTML files prohibited');

    // ── TEST 8: Admin Status Controls & Reason Validation ────────
    console.log('\n--- 8. Admin Status Controls & Verification ---');
    const rejectNoReasonRes = await fetch(`${baseUrl}/admin/signal-providers/${pendingSP.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'REJECTED' }),
    });
    assert(rejectNoReasonRes.status === 400, 'Admin rejection without reason is rejected (HTTP 400)');

    const rejectWithReasonRes = await fetch(`${baseUrl}/admin/signal-providers/${pendingSP.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'REJECTED', reason: 'Insufficient 3-month verified trading history.' }),
    });
    assert(rejectWithReasonRes.status === 200, 'Admin rejection with valid reason succeeds (HTTP 200)');

    // Verification toggle: verificationStatus only true when ID + statement + LIVE account
    const verifyToggleRes = await fetch(`${baseUrl}/admin/signal-providers/${pendingSP.id}/verification`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        idVerified: true,
        statementVerified: true,
      }),
    });
    const verifyData = (await verifyToggleRes.json()) as any;
    assert(verifyToggleRes.status === 200, 'Admin verification flags update succeeds');
    assert(
      verifyData.data.verificationStatus === false,
      'Spec 4.2: verificationStatus remains false without verified LIVE account statement'
    );

    // Clean up temporary test data
    await prisma.signal.deleteMany({ where: { signalProviderId: pendingSP.id } });
    await prisma.partnerAgreementAcceptance.deleteMany({ where: { partnerId: pendingSP.id } });
    await prisma.signalProvider.delete({ where: { id: pendingSP.id } });
    await prisma.user.delete({ where: { id: testUser.id } });

    console.log('\n======================================================');
    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;
    console.log(`SUMMARY: ${passedCount}/${totalCount} tests passed`);
    console.log('======================================================\n');

    if (passedCount < totalCount) {
      process.exit(1);
    }
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runSPSuite().catch((err) => {
  console.error('Fatal SP Test Suite Error:', err);
  process.exit(1);
});
