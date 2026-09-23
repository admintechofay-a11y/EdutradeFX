const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();

// Trust proxy for reverse proxies (Nginx / Cloudflare) to ensure accurate client IP and HTTPS detection
app.set('trust proxy', 1);

// Security Headers with Helmet.js
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: [
          "'self'",
          'data:',
          'https://res.cloudinary.com',
          'https://*.cloudinary.com',
          'https://images.unsplash.com',
        ],
        connectSrc: ["'self'", 'https://api.cloudinary.com'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// Production-domain restricted CORS configuration
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? [
        process.env.CLIENT_URL || 'https://edutradefx.com',
        process.env.ADMIN_URL || 'https://admin.edutradefx.com',
      ].filter(Boolean)
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
      ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost'))
      ) {
        return callback(null, true);
      }
      return callback(
        new Error('CORS policy: Not allowed by CORS for this domain.'),
        false
      );
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

// Body and cookie parsing
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB injection prevention (data sanitization against NoSQL query injection)
app.use(mongoSanitize());

// XSS Protection (data sanitization against cross-site scripting)
app.use(xss());

// General API rate limiting
app.use('/api', apiLimiter);

app.use(morgan('dev'));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'EduTradeFX RESTful API',
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date(),
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Route Groups
const authRoutes = require('./routes/auth.routes');
const brokerRoutes = require('./routes/broker.routes');
const accountManagerRoutes = require('./routes/accountManager.routes');
const signalProviderRoutes = require('./routes/signalProvider.routes');
const reviewRoutes = require('./routes/review.routes');
const courseRoutes = require('./routes/course.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
const complaintRoutes = require('./routes/complaint.routes');
const contactRoutes = require('./routes/contact.routes');
const adminRoutes = require('./routes/admin.routes');

// Mount under /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/brokers', brokerRoutes);
app.use('/api/account-managers', accountManagerRoutes);
app.use('/api/signal-providers', signalProviderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lms/courses', courseRoutes);
app.use('/api/lms', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// Mount under root as direct fallback (e.g. /complaints, /courses/me/payouts)
app.use('/auth', authRoutes);
app.use('/brokers', brokerRoutes);
app.use('/account-managers', accountManagerRoutes);
app.use('/signal-providers', signalProviderRoutes);
app.use('/reviews', reviewRoutes);
app.use('/courses', courseRoutes);
app.use('/lms/courses', courseRoutes);
app.use('/lms', courseRoutes);
app.use('/enrollments', enrollmentRoutes);
app.use('/complaints', complaintRoutes);
app.use('/contact', contactRoutes);
app.use('/admin', adminRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found`,
  });
});

// Centralized error handling
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edutradefx';

// Database connection & Server start
const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`[Database] Connected to MongoDB: ${MONGODB_URI}`);
  } catch (err) {
    console.warn(`[Database Warning] Could not connect to MongoDB: ${err.message}`);
    console.warn(
      `[Database Warning] The API server is running in standalone mode. Configure MONGODB_URI when MongoDB is ready.`
    );
  }

  app.listen(PORT, () => {
    console.log(`[EduTradeFX Server] REST API running on http://localhost:${PORT}`);
    console.log(`[EduTradeFX Server] Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer();
