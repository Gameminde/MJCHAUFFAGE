import express, { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
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
import healthRoutes from '@/routes/health';
import paymentRoutes from '@/routes/payments';
import uploadsRoutes from '@/routes/uploads';

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

// Core Middleware
app.use(compression());
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Security middleware (after cookieParser to access req.cookies)
app.use(applySecurity);

// Input sanitization
app.use(sanitizeRequestBody);

// Enhanced Rate Limiting with progressive delays
app.use('/api', progressiveDelay);
app.use('/api', apiRateLimit);

// Payments routes
app.use('/api/payments', paymentRoutes);

// Static serving for uploaded files
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Uploads API
app.use('/api/uploads', uploadsRoutes);

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

// ==========================================
// API v1 Routes (Current Version)
// ==========================================
const v1Router = Router();

// Geolocation endpoint (simple IP-based location)
v1Router.get('/geolocation', async (req: Request, res: Response): Promise<void> => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // For localhost, return Algeria as default
    if (ip === '::1' || ip === '127.0.0.1' || ip?.includes('localhost')) {
      res.json({
        country: 'Algeria',
        country_code: 'DZ',
        city: 'Algiers'
      });
      return;
    }
    
    res.json({
      country: 'Algeria',
      country_code: 'DZ',
      city: 'Unknown'
    });
  } catch (error) {
    logger.error('Geolocation error:', error);
    res.status(500).json({ error: 'Failed to get location' });
  }
});

v1Router.use('/auth', authRoutes);
v1Router.use('/products', productRoutes);
v1Router.use('/customers', customerRoutes);
v1Router.use('/orders', orderRoutes);
v1Router.use('/services', serviceRoutes);
v1Router.use('/analytics', analyticsRoutes);
v1Router.use('/admin', adminRoutes);
v1Router.use('/realtime', realtimeRoutes);
v1Router.use('/cart', cartRoutes);
v1Router.use('/payments', paymentRoutes);
v1Router.use('/uploads', uploadsRoutes);

app.use('/api/v1', v1Router);

// ==========================================
// Legacy API Routes (For backward compatibility)
// ==========================================
app.use('/health', healthRoutes);
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
  const isTestEnv = process.env.NODE_ENV === 'test';
  try {
    console.log('🚀 Starting MJ Chauffage Backend...');
    
    console.log('📊 Connecting to database...');
    // Test simple de connexion
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connected successfully.');
    
    console.log('🔗 Connecting to Redis...');
    await connectRedis();
    console.log('✅ Redis connected successfully.');

    const port = config.api.port || 3001;
    console.log(`🌐 Starting server on port ${port}...`);
    
    server.listen(port, () => {
      console.log(`✅ Server listening on http://localhost:${port}`);
      console.log(`🔍 Health check: http://localhost:${port}/health`);
      console.log(`📦 Uploads served at: http://localhost:${port}/uploads`);
      console.log(`🔐 Admin login: http://localhost:3005/login`);
    });

    // Ajouter un gestionnaire d'erreur pour server.listen
    server.on('error', (error: any) => {
      console.error('❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use`);
      }
      if (!isTestEnv) process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    redisClient.quit();
    if (!isTestEnv) process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') startServer();

export { app, server, io };
