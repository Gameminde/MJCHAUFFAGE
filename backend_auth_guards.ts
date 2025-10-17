// backend/src/middleware/auth.ts
// 🔐 Middlewares d'authentification et d'autorisation centralisés

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpResponse } from '../lib/http';

/**
 * Interface utilisateur JWT
 */
export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Extension de la Request pour inclure l'utilisateur
 */
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

/**
 * Middleware de vérification du token JWT
 * Extrait et vérifie le token, ajoute l'utilisateur à req.user
 */
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extraction du token depuis le header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      HttpResponse.unauthorized(res, 'Token d\'authentification manquant');
      return;
    }

    // Vérification du token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET non défini dans l\'environnement');
      HttpResponse.serverError(res, 'Configuration serveur incorrecte');
      return;
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      HttpResponse.unauthorized(res, 'Token expiré');
    } else if (error instanceof jwt.JsonWebTokenError) {
      HttpResponse.unauthorized(res, 'Token invalide');
    } else {
      HttpResponse.serverError(res, 'Erreur d\'authentification', error);
    }
  }
};

/**
 * Middleware optionnel d'authentification
 * Extrait l'utilisateur si le token est présent, mais n'échoue pas s'il est absent
 */
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (token) {
      const secret = process.env.JWT_SECRET;
      if (secret) {
        const decoded = jwt.verify(token, secret) as JwtPayload;
        req.user = decoded;
      }
    }
    next();
  } catch (error) {
    // En mode optionnel, on ignore les erreurs de token
    next();
  }
};

/**
 * Factory pour créer un middleware de vérification de rôle
 * @param allowedRoles - Liste des rôles autorisés
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user) {
      HttpResponse.unauthorized(res, 'Authentification requise');
      return;
    }

    // Vérifier le rôle
    if (!allowedRoles.includes(req.user.role)) {
      HttpResponse.forbidden(
        res, 
        `Accès refusé. Rôles autorisés: ${allowedRoles.join(', ')}`
      );
      return;
    }

    next();
  };
};

/**
 * Middleware pour vérifier que l'utilisateur accède à ses propres données
 * @param getUserIdFromRequest - Fonction pour extraire l'ID utilisateur depuis la requête
 */
export const requireOwnership = (
  getUserIdFromRequest: (req: AuthRequest) => string
) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      HttpResponse.unauthorized(res, 'Authentification requise');
      return;
    }

    const targetUserId = getUserIdFromRequest(req);
    const currentUserId = req.user.id;

    // Admin peut accéder à toutes les données
    if (req.user.role === 'admin') {
      next();
      return;
    }

    // Vérifier que l'utilisateur accède à ses propres données
    if (currentUserId !== targetUserId) {
      HttpResponse.forbidden(res, 'Vous ne pouvez accéder qu\'à vos propres données');
      return;
    }

    next();
  };
};

/**
 * Middleware pour vérifier les permissions spécifiques
 * @param checkPermission - Fonction de vérification de permission
 */
export const requirePermission = (
  checkPermission: (user: JwtPayload, req: AuthRequest) => boolean | Promise<boolean>
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      HttpResponse.unauthorized(res, 'Authentification requise');
      return;
    }

    try {
      const hasPermission = await checkPermission(req.user, req);
      
      if (!hasPermission) {
        HttpResponse.forbidden(res, 'Permissions insuffisantes');
        return;
      }

      next();
    } catch (error) {
      HttpResponse.serverError(res, 'Erreur de vérification des permissions', error);
    }
  };
};

/**
 * Middleware pour vérifier l'email vérifié
 */
export const requireVerifiedEmail = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    HttpResponse.unauthorized(res, 'Authentification requise');
    return;
  }

  // Supposant que le payload JWT contient un champ emailVerified
  if (!(req.user as any).emailVerified) {
    HttpResponse.forbidden(res, 'Email non vérifié. Veuillez vérifier votre email.');
    return;
  }

  next();
};

/**
 * Combiner plusieurs middlewares d'authentification
 * @param middlewares - Liste de middlewares à exécuter en séquence
 */
export const combineAuth = (...middlewares: Array<(req: AuthRequest, res: Response, next: NextFunction) => void>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    let index = 0;

    const executeNext = (): void => {
      if (index >= middlewares.length) {
        next();
        return;
      }

      const middleware = middlewares[index++];
      middleware(req, res, executeNext);
    };

    executeNext();
  };
};

/**
 * Helper pour générer un token JWT
 */
export const generateToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET non défini');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Helper pour vérifier un token manuellement
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET non défini');
    }

    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    return null;
  }
};