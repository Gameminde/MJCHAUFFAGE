import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  stack?: string;
  statusCode?: number;
}

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (error.statusCode) {
    statusCode = error.statusCode;
    message = error.message;
  }

  const errorResponse: ErrorResponse = {
    success: false,
    message,
  };

  // Include error details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error = error.message;
    errorResponse.stack = error.stack;
  }

  errorResponse.statusCode = statusCode;

  res.status(statusCode).json(errorResponse);
};