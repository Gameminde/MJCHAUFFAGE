import { prisma, checkDatabaseConnection } from './database';
import { logger } from '../utils/logger';

/**
 * Test basic database operations
 */
export const testDatabaseOperations = async (): Promise<boolean> => {
  try {
    logger.info('Testing database operations...');

    // Test connection
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Test basic query
    const userCount = await prisma.user.count();
    logger.info(`Database test successful. User count: ${userCount}`);

    // Test transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.findFirst();
      logger.info('Transaction test successful');
    });

    return true;
  } catch (error) {
    logger.error('Database test failed:', error);
    return false;
  }
};

/**
 * Test database performance
 */
export const testDatabasePerformance = async (): Promise<void> => {
  try {
    logger.info('Testing database performance...');

    const startTime = Date.now();
    
    // Test multiple queries
    await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.category.count(),
      prisma.manufacturer.count(),
    ]);

    const endTime = Date.now();
    const duration = endTime - startTime;

    logger.info(`Database performance test completed in ${duration}ms`);
  } catch (error) {
    logger.error('Database performance test failed:', error);
  }
};

/**
 * Test database with sample analytics data
 */
export const testAnalyticsOperations = async (): Promise<boolean> => {
  try {
    logger.info('Testing analytics operations...');

    // Create a test analytics session
    const testSession = await prisma.analyticsSession.create({
      data: {
        sessionId: `test-session-${Date.now()}`,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
        deviceType: 'desktop',
        browser: 'Chrome',
        os: 'Windows',
        country: 'Algeria',
        city: 'Algiers',
      },
    });

    // Create a test page analytics entry
    await prisma.pageAnalytics.create({
      data: {
        sessionId: testSession.sessionId,
        pagePath: '/test',
        pageTitle: 'Test Page',
        durationSeconds: 30,
      },
    });

    // Create a test e-commerce event
    await prisma.ecommerceEvent.create({
      data: {
        sessionId: testSession.sessionId,
        eventType: 'page_view',
        value: 0,
        currency: 'DZD',
      },
    });

    // Clean up test data
    await prisma.pageAnalytics.deleteMany({
      where: { sessionId: testSession.sessionId },
    });
    
    await prisma.ecommerceEvent.deleteMany({
      where: { sessionId: testSession.sessionId },
    });
    
    await prisma.analyticsSession.delete({
      where: { id: testSession.id },
    });

    logger.info('Analytics operations test successful');
    return true;
  } catch (error) {
    logger.error('Analytics operations test failed:', error);
    return false;
  }
};

/**
 * Run all database tests
 */
export const runDatabaseTests = async (): Promise<void> => {
  logger.info('Starting comprehensive database tests...');

  const connectionTest = await testDatabaseOperations();
  if (!connectionTest) {
    logger.error('Database connection test failed. Stopping tests.');
    return;
  }

  await testDatabasePerformance();
  
  const analyticsTest = await testAnalyticsOperations();
  if (!analyticsTest) {
    logger.warn('Analytics operations test failed');
  }

  logger.info('Database tests completed');
};