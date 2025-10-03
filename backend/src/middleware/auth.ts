import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/authService';
import { prisma } from '@/config/database';
// UserRole is stored as string in database
// Valid values: 'ADMIN', 'CUSTOMER', 'TECHNICIAN'
const UserRole = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
  TECHNICIAN: 'TECHNICIAN',
  SUPER_ADMIN: 'SUPER_ADMIN'
} as const;

type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Extend Express Request type to include user
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
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
      });
      return;
    }

    const decoded = AuthService.verifyToken(token);
    
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
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User not found or inactive',
      });
      return;
    }

    if (!user.isVerified) {
      res.status(401).json({
        success: false,
        message: 'Email verification required',
      });
      return;
    }

    req.user = user as any;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
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
    const attempts = await import('@/config/redis').then(({ redisClient }) => 
      redisClient.get(key)
    );
    
    const currentAttempts = attempts ? parseInt(attempts) : 0;
    
    if (currentAttempts >= 5) {
      res.status(429).json({
        success: false,
        message: 'Too many attempts. Please try again in 15 minutes.',
      });
      return;
    }

    // Increment attempts
    const { redisClient } = await import('@/config/redis');
    await redisClient.setEx(key, 15 * 60, (currentAttempts + 1).toString()); // 15 minutes

    next();
  } catch (error) {
    // If Redis is down, allow the request but log the error
    console.error('Rate limiting error:', error);
    next();
  }
};