import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

/**
 * Middleware to add deprecation warnings for legacy API routes
 * This allows gradual migration from /api/* to /api/v1/*
 */
export const deprecationWarning = (req: Request, res: Response, next: NextFunction) => {
  // Add deprecation header
  res.setHeader('Deprecation', 'true');
  res.setHeader('Sunset', new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toUTCString()); // 6 months
  res.setHeader('Link', `</api/v1${req.path}>; rel="successor-version"`);
  
  // Log deprecation warning
  logger.warn('Legacy API endpoint called', {
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  
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

