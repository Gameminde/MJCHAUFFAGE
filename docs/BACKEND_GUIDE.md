# Guide de Développement Backend - MJ CHAUFFAGE

## Vue d'ensemble

Le backend de MJ CHAUFFAGE est une API REST robuste construite avec Express.js et TypeScript, offrant une architecture modulaire, sécurisée et performante pour l'e-commerce et la gestion des services de chauffage.

### Démarrage local & Ports
- Port API par défaut : `3001` (config via `config.api.port` ou `API_PORT`)
- CORS : origines autorisées en dev `http://localhost:3000` (Frontend) et `http://localhost:3002` (Admin v2)
- Commande : `npm run dev` → http://localhost:3001
- Variables utiles : `FRONTEND_URL=http://localhost:3000`

## Stack Technique

### Technologies Principales
- **Express.js 4.18** - Framework web Node.js rapide et minimaliste
- **TypeScript 5.0+** - Typage statique pour la robustesse du code
- **Prisma 6.16** - ORM moderne avec type-safety
- **PostgreSQL** - Base de données relationnelle performante
- **Redis** - Cache et gestion des sessions
- **JWT** - Authentification stateless sécurisée
- **Socket.IO** - Communication temps réel

### Outils de Sécurité
- **Helmet** - Headers de sécurité HTTP
- **bcryptjs** - Hachage sécurisé des mots de passe
- **express-rate-limit** - Limitation du taux de requêtes
- **express-validator** - Validation et sanitisation des entrées
- **DOMPurify** - Protection contre les attaques XSS
- **CORS** - Contrôle d'accès cross-origin

### Outils de Développement
- **Jest** - Framework de tests
- **Winston** - Logging avancé
- **Morgan** - Logging des requêtes HTTP
- **Swagger** - Documentation API automatique
- **ESLint** - Analyse statique du code

## Architecture du Projet

```
backend/src/
├── config/                 # Configuration centralisée
│   ├── environment.ts      # Variables d'environnement
│   ├── database.ts         # Configuration Prisma
│   └── redis.ts           # Configuration Redis
├── controllers/           # Contrôleurs REST
│   ├── authController.ts   # Authentification
│   ├── productController.ts # Gestion produits
│   ├── orderController.ts  # Gestion commandes
│   ├── adminController.ts  # Administration
│   └── analyticsController.ts # Analytics
├── services/             # Logique métier
│   ├── authService.ts     # Services d'authentification
│   ├── productService.ts  # Services produits
│   ├── orderService.ts    # Services commandes
│   └── emailService.ts    # Services email
├── middleware/           # Middlewares Express
│   ├── auth.ts           # Authentification JWT
│   ├── security.ts       # Sécurité et rate limiting
│   ├── validation.ts     # Validation et sanitisation
│   └── errorHandler.ts   # Gestion d'erreurs
├── routes/              # Définition des routes
│   ├── auth.ts          # Routes authentification
│   ├── products.ts      # Routes produits
│   ├── orders.ts        # Routes commandes
│   └── admin.ts         # Routes administration
├── lib/                 # Utilitaires
│   └── database.ts      # Client Prisma
├── utils/               # Fonctions utilitaires
│   ├── logger.ts        # Configuration Winston
│   └── validation.ts    # Helpers de validation
└── server.ts           # Point d'entrée principal
```

## Configuration et Environnement

### Variables d'Environnement (`config/environment.ts`)

```typescript
interface Config {
  env: string;
  api: {
    port: number;
    baseUrl: string;
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
  security: {
    bcryptRounds: number;
  };
  rateLimit: {
    window: number;
    maxRequests: number;
  };
}
```

### Configuration Sécurisée
```typescript
// Validation des secrets JWT
if (!config.jwt.secret || config.jwt.secret.length < 64) {
  throw new Error('JWT secret must be at least 256 bits (64 hex characters)');
}

// Configuration bcrypt sécurisée
const BCRYPT_ROUNDS = config.security.bcryptRounds || 12;
```

## Architecture des Contrôleurs

### Pattern MVC + Services

```typescript
// 1. Route (routes/auth.ts)
router.post('/login', 
  authRateLimit,
  authValidation.login,
  handleValidationErrors,
  AuthController.login
);

// 2. Controller (controllers/authController.ts)
export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      // Validation des entrées
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      // Appel du service
      const result = await AuthService.login(email, password);
      
      if (!result.success) {
        res.status(401).json(result);
        return;
      }

      // Configuration des cookies sécurisés
      AuthService.setAuthCookies(res, result.tokens);
      
      res.json({
        success: true,
        data: { user: result.user }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
```

### Gestion des Erreurs Centralisée

```typescript
// middleware/errorHandler.ts
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Erreurs Prisma
  if (error.name === 'PrismaClientKnownRequestError') {
    handlePrismaError(error, res);
    return;
  }

  // Erreurs JWT
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
    return;
  }

  // Erreur générique
  res.status(500).json({
    success: false,
    message: config.env === 'production' 
      ? 'Internal server error' 
      : error.message
  });
};
```

## Services Métier

### AuthService (`services/authService.ts`)

```typescript
export class AuthService {
  /**
   * Génération de tokens JWT sécurisés
   */
  static generateTokens(user: User): AuthTokens {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      issuer: 'mj-chauffage',
      audience: 'mj-chauffage-users'
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: 'mj-chauffage',
      audience: 'mj-chauffage-refresh'
    });

    return { accessToken, refreshToken };
  }

  /**
   * Configuration des cookies sécurisés
   */
  static setAuthCookies(res: Response, tokens: AuthTokens): void {
    const cookieOptions = {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict' as const,
      path: '/',
    };

    res.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });
  }

  /**
   * Authentification avec gestion des tentatives
   */
  static async login(email: string, password: string): Promise<AuthResult> {
    // Vérification du rate limiting par IP/email
    const rateLimitKey = `login_attempts:${email}`;
    const attempts = await redisClient.get(rateLimitKey);
    
    if (attempts && parseInt(attempts) >= 5) {
      return {
        success: false,
        message: 'Too many login attempts. Please try again later.',
        code: 'RATE_LIMITED'
      };
    }

    // Recherche utilisateur
    const user = await prisma.user.findUnique({
      where: { email: sanitizeEmail(email) },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
        lastLoginAt: true
      }
    });

    if (!user || !user.isActive) {
      await this.incrementLoginAttempts(rateLimitKey);
      return {
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      };
    }

    // Vérification du mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      await this.incrementLoginAttempts(rateLimitKey);
      return {
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      };
    }

    // Réinitialisation des tentatives
    await redisClient.del(rateLimitKey);

    // Mise à jour de la dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Génération des tokens
    const tokens = this.generateTokens(user);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      },
      tokens
    };
  }
}
```

## Middlewares de Sécurité

### Authentification JWT (`middleware/auth.ts`)

```typescript
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Récupération du token (cookie ou header)
    let token = req.cookies.accessToken;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'NO_TOKEN'
      });
      return;
    }

    // Vérification du token
    const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
    
    // Vérification de la blacklist (Redis)
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      res.status(401).json({
        success: false,
        message: 'Token has been revoked',
        code: 'TOKEN_REVOKED'
      });
      return;
    }

    // Récupération des données utilisateur
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User not found or inactive',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    // Ajout des données utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
};
```

### Rate Limiting Avancé (`middleware/security.ts`)

```typescript
// Rate limiting par endpoint
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives par fenêtre
  message: {
    success: false,
    message: 'Too many authentication attempts',
    code: 'RATE_LIMITED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return `auth:${req.ip}:${req.body?.email || 'unknown'}`;
  }
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par fenêtre
  message: {
    success: false,
    message: 'Too many requests',
    code: 'RATE_LIMITED'
  }
});

export const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // Plus de requêtes pour les admins
  skip: (req) => {
    return req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN';
  }
});
```

### Validation et Sanitisation (`middleware/validation.ts`)

```typescript
// Sanitisation avancée des entrées
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // Suppression des balises HTML et caractères dangereux
  let sanitized = DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [] 
  });
  
  // Échappement des entités HTML
  sanitized = validator.escape(sanitized);
  
  // Suppression des caractères de contrôle
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Protection contre les injections
  sanitized = sanitized
    .replace(/[<>'"]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .substring(0, 1000);
  
  return sanitized;
};

// Middleware de sanitisation des requêtes
export const sanitizeRequestBody = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

// Validation des schémas avec express-validator
export const authValidation = {
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
  ],
  
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase and number'),
    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be 2-50 characters'),
    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be 2-50 characters')
  ]
};
```

## Base de Données et ORM

### Configuration Prisma (`lib/database.ts`)

```typescript
import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

// Configuration du client Prisma avec optimisations
export const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'event' },
    { level: 'info', emit: 'event' },
    { level: 'warn', emit: 'event' },
  ],
  errorFormat: 'pretty',
});

// Logging des requêtes en développement
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug('Prisma Query:', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });
}

// Gestion des erreurs Prisma
prisma.$on('error', (e) => {
  logger.error('Prisma Error:', e);
});

// Connexion et déconnexion propres
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

### Optimisations des Requêtes

```typescript
// Service avec optimisations
export class ProductService {
  static async getProducts(filters: ProductFilters) {
    return await prisma.product.findMany({
      where: {
        isActive: true,
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.search && {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } }
          ]
        }),
        ...(filters.priceRange && {
          price: {
            gte: filters.priceRange.min,
            lte: filters.priceRange.max
          }
        })
      },
      include: {
        category: {
          select: { id: true, name: true }
        },
        images: {
          select: { id: true, url: true, alt: true },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { reviews: true }
        }
      },
      orderBy: filters.sortBy === 'price' 
        ? { price: filters.sortOrder || 'asc' }
        : { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    });
  }
}
```

## Logging et Monitoring

### Configuration Winston (`utils/logger.ts`)

```typescript
import winston from 'winston';

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

export const logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: config.env === 'development' ? developmentFormat : productionFormat,
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10485760,
      maxFiles: 10,
    }),
    new winston.transports.Console({
      format: config.env === 'development' ? developmentFormat : productionFormat
    })
  ],
});
```

## Tests et Qualité

### Configuration Jest

```json
{
  "testEnvironment": "node",
  "roots": ["<rootDir>/src"],
  "testMatch": ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  "transform": {
    "^.+\\.ts$": "ts-jest"
  },
  "collectCoverageFrom": [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/server.ts"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

### Tests d'Intégration

```typescript
// __tests__/auth.test.ts
describe('Authentication', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
```

## Sécurité

### Headers de Sécurité

```typescript
// Configuration Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### Protection CSRF

```typescript
// Configuration CORS sécurisée
const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3002',
      config.frontend.url
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};
```

## Déploiement et Production

### Scripts de Déploiement

```json
{
  "scripts": {
    "build": "tsc && tsc-alias",
    "start:prod": "node dist/server.js",
    "db:migrate:prod": "npx prisma migrate deploy",
    "db:seed:prod": "npx prisma db seed",
    "security:audit": "npm audit && npm run security:test",
    "health:check": "curl -f http://localhost:3001/health || exit 1"
  }
}
```

### Variables d'Environnement de Production

```env
NODE_ENV=production
API_PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/mjchauffage"
REDIS_URL="redis://localhost:6379"

# JWT Secrets (256-bit minimum)
JWT_SECRET="your-super-secure-jwt-secret-key-256-bits-minimum-length-required"
JWT_REFRESH_SECRET="your-super-secure-refresh-secret-key-256-bits-minimum-length"

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET="your-session-secret-key"

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="noreply@mjchauffage.com"
EMAIL_PASSWORD="your-email-password"
```

## Monitoring et Maintenance

### Health Checks

```typescript
// routes/health.ts
router.get('/health', async (req, res) => {
  try {
    // Vérification base de données
    await prisma.$queryRaw`SELECT 1`;
    
    // Vérification Redis
    await redisClient.ping();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

### Métriques de Performance

```typescript
// Middleware de métriques
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('Request metrics', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });
  
  next();
};
```

## Bonnes Pratiques

### 1. Structure du Code
- Séparation claire des responsabilités (MVC + Services)
- Utilisation de TypeScript strict
- Validation des entrées à tous les niveaux
- Gestion d'erreurs centralisée

### 2. Sécurité
- Authentification JWT avec refresh tokens
- Rate limiting par endpoint et utilisateur
- Sanitisation de toutes les entrées
- Headers de sécurité appropriés
- Logging des événements de sécurité

### 3. Performance
- Requêtes de base de données optimisées
- Cache Redis pour les données fréquentes
- Compression des réponses
- Pagination efficace

### 4. Maintenance
- Logging structuré avec Winston
- Tests automatisés complets
- Documentation API avec Swagger
- Monitoring des métriques de performance

## Dépannage

### Problèmes Courants

1. **Erreurs de connexion base de données**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

2. **Problèmes de tokens JWT**
   - Vérifier la longueur des secrets (minimum 256 bits)
   - Contrôler l'expiration des tokens
   - Vérifier la blacklist Redis

3. **Rate limiting trop strict**
   - Ajuster les limites dans `config/environment.ts`
   - Vérifier les clés Redis pour le rate limiting

### Commandes Utiles

```bash
# Développement
npm run dev                 # Démarrage en mode développement
npm run build              # Build TypeScript
npm run typecheck          # Vérification des types

# Base de données
npm run db:migrate         # Migrations
npm run db:studio          # Interface Prisma Studio
npm run db:seed            # Données de test

# Tests et qualité
npm run test               # Tests unitaires
npm run test:coverage      # Couverture de code
npm run lint               # Analyse du code
npm run security:audit     # Audit de sécurité
```

## Support et Documentation

### Ressources
- **Documentation Express.js** : https://expressjs.com/
- **Documentation Prisma** : https://www.prisma.io/docs
- **Documentation TypeScript** : https://www.typescriptlang.org/docs

### Contact Technique
- **Email** : dev@mjchauffage.com
- **Documentation API** : http://localhost:3001/api-docs
- **Monitoring** : Logs dans `/logs/`

---

*Guide mis à jour le : Janvier 2025*
*Version : 2.0.0*## Dev Database (SQLite) Setup

Use SQLite for local development and tests. Production stays on PostgreSQL (`prisma/schema.prisma`).

- Environment
  - Set `DATABASE_URL="file:./dev.db"` in `backend/.env` or the shell.
  - Tests use `backend/.env.test` with `file:./test.db`.

- Prisma (SQLite schema)
  - Push: `npx prisma db push --schema prisma/schema-sqlite.prisma`
  - Generate client: `npx prisma generate --schema prisma/schema-sqlite.prisma`
  - Seed: `npx prisma db seed --schema prisma/schema-sqlite.prisma`

- Models added in SQLite schema
  - `PageAnalytics`, `EcommerceEvent`, `TrafficSource`, `CacheEntry`, `ErrorLog`, `AnalyticsSession`, `CartItem`
  - Relationships wired to `User`, `Customer`, `Product`, `Category`

- Notes
  - `db push` may drop columns when syncing; review warnings before applying.
  - If admin user is missing, use the seed scripts under `backend/prisma/` or `backend/create-admin-user.ts`.
