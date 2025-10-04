import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/authService';
import { prisma } from '@/lib/database';
// UserRole is stored as string in database
// Valid values: 'ADMIN', 'CUSTOMER', 'TECHNICIAN'
const UserRole = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
  TECHNICIAN: 'TECHNICIAN',
  SUPER_ADMIN: 'SUPER_ADMIN'
} as const;

type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Extend Express Request type to include user and rate limiting
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRoleType;
        firstName: string;
        lastName: string;
      };
      rateLimitKey?: string;
      currentAttempts?: number;
    }
  }
}

/**
 * Middleware to authenticate JWT tokens with enhanced security
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to get token from cookie first, then Authorization header
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
        code: 'MISSING_TOKEN'
      });
      return;
    }

    // Check if token is blacklisted
    const isBlacklisted = await AuthService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      res.status(401).json({
        success: false,
        message: 'Token has been revoked',
        code: 'TOKEN_REVOKED'
      });
      return;
    }

    const decoded = AuthService.verifyToken(token);
    
    // Check if all user tokens were revoked after this token was issued
    const areTokensRevoked = await AuthService.areUserTokensRevoked(decoded.userId, decoded.iat || 0);
    if (areTokensRevoked) {
      res.status(401).json({
        success: false,
        message: 'Token has been revoked for security reasons',
        code: 'TOKEN_REVOKED'
      });
      return;
    }
    
    // Fetch user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isVerified: true,
        lastLoginAt: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User not found or inactive',
        code: 'USER_INACTIVE'
      });
      return;
    }

    if (!user.isVerified) {
      res.status(401).json({
        success: false,
        message: 'Email verification required',
        code: 'EMAIL_NOT_VERIFIED'
      });
      return;
    }

    // Verify token payload matches database user
    if (user.email !== decoded.email || user.role !== decoded.role) {
      res.status(401).json({
        success: false,
        message: 'Token payload mismatch',
        code: 'TOKEN_MISMATCH'
      });
      return;
    }

    req.user = user as any;
    next();
  } catch (error) {
    let message = 'Invalid or expired token';
    let code = 'TOKEN_INVALID';

    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        message = 'Token has expired';
        code = 'TOKEN_EXPIRED';
      } else if (error.message.includes('signature')) {
        message = 'Invalid token signature';
        code = 'TOKEN_SIGNATURE_INVALID';
      }
    }

    res.status(403).json({
      success: false,
      message,
      code
    });
  }
};

/**
 * Middleware to check user roles
 */
export const requireRole = (roles: UserRoleType | UserRoleType[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};

/**
 * Middleware for admin access
 */
export const requireAdmin = requireRole(['ADMIN', 'SUPER_ADMIN']);

/**
 * Middleware for super admin access
 */
export const requireSuperAdmin = requireRole('SUPER_ADMIN');

/**
 * Middleware for technician access
 */
export const requireTechnician = requireRole(['TECHNICIAN', 'ADMIN', 'SUPER_ADMIN']);

/**
 * Middleware for customer access
 */
export const requireCustomer = requireRole(['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']);

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.accessToken;

    if (token) {
      const decoded = AuthService.verifyToken(token);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          isVerified: true,
        },
      });

      if (user && user.isActive && user.isVerified) {
        req.user = user as any;
      }
    }

    next();
  } catch (error) {
    // Ignore token errors in optional auth
    next();
  }
};

/**
 * Middleware to check if user can access their own resources
 */
export const requireOwnershipOrAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  const resourceUserId = req.params.userId || req.body.userId;
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
  const isOwner = req.user.id === resourceUserId;

  if (!isOwner && !isAdmin) {
    res.status(403).json({
      success: false,
      message: 'Access denied - can only access your own resources',
    });
    return;
  }

  next();
};

/**
 * Rate limiting middleware for authentication attempts
 */
export const rateLimitAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const identifier = req.ip;
    const key = `rate_limit:auth:${identifier}`;
    
    // Check current attempts
    const { redisClient } = await import('@/config/redis');
    const attempts = await redisClient.get(key);
    const currentAttempts = attempts ? parseInt(attempts) : 0;
    
    if (currentAttempts >= 5) {
      res.status(429).json({
        success: false,
        message: 'Too many login attempts. Please try again in 15 minutes.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: 15 * 60 // seconds
      });
      return;
    }

    // Store attempt count for failed attempts (will be cleared on success)
    req.rateLimitKey = key;
    req.currentAttempts = currentAttempts;

    next();
  } catch (error) {
    // If Redis is down, allow the request but log the error
    console.error('Rate limiting error:', error);
    next();
  }
};

/**
 * Rate limiting middleware for sensitive operations
 */
export const rateLimitSensitive = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const identifier = req.user?.id || req.ip;
    const key = `rate_limit:sensitive:${identifier}`;
    
    // Check current attempts
    const { redisClient } = await import('@/config/redis');
    const attempts = await redisClient.get(key);
    const currentAttempts = attempts ? parseInt(attempts) : 0;
    
    if (currentAttempts >= 3) {
      res.status(429).json({
        success: false,
        message: 'Too many sensitive operations. Please try again in 30 minutes.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: 30 * 60 // seconds
      });
      return;
    }

    // Increment attempts
    await redisClient.setEx(key, 30 * 60, (currentAttempts + 1).toString()); // 30 minutes

    next();
  } catch (error) {
    // If Redis is down, allow the request but log the error
    console.error('Rate limiting error:', error);
    next();
  }
};