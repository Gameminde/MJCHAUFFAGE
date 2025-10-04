import { Request, Response } from 'express';
import { AuthService } from '@/services/authService';
import { prisma } from '@/lib/database';
// UserRole is stored as string in database
// Valid values: 'ADMIN', 'CUSTOMER', 'TECHNICIAN'
const UserRole = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
  TECHNICIAN: 'TECHNICIAN'
} as const;

type UserRoleType = typeof UserRole[keyof typeof UserRole];
// Simple validation function for admin login
const validateAdminLogin = (body: any) => {
  const errors: { message: string }[] = [];
  
  if (!body.email) {
    errors.push({ message: 'Email is required' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push({ message: 'Invalid email format' });
  }
  
  if (!body.password) {
    errors.push({ message: 'Password is required' });
  } else if (body.password.length < 6) {
    errors.push({ message: 'Password must be at least 6 characters' });
  }
  
  return {
    error: errors.length > 0 ? { details: errors } : null
  };
};

/**
 * Admin login controller
 */
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error } = validateAdminLogin(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message),
      });
      return;
    }

    const { email, password } = req.body;

    // Find user with admin role
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        password: true,
        role: true,
        isActive: true,
        isVerified: true,
      },
    });

    // Check if user exists
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
      return;
    }

    // Check if user is verified
    if (!user.isVerified) {
      res.status(401).json({
        success: false,
        message: 'Email verification required',
      });
      return;
    }

    // Check if user has admin privileges
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    // Verify password
    if (!user.password) {
      res.status(500).json({
        success: false,
        message: 'Authentication method not supported',
      });
      return;
    }

    const isPasswordValid = await AuthService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Generate tokens
    const tokens = AuthService.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role as UserRoleType,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: true,
      isVerified: true,
    } as any);

    // Store refresh token
    await AuthService.storeRefreshToken(user.id, tokens.refreshToken);

    // Update last login
    await AuthService.updateLastLogin(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        tokens,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Admin logout controller
 */
export const adminLogout = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = AuthService.verifyToken(token);
      await AuthService.revokeRefreshToken(decoded.userId);
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Refresh admin token
 */
export const refreshAdminToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token required',
      });
      return;
    }

    // Verify refresh token
    const decoded = AuthService.verifyToken(refreshToken, true);

    // Validate refresh token in database
    const isValid = await AuthService.validateRefreshToken(decoded.userId, refreshToken);
    if (!isValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
      return;
    }

    // Get user
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

    if (!user || !user.isActive || !user.isVerified) {
      res.status(401).json({
        success: false,
        message: 'User not found or inactive',
      });
      return;
    }

    // Check if user has admin privileges
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    // Generate new tokens
    const tokens = AuthService.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role as UserRoleType,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      isVerified: user.isVerified,
    } as any);

    // Store new refresh token
    await AuthService.storeRefreshToken(user.id, tokens.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
};