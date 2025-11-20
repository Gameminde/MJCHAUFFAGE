import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';

// Extend Request interface for file uploads

interface RequestWithFiles extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      config.frontend.url,
      'http://localhost:3000',
      'http://localhost:3001',
      'https://mjchauffage.com',
      'https://www.mjchauffage.com',
      'https://admin.mjchauffage.com',
      // Vercel deployment URLs - allow all Vercel domains
      /^https:\/\/frontend-[a-zA-Z0-9-]+-youcefs-projects-b3c48b29\.vercel\.app$/,
      /^https:\/\/frontend-[a-zA-Z0-9-]+\.vercel\.app$/,
      /^https:\/\/mjchauffage-frontend\.vercel\.app$/,
      // Current production URL
      'https://frontend-eight-ruddy-86.vercel.app',
      'https://frontend-kcx09sr6k-youcefs-projects-b3c48b29.vercel.app',
      'https://mjchauffage-frontend.vercel.app'
    ];

    if (config.env === 'development') {
      // Allow all localhost origins in development
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }

    // Check if origin is allowed (handle both strings and regex patterns)
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-Client-Version'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
};

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for some CSS frameworks
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net"
      ],
      scriptSrc: [
        "'self'",
        "https://maps.googleapis.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:",
        "https://images.unsplash.com",
        "https://via.placeholder.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdn.jsdelivr.net"
      ],
      connectSrc: [
        "'self'",
        "https://maps.googleapis.com",
        config.frontend.url
      ],
      frameSrc: [
        "'self'"
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: config.env === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for compatibility
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

// Request size limiting
export const requestSizeLimit = (req: Request, res: Response, next: NextFunction): void => {
  const contentLength = req.get('content-length');
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength && parseInt(contentLength) > maxSize) {
    res.status(413).json({
      success: false,
      message: 'Request entity too large',
      code: 'PAYLOAD_TOO_LARGE',
      maxSize: '10MB'
    });
    return;
  }

  next();
};

// Advanced rate limiting with different tiers
export const createAdvancedRateLimit = (options: {
  windowMs: number;
  max: number;
  message: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      success: false,
      message: options.message,
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    skipFailedRequests: options.skipFailedRequests || false,
    keyGenerator: options.keyGenerator || ((req: Request) => req.ip || 'unknown'),
    skip: (req) => (options.skip ? options.skip(req) : false),
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip || 'unknown'}, URL: ${req.url}`);
      res.status(429).json({
        success: false,
        message: options.message,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(options.windowMs / 1000)
      });
    }
  });
};

// Specific rate limiters for different endpoint types
export const authRateLimit = createAdvancedRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true
});

export const apiRateLimit = createAdvancedRateLimit({
  windowMs: config.env === 'production' ? 15 * 60 * 1000 : 60 * 60 * 1000, // 15 min prod, 1 hour dev
  max: config.env === 'production' ? 100 : 5000, // Higher limit in development
  message: 'Too many API requests, please try again later',
  // Skip analytics endpoints in development to avoid interfering with local testing
  skip: (req: Request) => (
    config.env !== 'production' && (
      req.path.includes('/analytics/events') ||
      req.path.includes('/analytics/track')
    )
  )
});

export const strictRateLimit = createAdvancedRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: 'Too many requests for this sensitive operation'
});

export const adminRateLimit = createAdvancedRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Higher limit for admin operations
  message: 'Too many admin requests, please try again later'
});

// Progressive delay for repeated requests
export const progressiveDelay = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 10, // Allow 10 requests per window without delay
  delayMs: () => 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
});

// Enhanced input validation and sanitization
export const enhancedInputValidation = (req: Request, res: Response, next: NextFunction): void => {
  // Skip validation for product endpoints to allow legitimate product data
  const skipValidationPaths = [
    '/api/products',
    '/api/orders',
    '/api/customers'
  ];

  if (skipValidationPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  // Check for common attack patterns
  const maliciousPatterns = [
    // XSS patterns
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,

    // SQL injection patterns (more specific)
    /(\b(union|select|insert|delete|drop|create|alter|exec|execute)\b.*\b(from|where|into)\b)/gi,
    /(;.*--)|(\/\*.*\*\/)/g,
    /(\b(or|and)\b.*=.*('|"))/gi,

    // Path traversal patterns
    /\.\.\//g,
    /%2e%2e%2f/gi,
    /\.\.\\/g,

    // Command injection patterns
    /[|&;$`].*\b(nc|netcat|wget|curl|ping|nslookup|rm|del|format)\b/gi,

    // NoSQL injection patterns
    /(\$where|\$ne|\$in|\$nin|\$gt|\$lt|\$regex)/gi
  ];

  const checkInput = (obj: any, path = ''): boolean => {
    if (typeof obj === 'string') {
      return maliciousPatterns.some(pattern => pattern.test(obj));
    } else if (Array.isArray(obj)) {
      return obj.some((item, index) => checkInput(item, `${path}[${index}]`));
    } else if (obj && typeof obj === 'object') {
      return Object.entries(obj).some(([key, value]) =>
        checkInput(value, path ? `${path}.${key}` : key)
      );
    }
    return false;
  };

  if (checkInput(req.query) || checkInput(req.body) || checkInput(req.params)) {
    logger.warn(`Malicious input detected from ${req.ip || 'unknown'}:`, {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      body: req.body,
      query: req.query,
      params: req.params
    });

    res.status(400).json({
      success: false,
      message: 'Invalid request parameters detected',
      code: 'MALICIOUS_INPUT_DETECTED'
    });
    return;
  }

  next();
};

// File upload security
export const fileUploadSecurity = (req: Request, res: Response, next: NextFunction): void => {
  const reqWithFiles = req as RequestWithFiles;
  if (reqWithFiles.files || reqWithFiles.file) {
    const files = reqWithFiles.files ? (Array.isArray(reqWithFiles.files) ? reqWithFiles.files : Object.values(reqWithFiles.files).flat()) : [reqWithFiles.file];

    for (const file of files) {
      if (!file) continue;

      // Check file size
      if (file.size > config.upload.maxSize) {
        res.status(413).json({
          success: false,
          message: `File too large. Maximum size is ${config.upload.maxSize / 1024 / 1024}MB`,
          code: 'FILE_TOO_LARGE'
        });
        return;
      }

      // Check file type
      if (!config.upload.allowedTypes.includes(file.mimetype)) {
        res.status(415).json({
          success: false,
          message: 'File type not allowed',
          code: 'INVALID_FILE_TYPE',
          allowedTypes: config.upload.allowedTypes
        });
        return;
      }

      // Check for malicious file names
      const maliciousFilePatterns = [
        /\.\./g, // Path traversal
        /[<>:"|?*]/g, // Invalid characters
        /\.(exe|bat|cmd|scr|pif|com|dll|vbs|js|jar|php|asp|jsp)$/i // Executable files
      ];

      if (maliciousFilePatterns.some(pattern => pattern.test(file.originalname))) {
        res.status(400).json({
          success: false,
          message: 'Invalid file name detected',
          code: 'INVALID_FILE_NAME'
        });
        return;
      }
    }
  }

  next();
};

// Brute force protection
export const bruteForceProtection = (req: Request, _res: Response, next: NextFunction): void => {
  const suspiciousActivity = [
    // Multiple failed login attempts
    req.url.includes('/auth/login') && req.method === 'POST',
    // Password reset attempts
    req.url.includes('/auth/reset-password') && req.method === 'POST',
    // Registration attempts
    req.url.includes('/auth/register') && req.method === 'POST'
  ];

  if (suspiciousActivity.some(Boolean)) {
    // Log the attempt for monitoring
    logger.warn(`Potential brute force attempt from ${req.ip || 'unknown'}:`, {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// Honeypot trap for bots
export const honeypotTrap = (req: Request, res: Response, next: NextFunction): void => {
  // Check for honeypot field in forms
  if (req.body && req.body.honeypot && req.body.honeypot.trim() !== '') {
    logger.warn(`Bot detected via honeypot from ${req.ip || 'unknown'}:`, {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      honeypotValue: req.body.honeypot
    });

    // Return success to not alert the bot
    res.status(200).json({
      success: true,
      message: 'Request processed successfully'
    });
    return;
  }

  next();
};

// Security audit logging
export const securityAuditLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Log security-relevant events
  const securityEvents = [
    req.url.includes('/auth/'),
    req.url.includes('/admin/'),
    req.method === 'DELETE',
    req.url.includes('/users/'),
    req.url.includes('/orders/'),
    req.headers.authorization,
    req.cookies.accessToken
  ];

  const isSecurityRelevant = securityEvents.some(Boolean);

  if (isSecurityRelevant) {
    logger.info('Security event:', {
      method: req.method,
      url: req.url,
      ip: req.ip || 'unknown',
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      hasAuth: !!(req.headers.authorization || req.cookies.accessToken)
    });
  }

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // Log failed authentication attempts
    if (req.url.includes('/auth/') && res.statusCode >= 400) {
      logger.warn('Authentication failure:', {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        ip: req.ip || 'unknown',
        userAgent: req.get('User-Agent'),
        duration
      });
    }

    // Log admin access attempts
    if (req.url.includes('/admin/')) {
      logger.info('Admin access:', {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        ip: req.ip || 'unknown',
        duration
      });
    }
  });

  next();
};

// Request logging for security monitoring
export const securityLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Log suspicious patterns
  const suspiciousPatterns = [
    /\b(union|select|insert|delete|drop|create|alter)\b/i, // SQL injection
    /<script|javascript:|vbscript:|onload|onerror/i, // XSS
    /\.\.\//g, // Path traversal
    /%2e%2e%2f/gi, // Encoded path traversal
  ];

  const requestData = JSON.stringify({
    url: req.url,
    body: req.body,
    query: req.query,
    headers: req.headers
  });

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(requestData));

  if (isSuspicious) {
    console.warn(`Suspicious request detected from ${req.ip || 'unknown'}:`, {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      body: req.body,
      query: req.query
    });
  }

  // Log response time and status
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    if (duration > 5000) { // Log slow requests
      console.warn(`Slow request (${duration}ms):`, {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        ip: req.ip || 'unknown'
      });
    }

    if (res.statusCode >= 400) { // Log error responses
      console.error('Error response:', {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        ip: req.ip || 'unknown',
        userAgent: req.get('User-Agent')
      });
    }
  });

  next();
};

// Content type validation
export const validateContentType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentType = req.get('Content-Type');

    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
        res.status(415).json({
          success: false,
          message: 'Unsupported content type',
          code: 'UNSUPPORTED_MEDIA_TYPE',
          allowedTypes
        });
        return;
      }
    }

    next();
  };
};

// SQL injection prevention for query parameters
export const preventSQLInjection = (req: Request, res: Response, next: NextFunction): void => {
  // Allow known-safe analytics tracking payloads which include nested metadata
  const safePaths = ['/api/analytics/track'];
  if (safePaths.some(path => req.path === path || req.originalUrl?.startsWith(path))) {
    next();
    return;
  }

  const sqlPatterns = [
    /'\s*or\s*'1'='1/i,
    /;\s*drop\s+table/i,
    /union\s+select/i,
    /insert\s+into\s+\w+\s*\(/i,
    /\bexec(?:ute)?\s+\w+/i,
    /--\s*[^\n]*$/m
  ];

  const checkForSQLInjection = (obj: any, path = ''): boolean => {
    if (typeof obj === 'string') {
      const value = obj.trim();
      if (!value) {
        return false;
      }
      return sqlPatterns.some(pattern => pattern.test(value));
    } else if (Array.isArray(obj)) {
      return obj.some((item, index) => checkForSQLInjection(item, `${path}[${index}]`));
    } else if (obj && typeof obj === 'object') {
      return Object.entries(obj).some(([key, value]) =>
        checkForSQLInjection(value, path ? `${path}.${key}` : key)
      );
    }
    return false;
  };

  if (checkForSQLInjection(req.query) || checkForSQLInjection(req.body)) {
    console.warn(`SQL injection attempt detected from ${req.ip || 'unknown'}:`, {
      method: req.method,
      url: req.url,
      query: req.query,
      body: req.body
    });

    res.status(400).json({
      success: false,
      message: 'Invalid request parameters',
      code: 'INVALID_INPUT'
    });
    return;
  }

  next();
};

// Export all security middleware as a combined function
export const applySecurity = [
  securityHeaders,
  cors(corsOptions),
  requestSizeLimit,
  enhancedInputValidation,
  securityLogger,
  securityAuditLogger,
  preventSQLInjection,
  bruteForceProtection,
  honeypotTrap,
  fileUploadSecurity,
  validateContentType(['application/json', 'multipart/form-data', 'application/x-www-form-urlencoded'])
];