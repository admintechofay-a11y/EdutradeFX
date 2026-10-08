import { PrismaClient, BrokerOptionGroup } from '@prisma/client';
import { BROKER_OPTIONS } from './data/broker-options';

export async function seedBrokerOptions(prisma: PrismaClient) {
  console.log('🌱 Seeding Broker Options from Appendix A...');

  // Assert expected counts from Appendix A
  const countsByGroup: Record<string, number> = {};
  for (const opt of BROKER_OPTIONS) {
    countsByGroup[opt.group] = (countsByGroup[opt.group] || 0) + 1;
  }

  const EXPECTED_COUNTS: Record<BrokerOptionGroup, number> = {
    REGULATOR: 59, // 58 + OTHER
    LANGUAGE: 133,
    CURRENCY: 10, // 9 + OTHER
    LICENSE_STATUS: 8,
    DEPOSIT_BONUS: 21,
    LEVERAGE: 23,
    TIMEFRAME: 9,
  };

  for (const [group, expected] of Object.entries(EXPECTED_COUNTS)) {
    const actual = countsByGroup[group] || 0;
    if (actual !== expected) {
      throw new Error(
        `CRITICAL: BrokerOption count mismatch for ${group}. Expected ${expected}, got ${actual}`
      );
    }
  }

  console.log(`Upserting ${BROKER_OPTIONS.length} options...`);

  // Process in chunks to optimize network round-trips
  const chunkSize = 25;
  for (let i = 0; i < BROKER_OPTIONS.length; i += chunkSize) {
    const chunk = BROKER_OPTIONS.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map((opt) =>
        prisma.brokerOption.upsert({
          where: {
            group_code: {
              group: opt.group as BrokerOptionGroup,
              code: opt.code,
            },
          },
          update: {
            label: opt.label,
            sortOrder: opt.sortOrder,
            meta: opt.meta as any,
            isActive: true,
          },
          create: {
            group: opt.group as BrokerOptionGroup,
            code: opt.code,
            label: opt.label,
            sortOrder: opt.sortOrder,
            meta: opt.meta as any,
            isActive: true,
          },
        })
      )
    );
  }

  // Assert counts in database
  for (const [group, expected] of Object.entries(EXPECTED_COUNTS)) {
    const inDb = await prisma.brokerOption.count({
      where: { group: group as BrokerOptionGroup },
    });
    if (inDb !== expected) {
      throw new Error(`Database assertion failed for ${group}. Expected ${expected}, got ${inDb}`);
    }
  }

  console.log('✅ Broker Options successfully seeded and verified with exact Appendix A counts!');
}

if (require.main === module) {
  const p = new PrismaClient();
  seedBrokerOptions(p)
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(() => p.$disconnect());
}
