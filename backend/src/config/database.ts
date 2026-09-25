import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

declare global {
  // eslint-disable-next-line no-var
  var prismaClientGlobal: PrismaClient | undefined;
}

const getSanitizedDbUrl = (): string | undefined => {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  return url.replace(/[?&]channel_binding=[^&]+/, (match) => (match.startsWith('?') ? '?' : '')).replace(/\?&/, '?').replace(/[?&]$/, '');
};

const sanitizedUrl = getSanitizedDbUrl();

export const prisma =
  globalThis.prismaClientGlobal ||
  new PrismaClient({
    datasources: sanitizedUrl ? { db: { url: sanitizedUrl } } : undefined,
    log:
      process.env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'error' },
            { emit: 'stdout', level: 'info' },
            { emit: 'stdout', level: 'warn' },
          ]
        : [{ emit: 'stdout', level: 'error' }],
  });

if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  prisma.$on('query', (e: any) => {
    logger.debug(`Prisma Query: ${e.query} - Params: ${e.params} - Duration: ${e.duration}ms`);
  });
}

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaClientGlobal = prisma;
}

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully via Prisma PostgreSQL client');
  } catch (error) {
    logger.error('Database connection error:', error);
  }
};
