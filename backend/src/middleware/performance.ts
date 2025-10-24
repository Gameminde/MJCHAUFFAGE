import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

interface PerformanceMetrics {
  requestId: string;
  method: string;
  url: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  statusCode?: number;
  contentLength?: number | undefined;
  userAgent?: string | undefined;
  ip?: string | undefined;
  memoryUsage?: NodeJS.MemoryUsage;
}

class PerformanceMonitor {
  private static metrics: Map<string, PerformanceMetrics> = new Map();
  private static slowRequestThreshold = 1000; // 1 second
  private static memoryWarningThreshold = 100 * 1024 * 1024; // 100MB

  static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  static startTracking(req: Request): string {
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    
    const metrics: PerformanceMetrics = {
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      startTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.socket.remoteAddress,
      memoryUsage: process.memoryUsage(),
    };

    this.metrics.set(requestId, metrics);
    
    // Add request ID to request object for tracking
    (req as any).requestId = requestId;
    
    return requestId;
  }

  static endTracking(requestId: string, res: Response): PerformanceMetrics | null {
    const metrics = this.metrics.get(requestId);
    if (!metrics) return null;

    const endTime = Date.now();
    const duration = endTime - metrics.startTime;
    
    metrics.endTime = endTime;
    metrics.duration = duration;
    metrics.statusCode = res.statusCode;
    metrics.contentLength = res.get('Content-Length') ? parseInt(res.get('Content-Length')!) : undefined;

    // Log performance metrics
    this.logMetrics(metrics);
    
    // Check for performance issues
    this.checkPerformanceIssues(metrics);
    
    // Clean up
    this.metrics.delete(requestId);
    
    return metrics;
  }

  private static logMetrics(metrics: PerformanceMetrics) {
    const logData = {
      requestId: metrics.requestId,
      method: metrics.method,
      url: metrics.url,
      duration: metrics.duration,
      statusCode: metrics.statusCode,
      contentLength: metrics.contentLength,
      userAgent: metrics.userAgent,
      ip: metrics.ip,
    };

    if (metrics.duration! > this.slowRequestThreshold) {
      logger.warn('Slow request detected', logData);
    } else {
      logger.info('Request completed', logData);
    }
  }

  private static checkPerformanceIssues(metrics: PerformanceMetrics) {
    // Check for slow requests
    if (metrics.duration! > this.slowRequestThreshold) {
      logger.warn(`Slow request: ${metrics.method} ${metrics.url} took ${metrics.duration}ms`);
      
      // In production, you might want to:
      // - Send alerts to monitoring service
      // - Track slow endpoints
      // - Trigger auto-scaling if needed
    }

    // Check memory usage
    const currentMemory = process.memoryUsage();
    if (currentMemory.heapUsed > this.memoryWarningThreshold) {
      logger.warn(`High memory usage detected: ${(currentMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    }

    // Check for error responses
    if (metrics.statusCode! >= 500) {
      logger.error(`Server error: ${metrics.statusCode} for ${metrics.method} ${metrics.url}`);
    }
  }

  static getActiveRequests(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  static getStats() {
    const activeRequests = this.metrics.size;
    const memoryUsage = process.memoryUsage();
    
    return {
      activeRequests,
      memoryUsage: {
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)}MB`,
      },
      uptime: `${(process.uptime() / 60).toFixed(2)} minutes`,
    };
  }
}

export function performanceMiddleware(req: Request, res: Response, next: NextFunction) {
  // Start tracking
  const requestId = PerformanceMonitor.startTracking(req);
  
  // Override res.end to capture completion
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any): Response {
    // End tracking
    PerformanceMonitor.endTracking(requestId, res);
    
    // Call original end method and return the result
    return originalEnd.call(this, chunk, encoding) as Response;
  };

  next();
}

export function performanceStatsHandler(_req: Request, res: Response) {
  const stats = PerformanceMonitor.getStats();
  const activeRequests = PerformanceMonitor.getActiveRequests();
  
  res.json({
    stats,
    activeRequests: activeRequests.map(metric => ({
      requestId: metric.requestId,
      method: metric.method,
      url: metric.url,
      duration: Date.now() - metric.startTime,
      userAgent: metric.userAgent,
      ip: metric.ip,
    })),
  });
}

// Rate limiting for performance
export class RateLimiter {
  private static requests: Map<string, number[]> = new Map();
  private static windowMs = 60 * 1000; // 1 minute
  private static maxRequests = 100; // per window

  static isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Get existing requests for this identifier
    let requests = this.requests.get(identifier) || [];
    
    // Filter out old requests
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (requests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    requests.push(now);
    this.requests.set(identifier, requests);
    
    return true;
  }

  static getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    const requests = this.requests.get(identifier) || [];
    const recentRequests = requests.filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, this.maxRequests - recentRequests.length);
  }

  static cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    for (const [identifier, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(timestamp => timestamp > windowStart);
      
      if (recentRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recentRequests);
      }
    }
  }
}

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const identifier = req.ip || 'unknown';
  
  if (!RateLimiter.isAllowed(identifier)) {
    const remaining = RateLimiter.getRemainingRequests(identifier);
    
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil(RateLimiter['windowMs'] / 1000),
      remaining,
    });
    return;
  }
  
  // Add rate limit headers
  res.set({
    'X-RateLimit-Limit': RateLimiter['maxRequests'].toString(),
    'X-RateLimit-Remaining': RateLimiter.getRemainingRequests(identifier).toString(),
    'X-RateLimit-Reset': new Date(Date.now() + RateLimiter['windowMs']).toISOString(),
  });
  
  next();
}

// Cleanup rate limiter periodically
setInterval(() => {
  RateLimiter.cleanup();
}, 60000); // Every minute