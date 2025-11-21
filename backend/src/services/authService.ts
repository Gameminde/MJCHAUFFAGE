import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '@/config/environment';
import { prisma } from '@/lib/database';
import { redisClient } from '@/config/redis';
import { Response } from 'express';

// Define User type locally to avoid Prisma import issues
interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  static async findOrCreateSocialUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    image?: string;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      return existingUser;
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: '', // No password for social login
        role: 'CUSTOMER',
        isActive: true,
        isVerified: true,
        customer: {
          create: {
            customerType: 'B2C',
          },
        },
      },
    });

    return newUser;
  }

  static generateTokens(user: User): AuthTokens {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      issuer: 'mj-chauffage',
      audience: 'mj-chauffage-app',
      algorithm: 'HS256',
    } as jwt.SignOptions);

    // Refresh token with minimal payload for security
    const refreshPayload = {
      userId: user.id,
      type: 'refresh',
    };

    const refreshToken = jwt.sign(refreshPayload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: 'mj-chauffage',
      audience: 'mj-chauffage-app',
      algorithm: 'HS256',
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  static setAuthCookies(res: Response, tokens: AuthTokens): void {
    const isProduction = config.env === 'production';

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true, // Not accessible by client-side scripts for security
      secure: isProduction, // HTTPS only in production
      sameSite: 'lax', // CSRF protection
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
      domain: isProduction ? '.mjchauffage.com' : undefined, // Set domain in production
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true, // Not accessible by client-side scripts
      secure: isProduction, // HTTPS only in production
      sameSite: 'lax', // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
      domain: isProduction ? '.mjchauffage.com' : undefined,
    });
  }

  static clearAuthCookies(res: Response): void {
    const isProduction = config.env === 'production';

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      domain: isProduction ? '.mjchauffage.com' : undefined,
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      domain: isProduction ? '.mjchauffage.com' : undefined,
    });
  }

  static verifyToken(token: string, isRefreshToken = false): TokenPayload {
        const secret = isRefreshToken ? config.jwt.refreshSecret : config.jwt.secret;

        if (!secret || secret.length < 64) {
          throw new Error('JWT secret is not properly configured');
        }

        try {
          const decoded = jwt.verify(token, secret, {
            issuer: 'mj-chauffage',
            audience: 'mj-chauffage-app',
            algorithms: ['HS256'], // Explicitly specify algorithm
            clockTolerance: 30, // Allow 30 seconds clock skew
          }) as TokenPayload;

          // Additional validation
          if (!decoded.userId || !decoded.email || !decoded.role) {
            throw new Error('Invalid token payload');
          }

          return decoded;
        } catch (error) {
          if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid token signature');
          } else if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Token has expired');
          } else if (error instanceof jwt.NotBeforeError) {
            throw new Error('Token not active yet');
          } else {
            throw new Error('Token verification failed');
          }
        }
      }

  /**
   * Hash password with secure bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }

        const saltRounds = config.security.bcryptRounds;
        if (saltRounds < 10) {
          throw new Error('Bcrypt rounds must be at least 10 for security');
        }

        return bcrypt.hash(password, saltRounds);
      }

  /**
   * Compare password with hash securely
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
        if (!password || !hash) {
          return false;
        }

        try {
          return await bcrypt.compare(password, hash);
        } catch (error) {
          console.error('Password comparison error:', error);
          return false;
        }
      }

  /**
   * Store refresh token in Redis
   */
  static async storeRefreshToken(userId: string, token: string): Promise<void> {
        try {
          const key = `refresh_token:${userId}`;
          // Store for 7 days
          await redisClient.setEx(key, 7 * 24 * 60 * 60, token);
        } catch (error) {
          console.error('Error storing refresh token:', error);
        }
      }

  /**
   * Validate refresh token from Redis
   */
  static async validateRefreshToken(userId: string, token: string): Promise<boolean> {
        try {
          const key = `refresh_token:${userId}`;
          const storedToken = await redisClient.get(key);
          return storedToken === token;
        } catch (error) {
          console.error('Error validating refresh token:', error);
          return false;
        }
      }

  /**
   * Remove refresh token from Redis
   */
  static async revokeRefreshToken(userId: string): Promise<void> {
        try {
          const key = `refresh_token:${userId}`;
          await redisClient.del(key);
        } catch (error) {
          console.error('Error revoking refresh token:', error);
        }
      }

  /**
   * Blacklist a token (for logout/security)
   */
  static async blacklistToken(token: string, expiresIn: number): Promise<void> {
        try {
          const key = `blacklisted_token:${token}`;
          await redisClient.setEx(key, expiresIn, 'true');
        } catch (error) {
          console.error('Error blacklisting token:', error);
        }
      }

  /**
   * Check if token is blacklisted
   */
  static async isTokenBlacklisted(token: string): Promise<boolean> {
        try {
          const key = `blacklisted_token:${token}`;
          const result = await redisClient.get(key);
          return result === 'true';
        } catch (error) {
          console.error('Error checking token blacklist:', error);
          return false;
        }
      }

  /**
   * Revoke all tokens for a user (security breach response)
   */
  static async revokeAllUserTokens(userId: string): Promise<void> {
        try {
          // Remove refresh tokens
          await this.revokeRefreshToken(userId);

          // Add user to token revocation list with timestamp
          const key = `user_token_revoked:${userId}`;
          const timestamp = Date.now().toString();
          await redisClient.setEx(key, 7 * 24 * 60 * 60, timestamp); // 7 days
        } catch (error) {
          console.error('Error revoking all user tokens:', error);
        }
      }

  /**
   * Check if user tokens were revoked after token issue time
   */
  static async areUserTokensRevoked(userId: string, tokenIssuedAt: number): Promise<boolean> {
        try {
          const key = `user_token_revoked:${userId}`;
          const revokedTimestamp = await redisClient.get(key);

          if (!revokedTimestamp) {
            return false;
          }

          return parseInt(revokedTimestamp) > tokenIssuedAt * 1000; // Convert to milliseconds
        } catch (error) {
          console.error('Error checking user token revocation:', error);
          return false;
        }
      }

  /**
   * Create user session
   */
  static async createSession(
        userId: string,
        ipAddress?: string,
        userAgent?: string
      ): Promise<string> {
        const sessionToken = jwt.sign(
          { userId, sessionId: Date.now().toString() },
          config.jwt.secret,
          { expiresIn: '24h' }
        );

        await prisma.userSession.create({
          data: {
            userId,
            sessionToken,
            ipAddress: ipAddress || null,
            userAgent: userAgent || null,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        });

        return sessionToken;
      }

  /**
   * Validate user session
   */
  static async validateSession(sessionToken: string): Promise<boolean> {
        try {
          const session = await prisma.userSession.findUnique({
            where: { sessionToken },
            include: { user: true },
          });

          if (!session || session.expiresAt < new Date()) {
            return false;
          }

          return session.user.isActive;
        } catch (error) {
          return false;
        }
      }

  /**
   * Revoke user session
   */
  static async revokeSession(sessionToken: string): Promise<void> {
        await prisma.userSession.delete({
          where: { sessionToken },
        }).catch(() => {
          // Session might not exist, ignore error
        });
      }

  /**
   * Clean expired sessions
   */
  static async cleanExpiredSessions(): Promise<void> {
        await prisma.userSession.deleteMany({
          where: {
            expiresAt: {
              lt: new Date(),
            },
          },
        });
      }

  /**
   * Generate password reset token
   */
  static async generatePasswordResetToken(userId: string): Promise<string> {
        const token = jwt.sign(
          { userId, type: 'password_reset' },
          config.jwt.secret,
          { expiresIn: '1h' }
        );

        await prisma.passwordReset.create({
          data: {
            userId,
            token,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          },
        });

        return token;
      }

  /**
   * Validate password reset token
   */
  static async validatePasswordResetToken(token: string): Promise<string | null> {
        try {
          const decoded = jwt.verify(token, config.jwt.secret) as any;

          const resetRecord = await prisma.passwordReset.findUnique({
            where: { token },
          });

          if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
            return null;
          }

          return decoded.userId;
        } catch (error) {
          return null;
        }
      }

  /**
   * Mark password reset token as used
   */
  static async markPasswordResetTokenAsUsed(token: string): Promise<void> {
        await prisma.passwordReset.update({
          where: { token },
          data: { usedAt: new Date() },
        });
      }

  /**
   * Update user last login
   */
  static async updateLastLogin(userId: string): Promise<void> {
        await prisma.user.update({
          where: { id: userId },
          data: { lastLoginAt: new Date() },
        });
      }
    }