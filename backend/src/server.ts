import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import 'express-async-errors';

import { config } from '@/config/environment';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import { redisClient } from '@/config/redis';
import { prisma } from '@/config/database';

// Import routes
import authRoutes from '@/routes/auth';
import productRoutes from '@/routes/products';
import customerRoutes from '@/routes/customers';
import orderRoutes from '@/routes/orders';
import serviceRoutes from '@/routes/services';
import analyticsRoutes from '@/routes/analytics';
import adminRoutes from '@/routes/admin';

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
app.use(cors({ 
  origin: allowedOrigins, 
  credentials: true 
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", ...allowedOrigins],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },
  xssFilter: true,
  noSniff: true,
  ieNoOpen: true,
}));
app.use(compression());
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', apiLimiter);

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

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Socket.io setup
io.on('connection', (socket) => {
  logger.info(`New client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });

  // Order status updates
  socket.on('join_order', (orderId) => {
    socket.join(`order_${orderId}`);
  });

  // Admin dashboard updates
  socket.on('join_admin', () => {
    socket.join('admin_dashboard');
  });
});

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
    
    await redisClient.connect();
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
