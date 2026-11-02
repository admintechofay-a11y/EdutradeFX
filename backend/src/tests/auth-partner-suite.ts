process.env.NODE_ENV = 'test';
import 'dotenv/config';
import http from 'http';
import app from '../app';
import { prisma } from '../config/database';
import { Role, ProviderAccountType, ProviderStatus } from '@prisma/client';
import { PARTNER_ROLES } from '../config/constants';
import { generateAccessToken } from '../utils/jwt.utils';
import { checkSchemaSync } from '../utils/schemaGuard';
import fs from 'fs';
import path from 'path';

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

async function request(
  server: http.Server,
  method: string,
  urlPath: string,
  body?: any,
  headers: Record<string, string> = {}
): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const port = (server.address() as any).port;
    const postData = body ? JSON.stringify(body) : '';

    const reqHeaders: Record<string, string> = {
      'x-test-suite': 'true',
      ...headers,
      ...(body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData).toString() } : {}),
    };

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: urlPath,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed: any;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode || 500, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runAuthPartnerSuite() {
  console.log('\n======================================================');
  console.log('EDUTRADEFX PARTNER REGISTRATION & SCHEMA SYNC SUITE');
  console.log('======================================================\n');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));

  try {
    // ── 1. Single Source of Truth for Partner Roles ─────────────────────────
    console.log('--- 1. Allowed Partner Roles Endpoint & Schema Truth ---');
    const partnerRolesRes = await request(server, 'GET', '/api/auth/partner-roles');
    assert(partnerRolesRes.status === 200, 'GET /api/auth/partner-roles returns 200');
    assert(
      Array.isArray(partnerRolesRes.body?.data?.roles) &&
        partnerRolesRes.body.data.roles.includes(Role.SERVICE_PROVIDER),
      'GET /api/auth/partner-roles includes SERVICE_PROVIDER'
    );
    assert(
      partnerRolesRes.body?.data?.roles.length === PARTNER_ROLES.length,
      `partner-roles returns exactly ${PARTNER_ROLES.length} partner roles from constants`
    );

    // ── 2. Role Accept/Reject Matrix ────────────────────────────────────────
    console.log('\n--- 2. Partner Registration Role Accept/Reject Matrix ---');
    for (const allowedRole of PARTNER_ROLES) {
      const email = `test.role.${allowedRole.toLowerCase()}.${Date.now()}@example.com`;
      const payload: any = {
        name: `Test ${allowedRole}`,
        email,
        password: 'Str0ng!Password#2026',
        phone: '+919876543210',
        role: allowedRole,
        consent: true,
      };

      if (allowedRole === Role.SERVICE_PROVIDER) {
        payload.accountType = ProviderAccountType.REGISTERED_COMPANY;
        payload.contactFullName = 'Test Provider Contact';
        payload.contactTitle = 'Managing Partner';
        payload.consentTerms = true;
        payload.consentPrivacy = true;
      }

      const res = await request(server, 'POST', '/api/auth/register-partner', payload);
      assert(
        res.status === 201 || res.status === 202,
        `register-partner accepts valid partner role: ${allowedRole} (HTTP 201/202)`
      );
      // Clean up test user
      await prisma.user.deleteMany({ where: { email } }).catch(() => {});
      await prisma.pendingRegistration.deleteMany({ where: { email } }).catch(() => {});
    }

    // Disallowed Roles (ADMIN, STUDENT, FOO)
    for (const invalidRole of ['ADMIN', 'STUDENT', 'FOO_INVALID']) {
      const email = `test.invalid.${invalidRole.toLowerCase()}.${Date.now()}@example.com`;
      const res = await request(server, 'POST', '/api/auth/register-partner', {
        name: 'Invalid Test',
        email,
        password: 'Str0ng!Password#2026',
        phone: '+919876543210',
        role: invalidRole,
        consent: true,
      });

      assert(res.status === 400, `register-partner rejects disallowed role ${invalidRole} (HTTP 400)`);
      const errorMsg = JSON.stringify(res.body);
      assert(
        errorMsg.includes('Invalid partner role') && errorMsg.includes('SERVICE_PROVIDER'),
        `Error message for ${invalidRole} is generated from PARTNER_ROLES and mentions SERVICE_PROVIDER`
      );
    }

    // ── 3. Solutions Provider Form 1 Validation & Consents ──────────────────
    console.log('\n--- 3. Form 1 Provider Validation & Explicit Consents ---');
    const baseSpPayload = {
      name: 'Solutions Corp',
      email: `test.sp.val.${Date.now()}@example.com`,
      password: 'Str0ng!Password#2026',
      phone: '+919876543210',
      role: 'SERVICE_PROVIDER',
      consent: true,
      accountType: 'REGISTERED_COMPANY',
      contactFullName: 'Jordan Lee',
      contactTitle: 'CTO',
      consentTerms: true,
      consentPrivacy: true,
    };

    // Missing consentTerms
    const resNoTerms = await request(server, 'POST', '/api/auth/register-partner', {
      ...baseSpPayload,
      email: `noterms.${Date.now()}@example.com`,
      consentTerms: false,
    });
    assert(resNoTerms.status === 400, 'Reject SERVICE_PROVIDER with consentTerms: false (HTTP 400)');

    // Missing consentPrivacy
    const resNoPrivacy = await request(server, 'POST', '/api/auth/register-partner', {
      ...baseSpPayload,
      email: `noprivacy.${Date.now()}@example.com`,
      consentPrivacy: false,
    });
    assert(resNoPrivacy.status === 400, 'Reject SERVICE_PROVIDER with consentPrivacy: false (HTTP 400)');

    // Missing accountType
    const resNoAccountType = await request(server, 'POST', '/api/auth/register-partner', {
      ...baseSpPayload,
      email: `noacctype.${Date.now()}@example.com`,
      accountType: undefined,
    });
    assert(resNoAccountType.status === 400, 'Reject SERVICE_PROVIDER with missing accountType (HTTP 400)');

    // Missing contactTitle
    const resNoTitle = await request(server, 'POST', '/api/auth/register-partner', {
      ...baseSpPayload,
      email: `notitle.${Date.now()}@example.com`,
      contactTitle: '',
    });
    assert(resNoTitle.status === 400, 'Reject SERVICE_PROVIDER with missing contactTitle (HTTP 400)');

    // AccountType OTHER without accountTypeOther
    const resOtherWithoutText = await request(server, 'POST', '/api/auth/register-partner', {
      ...baseSpPayload,
      email: `othernotext.${Date.now()}@example.com`,
      accountType: 'OTHER',
      accountTypeOther: '',
    });
    assert(resOtherWithoutText.status === 400, 'Reject accountType OTHER without accountTypeOther (HTTP 400)');

    // ── 4. Verify Flow: Direct Active Account, Private Contact & Idempotency ──
    console.log('\n--- 4. Direct Active Registration, Private Contact & Safe Verification ---');
    const verifyEmail = `sp.verify.${Date.now()}@example.com`;
    const regRes = await request(server, 'POST', '/api/auth/register-partner', {
      ...baseSpPayload,
      email: verifyEmail,
      contactFullName: 'Taylor Morgan',
      contactTitle: 'Chief Compliance Officer',
    });
    assert(regRes.status === 201 || regRes.status === 202, 'Provider registration initiated (HTTP 201/202)');

    // Assert user row exists immediately and is verified
    const userAfter = await prisma.user.findUnique({ where: { email: verifyEmail } });
    assert(userAfter !== null, 'User row created immediately upon registration');
    assert(userAfter !== null && userAfter.role === Role.SERVICE_PROVIDER, 'User created with role SERVICE_PROVIDER');
    assert(userAfter !== null && userAfter.isEmailVerified === true, 'User is active and isEmailVerified: true');

    // Assert ServiceProvider created with status DRAFT
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: userAfter!.id },
      include: { contacts: true },
    });
    assert(provider !== null && provider.status === ProviderStatus.DRAFT, 'ServiceProvider created with status DRAFT');

    // Assert Primary Contact created with isPublic: false (Private Contact Bug Fix)
    const primaryContact = provider!.contacts.find((c) => c.isPrimary);
    assert(primaryContact !== undefined, 'Primary ProviderContact exists');
    assert(primaryContact?.fullName === 'Taylor Morgan', 'Primary contact uses contactFullName');
    assert(primaryContact?.isPublic === false, 'Primary ProviderContact isPublic is FALSE (private by default)');

    // Verification endpoint handled safely without 500 error
    const doubleVerifyRes = await request(server, 'GET', `/api/auth/verify-email/test-token-123`);
    assert(doubleVerifyRes.status === 200 || doubleVerifyRes.status === 400 || doubleVerifyRes.status === 410, 'Verification link handled safely without 500 error');

    // Clean up test provider
    if (userAfter) {
      await prisma.user.delete({ where: { id: userAfter.id } }).catch(() => {});
    }

    // ── 5. Database Schema & Role Enum Sync ─────────────────────────────────
    console.log('\n--- 5. Database Schema & Role Enum Sync ---');
    const syncResult = await checkSchemaSync();
    assert(syncResult.inSync === true, 'checkSchemaSync() reports inSync: true');
    assert(syncResult.missing.length === 0, 'No missing Role enum values between Prisma and database');
    for (const r of Object.values(Role)) {
      assert(syncResult.dbRoles.includes(r), `Role.${r} exists in database Role enum`);
    }

    // ── 6. Health & System Status Endpoints ─────────────────────────────────
    console.log('\n--- 6. Health & System Status Endpoints ---');
    const healthRes = await request(server, 'GET', '/api/health');
    assert(healthRes.status === 200, 'GET /api/health returns 200');
    assert(healthRes.body?.status === 'ok', 'Health status is ok');
    assert('version' in healthRes.body && 'commit' in healthRes.body && 'builtAt' in healthRes.body, 'Health contains version, commit, builtAt metadata');
    assert(!('databaseUrl' in healthRes.body) && !('secret' in healthRes.body), 'Health contains NO database credentials or secrets');

    // Admin System Status Guard
    const statusAnon = await request(server, 'GET', '/api/admin/system/status');
    assert(statusAnon.status === 401, 'Anonymous GET /api/admin/system/status returns 401 Unauthorized');

    const traderToken = generateAccessToken({ userId: 'fake-trader-id', role: Role.STUDENT });
    const statusTrader = await request(server, 'GET', '/api/admin/system/status', undefined, {
      Authorization: `Bearer ${traderToken}`,
    });
    assert(statusTrader.status === 403, 'Trader GET /api/admin/system/status returns 403 Forbidden');

    const adminToken = generateAccessToken({ userId: 'fake-admin-id', role: Role.ADMIN });
    const statusAdmin = await request(server, 'GET', '/api/admin/system/status', undefined, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(statusAdmin.status === 200, 'Admin GET /api/admin/system/status returns 200 OK');
    assert(statusAdmin.body?.data?.inSync === true, 'Admin system status reports inSync: true');
    assert(statusAdmin.body?.data?.dbRoles.includes('SERVICE_PROVIDER'), 'Admin system status dbRoles includes SERVICE_PROVIDER');

    // ── 7. Frontend Role Cards Synchronization ──────────────────────────────
    console.log('\n--- 7. Frontend Role Cards Alignment Check ---');
    const registerPagePath = path.resolve(__dirname, '../../../frontend/src/app/(auth)/register/page.tsx');
    assert(fs.existsSync(registerPagePath), 'Frontend register/page.tsx exists');
    const registerContent = fs.readFileSync(registerPagePath, 'utf-8');
    for (const partnerRole of PARTNER_ROLES) {
      assert(
        registerContent.includes(`role: '${partnerRole}'`) || registerContent.includes(`'${partnerRole}' as Role`),
        `Frontend register page cards include ${partnerRole}`
      );
    }
  } finally {
    server.close();
  }

  // Summary
  console.log('\n------------------------------------------------------');
  const failed = results.filter((r) => !r.passed);
  console.log(`TOTAL: ${results.length} | PASSED: ${results.length - failed.length} | FAILED: ${failed.length}`);
  if (failed.length > 0) {
    console.error('Failed checks:');
    failed.forEach((f) => console.error(`  - ${f.name}: ${f.error}`));
    process.exit(1);
  } else {
    console.log('ALL PARTNER REGISTRATION & SCHEMA TESTS PASSED GREEN!');
  }
}

runAuthPartnerSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

