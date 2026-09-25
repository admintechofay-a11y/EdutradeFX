import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import { generalLimiter } from './middleware/rateLimit.middleware';
import { errorHandler } from './middleware/error.middleware';
import { sanitizeBody } from './middleware/sanitize.middleware';
import { logger } from './utils/logger';

// Route imports (one per module)
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import brokerRoutes from './modules/brokers/broker.routes';
import accountManagerRoutes from './modules/account-managers/am.routes';
import signalProviderRoutes from './modules/signal-providers/sp.routes';
import lmsRoutes from './modules/lms/lms.routes';
import courseRoutes from './modules/lms/course.routes';
import aiRoutes from './modules/ai-assistant/ai.routes';
import blogRoutes from './modules/blog/blog.routes';
import complaintRoutes from './modules/complaints/complaint.routes';
import adRoutes from './modules/advertisements/ad.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import adminRoutes from './modules/admin/admin.routes';
import contactRoutes from './modules/contact/contact.routes';

const app = express();

// Trust first proxy (necessary for secure cookies, rate limiting, and client IP detection)
app.set('trust proxy', 1);

// ── SECURITY MIDDLEWARE ────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:', 'res.cloudinary.com'],
        scriptSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

const envOrigins = [
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
  process.env.NEXT_PUBLIC_APP_URL,
]
  .filter(Boolean)
  .flatMap((url) => (url as string).split(',').map((u) => u.trim()));

const allowedOrigins = Array.from(
  new Set([
    ...envOrigins,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
  ])
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        /^https:\/\/([a-zA-Z0-9_-]+\.)?vercel\.app$/.test(origin) ||
        /^https:\/\/([a-zA-Z0-9_-]+\.)?edutradefx\.com$/.test(origin)
      ) {
        return callback(null, true);
      }

      // In development mode only, permit other local ports
      if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS policy violation: Origin '${origin}' is not authorized.`),
        false
      );
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(hpp()); // Prevent HTTP parameter pollution

// ── GENERAL MIDDLEWARE ─────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(sanitizeBody);
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.http ? logger.http(msg.trim()) : logger.info(msg.trim()) },
  })
);
app.use(generalLimiter);

// ── ROUTES ─────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/brokers', brokerRoutes);
app.use('/api/account-managers', accountManagerRoutes);
app.use('/api/signal-providers', signalProviderRoutes);
app.use('/api/lms', lmsRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/advertisements', adRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// ── HEALTH CHECK ──────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'EdutradeFX Backend API',
    timestamp: new Date().toISOString(),
  });
});

// ── ERROR HANDLER (must be last) ──────────────────
app.use(errorHandler);

export default app;
