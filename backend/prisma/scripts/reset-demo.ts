import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import path from 'path';

dotenv.config();
const prisma = new PrismaClient();

export async function resetDemoAccounts(): Promise<void> {
  console.log('🔄 Starting Demo Accounts Reset (Demo-only rows)...');

  // Verify only demo accounts are targeted
  const demoUsers = await prisma.user.findMany({
    where: { isDemoAccount: true },
    select: { id: true, email: true },
  });

  const demoUserIds = demoUsers.map((u) => u.id);
  console.log(`Found ${demoUsers.length} demo accounts to reset.`);

  if (demoUserIds.length > 0) {
    // 1. Delete published provider snapshots owned by demo providers
    const demoProviders = await prisma.serviceProvider.findMany({
      where: { userId: { in: demoUserIds } },
      select: { id: true },
    });
    const demoProviderIds = demoProviders.map((p) => p.id);

    if (demoProviderIds.length > 0) {
      await prisma.publishedProduct.deleteMany({
        where: { providerId: { in: demoProviderIds } },
      });
      await prisma.publishedProvider.deleteMany({
        where: { providerId: { in: demoProviderIds } },
      });
      // Delete service providers cascade
      await prisma.serviceProvider.deleteMany({
        where: { id: { in: demoProviderIds } },
      });
    }

    // 2. Delete demo reviews, notifications, etc.
    await prisma.providerReview.deleteMany({
      where: { userId: { in: demoUserIds } },
    });
    await prisma.notification.deleteMany({
      where: { userId: { in: demoUserIds } },
    });
  }

  // 3. Re-run unified demo accounts seed
  console.log('Re-running unified demo accounts seed...');
  const seedScript = path.resolve(__dirname, '../seed-demo-accounts.ts');
  execSync(`npx ts-node "${seedScript}"`, { stdio: 'inherit' });

  console.log('✅ Demo accounts reset completed successfully.');
}

if (require.main === module) {
  resetDemoAccounts()
    .catch((err) => {
      console.error('❌ Error resetting demo accounts:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

