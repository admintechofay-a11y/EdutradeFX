import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.brokerBusinessArea.findMany();
    console.log(`Total BrokerBusinessArea rows: ${rows.length}`);
    for (const r of rows) {
      console.log(`ID: ${r.id} | BrokerId: ${r.brokerId} | countryOrRegion: "${r.countryOrRegion}" | clientsNote: "${r.clientsNote}"`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
