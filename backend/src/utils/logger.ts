/**
 * Centralized Logger Service using Winston
 * Replaces all console.log statements with proper logging
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const isDevelopment = process.env.NODE_ENV !== 'production';
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

// Daily rotate file transport for all logs
const allLogsTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
});

// Daily rotate file transport for error logs
const errorLogsTransport = new DailyRotateFile({
  level: 'error',
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: fileFormat,
});

// Create the logger instance
const logger = winston.createLogger({
  level: logLevel,
  format: fileFormat,
  transports: [
    allLogsTransport,
    errorLogsTransport,
  ],
  // Handle exceptions and rejections
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
});

// Add console transport in development
if (isDevelopment) {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

/**
 * Helper functions to replace console.log/error/warn
 */
export const log = {
  /**
   * Debug level logging (development only)
   */
  debug: (message: string, meta?: any) => {
    logger.debug(message, meta);
  },

  /**
   * Info level logging
   */
  info: (message: string, meta?: any) => {
    logger.info(message, meta);
  },

  /**
   * Warning level logging
   */
  warn: (message: string, meta?: any) => {
    logger.warn(message, meta);
  },

  /**
   * Error level logging
   */
  error: (message: string, error?: Error | any, meta?: any) => {
    if (error instanceof Error) {
      logger.error(message, {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        ...meta,
      });
    } else {
      logger.error(message, { error, ...meta });
    }
  },

  /**
   * HTTP request logging
   */
  http: (message: string, meta?: any) => {
    logger.http(message, meta);
  },

  /**
   * Success logging (using info level with success flag)
   */
  success: (message: string, meta?: any) => {
    logger.info(message, { success: true, ...meta });
  },

  /**
   * Database query logging
   */
  query: (message: string, meta?: any) => {
    logger.debug(`[DB] ${message}`, meta);
  },

  /**
   * API call logging
   */
  api: (method: string, path: string, statusCode: number, duration: number, meta?: any) => {
    logger.http(`${method} ${path} ${statusCode} - ${duration}ms`, meta);
  },

  /**
   * Security event logging
   */
  security: (message: string, meta?: any) => {
    logger.warn(`[SECURITY] ${message}`, meta);
  },

  /**
   * Performance logging
   */
  performance: (operation: string, duration: number, meta?: any) => {
    logger.info(`[PERF] ${operation} took ${duration}ms`, meta);
  },
};

/**
 * Request logging middleware helper
 */
export const logRequest = (req: any, res: any, duration: number) => {
  const meta = {
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  };

  if (res.statusCode >= 500) {
    log.error(`${req.method} ${req.path} - ${res.statusCode}`, undefined, meta);
  } else if (res.statusCode >= 400) {
    log.warn(`${req.method} ${req.path} - ${res.statusCode}`, meta);
  } else {
    log.http(`${req.method} ${req.path} - ${res.statusCode}`, meta);
  }
};

// Export the logger (log object) as named export
export { log as logger };

// Export health logger (same as logger)
export { log as healthLogger };

// Export Winston instance for advanced usage
export const winstonLogger = logger;

// Default export
export default log;
