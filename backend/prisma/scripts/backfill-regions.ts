import { PrismaClient } from '@prisma/client';

export const REGION_MAP: Record<string, string> = {
  UK_EEA: 'United Kingdom & Europe (EEA)',
  EUROPE_NON_EEA: 'Europe (Non-EEA)',
  NORTH_AMERICA: 'North America',
  CENTRAL_AMERICA: 'Central America',
  CARIBBEAN: 'Caribbean',
  SOUTH_AMERICA: 'South America',
  MIDDLE_EAST: 'Middle East',
  NORTH_AFRICA: 'North Africa',
  WEST_AFRICA: 'West Africa',
  EAST_AFRICA: 'East Africa',
  CENTRAL_AFRICA: 'Central Africa',
  SOUTHERN_AFRICA: 'Southern Africa',
  SOUTH_ASIA: 'South Asia',
  CENTRAL_ASIA: 'Central Asia',
  EAST_ASIA: 'East Asia',
  SOUTHEAST_ASIA: 'Southeast Asia',
  ANZ: 'Australia & New Zealand',
  PACIFIC_ISLANDS: 'Pacific Islands',
  GLOBAL: 'Global / Worldwide',
  OTHER_EMERGING: 'Other / Emerging Markets',
};

export function mapOldTextToRegionCode(text: string): { code: string; isFallback: boolean } {
  const t = (text || '').toLowerCase().trim();
  if (!t) return { code: 'OTHER_EMERGING', isFallback: true };

  if (/\b(global|worldwide|all|everywhere)\b/i.test(t)) {
    return { code: 'GLOBAL', isFallback: false };
  }
  if (/\b(india|pakistan|bangladesh|sri lanka|nepal|bhutan|maldives|south asia)\b/i.test(t)) {
    return { code: 'SOUTH_ASIA', isFallback: false };
  }
  if (/\b(uae|dubai|abu dhabi|saudi|qatar|bahrain|kuwait|oman|middle east|mena|gcc)\b/i.test(t)) {
    return { code: 'MIDDLE_EAST', isFallback: false };
  }
  if (/\b(nigeria|ghana|senegal|ivory coast|cote d'ivoire|west africa)\b/i.test(t)) {
    return { code: 'WEST_AFRICA', isFallback: false };
  }
  if (/\b(kenya|tanzania|ethiopia|uganda|rwanda|east africa)\b/i.test(t)) {
    return { code: 'EAST_AFRICA', isFallback: false };
  }
  if (/\b(south africa|botswana|namibia|lesotho|swaziland|eswatini|southern africa)\b/i.test(t)) {
    return { code: 'SOUTHERN_AFRICA', isFallback: false };
  }
  if (/\b(cameroon|gabon|drc|congo|central africa)\b/i.test(t)) {
    return { code: 'CENTRAL_AFRICA', isFallback: false };
  }
  if (/\b(egypt|morocco|tunisia|algeria|libya|north africa)\b/i.test(t)) {
    return { code: 'NORTH_AFRICA', isFallback: false };
  }
  if (/\b(usa|us|united states|canada|mexico|north america)\b/i.test(t)) {
    return { code: 'NORTH_AMERICA', isFallback: false };
  }
  if (/\b(central america|panama|costa rica|guatemala|honduras|el salvador|belize|nicaragua)\b/i.test(t)) {
    return { code: 'CENTRAL_AMERICA', isFallback: false };
  }
  if (/\b(caribbean|bahamas|cayman|bermuda|barbados|jamaica)\b/i.test(t)) {
    return { code: 'CARIBBEAN', isFallback: false };
  }
  if (/\b(brazil|argentina|chile|colombia|peru|south america|latin america|latam)\b/i.test(t)) {
    return { code: 'SOUTH_AMERICA', isFallback: false };
  }
  if (/\b(uk|united kingdom|britain|england|europe|eu|european union|germany|france|italy|spain|eea|cyprus)\b/i.test(t)) {
    return { code: 'UK_EEA', isFallback: false };
  }
  if (/\b(switzerland|swiss|balkans|serbia|albania|bosnia|non-eea)\b/i.test(t)) {
    return { code: 'EUROPE_NON_EEA', isFallback: false };
  }
  if (/\b(china|japan|korea|south korea|mongolia|taiwan|east asia)\b/i.test(t)) {
    return { code: 'EAST_ASIA', isFallback: false };
  }
  if (/\b(singapore|malaysia|thailand|indonesia|vietnam|philippines|southeast asia|asean)\b/i.test(t)) {
    return { code: 'SOUTHEAST_ASIA', isFallback: false };
  }
  if (/\b(australia|new zealand|anz|oceania|asia-pacific|apac)\b/i.test(t)) {
    return { code: 'ANZ', isFallback: false };
  }
  if (/\b(pacific island|fiji|vanuatu|papua|samoa)\b/i.test(t)) {
    return { code: 'PACIFIC_ISLANDS', isFallback: false };
  }
  if (/\b(kazakhstan|uzbekistan|kyrgyzstan|tajikistan|turkmenistan|central asia)\b/i.test(t)) {
    return { code: 'CENTRAL_ASIA', isFallback: false };
  }

  return { code: 'OTHER_EMERGING', isFallback: true };
}

export async function backfillRegions(prisma: PrismaClient) {
  console.log('🔄 Starting backfill of BrokerBusinessArea regions...');

  const allRows = await prisma.brokerBusinessArea.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  console.log(`Found ${allRows.length} total BrokerBusinessArea rows.`);

  const unmappedRows: { id: string; text: string; brokerId: string }[] = [];
  let mappedCount = 0;
  let fallbackCount = 0;

  // Group by brokerId
  const byBroker = new Map<string, typeof allRows>();
  for (const row of allRows) {
    if (!byBroker.has(row.brokerId)) {
      byBroker.set(row.brokerId, []);
    }
    byBroker.get(row.brokerId)!.push(row);
  }

  for (const [brokerId, rows] of byBroker.entries()) {
    // Map each row
    const mappedItems = rows.map((r) => {
      // If row already has valid regionCode, use it
      if (r.regionCode && REGION_MAP[r.regionCode]) {
        return {
          row: r,
          code: r.regionCode,
          isFallback: false,
          label: REGION_MAP[r.regionCode],
        };
      }
      const mapped = mapOldTextToRegionCode(r.countryOrRegion);
      if (mapped.isFallback) {
        unmappedRows.push({ id: r.id, text: r.countryOrRegion, brokerId: r.brokerId });
        return {
          row: r,
          code: mapped.code,
          isFallback: true,
          label: r.countryOrRegion, // Preserve original text until broker re-saves
        };
      }
      return {
        row: r,
        code: mapped.code,
        isFallback: false,
        label: REGION_MAP[mapped.code],
      };
    });

    // Check if GLOBAL is present
    const hasGlobal = mappedItems.some((item) => item.code === 'GLOBAL');

    let surviving: typeof mappedItems = [];
    let toDeleteIds: string[] = [];

    if (hasGlobal) {
      // Keep only the first GLOBAL row
      const globalItem = mappedItems.find((item) => item.code === 'GLOBAL')!;
      surviving = [globalItem];
      toDeleteIds = mappedItems
        .filter((item) => item.row.id !== globalItem.row.id)
        .map((item) => item.row.id);
    } else {
      // De-duplicate by code (keep lowest sortOrder, which is earlier in list)
      const seenCodes = new Set<string>();
      for (const item of mappedItems) {
        if (!seenCodes.has(item.code)) {
          seenCodes.add(item.code);
          surviving.push(item);
        } else {
          toDeleteIds.push(item.row.id);
        }
      }
    }

    // Delete duplicates
    if (toDeleteIds.length > 0) {
      await prisma.brokerBusinessArea.deleteMany({
        where: { id: { in: toDeleteIds } },
      });
      console.log(`Broker ${brokerId}: deleted ${toDeleteIds.length} duplicate/non-global rows.`);
    }

    // Update surviving rows
    for (let i = 0; i < surviving.length; i++) {
      const item = surviving[i];
      if (item.isFallback) {
        fallbackCount++;
      } else {
        mappedCount++;
      }
      await prisma.brokerBusinessArea.update({
        where: { id: item.row.id },
        data: {
          regionCode: item.code,
          countryOrRegion: item.label,
          sortOrder: i + 1,
        },
      });
    }
  }

  console.log('\n========================================');
  console.log('BACKFILL REGIONAL FOOTPRINT SUMMARY');
  console.log('========================================');
  console.log(`Total rows processed: ${allRows.length}`);
  console.log(`Successfully mapped rows: ${mappedCount}`);
  console.log(`Fallback rows (OTHER_EMERGING): ${fallbackCount}`);
  if (unmappedRows.length > 0) {
    console.log(`\nUnmapped rows (${unmappedRows.length}):`);
    for (const u of unmappedRows) {
      console.log(`  - [ID: ${u.id}] (Broker: ${u.brokerId}): "${u.text}"`);
    }
  } else {
    console.log('Zero unmapped rows — 100% matched to defined regional codes!');
  }
  console.log('========================================\n');
}

if (require.main === module) {
  const p = new PrismaClient();
  backfillRegions(p)
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(() => p.$disconnect());
}
