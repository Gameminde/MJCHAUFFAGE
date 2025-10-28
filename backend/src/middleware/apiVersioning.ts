import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

/**
 * Middleware to add deprecation warnings for legacy API routes
 * This allows gradual migration from /api/* to /api/v1/*
 * Optimized to reduce log noise - only log 1% of legacy calls
 */
export const deprecationWarning = (req: Request, res: Response, next: NextFunction) => {
  // Add deprecation header
  res.setHeader('Deprecation', 'true');
  res.setHeader('Sunset', new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toUTCString()); // 6 months
  res.setHeader('Link', `</api/v1${req.path}>; rel="successor-version"`);

  // Log deprecation warning with sampling to reduce noise (1% of calls)
  const shouldLogLegacy = Math.random() < 0.01; // 1% sampling
  if (shouldLogLegacy) {
    logger.warn('Legacy API endpoint called', {
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      note: 'Sampled log (1% of legacy calls)'
    });
  }

  next();
};

/**
 * Middleware to add current API version header
 */
export const apiVersionHeader = (version: string) => {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-API-Version', version);
    next();
  };
};

