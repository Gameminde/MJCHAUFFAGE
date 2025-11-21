// v2.0 - PostgreSQL migration complete
import express from 'express';
import compression from 'compression';
import morgan from 'morgan';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import 'express-async-errors';
import path from 'path';

import { config } from '@/config/environment';
import { logger } from '@/utils/logger';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import { applySecurity, authRateLimit, apiRateLimit, strictRateLimit, adminRateLimit, progressiveDelay } from '@/middleware/security';
import { sanitizeRequestBody } from '@/middleware/validation';
import { connectRedis, redisClient } from '@/config/redis';
import { prisma } from '@/lib/database';
import { apiVersionHeader, deprecationWarning } from '@/middleware/apiVersioning';
import { RequestHandler } from 'express';

// Import routes
import authRoutes from '@/routes/auth';
import productRoutes from '@/routes/products';
import categoryRoutes from '@/routes/categories';
import customerRoutes from '@/routes/customers';
import orderRoutes from '@/routes/orders';
import serviceRoutes from '@/routes/services';
import analyticsRoutes from '@/routes/analytics';
import adminRoutes from '@/routes/admin';
import realtimeRoutes from '@/routes/realtime';
import cartRoutes from '@/routes/cart';
import healthRoutes from '@/routes/health';
import paymentRoutes from '@/routes/payments';
import geolocationRoutes from '@/routes/geolocation';
import uploadsRoutes from '@/routes/uploads';
import wilayaRoutes from '@/routes/wilayas';
import boilerRoutes from '@/routes/boilers';

const app = express();
app.set('trust proxy', 1);
const server = createServer(app);

// Define allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://mj-chauffage-frontend.netlify.app', // Explicitly allow Netlify frontend
  config.frontend.url,
  // Add specific IPs if needed or use environment variable for more flexibility
  ...(config.env === 'development' ? [/^http:\/\/localhost:\d+$/] : []) 
];

const io = new SocketServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Core Middleware
app.use(compression() as unknown as RequestHandler);
app.use(morgan(config.env === 'development' ? 'dev' : 'combined') as unknown as RequestHandler);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS Middleware (Manual implementation to handle dynamic origins and credentials)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (origin) {
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });

    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
    }
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
});

app.use(cookieParser());

// Security middleware (after cookieParser to access req.cookies)
app.use(applySecurity);

// Input sanitization
app.use(sanitizeRequestBody);

// Enhanced Rate Limiting with progressive delays
app.use('/api', progressiveDelay as unknown as RequestHandler);
app.use('/api', apiRateLimit as unknown as RequestHandler);
app.use('/api', apiVersionHeader('v1'));
app.use('/api', deprecationWarning);

// Payments routes
app.use('/api/payments/process', strictRateLimit as unknown as RequestHandler);
app.use('/api/payments', paymentRoutes);

// Specific rate limits for different endpoint types
app.use('/api/auth/login', authRateLimit as unknown as RequestHandler);
app.use('/api/auth/register', authRateLimit as unknown as RequestHandler);
app.use('/api/auth/reset-password', authRateLimit as unknown as RequestHandler);
app.use('/api/auth/change-password', strictRateLimit as unknown as RequestHandler);
app.use('/api/admin', adminRateLimit as unknown as RequestHandler);

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

// Public files (uploaded assets) with proper CORS
// allowedOrigins already defined above

app.use('/files', express.static(path.resolve(__dirname, '..', 'uploads'), {
  maxAge: '1d',
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow from any origin for images
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    // Set proper content type for images
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
}));

// Alias for images (for compatibility with frontend requests)
app.use('/images', express.static(path.resolve(__dirname, '..', 'uploads'), {
  maxAge: '1d',
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// API Routes
app.get('/', (_req, res) => {
  res.json({
    message: 'MJ Chauffage Backend API is running',
    environment: config.env,
    timestamp: new Date().toISOString()
  });
});

app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/v1/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/realtime', realtimeRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/geolocation', geolocationRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/wilayas', wilayaRoutes);
app.use('/api/boilers', boilerRoutes);

// API v1 alias (legacy clients)
app.use('/api/v1', apiVersionHeader('v1'));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/realtime', realtimeRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/geolocation', geolocationRoutes);
app.use('/api/v1/uploads', uploadsRoutes);
app.use('/api/v1/wilayas', wilayaRoutes);
app.use('/api/v1/boilers', boilerRoutes);
// Remove duplicate legacy middleware insertion
// (version and deprecation headers already applied earlier)
// app.use('/api', apiVersionHeader('v1'));
// import { deprecationWarning } from '@/middleware/apiVersioning';
// app.use('/api', deprecationWarning);

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
      console.log(`🔐 Admin login: http://localhost:3000/admin`);
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
