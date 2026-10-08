import 'dotenv/config';
import http from 'http';
import fs from 'fs';
import path from 'path';
import app from '../app';
import { prisma } from '../config/database';
import { generateAccessToken } from '../utils/jwt.utils';
import { Role } from '@prisma/client';

/**
 * Recursively checks that every property present in `golden` also exists in `actual`,
 * and has the same primitive type (or structure). Allows additive keys in `actual`.
 */
function assertAdditiveOnly(golden: any, actual: any, pathStr = ''): string[] {
  const violations: string[] = [];

  if (golden === null || golden === undefined) {
    return violations;
  }

  if (typeof golden !== typeof actual) {
    violations.push(`Type mismatch at ${pathStr}: expected ${typeof golden}, got ${typeof actual}`);
    return violations;
  }

  if (Array.isArray(golden)) {
    if (!Array.isArray(actual)) {
      violations.push(`Expected array at ${pathStr}, got ${typeof actual}`);
      return violations;
    }
    // Check first item structure if array is not empty
    if (golden.length > 0 && actual.length > 0) {
      violations.push(...assertAdditiveOnly(golden[0], actual[0], `${pathStr}[0]`));
    }
    return violations;
  }

  if (typeof golden === 'object') {
    for (const key of Object.keys(golden)) {
      if (!(key in actual)) {
        violations.push(`Missing key in response: ${pathStr}.${key}`);
      } else {
        violations.push(...assertAdditiveOnly(golden[key], actual[key], `${pathStr}.${key}`));
      }
    }
  }

  return violations;
}

async function verifyGolden() {
  const goldenDir = path.resolve(__dirname, 'golden');
  if (!fs.existsSync(goldenDir)) {
    throw new Error('Golden directory does not exist. Run capture-golden first.');
  }

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

  console.log(`🔍 Verifying live endpoints against Golden Snapshots at ${baseUrl}...`);

  const tests: Array<{
    name: string;
    url: string;
    headers: Record<string, string>;
    goldenFile: string;
  }> = [
    {
      name: 'GET /api/brokers',
      url: `${baseUrl}/api/brokers`,
      headers: {},
      goldenFile: 'get_brokers.json',
    },
    {
      name: 'GET /api/brokers/:slug',
      url: `${baseUrl}/api/brokers/pepperstone-global-markets`,
      headers: {},
      goldenFile: 'get_broker_slug.json',
    },
    {
      name: 'GET /api/brokers/compare',
      url: `${baseUrl}/api/brokers/compare?ids=${icMarkets ? `${pepperstone.id},${icMarkets.id}` : pepperstone.id}`,
      headers: {},
      goldenFile: 'get_broker_compare.json',
    },
    {
      name: 'GET /api/brokers/my/profile',
      url: `${baseUrl}/api/brokers/my/profile`,
      headers: { Authorization: `Bearer ${brokerToken}` },
      goldenFile: 'get_broker_my_profile.json',
    },
    {
      name: 'GET /api/admin/brokers',
      url: `${baseUrl}/api/admin/brokers`,
      headers: { Authorization: `Bearer ${adminToken}` },
      goldenFile: 'get_admin_brokers.json',
    },
  ];

  let totalViolations = 0;

  try {
    for (const t of tests) {
      const res = await fetch(t.url, { headers: t.headers });
      const actualJson = await res.json();
      const goldenContent = fs.readFileSync(path.join(goldenDir, t.goldenFile), 'utf-8');
      const goldenJson = JSON.parse(goldenContent);

      const violations = assertAdditiveOnly(goldenJson, actualJson, t.name);
      if (violations.length === 0) {
        console.log(`  ✓ ${t.name}: PASSED (Additive contract verified)`);
      } else {
        console.error(`  ✗ ${t.name}: FAILED with ${violations.length} violations:`);
        violations.forEach((v) => console.error(`     - ${v}`));
        totalViolations += violations.length;
      }
    }

    if (totalViolations > 0) {
      throw new Error(`Golden verification failed with ${totalViolations} breaking contract violations!`);
    }

    console.log('✅ All Golden Snapshot non-breaking contracts verified successfully!');
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

verifyGolden().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
