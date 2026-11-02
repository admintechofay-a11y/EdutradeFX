import './config/env'; // Validate environment variables on startup
import app from './app';
import { connectDB, prisma } from './config/database';
import { checkSchemaSync } from './utils/schemaGuard';
import { verifyEmailConnection } from './config/email';
import { logger } from './utils/logger';

const PORT = parseInt(process.env.PORT || '5000', 10);

const startServer = async () => {
  try {
    // 1. Initialize Database connection
    await connectDB();

    // 1.1 Verify Schema and Enum Sync (fail fast on missing enum values)
    await checkSchemaSync();

    // 1.2 Safety audit: warn if demo logins are active on a DB with real users
    if (process.env.NODE_ENV === 'production' && process.env.DEMO_LOGIN_ENABLED === 'true') {
      const nonDemoUsers = await prisma.user.count({ where: { isDemoAccount: false } });
      if (nonDemoUsers > 0) {
        logger.warn(
          '⚠️ CRITICAL SECURITY WARNING: Demo logins are enabled on a database with real users. Use a separate demo database.'
        );
      }
    }

    // 2. Verify Email SMTP connection (non-blocking in development)
    verifyEmailConnection().catch(() => {});

    // 3. Start Express HTTP Server
    app.listen(PORT, () => {
      logger.info(`🚀 EdutradeFX Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      logger.info(`Health check available at: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start EdutradeFX server:', error);
    process.exit(1);
  }
};

startServer();
