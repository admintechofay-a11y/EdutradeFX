import './config/env'; // Validate environment variables on startup
import app from './app';
import { connectDB } from './config/database';
import { verifyEmailConnection } from './config/email';
import { logger } from './utils/logger';

const PORT = parseInt(process.env.PORT || '5000', 10);

const startServer = async () => {
  try {
    // 1. Initialize Database connection
    await connectDB();

    // 2. Verify Email SMTP connection
    await verifyEmailConnection();

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
