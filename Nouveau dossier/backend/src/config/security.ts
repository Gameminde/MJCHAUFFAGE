import { config } from './environment';

export interface SecurityConfig {
  rateLimit: {
    auth: {
      windowMs: number;
      max: number;
    };
    api: {
      windowMs: number;
      max: number;
    };
    admin: {
      windowMs: number;
      max: number;
    };
    strict: {
      windowMs: number;
      max: number;
    };
  };
  cors: {
    allowedOrigins: string[];
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
  };
  headers: {
    contentSecurityPolicy: {
      directives: Record<string, string[]>;
    };
    hsts: {
      maxAge: number;
      includeSubDomains: boolean;
      preload: boolean;
    };
  };
  validation: {
    maxRequestSize: number;
    maxArraySize: number;
    maxObjectKeys: number;
    maxNestingDepth: number;
    maxStringLength: number;
  };
  upload: {
    maxFileSize: number;
    allowedMimeTypes: string[];
    allowedExtensions: string[];
    scanForMalware: boolean;
  };
  session: {
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    maxAge: number;
  };
  jwt: {
    algorithm: string;
    expiresIn: string;
    refreshExpiresIn: string;
    issuer: string;
    audience: string;
  };
  password: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAttempts: number;
    lockoutDuration: number;
  };
  monitoring: {
    logSecurityEvents: boolean;
    alertOnSuspiciousActivity: boolean;
    maxFailedAttempts: number;
    suspiciousActivityThreshold: number;
  };
}

export const securityConfig: SecurityConfig = {
  rateLimit: {
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5 // 5 attempts per window
    },
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // 100 requests per window
    },
    admin: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 200 // Higher limit for admin operations
    },
    strict: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10 // 10 requests per hour for sensitive operations
    }
  },

  cors: {
    allowedOrigins: [
      config.frontend.url,
      'http://localhost:3000',
      'http://localhost:3001',
      'https://mjchauffage.com',
      'https://www.mjchauffage.com',
      'https://admin.mjchauffage.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
      'X-Client-Version',
      'X-CSRF-Token'
    ]
  },

  headers: {
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
          "https://maps.googleapis.com",
          "'nonce-{NONCE}'" // Dynamic nonce for inline scripts
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
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"]
      }
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    }
  },

  validation: {
    maxRequestSize: 10 * 1024 * 1024, // 10MB
    maxArraySize: 1000,
    maxObjectKeys: 100,
    maxNestingDepth: 10,
    maxStringLength: 10000
  },

  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'text/plain',
      'text/csv'
    ],
    allowedExtensions: [
      '.jpg',
      '.jpeg',
      '.png',
      '.webp',
      '.gif',
      '.pdf',
      '.txt',
      '.csv'
    ],
    scanForMalware: config.env === 'production'
  },

  session: {
    secure: config.env === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },

  jwt: {
    algorithm: 'HS256',
    expiresIn: '15m',
    refreshExpiresIn: '7d',
    issuer: 'mjchauffage.com',
    audience: 'mjchauffage-users'
  },

  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAttempts: 5,
    lockoutDuration: 15 * 60 * 1000 // 15 minutes
  },

  monitoring: {
    logSecurityEvents: true,
    alertOnSuspiciousActivity: config.env === 'production',
    maxFailedAttempts: 5,
    suspiciousActivityThreshold: 10
  }
};

// Security patterns for detection
export const securityPatterns = {
  sqlInjection: [
    /(\b(union|select|insert|delete|drop|create|alter|exec|execute)\b)/gi,
    /(;|\||&|\$|`|'|"|\\|\*|\?|<|>|\{|\}|\[|\]|\(|\))/g,
    /(\b(or|and)\b.*=.*)/gi
  ],
  
  xss: [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi
  ],
  
  pathTraversal: [
    /\.\.\//g,
    /%2e%2e%2f/gi,
    /\.\.\\/g
  ],
  
  commandInjection: [
    /[|&;$`]/g,
    /(nc|netcat|wget|curl|ping|nslookup)/gi
  ],
  
  ldapInjection: [
    /[()&|!=*<>~]/g
  ],
  
  nosqlInjection: [
    /(\$where|\$ne|\$in|\$nin|\$gt|\$lt|\$regex)/gi
  ]
};

// Trusted domains for external resources
export const trustedDomains = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net',
  'maps.googleapis.com',
  'images.unsplash.com'
];

// Security headers configuration
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
};

// Environment-specific security overrides
if (config.env === 'development') {
  // Relax some restrictions for development
  securityConfig.cors.allowedOrigins.push('http://localhost:*');
  securityConfig.headers.contentSecurityPolicy.directives.scriptSrc.push("'unsafe-eval'");
  securityConfig.session.secure = false;
}

if (config.env === 'production') {
  // Stricter settings for production
  securityConfig.rateLimit.auth.max = 3; // Stricter auth rate limiting
  securityConfig.monitoring.alertOnSuspiciousActivity = true;
  securityConfig.upload.scanForMalware = true;
}

export default securityConfig;