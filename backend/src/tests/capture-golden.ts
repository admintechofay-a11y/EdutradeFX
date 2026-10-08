import 'dotenv/config';
import http from 'http';
import fs from 'fs';
import path from 'path';
import app from '../app';
import { prisma } from '../config/database';
import { generateAccessToken } from '../utils/jwt.utils';
import { Role } from '@prisma/client';

async function captureGolden() {
  const goldenDir = path.resolve(__dirname, 'golden');
  if (!fs.existsSync(goldenDir)) {
    fs.mkdirSync(goldenDir, { recursive: true });
  }

  // 1. Get users for auth tokens
  const adminUser = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
  });
  if (!adminUser) throw new Error('No admin user found for golden test');

  const brokerUser = await prisma.user.findFirst({
    where: { email: 'broker@pepperstone-demo.com' },
  });
  if (!brokerUser) throw new Error('No demo broker user found for golden test');

  const pepperstone = await prisma.broker.findUnique({
    where: { slug: 'pepperstone-global-markets' },
  });
  if (!pepperstone) throw new Error('Pepperstone broker not found');

  const icMarkets = await prisma.broker.findUnique({
    where: { slug: 'ic-markets-global' },
  });

  const adminToken = generateAccessToken({ userId: adminUser.id, role: Role.ADMIN });
  const brokerToken = generateAccessToken({ userId: brokerUser.id, role: Role.BROKER });

  // 2. Start ephemeral server
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 5000;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`📡 Capturing golden snapshots from ephemeral server at ${baseUrl}...`);

  try {
    // a. GET /api/brokers
    const resBrokers = await fetch(`${baseUrl}/api/brokers`);
    const jsonBrokers = await resBrokers.json();
    fs.writeFileSync(path.join(goldenDir, 'get_brokers.json'), JSON.stringify(jsonBrokers, null, 2));
    console.log('  ✓ Captured get_brokers.json');

    // b. GET /api/brokers/:slug
    const resSlug = await fetch(`${baseUrl}/api/brokers/pepperstone-global-markets`);
    const jsonSlug = await resSlug.json();
    fs.writeFileSync(path.join(goldenDir, 'get_broker_slug.json'), JSON.stringify(jsonSlug, null, 2));
    console.log('  ✓ Captured get_broker_slug.json');

    // c. GET /api/brokers/compare?ids=...
    const compareIds = icMarkets ? `${pepperstone.id},${icMarkets.id}` : pepperstone.id;
    const resCompare = await fetch(`${baseUrl}/api/brokers/compare?ids=${compareIds}`);
    const jsonCompare = await resCompare.json();
    fs.writeFileSync(path.join(goldenDir, 'get_broker_compare.json'), JSON.stringify(jsonCompare, null, 2));
    console.log('  ✓ Captured get_broker_compare.json');

    // d. GET /api/brokers/my/profile
    const resMyProfile = await fetch(`${baseUrl}/api/brokers/my/profile`, {
      headers: { Authorization: `Bearer ${brokerToken}` },
    });
    const jsonMyProfile = await resMyProfile.json();
    fs.writeFileSync(path.join(goldenDir, 'get_broker_my_profile.json'), JSON.stringify(jsonMyProfile, null, 2));
    console.log('  ✓ Captured get_broker_my_profile.json');

    // e. GET /api/admin/brokers
    const resAdminBrokers = await fetch(`${baseUrl}/api/admin/brokers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const jsonAdminBrokers = await resAdminBrokers.json();
    fs.writeFileSync(path.join(goldenDir, 'get_admin_brokers.json'), JSON.stringify(jsonAdminBrokers, null, 2));
    console.log('  ✓ Captured get_admin_brokers.json');

    console.log('🎉 Golden snapshots successfully captured in backend/src/tests/golden/!');
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

captureGolden().catch((err) => {
  console.error('Failed to capture golden snapshots:', err);
  process.exit(1);
});
