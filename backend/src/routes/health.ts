import { Router } from 'express';
import { prisma } from '@/lib/database';
import { CacheService } from '@/services/cacheService';
import { logger, healthLogger } from '@/utils/logger';

const router = Router();

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  details?: any;
  timestamp: string;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: HealthCheckResult[];
}

/**
 * Basic health check endpoint
 */
router.get('/', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'MJ CHAUFFAGE API is running',
  });
});

/**
 * Detailed health check with all services
 */
router.get('/detailed', async (_req, res) => {
  const startTime = Date.now();
  const checks: HealthCheckResult[] = [];
  
  try {
    // Check database connection
    const dbCheck = await checkDatabase();
    checks.push(dbCheck);
    
    // Check cache service
    const cacheCheck = await checkCache();
    checks.push(cacheCheck);
    
    // Check memory usage
    const memoryCheck = checkMemory();
    checks.push(memoryCheck);
    
    // Check disk space (if applicable)
    const diskCheck = await checkDiskSpace();
    checks.push(diskCheck);
    
    // Determine overall status
    const hasUnhealthy = checks.some(check => check.status === 'unhealthy');
    const overallStatus: HealthStatus['status'] = hasUnhealthy ? 'unhealthy' : 'healthy';
    
    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks,
    };
    
    const responseTime = Date.now() - startTime;
    logger.info('Health check completed', { 
      status: overallStatus, 
      responseTime: `${responseTime}ms`,
      checks: checks.length 
    });
    
    const statusCode = overallStatus === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthStatus);
    
  } catch (error) {
    logger.error('Health check failed', error);
    
    const healthStatus: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: [
        {
          service: 'health-check',
          status: 'unhealthy',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
          timestamp: new Date().toISOString(),
        }
      ],
    };
    
    res.status(503).json(healthStatus);
  }
});

/**
 * Readiness probe (for Kubernetes)
 */
router.get('/ready', async (_req, res) => {
  try {
    // Check if the application is ready to serve traffic
    await checkDatabase();
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Readiness check failed', error);
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Liveness probe (for Kubernetes)
 */
router.get('/live', (_req, res) => {
  // Simple liveness check - if this endpoint responds, the app is alive
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Simple query to check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    const responseTime = Date.now() - startTime;
    const result: HealthCheckResult = {
      service: 'database',
      status: 'healthy',
      responseTime,
      timestamp: new Date().toISOString(),
    };
    
    healthLogger.logHealthCheck('database', 'healthy', { responseTime });
    return result;
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const result: HealthCheckResult = {
      service: 'database',
      status: 'unhealthy',
      responseTime,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      timestamp: new Date().toISOString(),
    };
    
    healthLogger.logHealthCheck('database', 'unhealthy', { error, responseTime });
    return result;
  }
}

/**
 * Check cache service
 */
async function checkCache(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Test cache operations
    const testKey = 'health-check-test';
    const testValue = { timestamp: Date.now() };
    
    await CacheService.set(testKey, testValue, 60); // 1 minute TTL
    const retrieved = await CacheService.get(testKey);
    await CacheService.delete(testKey);
    
    if (!retrieved || retrieved.timestamp !== testValue.timestamp) {
      throw new Error('Cache test failed - data mismatch');
    }
    
    const responseTime = Date.now() - startTime;
    const result: HealthCheckResult = {
      service: 'cache',
      status: 'healthy',
      responseTime,
      timestamp: new Date().toISOString(),
    };
    
    healthLogger.logHealthCheck('cache', 'healthy', { responseTime });
    return result;
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const result: HealthCheckResult = {
      service: 'cache',
      status: 'unhealthy',
      responseTime,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      timestamp: new Date().toISOString(),
    };
    
    healthLogger.logHealthCheck('cache', 'unhealthy', { error, responseTime });
    return result;
  }
}

/**
 * Check memory usage
 */
function checkMemory(): HealthCheckResult {
  const memoryUsage = process.memoryUsage();
  const memoryUsageMB = {
    rss: Math.round(memoryUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    external: Math.round(memoryUsage.external / 1024 / 1024),
  };
  
  // Consider unhealthy if heap usage is over 1GB
  const isHealthy = memoryUsageMB.heapUsed < 1024;
  
  const result: HealthCheckResult = {
    service: 'memory',
    status: isHealthy ? 'healthy' : 'unhealthy',
    details: memoryUsageMB,
    timestamp: new Date().toISOString(),
  };
  
  healthLogger.logHealthCheck('memory', result.status, memoryUsageMB);
  return result;
}

/**
 * Check disk space (basic implementation)
 */
async function checkDiskSpace(): Promise<HealthCheckResult> {
  try {
    const fs = await import('fs/promises');
    await fs.stat('./');
    
    // This is a basic check - in production you might want to use a more sophisticated approach
    const result: HealthCheckResult = {
      service: 'disk',
      status: 'healthy',
      details: {
        message: 'Disk space check completed',
        // Note: Getting actual disk space requires additional libraries or system calls
      },
      timestamp: new Date().toISOString(),
    };
    
    healthLogger.logHealthCheck('disk', 'healthy');
    return result;
    
  } catch (error) {
    const result: HealthCheckResult = {
      service: 'disk',
      status: 'unhealthy',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      timestamp: new Date().toISOString(),
    };
    
    healthLogger.logHealthCheck('disk', 'unhealthy', { error });
    return result;
  }
}

export default router;