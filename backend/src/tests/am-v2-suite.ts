import 'dotenv/config';
import http from 'http';
import app from '../app';
import { prisma } from '../config/database';
import { generateAccessToken } from '../utils/jwt.utils';
import { Role, ApprovalStatus, AmOnboardingStatus, AmEntityType, RiskTolerance, SettlementCycle } from '@prisma/client';
import { serializePublicAM, FORBIDDEN_PRIVATE_KEYS } from '../modules/account-managers/am.serializer';
import { calculateAMCompletion, ALL_AGREEMENT_KEYS, MASTER_TERMS_KEY } from '../modules/account-managers/am.utils';
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

async function runAMSuite() {
  console.log('\n======================================================');
  console.log('EDUTRADEFX ACCOUNT MANAGER V2 TEST SUITE');
  console.log('======================================================\n');

  // Find demo users
  const adminUser = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
  if (!adminUser) throw new Error('No admin user found in database');

  const amUser = await prisma.user.findFirst({ where: { email: 'accountmanager@demo.com' } });
  if (!amUser) throw new Error('No demo AM user found');

  const regularUser = await prisma.user.findFirst({ where: { role: Role.STUDENT } });
  if (!regularUser) throw new Error('No regular STUDENT found');

  const adminToken = generateAccessToken({ userId: adminUser.id, role: Role.ADMIN });
  const amToken = generateAccessToken({ userId: amUser.id, role: Role.ACCOUNT_MANAGER });
  const userToken = generateAccessToken({ userId: regularUser.id, role: Role.STUDENT });

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 5000;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  try {
    // ── TEST 1: Public Serializer Never Leaks Private Keys ──────
    console.log('\n--- 1. Security & Privacy Serializer ---');
    const mockAM = {
      id: 'test-am-id',
      fullName: 'Marcus Vance',
      slug: 'marcus-vance',
      photo: 'https://example.com/photo.jpg',
      contactEmail: 'sensitive-private-email@trader.com',
      contactPhone: '+12125550198',
      address: '77 Wall Street, Suite 500',
      zipCode: '10005',
      lossRecoveryStrategy: 'Secret Proprietary Drawdown Formula',
      rejectionReason: 'Previous rejection note',
      changesRequestedNote: 'Fix your docs note',
      reviewedById: 'admin-123',
      reviewedAt: new Date(),
      userId: 'user-secret-id',
      socialLinksPublic: false,
      socialLinks: { twitter: 'marcus_fx' },
      regulatoryVerified: false,
      regulatorName: 'Unverified SEC',
      documents: [
        { id: 'doc-1', docType: 'CV_RESUME', isPublic: false, reviewStatus: 'APPROVED', fileUrl: 'https://secret.pdf' },
        { id: 'doc-2', docType: 'PAST_RESULT_SCREENSHOT', isPublic: true, reviewStatus: 'APPROVED', fileUrl: 'https://public-screenshot.png' },
      ],
      reviews: [{ id: 'rev-1', rating: 5, comment: 'Great manager', isApproved: true }],
    };

    const serialized = serializePublicAM(mockAM);
    assert(serialized !== null, 'Serializer returns an object');

    for (const key of FORBIDDEN_PRIVATE_KEYS) {
      assert(
        !(key in (serialized as any)),
        `Strict Privacy: ${key} is NOT leaked in public response`
      );
    }
    assert(serialized?.documents.length === 1, 'Only approved public screenshots returned; CV is withheld');
    assert(Object.keys(serialized?.socialLinks || {}).length === 0, 'Social links withheld when socialLinksPublic is false');
    assert(serialized?.regulatorName === undefined, 'Regulator name withheld when regulatoryVerified is false');

    // ── TEST 2: Section Saves (Partial / Draft Mode) ────────────
    console.log('\n--- 2. Section Saves & Draft Handling ---');
    const personalRes = await fetch(`${baseUrl}/account-managers/my/sections/personal`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${amToken}`,
      },
      body: JSON.stringify({
        address: '500 Madison Ave, Floor 12',
        city: 'New York',
        countryCode: 'US',
        stateRegion: 'New York',
        zipCode: '10022',
        contactEmail: 'marcus.vance@portfolio.com',
        contactPhone: '+12125550198',
      }),
    });
    const personalData = (await personalRes.json()) as any;
    assert(personalRes.status === 200, 'PUT /my/sections/personal succeeds with 200');
    assert(personalData.data.city === 'New York', 'Updated city correctly saved');

    // Test risk section parsing of ratio
    const riskRes = await fetch(`${baseUrl}/account-managers/my/sections/risk`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${amToken}`,
      },
      body: JSON.stringify({
        riskRewardRatio: '1:3',
        riskTolerance: 'MODERATE',
        lossPerTradePercent: 1.5,
        dailyTrades: 5,
        dailyLots: 1.2,
        dailyStopLossPoints: 40,
        dailyTakeProfitPoints: 120,
        favouriteTimeframe: 'H1',
        tradingTimeFrom: '14:00',
        tradingTimeTo: '22:00',
        lossRecoveryStrategy: 'Conservative capital preservation protocol on high drawdowns.',
      }),
    });
    const riskData = (await riskRes.json()) as any;
    assert(riskRes.status === 200, 'PUT /my/sections/risk succeeds with 200');
    assert(riskData.data.riskRewardValue === 3, 'Calculated riskRewardValue parsed 1:3 -> 3.0');

    // ── TEST 3: Submit Gating Fails on Incomplete AM ────────────
    console.log('\n--- 3. Submit Gating on Incomplete Profile ---');
    // Create an incomplete AM user
    const incompleteUserEmail = `incomplete_am_${Date.now()}@test.com`;
    const incUser = await prisma.user.create({
      data: {
        name: 'Incomplete AM',
        email: incompleteUserEmail,
        password: 'Password@123!',
        role: Role.ACCOUNT_MANAGER,
        isEmailVerified: true,
      },
    });
    const incAm = await prisma.accountManager.create({
      data: {
        userId: incUser.id,
        fullName: incUser.name,
        slug: `incomplete-am-${Date.now()}`,
        status: ApprovalStatus.PENDING,
        onboardingStatus: AmOnboardingStatus.DRAFT,
      },
    });
    const incToken = generateAccessToken({ userId: incUser.id, role: Role.ACCOUNT_MANAGER });

    const submitFailRes = await fetch(`${baseUrl}/account-managers/my/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${incToken}` },
    });
    const submitFailData = (await submitFailRes.json()) as any;
    assert(submitFailRes.status === 400, 'Submit fails with 400 when profile is incomplete');
    assert(
      submitFailData.message.includes('incomplete profile requirements') ||
      submitFailData.errors?.length > 0,
      'Submit returns detailed field-level rejection reasons'
    );

    // ── TEST 4: Agreements Scroll-Gate & Version Bump ───────────
    console.log('\n--- 4. Agreements & Version Enforcement ---');
    const agreementsRes = await fetch(`${baseUrl}/account-managers/agreements`);
    const agreementsData = (await agreementsRes.json()) as any;
    assert(agreementsRes.status === 200, 'GET /agreements returns active agreements');
    assert(agreementsData.data.length >= 8, 'All 7 agreements + master agreement exist in database');

    // Accept agreements for incomplete AM
    const acceptRes = await fetch(`${baseUrl}/account-managers/my/agreements/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${incToken}`,
      },
      body: JSON.stringify({
        acceptances: agreementsData.data.map((ag: any) => ({
          key: ag.key,
          version: ag.version,
        })),
        master: true,
      }),
    });
    assert(acceptRes.status === 200, 'POST /my/agreements/accept records acceptances successfully');

    // Admin bumps agreement version
    const bumpRes = await fetch(`${baseUrl}/admin/account-managers/agreements/CLIENT_FUND_PROTECTION`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Client Fund Protection Agreement (Amended)',
        body: '[DRAFT — replace with legal-approved text before launch]\nAmended body version with increased escrow protection.',
      }),
    });
    const bumpData = (await bumpRes.json()) as any;
    assert(bumpRes.status === 200, 'Admin can update agreement body');
    assert(bumpData.data.version >= 2, 'Updating agreement body automatically bumps version');

    // ── TEST 5: Document Magic Byte Verification ────────────────
    console.log('\n--- 5. Document Security & Magic Bytes ---');
    const validPdfHeader = Buffer.from('%PDF-1.4\n%...\n');
    const invalidExeHeader = Buffer.from('MZ\x90\x00\x03\x00\x00\x00');
    assert(verifyDocumentMagicBytes(validPdfHeader, '.pdf') === true, 'Valid PDF buffer passes magic byte check');
    assert(verifyDocumentMagicBytes(invalidExeHeader, '.pdf') === false, 'Disguised executable fails PDF magic byte check');

    // ── TEST 6: Admin Rejection Requires Reason ─────────────────
    console.log('\n--- 6. Admin Status Controls & Rejection Reason ---');
    const rejectNoReasonRes = await fetch(`${baseUrl}/admin/account-managers/${incAm.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'REJECTED' }),
    });
    assert(rejectNoReasonRes.status === 400, 'Admin rejection without reason is rejected with 400');

    const rejectWithReasonRes = await fetch(`${baseUrl}/admin/account-managers/${incAm.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'REJECTED', reason: 'Missing verifiable performance records and CV.' }),
    });
    assert(rejectWithReasonRes.status === 200, 'Admin rejection with valid reason succeeds with 200');

    // ── TEST 7: Role Gating & Enquiries Endpoint ────────────────
    console.log('\n--- 7. Role Gating & Inquiries Endpoint ---');
    const amEnquiriesRes = await fetch(`${baseUrl}/account-managers/my/enquiries`, {
      headers: { Authorization: `Bearer ${amToken}` },
    });
    assert(amEnquiriesRes.status === 200, 'Account Manager can access GET /account-managers/my/enquiries');

    const userEnquiriesRes = await fetch(`${baseUrl}/account-managers/my/enquiries`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(userEnquiriesRes.status === 403, 'Regular USER is denied (403 Forbidden) from AM enquiries');

    // Clean up temporary incomplete user
    await prisma.accountManagerAgreementAcceptance.deleteMany({ where: { accountManagerId: incAm.id } });
    await prisma.accountManager.delete({ where: { id: incAm.id } });
    await prisma.user.delete({ where: { id: incUser.id } });

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

runAMSuite().catch((err) => {
  console.error('Fatal AM Test Suite Error:', err);
  process.exit(1);
});
