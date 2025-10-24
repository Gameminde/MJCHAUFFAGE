import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { 
  getDatabaseConfig, 
  createPrismaClientWithConfig,
  connectWithRetry,
  performHealthCheck,
  gracefulShutdown
} from '../config/database';

// Global variable to store the Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Get database configuration
const dbConfig = getDatabaseConfig();

// Create a singleton Prisma client instance
const createPrismaClient = (): PrismaClient => {
  const prisma = createPrismaClientWithConfig(dbConfig);

  // Query logging disabled due to TypeScript compatibility issues

  return prisma;
};

// Use global variable in development to prevent multiple instances
const prisma = globalThis.__prisma || createPrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Database connection health check
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const isHealthy = await performHealthCheck(prisma);
    if (isHealthy) {
      logger.info('Database connection successful');
    } else {
      logger.error('Database health check failed');
    }
    return isHealthy;
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
};

// Initialize database connection with retry logic
export const initializeDatabaseConnection = async (): Promise<void> => {
  try {
    await connectWithRetry(prisma, dbConfig);
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
};

// Graceful shutdown
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await gracefulShutdown(prisma);
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
  }
};

// Connection pool configuration
export const configureDatabasePool = () => {
  logger.info('Database connection pool configured with settings:', {
    maxConnections: dbConfig.maxConnections,
    connectionTimeout: dbConfig.connectionTimeout,
    queryTimeout: dbConfig.queryTimeout,
  });
};

export { prisma };
export default prisma;