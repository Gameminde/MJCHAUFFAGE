import winston from 'winston';
import { config } from '@/config/environment';

// Define log formats
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
);

// Create transports based on environment
const transports: winston.transport[] = [];

// File transports for all environments
transports.push(
  // Error logs
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    maxsize: 10485760, // 10MB
    maxFiles: 10,
    format: productionFormat,
  }),
  
  // Combined logs
  new winston.transports.File({
    filename: config.logging?.file || 'logs/combined.log',
    maxsize: 10485760, // 10MB
    maxFiles: 10,
    format: productionFormat,
  }),
  
  // Access logs (for HTTP requests)
  new winston.transports.File({
    filename: 'logs/access.log',
    level: 'info',
    maxsize: 10485760, // 10MB
    maxFiles: 5,
    format: productionFormat,
  })
);

// Console transport for development
if (config.env !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: developmentFormat,
    })
  );
} else {
  // In production, only log warnings and errors to console
  transports.push(
    new winston.transports.Console({
      level: 'warn',
      format: productionFormat,
    })
  );
}

// Create the logger
export const logger = winston.createLogger({
  level: config.logging?.level || (config.env === 'production' ? 'warn' : 'debug'),
  format: config.env === 'production' ? productionFormat : developmentFormat,
  defaultMeta: { 
    service: 'mj-chauffage-api',
    environment: config.env,
    version: process.env.npm_package_version || '1.0.0',
    nodeVersion: process.version,
  },
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: 'logs/exceptions.log',
      maxsize: 10485760,
      maxFiles: 5,
    })
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: 'logs/rejections.log',
      maxsize: 10485760,
      maxFiles: 5,
    })
  ]
});

// Performance logging helper
export const performanceLogger = {
  logRequest: (req: any, res: any, duration: number) => {
    logger.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      requestId: req.requestId,
    });
  },
  
  logSlowQuery: (query: string, duration: number, params?: any) => {
    logger.warn('Slow Database Query', {
      query,
      duration: `${duration}ms`,
      params,
    });
  },
  
  logError: (error: Error, context?: any) => {
    logger.error('Application Error', {
      message: error.message,
      stack: error.stack,
      context,
    });
  },
  
  logSecurity: (event: string, details: any) => {
    logger.warn('Security Event', {
      event,
      ...details,
      timestamp: new Date().toISOString(),
    });
  }
};

// Health check logger
export const healthLogger = {
  logHealthCheck: (service: string, status: 'healthy' | 'unhealthy', details?: any) => {
    const level = status === 'healthy' ? 'info' : 'error';
    logger.log(level, 'Health Check', {
      service,
      status,
      details,
    });
  }
};

// Create logs directory if it doesn't exist
import { existsSync, mkdirSync } from 'fs';
if (!existsSync('logs')) {
  mkdirSync('logs');
}