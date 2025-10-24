// ==============================================================================
// AMÉLIORATIONS DE SÉCURITÉ CRITIQUES - MJ CHAUFFAGE
// À implémenter immédiatement après la correction des erreurs TypeScript
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Utiliser bcryptjs qui est déjà installé
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { z } from 'zod';
import { prisma } from '@/lib/database';

// ==============================================================================
// 1. MIDDLEWARE DE SÉCURITÉ RENFORCÉ
// ==============================================================================

/**
 * Middleware de sécurité global à appliquer sur toutes les routes
 */
export const globalSecurityMiddleware = [
  // Protection des headers HTTP
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }),
  
  // Rate limiting global
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Max 100 requêtes par IP
    message: {
      error: 'Trop de requêtes, veuillez réessayer plus tard.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  })
];

/**
 * Rate limiting spécifique pour l'authentification
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 tentatives de connexion par IP
  message: {
    error: 'Trop de tentatives de connexion, veuillez réessayer plus tard.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true,
});

// ==============================================================================
// 2. GESTION SÉCURISÉE DES TOKENS JWT
// ==============================================================================

interface JWTPayload {
  userId: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  iat: number;
  exp: number;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class SecureTokenManager {
  private static readonly ACCESS_TOKEN_EXPIRY = '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';
  private static readonly JWT_SECRET = process.env.JWT_SECRET!;
  private static readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

  /**
   * Génère une paire de tokens (access + refresh)
   */
  static generateTokenPair(user: { id: string; email: string; role: string }): TokenPair {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role as 'SUPER_ADMIN' | 'ADMIN' | 'USER'
    };

    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
      issuer: 'mj-chauffage',
      audience: 'mj-chauffage-app'
    });

    const refreshToken = jwt.sign(
      { userId: user.id },
      this.REFRESH_SECRET,
      {
        expiresIn: this.REFRESH_TOKEN_EXPIRY,
        issuer: 'mj-chauffage',
        audience: 'mj-chauffage-app'
      }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Vérifie et décode un access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET, {
        issuer: 'mj-chauffage',
        audience: 'mj-chauffage-app'
      }) as JWTPayload;
    } catch (error) {
      throw new Error('Token invalide ou expiré');
    }
  }

  /**
   * Vérifie un refresh token
   */
  static verifyRefreshToken(token: string): { userId: string } {
    try {
      return jwt.verify(token, this.REFRESH_SECRET, {
        issuer: 'mj-chauffage',
        audience: 'mj-chauffage-app'
      }) as { userId: string };
    } catch (error) {
      throw new Error('Refresh token invalide ou expiré');
    }
  }

  /**
   * Extrait le token du header Authorization
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}

// ==============================================================================
// 3. MIDDLEWARE D'AUTHENTIFICATION SÉCURISÉ
// ==============================================================================

/**
 * Middleware d'authentification avec validation complète
 */
export const secureAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Extraire le token
    const token = SecureTokenManager.extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      res.status(401).json({
        error: 'Token d\'authentification requis',
        code: 'MISSING_TOKEN'
      });
      return;
    }

    // 2. Vérifier le token
    const decoded = SecureTokenManager.verifyAccessToken(token);

    // 3. Vérifier que l'utilisateur existe toujours en base
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
        lastLoginAt: true
      }
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        error: 'Utilisateur non trouvé ou désactivé',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    // 4. Ajouter les infos utilisateur à la requête
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as any, // Temporary fix for type compatibility
      firstName: user.firstName,
      lastName: user.lastName
    };

    next();
  } catch (error) {
    res.status(401).json({
      error: 'Authentification échouée',
      code: 'AUTH_FAILED'
    });
  }
};

/**
 * Middleware de vérification des rôles admin
 */
export const requireAdminRole = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user;
  
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    res.status(403).json({
      error: 'Accès réservé aux administrateurs',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
    return;
  }
  
  next();
};

// ==============================================================================
// 4. VALIDATION DES DONNÉES AVEC ZOD
// ==============================================================================

/**
 * Schémas de validation pour les données sensibles
 */
export const ValidationSchemas = {
  // Authentification
  loginSchema: z.object({
    email: z.string().email('Email invalide').min(1, 'Email requis'),
    password: z.string().min(6, 'Mot de passe trop court')
  }),

  // Création d'utilisateur
  createUserSchema: z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    role: z.enum(['ADMIN', 'USER']),
    firstName: z.string().min(1, 'Prénom requis'),
    lastName: z.string().min(1, 'Nom requis'),
    phone: z.string().optional()
  }),

  // Produits
  productSchema: z.object({
    name: z.string().min(1, 'Nom requis').max(255, 'Nom trop long'),
    description: z.string().min(1, 'Description requise'),
    price: z.number().positive('Prix invalide'),
    categoryId: z.string().uuid('ID catégorie invalide'),
    manufacturerId: z.string().uuid('ID fabricant invalide').optional(),
    stockQuantity: z.number().int().min(0, 'Stock invalide'),
    isActive: z.boolean().default(true)
  }),

  // Commandes
  orderSchema: z.object({
    customerId: z.string().uuid('ID client invalide'),
    items: z.array(z.object({
      productId: z.string().uuid('ID produit invalide'),
      quantity: z.number().int().positive('Quantité invalide'),
      price: z.number().positive('Prix invalide')
    })).min(1, 'Au moins un article requis'),
    deliveryAddress: z.string().min(1, 'Adresse de livraison requise'),
    paymentMethod: z.enum(['CARD', 'BANK_TRANSFER', 'CHECK', 'CASH'])
  }),

  // Filtres admin
  adminFiltersSchema: z.object({
    status: z.string().optional(),
    customerId: z.string().uuid().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20)
  })
};

/**
 * Middleware de validation générique
 */
export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Données invalides',
          code: 'VALIDATION_ERROR',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      } else {
        res.status(400).json({
          error: 'Erreur de validation',
          code: 'VALIDATION_ERROR'
        });
      }
    }
  };
};

// ==============================================================================
// 5. GESTION SÉCURISÉE DES MOTS DE PASSE
// ==============================================================================

export class SecurePasswordManager {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Hash un mot de passe de manière sécurisée
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Vérifie un mot de passe contre son hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Génère un mot de passe temporaire sécurisé
   */
  static generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// ==============================================================================
// 6. LOGGING DE SÉCURITÉ
// ==============================================================================

export class SecurityLogger {
  static logAuthAttempt(_ip: string, _email: string, _success: boolean): void {
    // En production, utiliser un vrai système de logging
    // comme Winston avec rotation des logs
  }

  static logSuspiciousActivity(_ip: string, _action: string, _details: any): void {
    // En production, utiliser un vrai système de logging
  }

  static logAdminAction(_userId: string, _action: string, _target: string): void {
    // En production, utiliser un vrai système de logging
  }
}

// ==============================================================================
// 7. MIDDLEWARE D'INSTALLATION DES DÉPENDANCES
// ==============================================================================

/**
 * Fonction pour installer les dépendances de sécurité manquantes
 */
export const installSecurityDependencies = async (): Promise<void> => {
  const dependencies = [
    'helmet',
    'express-rate-limit', 
    'zod',
    'jsonwebtoken',
    '@types/jsonwebtoken'
  ];

  console.log('Dépendances requises:', dependencies.join(', '));
  console.log('Exécutez: npm install ' + dependencies.join(' '));
};
