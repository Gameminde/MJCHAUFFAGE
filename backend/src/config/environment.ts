import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  env: string;
  api: {
    port: number;
    baseUrl: string;
  };
  frontend: {
    url: string;
  };
  database: {
    url: string;
  };
  redis: {
    url: string;
    host: string;
    port: number;
  };
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  session: {
    secret: string;
  };
  email: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };
  upload: {
    maxSize: number;
    allowedTypes: string[];
  };
  security: {
    bcryptRounds: number;
  };
  rateLimit: {
    window: number; // minutes
    maxRequests: number;
  };
  externalApis: {
    googleMapsApiKey: string;
    weatherApiKey: string;
    geminiApiKey: string;
  };
  logging: {
    level: string;
    file: string;
  };
  algeria: {
    currency: string;
    defaultLocale: string;
    supportedLocales: string[];
    timezone: string;
  };
}

const requiredEnvVars =
  process.env.NODE_ENV === 'production'
    ? [
        'DATABASE_URL',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'SESSION_SECRET',
        // Email variables are optional for now
        // 'EMAIL_HOST',
        // 'EMAIL_USER',
        // 'EMAIL_PASSWORD',
      ]
    : [
        // En développement, ne valider que l'essentiel
        'DATABASE_URL',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'SESSION_SECRET',
      ];

// Validate required environment variables
const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
}

export const config: Config = {
  env: process.env.NODE_ENV || 'development',
  
  api: {
    port: parseInt(process.env.PORT || process.env.API_PORT || '3001', 10),
    baseUrl: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || process.env.API_PORT || '3001'}`,
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  
  database: {
    url: process.env.DATABASE_URL!,
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  
  jwt: {
    secret: process.env.JWT_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  session: {
    secret: process.env.SESSION_SECRET!,
  },
  
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'MJ CHAUFFAGE <noreply@mjchauffage.com>',
  },
  
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760', 10), // 10MB
    allowedTypes: (
      process.env.UPLOAD_ALLOWED_TYPES ||
      'image/jpeg,image/png,image/webp,application/pdf'
    ).split(','),
  },
  
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  },
  
  rateLimit: {
    window: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  externalApis: {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    weatherApiKey: process.env.WEATHER_API_KEY || '',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },
  
  algeria: {
    currency: process.env.DEFAULT_CURRENCY || 'DZD',
    defaultLocale: process.env.DEFAULT_LOCALE || 'ar',
    supportedLocales: (
      process.env.SUPPORTED_LOCALES || 'ar,fr'
    ).split(','),
    timezone: process.env.TIMEZONE || 'Africa/Algiers',
  },
};