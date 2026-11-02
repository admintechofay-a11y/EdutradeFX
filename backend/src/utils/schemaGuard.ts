import { Role } from '@prisma/client';
import { prisma } from '../config/database';
import { logger } from './logger';

export interface SchemaSyncResult {
  inSync: boolean;
  missing: string[];
  dbRoles: string[];
  prismaRoles: string[];
}

/**
 * Validates that all Prisma Client Role enum values exist in the database.
 * In production: logs fatal error and exits(1) if any value is missing.
 * In development: logs a loud warning.
 */
export async function checkSchemaSync(): Promise<SchemaSyncResult> {
  const prismaRoles = Object.values(Role);
  try {
    const rows = await prisma.$queryRawUnsafe<{ r: string }[]>('SELECT unnest(enum_range(NULL::"Role")) as r');
    const dbRoles = rows.map((x) => x.r);
    const missing = prismaRoles.filter((role) => !dbRoles.includes(role));

    if (missing.length > 0) {
      const msg = `FATAL: Database is missing enum value(s): ${missing.join(', ')}. Run 'npx prisma migrate deploy'.`;
      if (process.env.NODE_ENV === 'production') {
        logger.error(msg);
        process.exit(1);
      } else {
        logger.warn(`⚠️ SCHEMA WARNING: ${msg}`);
      }
      return { inSync: false, missing, dbRoles, prismaRoles };
    }

    logger.info(`✅ Database schema check passed: ${dbRoles.length} Role enum values verified in sync.`);
    return { inSync: true, missing: [], dbRoles, prismaRoles };
  } catch (err: any) {
    logger.error('Failed to verify schema sync with database:', err);
    if (process.env.NODE_ENV === 'production') {
      logger.error('Exiting due to database schema verification failure.');
      process.exit(1);
    }
    return { inSync: false, missing: prismaRoles, dbRoles: [], prismaRoles };
  }
}

