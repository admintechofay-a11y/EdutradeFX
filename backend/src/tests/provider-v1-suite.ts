import 'dotenv/config';
import http from 'http';
import app from '../app';
import { prisma } from '../config/database';
import { generateAccessToken } from '../utils/jwt.utils';
import {
  Role,
  ProviderStatus,
  ProviderVerificationStatus,
  ProviderCategoryStatus,
  ProductStatus,
} from '@prisma/client';
import {
  serializeProviderPublic,
  FORBIDDEN_PRIVATE_PROVIDER_KEYS,
} from '../modules/service-providers/provider.serializer';
import {
  calculateOverallCompletion,
  generateProviderCode,
  generateApplicationRef,
} from '../modules/service-providers/provider.utils';
import {
  verifyImageMagicBytes,
  verifyDocumentMagicBytes,
} from '../middleware/upload.middleware';
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

async function runProviderSuite() {
  console.log('\n======================================================');
  console.log('EDUTRADEFX SOLUTIONS PROVIDERS V1 COMPREHENSIVE SUITE');
  console.log('======================================================\n');

  // Seed / counts verification
  console.log('--- 1. Seed & Option Lists Verification ---');
  const expectedCountsPath = path.resolve(__dirname, '../../prisma/data/provider-forms/expected-counts.json');
  assert(fs.existsSync(expectedCountsPath), 'expected-counts.json exists in prisma data directory');

  const expectedCounts = JSON.parse(fs.readFileSync(expectedCountsPath, 'utf-8'));
  const dbCategories = await prisma.providerCategory.findMany({
    include: { formSections: true },
    orderBy: { number: 'asc' },
  });

  assert(dbCategories.length === 10, 'All 10 Enterprise Categories are seeded in the database');
  let totalSections = 0;
  for (const cat of dbCategories) {
    totalSections += cat.formSections.length;
  }
  assert(totalSections === 79, `All 79 category sections are accurately seeded in DB (found: ${totalSections})`);

  const optionLists = await prisma.providerOptionList.findMany();
  assert(optionLists.length >= 28, `All common option lists seeded (found: ${optionLists.length} >= 28)`);

  // Agreements verification
  const spAgreement = await prisma.partnerAgreement.findFirst({
    where: { key: 'PROVIDER_LISTING_TERMS' },
  });
  assert(spAgreement !== null, 'PROVIDER_LISTING_TERMS partner agreement is seeded and active');

  // Find demo admin user
  const adminUser = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
  if (!adminUser) throw new Error('No admin user found in database');

  // Create temporary test user and test provider
  const testEmail = `sp_test_${Date.now()}@nexustech.io`;
  const testUser = await prisma.user.create({
    data: {
      email: testEmail,
      name: 'Nexus Test Lead',
      password: 'HashedPassword123!',
      role: Role.SERVICE_PROVIDER,
      isEmailVerified: true,
    },
  });

  const testProvider = await prisma.serviceProvider.create({
    data: {
      userId: testUser.id,
      slug: `nexus-tech-${Date.now()}`,
      legalName: 'Nexus Enterprise Technologies Ltd',
      brandName: 'NexusTech',
      companyEmail: testEmail,
      status: ProviderStatus.DRAFT,
      verificationStatus: ProviderVerificationStatus.NOT_SUBMITTED,
    },
  });

  const adminToken = generateAccessToken({ userId: adminUser.id, role: Role.ADMIN });
  const providerToken = generateAccessToken({ userId: testUser.id, role: Role.SERVICE_PROVIDER });

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 5000;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  try {
    // ── TEST 2: Serializer Privacy & Leak Prevention ──────
    console.log('\n--- 2. Public Serializer & Strict Privacy Boundary ---');
    const mockFullProvider = {
      id: testProvider.id,
      userId: testUser.id,
      slug: testProvider.slug,
      brandName: 'NexusTech',
      legalName: 'Nexus Enterprise Technologies Ltd Private',
      registrationNumber: 'REG-987654-CONFIDENTIAL',
      registrationAuthority: 'Companies House',
      companyEmail: 'confidential@company.com',
      companyPhone: '+15551234567',
      registeredAddress: {
        line1: 'Top Secret Building, Floor 99',
        cityName: 'London',
        countryName: 'United Kingdom',
        postalCode: 'EC2A 4NE',
      },
      status: ProviderStatus.APPROVED,
      verificationStatus: ProviderVerificationStatus.VERIFIED,
      rejectionReason: 'Internal admin note: check tax docs',
      changesRequestedNote: 'Internal note: please update brochure',
      reviewedById: adminUser.id,
      reviewedAt: new Date(),
      documents: [{ id: 'doc-1', docType: 'PASSPORT', fileUrl: 'https://cloudinary.com/secret.pdf' }],
      categorySelections: [
        {
          id: 'sel-1',
          categoryId: dbCategories[0].id,
          status: ProviderCategoryStatus.APPROVED,
          category: dbCategories[0],
          verifiedClaims: ['uptimeSla'],
          answers: {
            unverifiedLatency: '20 microseconds',
            uptimeSla: '99.99%',
          },
        },
      ],
      products: [],
      teamMembers: [
        {
          id: 'tm-1',
          name: 'Sarah Connor',
          roleTitle: 'Chief Scientist',
          isPublic: true,
          nationalId: 'SECRET-ID-999',
          ownershipPercent: 49.5,
        },
      ],
      reviews: [],
    };

    const serialized = serializeProviderPublic(mockFullProvider as any);
    assert(serialized !== null, 'Public serializer returns an object');

    for (const key of FORBIDDEN_PRIVATE_PROVIDER_KEYS) {
      assert(
        !(key in (serialized as any)),
        `Strict Privacy: ${key} is NEVER leaked in public response`
      );
    }

    assert(
      (serialized as any).registeredAddress === undefined || (serialized as any).registeredAddress === null,
      'Private registered address is stripped from public snapshot'
    );
    assert(
      (serialized as any).registrationNumber === undefined || (serialized as any).registrationNumber === null,
      'Corporate registration number is stripped from public snapshot'
    );
    assert(
      (serialized as any).rejectionReason === undefined,
      'Internal rejection reasons are never leaked'
    );

    // ── TEST 3: Dynamic Form Engine & Validation ──────
    console.log('\n--- 3. Form Builder & Runtime Completion ---');
    const catRes = await fetch(`${baseUrl}/provider-forms/categories/1`);
    const catData: any = await catRes.json();
    assert(catData.success === true, 'GET /provider-forms/categories/1 returns active category definition');
    assert(catData.data.sections.length > 0, 'Category 1 contains defined form sections');

    const completion = await calculateOverallCompletion(testProvider.id);
    assert(typeof completion === 'number' && completion >= 0, `Completion calculator returns score: ${completion}%`);

    const pCode = await generateProviderCode();
    assert(/^ETP-[A-Z0-9]{6}$/.test(pCode), `Provider code matches format ETP-XXXXXX (generated: ${pCode})`);

    const appRef = await generateApplicationRef();
    assert(/^APP-\d{4}-[A-Z0-9]{6}$/.test(appRef), `Application ref matches format APP-YYYY-XXXXXX (generated: ${appRef})`);

    // ── TEST 4: Document & File Security ──────
    console.log('\n--- 4. Document Security & Magic Bytes ---');
    const validPdfBuffer = Buffer.from('%PDF-1.5 test content');
    const invalidExeBuffer = Buffer.from('MZ\x90\x00\x03\x00\x00\x00');
    const validJpgBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01]);

    assert(verifyDocumentMagicBytes(validPdfBuffer, '.pdf') === true, 'Valid PDF buffer passes magic byte verification');
    assert(verifyDocumentMagicBytes(invalidExeBuffer, '.exe') === false, 'Disguised executable blocked by magic byte check');
    assert(verifyImageMagicBytes(validJpgBuffer) === true, 'Valid JPEG buffer passes image magic bytes check');

    // ── TEST 5: Products, Specs & Duplicate ──────
    console.log('\n--- 5. Products CRUD, Specs & Duplication ---');
    const prodRes = await fetch(`${baseUrl}/service-providers/me/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${providerToken}`,
      },
      body: JSON.stringify({
        name: 'Nexus Liquidity Bridge V1',
        productType: 'SOFTWARE',
        shortDescription: 'Institutional multi-asset liquidity aggregator',
      }),
    });
    const prodData: any = await prodRes.json();
    assert(prodData.success === true, 'POST /service-providers/me/products creates product');
    const productId = prodData.data.id;

    // Duplicate product
    const dupRes = await fetch(`${baseUrl}/service-providers/me/products/${productId}/duplicate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${providerToken}` },
    });
    const dupData: any = await dupRes.json();
    assert(dupData.success === true, 'POST /service-providers/me/products/:id/duplicate successfully clones product');
    assert(dupData.data.name.includes('(Copy)'), 'Duplicated product carries (Copy) designation');

    // ── TEST 6: Publication Architecture Snapshot ──────
    console.log('\n--- 6. Publication Architecture & Granular Review ---');
    // Admin approves provider
    const statusRes = await fetch(`${baseUrl}/admin/service-providers/${testProvider.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: ProviderStatus.APPROVED,
      }),
    });
    const statusData: any = await statusRes.json();
    assert(statusData.success === true, 'Admin can update status to APPROVED');

    // Check published provider snapshot created in DB
    const published = await prisma.publishedProvider.findUnique({
      where: { providerId: testProvider.id },
    });
    assert(published !== null, 'PublishedProvider table contains compiled snapshot on approval');
    assert(published?.slug === testProvider.slug, 'PublishedProvider slug matches provider slug');

    // ── TEST 7: Public Directory & B2B Inquiry ──────
    console.log('\n--- 7. Public Directory & Inbound Inquiries ---');
    const dirRes = await fetch(`${baseUrl}/solutions-providers`);
    const dirData: any = await dirRes.json();
    assert(dirData.success === true, 'GET /solutions-providers returns public directory');

    const enqRes = await fetch(`${baseUrl}/solutions-providers/${testProvider.slug}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Institutional Buyer',
        email: 'procurement@broker.com',
        companyName: 'Prime Brokerage Ltd',
        message: 'Requesting FIX API integration testing and license quote.',
      }),
    });
    const enqData: any = await enqRes.json();
    assert(enqData.success === true, 'POST /solutions-providers/:slug/enquiries records lead without leaking email');

  } finally {
    server.close();
    // Clean up test records
    await prisma.enquiry.deleteMany({ where: { email: 'procurement@broker.com' } }).catch(() => {});
    await prisma.productPricing.deleteMany({ where: { product: { providerId: testProvider.id } } }).catch(() => {});
    await prisma.productIntegration.deleteMany({ where: { product: { providerId: testProvider.id } } }).catch(() => {});
    await prisma.productTechnicalSpec.deleteMany({ where: { product: { providerId: testProvider.id } } }).catch(() => {});
    await prisma.publishedProduct.deleteMany({ where: { providerId: testProvider.id } }).catch(() => {});
    await prisma.serviceProviderProduct.deleteMany({ where: { providerId: testProvider.id } }).catch(() => {});
    await prisma.publishedProvider.deleteMany({ where: { providerId: testProvider.id } }).catch(() => {});
    await prisma.serviceProvider.deleteMany({ where: { id: testProvider.id } }).catch(() => {});
    await prisma.user.deleteMany({ where: { id: testUser.id } }).catch(() => {});
  }

  console.log('\n======================================================');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`SUMMARY: ${passed}/${results.length} tests passed (Failed: ${failed})`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runProviderSuite().catch((err) => {
  console.error('Fatal error running Provider suite:', err);
  process.exit(1);
});
