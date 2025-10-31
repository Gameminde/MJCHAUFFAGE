import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import DOMPurify from 'isomorphic-dompurify';
import rateLimit from 'express-rate-limit';
import * as validator from 'validator';
import { logger } from '@/utils/logger';

// Enhanced input sanitization helper
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';

  // Remove HTML tags and potentially dangerous characters
  let sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });

  // Escape HTML entities
  sanitized = validator.escape(sanitized);

  // Remove null bytes and control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  // Additional sanitization for various injection attacks
  sanitized = sanitized
    .replace(/[<>'"]/g, '') // Remove dangerous characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 1000); // Limit length

  return sanitized;
};

// Advanced sanitization for different data types
export const sanitizeEmail = (email: string): string => {
  if (typeof email !== 'string') return '';
  return validator.normalizeEmail(email.toLowerCase().trim()) || '';
};

export const sanitizePhone = (phone: string): string => {
  if (typeof phone !== 'string') return '';
  // Remove all non-digit characters except + at the beginning
  return phone.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
};

export const sanitizeNumeric = (value: any): number | null => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value.replace(/[^\d.-]/g, ''));
    return isNaN(num) ? null : num;
  }
  return null;
};

export const sanitizeBoolean = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  }
  return false;
};

export const sanitizeUrl = (url: string): string => {
  if (typeof url !== 'string') return '';
  
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
};

// Enhanced sanitize request body middleware
export const sanitizeRequestBody = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    // Fields that should not be sanitized (passwords, etc.)
    const skipSanitizationFields = ['password', 'currentPassword', 'newPassword', 'confirmPassword'];

    const sanitizeObject = (obj: any, depth = 0, parentKey = ''): any => {
      // Prevent deep nesting attacks
      if (depth > 10) {
        logger.warn(`Deep nesting attack detected from ${req.ip}`, { depth, url: req.url });
        res.status(400).json({
          success: false,
          message: 'Request structure too complex',
          code: 'DEEP_NESTING_DETECTED'
        });
        return;
      }

      if (typeof obj === 'string') {
        // Skip sanitization for password fields
        if (skipSanitizationFields.includes(parentKey.toLowerCase())) {
          return obj;
        }
        return sanitizeInput(obj);
      } else if (Array.isArray(obj)) {
        // Limit array size to prevent DoS
        if (obj.length > 1000) {
          logger.warn(`Large array attack detected from ${req.ip}`, { size: obj.length, url: req.url });
          res.status(400).json({
            success: false,
            message: 'Array too large',
            code: 'ARRAY_TOO_LARGE'
          });
          return;
        }
        return obj.map(item => sanitizeObject(item, depth + 1, parentKey));
      } else if (obj && typeof obj === 'object') {
        // Limit object properties to prevent DoS
        const keys = Object.keys(obj);
        if (keys.length > 100) {
          logger.warn(`Large object attack detected from ${req.ip}`, { keys: keys.length, url: req.url });
          res.status(400).json({
            success: false,
            message: 'Object too complex',
            code: 'OBJECT_TOO_COMPLEX'
          });
          return;
        }

        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          // Sanitize property names too
          const sanitizedKey = sanitizeInput(key);
          if (sanitizedKey) {
            sanitized[sanitizedKey] = sanitizeObject(value, depth + 1, key);
          }
        }
        return sanitized;
      }
      return obj;
    };

    const sanitized = sanitizeObject(req.body);
    if (sanitized !== undefined) {
      req.body = sanitized;
    } else {
      return; // Response already sent due to attack detection
    }
  }

  // Also sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    const sanitizedQuery: any = {};
    for (const [key, value] of Object.entries(req.query)) {
      const sanitizedKey = sanitizeInput(key);
      if (sanitizedKey && typeof value === 'string') {
        sanitizedQuery[sanitizedKey] = sanitizeInput(value);
      } else if (sanitizedKey && Array.isArray(value)) {
        sanitizedQuery[sanitizedKey] = value.map(v => typeof v === 'string' ? sanitizeInput(v) : v);
      }
    }
    req.query = sanitizedQuery;
  }

  next();
};

// Rate limiting for API endpoints
export const createRateLimit = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        message,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Common rate limits
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts, please try again later'
);

export const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  'Too many API requests, please try again later'
);

export const strictRateLimit = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // 10 requests
  'Too many requests for this sensitive operation'
);

// Validation chains for different endpoints
export const authValidation = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8, max: 128 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must be 8+ characters with uppercase, lowercase, and number'),
    body('firstName')
      .isLength({ min: 1, max: 50 })
      .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/)
      .withMessage('First name must be 1-50 characters, letters, spaces, hyphens, and apostrophes only'),
    body('lastName')
      .isLength({ min: 1, max: 50 })
      .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/)
      .withMessage('Last name must be 1-50 characters, letters, spaces, hyphens, and apostrophes only'),
    body('phone')
      .optional()
      .isLength({ min: 8, max: 15 })
      .withMessage('Phone number must be 8-15 characters'),
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 1 })
      .withMessage('Password is required'),
  ],

  changePassword: [
    body('currentPassword')
      .isLength({ min: 1 })
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8, max: 128 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must be 8+ characters with uppercase, lowercase, and number'),
  ],

  resetPassword: [
    body('token')
      .isLength({ min: 1 })
      .withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 8, max: 128 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must be 8+ characters with uppercase, lowercase, and number'),
  ],
};

export const productValidation = {
  create: [
    body('name')
      .isLength({ min: 1, max: 255 })
      .withMessage('Product name must be 1-255 characters'),
    body('description')
      .isLength({ min: 1, max: 2000 })
      .withMessage('Description must be 1-2000 characters'),
    body('price')
      .isFloat({ min: 0.01, max: 999999.99 })
      .withMessage('Price must be between 0.01 and 999999.99'),
    body('categoryId')
      .isUUID()
      .withMessage('Valid category ID is required'),
    body('stockQuantity')
      .isInt({ min: 0, max: 999999 })
      .withMessage('Stock quantity must be between 0 and 999999'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be boolean'),
  ],

  update: [
    param('id')
      .isUUID()
      .withMessage('Valid product ID is required'),
    body('name')
      .optional()
      .isLength({ min: 1, max: 255 })
      .withMessage('Product name must be 1-255 characters'),
    body('description')
      .optional()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Description must be 1-2000 characters'),
    body('price')
      .optional()
      .isFloat({ min: 0.01, max: 999999.99 })
      .withMessage('Price must be between 0.01 and 999999.99'),
    body('stockQuantity')
      .optional()
      .isInt({ min: 0, max: 999999 })
      .withMessage('Stock quantity must be between 0 and 999999'),
  ],
};

export const orderValidation = {
  create: [
    body('items')
      .isArray({ min: 1, max: 50 })
      .withMessage('Order must have 1-50 items'),
    body('items.*.productId')
      .isUUID()
      .withMessage('Valid product ID is required for each item'),
    body('items.*.quantity')
      .isInt({ min: 1, max: 999 })
      .withMessage('Quantity must be between 1 and 999'),
    body('deliveryAddress')
      .isLength({ min: 10, max: 500 })
      .withMessage('Delivery address must be 10-500 characters'),
    body('paymentMethod')
      .isIn(['CASH_ON_DELIVERY', 'DAHABIA_CARD', 'BANK_TRANSFER'])
      .withMessage('Invalid payment method'),
  ],
};

export const queryValidation = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Page must be between 1 and 1000'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],

  search: [
    query('q')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be 1-100 characters'),
    query('category')
      .optional()
      .isUUID()
      .withMessage('Category must be valid UUID'),
  ],
};

// Validation result handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  // LOG DÉTAILLÉ 1 - Informations de la requête
  console.log('🔍 Validation Request Details:');
  console.log('Method:', req.method);
  console.log('URL:', req.originalUrl);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Headers Authorization:', req.headers.authorization ? 'Present' : 'Missing');
  console.log('Content-Type:', req.headers['content-type']);
  
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // LOG DÉTAILLÉ 2 - Erreurs de validation
    console.log('❌ Erreurs de validation détectées:');
    console.log('Nombre d\'erreurs:', errors.array().length);
    console.log('Erreurs complètes:', JSON.stringify(errors.array(), null, 2));
    
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }));

    console.log('Erreurs formatées:', JSON.stringify(formattedErrors, null, 2));

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: formattedErrors
    });
    return;
  }

  console.log('✅ Validation passée avec succès');
  next();
};

// Legacy validation functions (keeping for backward compatibility)
export const validatePaymentRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { amount, currency, method, orderId, customerInfo, shippingAddress } = req.body;
  const errors: string[] = [];

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    errors.push('Valid amount is required');
  }

  if (currency !== 'DZD') {
    errors.push('Currency must be DZD');
  }

  if (!method || !['CASH_ON_DELIVERY', 'DAHABIA_CARD'].includes(method)) {
    errors.push('Valid payment method is required');
  }

  if (!orderId || typeof orderId !== 'string') {
    errors.push('Valid order ID is required');
  }

  if (!customerInfo || typeof customerInfo !== 'object') {
    errors.push('Customer information is required');
  }

  if (!shippingAddress || typeof shippingAddress !== 'object') {
    errors.push('Shipping address is required');
  }

  if (method === 'DAHABIA_CARD') {
    const { cardData } = req.body;
    if (!cardData || typeof cardData !== 'object') {
      errors.push('Card data is required for Dahabia payments');
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ 
      success: false, 
      message: 'Validation failed', 
      code: 'VALIDATION_ERROR',
      errors: errors.map(error => ({ message: error }))
    });
    return;
  }

  next();
};

export const validateVerificationRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { transactionId } = req.params;

  if (!transactionId || typeof transactionId !== 'string') {
    res.status(400).json({ 
      success: false, 
      message: 'Valid transaction ID is required',
      code: 'VALIDATION_ERROR'
    });
    return;
  }

  next();
};