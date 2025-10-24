// backend/src/controllers/authController.ts - CORRECTIONS

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logger } from '@/utils/logger';
import { config } from '@/config/environment';

const prisma = new PrismaClient();

// ========================================
// TYPES & INTERFACES
// ========================================

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: UserDTO;
    accessToken: string;
    refreshToken: string;
  };
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function generateTokens(user: any): { accessToken: string; refreshToken: string } {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn || '15m'
  });

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn || '7d'
  });

  return { accessToken, refreshToken };
}

function formatUserForResponse(user: any): UserDTO {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phone: user.phone || undefined,
    avatar: user.avatar || undefined,
    isActive: user.isActive,
    isVerified: user.isVerified || false,
    createdAt: user.createdAt.toISOString()
  };
}

function getClientInfo(req: Request): { ipAddress: string | null; userAgent: string | null } {
  // Extract IP address safely
  const ipAddress = 
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    null;

  // Extract user agent safely
  const userAgent = req.headers['user-agent'] || null;

  return { ipAddress, userAgent };
}

// ========================================
// CONTROLLERS
// ========================================

export class AuthController {
  
  /**
   * Register new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { email, password, firstName, lastName, phone, customerType = 'B2C' } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'User already exists with this email'
        });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds || 12);

      // Get client info
      const { ipAddress, userAgent } = getClientInfo(req);

      // Create user and customer in transaction
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          firstName,
          lastName,
          phone: phone || null,
          role: 'CUSTOMER',
          isActive: true,
          isVerified: false,
          customer: {
            create: {
              customerType,
              firstName,
              lastName,
              email: email.toLowerCase(),
              phone: phone || null
            }
          }
        },
        include: {
          customer: true
        }
      });

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user);

      // Create session
      await prisma.userSession.create({
        data: {
          userId: user.id,
          sessionToken: refreshToken,
          ipAddress: ipAddress || 'unknown',
          userAgent: userAgent || 'unknown',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      }).catch(err => {
        logger.warn('Failed to create session:', err);
        // Non-blocking error
      });

      // Set cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      logger.info('User registered successfully', { userId: user.id, email: user.email });

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: formatUserForResponse(user),
          accessToken,
          refreshToken
        }
      });

    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed. Please try again.'
      });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          customer: true
        }
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please contact support.'
        });
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password || '');

      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user);

      // Get client info
      const { ipAddress, userAgent } = getClientInfo(req);

      // Create session
      await prisma.userSession.create({
        data: {
          userId: user.id,
          sessionToken: refreshToken,
          ipAddress: ipAddress || 'unknown',
          userAgent: userAgent || 'unknown',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      }).catch(err => {
        logger.warn('Failed to create session:', err);
      });

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      }).catch(err => {
        logger.warn('Failed to update last login:', err);
      });

      // Set cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      logger.info('User logged in successfully', { userId: user.id, email: user.email });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: formatUserForResponse(user),
          accessToken,
          refreshToken
        }
      });

    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed. Please try again.'
      });
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
        return;
      }

      // Verify refresh token
      let decoded: TokenPayload;
      try {
        decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as TokenPayload;
      } catch (error) {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
        return;
      }

      // Check if session exists
      const session = await prisma.userSession.findFirst({
        where: {
          sessionToken: refreshToken,
          userId: decoded.userId,
          expiresAt: { gt: new Date() }
        }
      });

      if (!session) {
        res.status(401).json({
          success: false,
          message: 'Session expired or invalid'
        });
        return;
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          message: 'User not found or inactive'
        });
        return;
      }

      // Generate new tokens
      const tokens = generateTokens(user);

      // Update session
      await prisma.userSession.update({
        where: { id: session.id },
        data: {
          sessionToken: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      }).catch(err => {
        logger.warn('Failed to update session:', err);
      });

      // Set cookies
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      });

    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        message: 'Token refresh failed'
      });
    }
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) {
        // Delete session
        await prisma.userSession.deleteMany({
          where: { sessionToken: refreshToken }
        }).catch(err => {
          logger.warn('Failed to delete session:', err);
        });
      }

      // Clear cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      logger.info('User logged out', { userId: req.user?.id });

      res.json({
        success: true,
        message: 'Logout successful'
      });

    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          customer: {
            select: {
              id: true,
              customerType: true,
              companyName: true
            }
          }
        }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: formatUserForResponse(user),
          customer: user.customer
        }
      });

    } catch (error) {
      logger.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user information'
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
          errors: errors.array()
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
        return;
      }

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });

      if (!user || !user.password) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isCurrentPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
        return;
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds || 12);

      // Update password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });

      // Invalidate all sessions except current
      const currentRefreshToken = req.cookies.refreshToken;
      await prisma.userSession.deleteMany({
        where: {
          userId: user.id,
          sessionToken: { not: currentRefreshToken }
        }
      });

      logger.info('Password changed successfully', { userId: user.id });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      logger.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password'
      });
    }
  }
}

export default AuthController;