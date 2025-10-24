import { checkDatabaseConnection, configureDatabasePool } from './src/lib/database';
import { logger } from './src/utils/logger';

async function testConnection() {
  try {
    logger.info('Testing database connection...');
    
    // Configure connection pool
    configureDatabasePool();
    
    // Test connection
    const isConnected = await checkDatabaseConnection();
    
    if (isConnected) {
      logger.info('✅ Database connection test successful!');
      process.exit(0);
    } else {
      logger.error('❌ Database connection test failed!');
      process.exit(1);
    }
  } catch (error) {
    logger.error('❌ Database connection test error:', error);
    process.exit(1);
  }
}

testConnection();