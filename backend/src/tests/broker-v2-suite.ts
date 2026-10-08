import 'dotenv/config';
import http from 'http';
import app from '../app';
import { prisma } from '../config/database';
import { generateAccessToken } from '../utils/jwt.utils';
import { Role } from '@prisma/client';

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

async function runBrokerV2Suite() {
  console.log('\n======================================================');
  console.log('EDUTRADEFX BROKER REGISTRATION V2 TEST SUITE');
  console.log('======================================================\n');

  const adminUser = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
  });
  if (!adminUser) throw new Error('No admin user found');

  const brokerUser = await prisma.user.findFirst({
    where: { email: 'broker@pepperstone-demo.com' },
  });
  if (!brokerUser) throw new Error('No demo broker user found');

  const pepperstone = await prisma.broker.findUnique({
    where: { slug: 'pepperstone-global-markets' },
    include: { accountGroups: true },
  });
  if (!pepperstone) throw new Error('Pepperstone broker not found');

  const icMarkets = await prisma.broker.findUnique({
    where: { slug: 'ic-markets-global' },
  });

  const adminToken = generateAccessToken({ userId: adminUser.id, role: Role.ADMIN });
  const brokerToken = generateAccessToken({ userId: brokerUser.id, role: Role.BROKER });

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 5000;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // -----------------------------------------------------------------
    // 1. Broker Options API (GET /api/options)
    // -----------------------------------------------------------------
    console.log('1. Broker Options Catalog & Dropdowns (Appendix A)');
    const optRes = await fetch(`${baseUrl}/api/options`);
    assert(optRes.status === 200, 'GET /api/options returns 200 OK');

    const optData = (await optRes.json()) as any;
    const groups = optData.data;

    assert(Boolean(groups.REGULATOR), 'REGULATOR option group exists');
    assert(groups.REGULATOR.length === 59, `REGULATOR group has 59 items (58 + OTHER) - got ${groups.REGULATOR?.length}`);

    assert(Boolean(groups.LANGUAGE), 'LANGUAGE option group exists');
    assert(groups.LANGUAGE.length === 133, `LANGUAGE group has 133 items - got ${groups.LANGUAGE?.length}`);

    assert(Boolean(groups.CURRENCY), 'CURRENCY option group exists');
    assert(groups.CURRENCY.length === 10, `CURRENCY group has 10 items (9 + OTHER) - got ${groups.CURRENCY?.length}`);

    assert(Boolean(groups.LICENSE_STATUS), 'LICENSE_STATUS option group exists');
    assert(groups.LICENSE_STATUS.length === 8, `LICENSE_STATUS group has 8 items - got ${groups.LICENSE_STATUS?.length}`);

    assert(Boolean(groups.DEPOSIT_BONUS), 'DEPOSIT_BONUS option group exists');
    assert(groups.DEPOSIT_BONUS.length === 21, `DEPOSIT_BONUS group has 21 items - got ${groups.DEPOSIT_BONUS?.length}`);

    assert(Boolean(groups.LEVERAGE), 'LEVERAGE option group exists');
    assert(groups.LEVERAGE.length === 23, `LEVERAGE group has 23 items - got ${groups.LEVERAGE?.length}`);

    assert(Boolean(groups.TIMEFRAME), 'TIMEFRAME option group exists');
    assert(groups.TIMEFRAME.length === 9, `TIMEFRAME group has 9 items - got ${groups.TIMEFRAME?.length}`);

    const totalCount =
      groups.REGULATOR.length +
      groups.LANGUAGE.length +
      groups.CURRENCY.length +
      groups.LICENSE_STATUS.length +
      groups.DEPOSIT_BONUS.length +
      groups.LEVERAGE.length +
      groups.TIMEFRAME.length;
    assert(totalCount === 263, `Total option count across 7 groups is exactly 263 - got ${totalCount}`);

    // Test group filtering
    const regRes = await fetch(`${baseUrl}/api/options?group=REGULATOR`);
    const regData = (await regRes.json()) as any;
    assert(
      regRes.status === 200 && Array.isArray(regData.data) && regData.data.length === 59,
      'Filter by ?group=REGULATOR returns only 59 options in flat array'
    );

    // -----------------------------------------------------------------
    // 2. Public Broker API & Security Redaction (GET /api/brokers/:slug)
    // -----------------------------------------------------------------
    console.log('\n2. Public Broker Projection & Security Redaction (Zero Leakage)');
    const pubRes = await fetch(`${baseUrl}/api/brokers/pepperstone-global-markets`);
    assert(pubRes.status === 200, 'GET /api/brokers/:slug returns 200 OK');

    const pubData = (await pubRes.json()) as any;
    const b = pubData.data;

    assert(Array.isArray(b.availableTimeframes) && b.availableTimeframes.length > 0, 'Public broker has availableTimeframes list');
    assert(Array.isArray(b.licenses) && b.licenses.length > 0, 'Public broker has licenses relation');
    assert(Boolean(b.licenses[0].regulatorCode), 'Public licenses contain regulatorCode');

    assert(Array.isArray(b.accountGroups) && b.accountGroups.length > 0, 'Public broker has accountGroups relation');
    assert(Boolean(b.accountGroups[0].currencyCode), 'Account groups contain currencyCode');
    assert(Boolean(b.accountGroups[0].leverageCode), 'Account groups contain leverageCode');
    assert(Boolean(b.accountGroups[0].depositBonusCode), 'Account groups contain depositBonusCode');

    // Confidentiality checks
    assert(b.fundingYears === undefined, 'Confidential financial turnover (fundingYears) is NOT exposed publicly');
    assert(b.clientActivity === undefined, 'Confidential client activity data is NOT exposed publicly');

    let credentialsExposed = false;
    for (const group of b.accountGroups) {
      if (group.testLogin || group.testPasswordEnc || group.testServer) {
        credentialsExposed = true;
      }
    }
    assert(!credentialsExposed, 'Account group test credentials (login, pass, server) are NOT exposed in public API');

    let serverIpExposed = false;
    if (b.servers) {
      for (const s of b.servers) {
        if (s.ip) serverIpExposed = true;
      }
    }
    assert(!serverIpExposed, 'Trading server IP addresses are NOT exposed in public API');

    // -----------------------------------------------------------------
    // 3. Compare Endpoint (GET /api/brokers/compare)
    // -----------------------------------------------------------------
    console.log('\n3. Comparison Engine API (GET /api/brokers/compare)');
    const compUrl = `${baseUrl}/api/brokers/compare?ids=${icMarkets ? `${pepperstone.id},${icMarkets.id}` : pepperstone.id}`;
    const compRes = await fetch(compUrl);
    assert(compRes.status === 200, 'GET /api/brokers/compare returns 200 OK');

    const compData = (await compRes.json()) as any;
    assert(Array.isArray(compData.data) && compData.data.length >= 1, 'Compare endpoint returns array of approved brokers');

    const compItem = compData.data[0];
    assert(compItem.fundingYears === undefined, 'Compare endpoint does not leak fundingYears');
    assert(compItem.clientActivity === undefined, 'Compare endpoint does not leak clientActivity');

    // -----------------------------------------------------------------
    // 4. Admin Broker Review & Credential Decryption
    // -----------------------------------------------------------------
    console.log('\n4. Admin Broker Dossier & Test Credential Reveal');
    const adminRes = await fetch(`${baseUrl}/api/admin/brokers/${pepperstone.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminRes.status === 200, 'GET /api/admin/brokers/:id returns 200 OK for ADMIN');

    const adminBrokerData = (await adminRes.json()) as any;
    const adminBroker = adminBrokerData.data;
    assert(Array.isArray(adminBroker.fundingYears) && adminBroker.fundingYears.length > 0, 'Admin can view confidential fundingYears');
    assert(Array.isArray(adminBroker.accountGroups) && adminBroker.accountGroups.length > 0, 'Admin can view account groups');

    // Reveal credentials test
    const razorGroup = pepperstone.accountGroups.find((g) => g.name === 'Razor Account') || pepperstone.accountGroups[0];
    const credRes = await fetch(`${baseUrl}/api/admin/brokers/${pepperstone.id}/account-group/${razorGroup.id}/reveal-credentials`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(credRes.status === 200, 'POST .../reveal-credentials returns 200 OK');

    const credData = (await credRes.json()) as any;
    assert(credData.data.name === razorGroup.name, 'Credentials response matches account group name');
    assert(credData.data.testPassword === 'TestRazor@2025!', `Password successfully decrypted to original plaintext: ${credData.data.testPassword}`);

    // Verify audit log entry was created
    const log = await prisma.auditLog.findFirst({
      where: {
        actorId: adminUser.id,
        action: 'REVEAL_TEST_CREDENTIALS',
        targetId: razorGroup.id,
      },
      orderBy: { createdAt: 'desc' },
    });
    assert(Boolean(log), 'Audit log successfully recorded REVEAL_TEST_CREDENTIALS event');

    // -----------------------------------------------------------------
    // 5. Broker Onboarding Partial Update Persistence (PATCH)
    // -----------------------------------------------------------------
    console.log('\n5. Broker Onboarding Patch Persistence');
    const patchRes = await fetch(`${baseUrl}/api/brokers/my/onboarding/services`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brokerToken}`,
      },
      body: JSON.stringify({
        availableTimeframes: ['M1', 'M5', 'M15', 'H1', 'D1'],
        languagesSupported: ['English', 'Spanish', 'French'],
      }),
    });
    assert(patchRes.status === 200, 'PATCH /api/brokers/my/onboarding/services returns 200 OK');

    const patchData = (await patchRes.json()) as any;
    assert(
      Array.isArray(patchData.data.availableTimeframes) && patchData.data.availableTimeframes.length === 5,
      'availableTimeframes persisted and returned'
    );
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await prisma.$disconnect();
  }

  console.log('\n======================================================');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runBrokerV2Suite().catch((err) => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});
