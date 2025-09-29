import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '@/config/environment';
import { prisma } from '@/config/database';
import { redisClient } from '@/config/redis';
import { User } from '@prisma/client';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Generate JWT tokens for a user
   */
  static generateTokens(user: User): AuthTokens {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  /**
   * Verify and decode JWT token
   */
  static verifyToken(token: string, isRefreshToken = false): TokenPayload {
    const secret = isRefreshToken ? config.jwt.refreshSecret : config.jwt.secret;
    
    try {
      return jwt.verify(token, secret, {
        issuer: 'mj-chauffage',
        audience: 'mj-chauffage-app',
      }) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Hash password
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.security.bcryptRounds);
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
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