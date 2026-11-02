process.env.NODE_ENV = 'test';
import 'dotenv/config';
import http from 'http';
import app from '../app';
import { prisma } from '../config/database';
import { Role, ProviderStatus, ProviderVerificationStatus } from '@prisma/client';
import { generateAccessToken } from '../utils/jwt.utils';
import { DEMO_ACCOUNTS, isDemoEmail, getPublicDemoAccounts } from '../config/demo-accounts.config';
import { buildAnswerSchema } from '../modules/provider-forms/form.engine';

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
            parsed = data ? JSON.parse(data) : {};
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

async function runDemoTestSuite() {
  console.log('\n============================================================');
  console.log('🧪 RUNNING EDUTRADEFX DEMO ACCOUNTS TEST SUITE');
  console.log('============================================================\n');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));

  try {
    // 1. Test Public Demo Accounts Endpoint
    console.log('\n--- 1. Testing GET /api/auth/demo-accounts ---');
    const demoRes = await request(server, 'GET', '/api/auth/demo-accounts');
    assert(demoRes.status === 200, 'GET /api/auth/demo-accounts returns HTTP 200');
    assert(demoRes.body.success === true, 'Response contains success: true');
    assert(demoRes.body.data?.enabled === true, 'Response contains enabled: true');
    assert(Array.isArray(demoRes.body.data?.accounts), 'Accounts is an array');

    const accounts = demoRes.body.data?.accounts || [];
    assert(accounts.length >= 7, 'Returns at least 7 demo accounts');

    const returnedRoles = accounts.map((a: any) => a.role);
    assert(returnedRoles.includes(Role.ADMIN), 'Includes Admin role');
    assert(returnedRoles.includes(Role.BROKER), 'Includes Broker role');
    assert(returnedRoles.includes(Role.ACCOUNT_MANAGER), 'Includes Account Manager role');
    assert(returnedRoles.includes(Role.SIGNAL_PROVIDER), 'Includes Signal Provider role');
    assert(returnedRoles.includes(Role.SERVICE_PROVIDER), 'Includes Solutions Provider (SERVICE_PROVIDER) role');
    assert(returnedRoles.includes(Role.TUTOR), 'Includes Tutor role');
    assert(returnedRoles.includes(Role.STUDENT), 'Includes Trader / Student role');

    // No password hashes or sensitive IDs exposed
    assert(
      accounts.every((a: any) => !a.password && !a.passwordHash && !a.id && !a.twoFactorSecret),
      'Security: No password hashes or sensitive internal IDs are exposed'
    );

    // 2. Database Verification: Demo User Flags
    console.log('\n--- 2. Database Verification of Demo Users ---');
    const demoUsers = await prisma.user.findMany({
      where: { isDemoAccount: true },
      select: { email: true, role: true, isDemoAccount: true, isEmailVerified: true },
    });
    assert(demoUsers.length >= 7, 'Database has at least 7 flagged demo users');

    const solutionsUser = demoUsers.find((u) => u.email === 'solutions@edutradefx.com');
    assert(!!solutionsUser, 'solutions@edutradefx.com exists in database');
    assert(solutionsUser?.role === Role.SERVICE_PROVIDER, 'solutions user has SERVICE_PROVIDER role');
    assert(solutionsUser?.isDemoAccount === true, 'solutions user has isDemoAccount: true');
    assert(solutionsUser?.isEmailVerified === true, 'solutions user is immediately email-verified');

    // Check helper
    assert(isDemoEmail('solutions@edutradefx.com'), 'isDemoEmail correctly identifies solutions@edutradefx.com');
    assert(isDemoEmail('admin@edutradefx.com'), 'isDemoEmail correctly identifies admin@edutradefx.com');
    assert(!isDemoEmail('realtrader@example.com'), 'isDemoEmail correctly rejects real personal emails');

    // 3. Solutions Provider Profile & Real Publication
    console.log('\n--- 3. Verifying Solutions Provider Profile & Real Publication ---');
    const provider = await prisma.serviceProvider.findFirst({
      where: { slug: 'demo-solutions-ltd' },
      include: {
        contacts: true,
        addresses: true,
        categorySelections: true,
        published: true,
        products: true,
      },
    });

    assert(!!provider, 'Demo Solutions Ltd provider record exists in database');
    assert(provider?.status === ProviderStatus.APPROVED, 'Provider status is APPROVED');
    assert(provider?.brandName === 'Demo Solutions', 'Brand name is Demo Solutions');

    // Privacy Verification
    const primaryContact = provider?.contacts.find((c) => c.isPrimary);
    assert(!!primaryContact, 'Primary contact exists');
    assert(primaryContact?.isPublic === false, 'Privacy Security: Primary contact is strictly PRIVATE (isPublic: false)');

    // Real Publication verification
    assert(!!provider?.published, 'PublishedProvider entry exists via real publisher');
    const published = provider?.published;
    assert(Array.isArray(published?.categoryNumbers), 'PublishedProvider has categoryNumbers array');
    assert(published?.categoryNumbers.includes(1) === true, 'PublishedProvider includes Category 01');
    assert(published?.categoryNumbers.includes(3) === true, 'PublishedProvider includes Category 03');
    assert(published?.categoryNumbers.includes(6) === false, 'Category 06 (CHANGES_REQUESTED) is correctly excluded from publication');

    const snapshot: any = published?.snapshot;
    assert(!!snapshot, 'PublishedProvider contains serialized JSON snapshot');
    assert(Array.isArray(snapshot.categories), 'Snapshot has categories array');
    assert(snapshot.categories.some((c: any) => c.categoryNumber === 1 || c.number === 1), 'Snapshot categories includes Category 01');

    const publishedProducts = await prisma.publishedProduct.findMany({
      where: { providerId: provider?.id },
    });
    assert(publishedProducts.length >= 2, 'Published products count is at least 2 (Bridge Pro & Demo CRM Suite)');

    // 4. Form Engine Answer Schema Validation
    console.log('\n--- 4. Verifying Provider Form Engine Submit Validation ---');
    const cat1 = await prisma.providerCategory.findUnique({ where: { number: 1 } });
    const fieldsCat1 = await prisma.categoryFormField.findMany({
      where: { section: { categoryId: cat1!.id }, isActive: true },
    });
    const schemaCat1 = buildAnswerSchema(fieldsCat1, { mode: 'submit' });

    let schemaValidationPassed = false;
    try {
      schemaCat1.parse({
        serviceTypes: ['LIQUIDITY_BRIDGE', 'LIQUIDITY_AGGREGATOR'],
        productArchitecture: ['PROPRIETARY_ENGINE'],
        deploymentModel: 'DEDICATED_CLOUD_INSTANCE',
      });
      schemaValidationPassed = true;
    } catch {
      schemaValidationPassed = false;
    }
    assert(schemaValidationPassed, 'buildAnswerSchema validates Category 01 answers in submit mode');

    // 5. Server-side Demo Account Mutation Protection
    console.log('\n--- 5. Verifying Demo Account Mutation Protection ---');
    if (solutionsUser) {
      const demoToken = generateAccessToken({
        userId: (solutionsUser as any).id || (await prisma.user.findFirst({ where: { email: 'solutions@edutradefx.com' } }))!.id,
        role: Role.SERVICE_PROVIDER,
        isDemoAccount: true,
      });

      const changePassRes = await request(
        server,
        'PATCH',
        '/api/auth/change-password',
        {
          currentPassword: 'Demo@1234!',
          newPassword: 'HackedPassword123!',
        },
        { Authorization: `Bearer ${demoToken}` }
      );

      assert(
        changePassRes.status === 403,
        'PATCH /api/auth/change-password rejects demo account mutations with HTTP 403 Forbidden'
      );
      assert(
        changePassRes.body.message?.includes('restricted for demo accounts') ||
          changePassRes.body.errors === 'DEMO_ACCOUNT_RESTRICTED',
        'Returns restricted demo account error'
      );
    }

    // 6. Demo Admin Queue Pending Provider Verification
    console.log('\n--- 6. Verifying Pending Demo Provider for Admin Review Queue ---');
    const pendingProvider = await prisma.serviceProvider.findFirst({
      where: { slug: 'pending-tech-solutions' },
    });
    assert(!!pendingProvider, 'Pending Demo Provider exists in database');
    assert(pendingProvider?.status === ProviderStatus.SUBMITTED, 'Pending provider has status SUBMITTED');
    assert(
      pendingProvider?.verificationStatus === ProviderVerificationStatus.PENDING_REVIEW,
      'Pending provider has verificationStatus PENDING_REVIEW for Admin queue'
    );

    // 7. Directory API Endpoint Check
    console.log('\n--- 7. Verifying /api/solutions-providers directory payload ---');
    const dirRes = await request(server, 'GET', '/api/solutions-providers');
    assert(dirRes.status === 200, 'GET /api/solutions-providers returns HTTP 200');
    const dirProviders = dirRes.body?.data?.items || dirRes.body?.data?.providers || (Array.isArray(dirRes.body?.data) ? dirRes.body.data : []);
    assert(Array.isArray(dirProviders), 'Directory providers payload is an array');
    const demoDirItem = dirProviders.find((p: any) => p.slug === 'demo-solutions-ltd' || p.name === 'Demo Solutions' || p.name === 'Demo Solutions Ltd');
    assert(!!demoDirItem, 'Demo Solutions Ltd is visible in public solutions directory');

  } finally {
    server.close();
  }

  // Summary
  console.log('\n============================================================');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runDemoTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
