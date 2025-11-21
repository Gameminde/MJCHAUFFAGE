import { PrismaClient } from '@prisma/client';

export interface DatabaseConfig {
  url: string;
  maxConnections: number;
  connectionTimeout: number;
  queryTimeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export const getDatabaseConfig = (): DatabaseConfig => {
  const baseUrl = process.env.DATABASE_URL || '';
  
  // For SQLite, don't modify the URL - use it as is
  if (baseUrl.startsWith('file:')) {
    return {
      url: baseUrl,
      maxConnections: 1, // SQLite only supports 1 connection
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '60000'),
      queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'),
      retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '3'),
      retryDelay: parseInt(process.env.DB_RETRY_DELAY || '1000'),
    };
  }
  
  // For Neon with PgBouncer, we must remove the connection_limit param and add pgbouncer=true if not present
  // We rely on the URL provided in env which should be the pooled connection string
  return {
    url: baseUrl,
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '60000'),
    queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'),
    retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(process.env.DB_RETRY_DELAY || '1000'),
  };
};

export const createPrismaClientWithConfig = (config: DatabaseConfig): PrismaClient => {
  return new PrismaClient({
    datasources: {
      db: {
        url: config.url,
      },
    },
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
    errorFormat: 'pretty',
  });
};

// Connection retry logic
export const connectWithRetry = async (
  prisma: PrismaClient,
  config: DatabaseConfig
): Promise<void> => {
  let attempts = 0;
  
  while (attempts < config.retryAttempts) {
    try {
      await prisma.$connect();
      console.log('Database connected successfully');
      return;
    } catch (error) {
      attempts++;
      console.error(`Database connection attempt ${attempts} failed:`, error);
      
      if (attempts >= config.retryAttempts) {
        throw new Error(`Failed to connect to database after ${config.retryAttempts} attempts`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, config.retryDelay));
    }
  }
};

// Health check function
export const performHealthCheck = async (prisma: PrismaClient): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

// Graceful shutdown
export const gracefulShutdown = async (prisma: PrismaClient): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log('Database disconnected gracefully');
  } catch (error) {
    console.error('Error during database disconnect:', error);
  }
};
