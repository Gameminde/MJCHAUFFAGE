import express from 'express';
import compression from 'compression';
import morgan from 'morgan';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import 'express-async-errors';

import { config } from '@/config/environment';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import { applySecurity, authRateLimit, apiRateLimit, strictRateLimit, adminRateLimit, progressiveDelay } from '@/middleware/security';
import { sanitizeRequestBody } from '@/middleware/validation';
import { connectRedis, redisClient } from '@/config/redis';
import { prisma } from '@/lib/database';

// Import routes
import authRoutes from '@/routes/auth';
import productRoutes from '@/routes/products';
import customerRoutes from '@/routes/customers';
import orderRoutes from '@/routes/orders';
import serviceRoutes from '@/routes/services';
import analyticsRoutes from '@/routes/analytics';
import adminRoutes from '@/routes/admin';
import realtimeRoutes from '@/routes/realtime';
import cartRoutes from '@/routes/cart';

const app = express();
const server = createServer(app);

// Define allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  config.frontend.url
];

const io = new SocketServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

// Apply comprehensive security middleware
app.use(applySecurity);

// Core Middleware
app.use(compression());
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Input sanitization
app.use(sanitizeRequestBody);

// Enhanced Rate Limiting with progressive delays
app.use('/api', progressiveDelay);
app.use('/api', apiRateLimit);

// Specific rate limits for different endpoint types
app.use('/api/auth/login', authRateLimit);
app.use('/api/auth/register', authRateLimit);
app.use('/api/auth/reset-password', authRateLimit);
app.use('/api/auth/change-password', strictRateLimit);
app.use('/api/admin', adminRateLimit);

// Session configuration (without Redis store)
app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.env === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/realtime', realtimeRoutes);
app.use('/api/cart', cartRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize realtime service
import { RealtimeService } from '@/services/realtimeService';
RealtimeService.initialize(io);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    prisma.$disconnect();
    redisClient.quit();
    process.exit(0);
  });
});

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully.');
    
    await connectRedis();
    logger.info('Redis connected successfully.');

    const port = config.api.port || 3001;
    server.listen(port, () => {
      logger.info(`Server listening on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    prisma.$disconnect();
    redisClient.quit();
    process.exit(1);
  }
};

startServer();

export { app, server, io };
