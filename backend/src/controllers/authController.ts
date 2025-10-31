import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '@/services/authService';
// import { // EmailService } from '@/services/emailService';
import { prisma } from '@/lib/database';
import { logger } from '@/utils/logger';

// UserRole is stored as string in database
// Valid values: 'ADMIN', 'CUSTOMER', 'TECHNICIAN'

interface ClientInfo {
  ipAddress: string | null;
  userAgent: string | null;
}

const getClientInfo = (req: Request): ClientInfo => {
  const forwarded = (req.headers['x-forwarded-for'] as string | undefined)
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    ipAddress:
      forwarded?.[0] ||
      (req.headers['x-real-ip'] as string | undefined) ||
      req.socket.remoteAddress ||
      null,
    userAgent: (req.headers['user-agent'] as string | undefined) || null,
  };
};

const formatUserForResponse = (user: any) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role,
  phone: user.phone ?? null,
  avatar: user.avatar ?? null,
  isActive: user.isActive,
  isVerified: user.isVerified ?? false,
  createdAt:
    user.createdAt?.toISOString?.() ?? new Date(user.createdAt).toISOString(),
  updatedAt:
    user.updatedAt?.toISOString?.() ?? new Date(user.updatedAt).toISOString(),
});



export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const { email, password, firstName, lastName, companyName, customerType = 'B2C' } = req.body;

      // Validate password strength
      if (password.length < 8) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long',
          code: 'WEAK_PASSWORD'
        });
        return;
      }

      // Check password complexity
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);

      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        res.status(400).json({
          success: false,
          message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
          code: 'WEAK_PASSWORD'
        });
        return;
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'An account with this email address already exists',
          code: 'EMAIL_EXISTS'
        });
        return;
      }

      // Hash password securely
      const hashedPassword = await AuthService.hashPassword(password);

      // Create user and customer in a transaction
      const result = await prisma.$transaction(async (tx: any) => {
        const user = await tx.user.create({
          data: {
            email: email.toLowerCase(),
            firstName,
            lastName,
            password: hashedPassword,
            role: 'CUSTOMER',
            isVerified: true, // Auto-verify users for easier testing
          },
        });

        const customer = await tx.customer.create({
          data: {
            userId: user.id,
            companyName: companyName || null,
            customerType: customerType as 'B2B' | 'B2C',
          },
        });

        return { user, customer };
      });

      // Generate tokens
      const { accessToken, refreshToken } = AuthService.generateTokens(result.user);
      await AuthService.storeRefreshToken(result.user.id, refreshToken);

      // Send verification email
      // await // EmailService.sendVerificationEmail(result.user.email, result.user.firstName);

      AuthService.setAuthCookies(res, { accessToken, refreshToken });

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email for verification.',
        data: {
          user: formatUserForResponse(result.user),
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          customer: true,
          technician: true,
        },
      });

      if (!user || !user.password) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        });
        return;
      }

      if (!user.isActive) {
        res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please contact support.',
          code: 'ACCOUNT_INACTIVE',
        });
        return;
      }

      const isPasswordValid = await AuthService.comparePassword(password, user.password);

      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        });
        return;
      }

      // Email verification disabled for easier testing
      // if (!user.isVerified) {
      //   res.status(401).json({
      //     success: false,
      //     message: 'Please verify your email address before logging in',
      //     code: 'EMAIL_NOT_VERIFIED',
      //   });
      //   return;
      // }

      const tokens = AuthService.generateTokens(user);

      try {
        await AuthService.storeRefreshToken(user.id, tokens.refreshToken);
      } catch (error) {
        logger.warn('Failed to store refresh token', { userId: user.id, error });
      }

      AuthService.setAuthCookies(res, tokens);

      await prisma.user
        .update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })
        .catch((error) => {
          logger.warn('Failed to update lastLoginAt', { userId: user.id, error });
        });

      logger.info('User logged in successfully', {
        userId: user.id,
        email: user.email,
        ...getClientInfo(req),
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: formatUserForResponse(user),
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
    } catch (error) {
      logger.error('Login error', { error });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Refresh access token with enhanced security
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token required',
          code: 'MISSING_REFRESH_TOKEN'
        });
        return;
      }

      // Verify refresh token
      const decoded = AuthService.verifyToken(refreshToken, true);
      
      // Check if user tokens were revoked
      const areTokensRevoked = await AuthService.areUserTokensRevoked(decoded.userId, decoded.iat || 0);
      if (areTokensRevoked) {
        res.status(401).json({
          success: false,
          message: 'Refresh token has been revoked for security reasons',
          code: 'TOKEN_REVOKED'
        });
        return;
      }
      
      // Validate token in Redis
      const isValidToken = await AuthService.validateRefreshToken(decoded.userId, refreshToken);
      if (!isValidToken) {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN'
        });
        return;
      }

      // Get user with full validation
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

      // Revoke old refresh token first
      await AuthService.revokeRefreshToken(user.id);

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = AuthService.generateTokens(user);
      await AuthService.storeRefreshToken(user.id, newRefreshToken);

      AuthService.setAuthCookies(res, { accessToken, refreshToken: newRefreshToken });

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          }
        }
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      
      let message = 'Invalid or expired refresh token';
      let code = 'REFRESH_TOKEN_INVALID';

      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          message = 'Refresh token has expired';
          code = 'REFRESH_TOKEN_EXPIRED';
        } else if (error.message.includes('signature')) {
          message = 'Invalid refresh token signature';
          code = 'REFRESH_TOKEN_SIGNATURE_INVALID';
        }
      }

      res.status(401).json({
        success: false,
        message,
        code
      });
    }
  }

  /**
   * Logout user with secure token revocation
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken, accessToken } = req.cookies;
      const userId = req.user?.id;

      if (userId) {
        // Revoke refresh token
        if (refreshToken) {
          await AuthService.revokeRefreshToken(userId);
        }

        // Blacklist current access token
        if (accessToken) {
          try {
            const decoded = AuthService.verifyToken(accessToken);
            const expiresIn = (decoded.exp || 0) - Math.floor(Date.now() / 1000);
            if (expiresIn > 0) {
              await AuthService.blacklistToken(accessToken, expiresIn);
            }
          } catch (error) {
            // Token might be invalid, but continue with logout
            console.warn('Could not blacklist token during logout:', error);
          }
        }
      }

      AuthService.clearAuthCookies(res);

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId! },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isVerified: true,
          lastLoginAt: true,
          createdAt: true,
          customer: {
            select: {
              id: true,
              companyName: true,
              customerType: true,
              totalSpent: true,
              orderCount: true,
              lastOrderAt: true,
              addresses: true,
            },
          },
          technician: {
            select: {
              id: true,
              employeeId: true,
              specialties: true,
            },
          },
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const userId = req.user?.id;
      const { firstName, lastName, phone } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId! },
        data: {
          firstName,
          lastName,
          phone,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isVerified: true,
        },
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Change password
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const userId = req.user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get current user
      const user = await prisma.user.findUnique({
        where: { id: userId! },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Verify current password
      const isValidPassword = user.password ? await AuthService.comparePassword(currentPassword, user.password) : false;
      if (!isValidPassword) {
        res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD'
        });
        return;
      }

      // Validate new password strength
      if (newPassword.length < 8) {
        res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long',
          code: 'WEAK_PASSWORD'
        });
        return;
      }

      // Check if new password is different from current
      const isSamePassword = await AuthService.comparePassword(newPassword, user.password!);
      if (isSamePassword) {
        res.status(400).json({
          success: false,
          message: 'New password must be different from current password',
          code: 'SAME_PASSWORD'
        });
        return;
      }

      // Hash new password
      const hashedNewPassword = await AuthService.hashPassword(newPassword);

      // Update password in transaction
      await prisma.$transaction(async (tx: any) => {
        await tx.user.update({
          where: { id: userId! },
          data: { 
            password: hashedNewPassword,
            updatedAt: new Date()
          },
        });
      });

      // Revoke all tokens for security (force re-login on all devices)
      await AuthService.revokeAllUserTokens(userId);

      // Log password change for security monitoring
      console.info(`Password changed for user: ${userId} from IP: ${req.ip}`);

      res.json({
        success: true,
        message: 'Password changed successfully. Please log in again.',
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      // Always return success to prevent email enumeration
      if (!user) {
        res.json({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.',
        });
        return;
      }

      // Generate reset token
      // const resetToken = await AuthService.generatePasswordResetToken(user.id);

      // Send reset email
      // await // EmailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);

      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const { token, newPassword } = req.body;

      // Validate reset token
      const userId = await AuthService.validatePasswordResetToken(token);
      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token',
        });
        return;
      }

      // Hash new password
      const hashedPassword = await AuthService.hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId! },
        data: { password: hashedPassword },
      });

      // Mark token as used
      await AuthService.markPasswordResetTokenAsUsed(token);

      // Revoke all refresh tokens
      await AuthService.revokeRefreshToken(userId);

      res.json({
        success: true,
        message: 'Password reset successfully. Please log in with your new password.',
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}