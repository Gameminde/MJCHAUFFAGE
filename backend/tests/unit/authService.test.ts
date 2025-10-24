/// <reference types="jest" />
import { jest, describe, it, expect, afterEach } from '@jest/globals';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthService } from '@/services/authService';
import { config } from '@/config/environment';
import { prisma } from '@/lib/database';
import { redisClient } from '@/config/redis';
import { User } from '@prisma/client';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');
jest.mock('@/config/environment', () => ({
  config: {
    jwt: {
      secret: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      refreshSecret: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      expiresIn: '15m',
      refreshExpiresIn: '7d',
    },
    security: {
      bcryptRounds: 10,
    },
  },
}));
jest.mock('@/lib/database', () => ({
  prisma: {
    user: {
      update: jest.fn(),
    },
    userSession: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    passwordReset: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));
jest.mock('@/config/redis', () => ({
  redisClient: {
    setEx: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  },
}));

const mockedJwt = jwt as unknown as jest.Mocked<typeof jwt>;
const mockedBcrypt = bcrypt as unknown as jest.Mocked<typeof bcrypt>;
const mockedPrisma = prisma as any;
const mockedRedis = redisClient as unknown as { setEx: jest.Mock; get: jest.Mock; del: jest.Mock };

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedpassword',
    role: 'CUSTOMER',
    firstName: 'Test',
    lastName: 'User',
    phone: null,
    avatar: null,
    isActive: true,
    isVerified: false,
    emailVerified: null,
    googleId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
  };

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      (mockedJwt.sign as jest.Mock).mockImplementation((_payload: any, secret: any, _options: any) => { void _payload; void _options;
        if (secret === config.jwt.secret) {
          return accessToken;
        }
        if (secret === config.jwt.refreshSecret) {
          return refreshToken;
        }
        return '';
      });

      const tokens = AuthService.generateTokens(mockUser);

      expect(tokens).toEqual({ accessToken, refreshToken });
      expect(mockedJwt.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload = { userId: 'user-123', email: 'test@example.com', role: 'USER' };
      (mockedJwt.verify as jest.Mock).mockReturnValue(payload as any);

      const result = AuthService.verifyToken('valid-token');

      expect(result).toEqual(payload);
      expect(mockedJwt.verify).toHaveBeenCalledWith('valid-token', config.jwt.secret, {
        issuer: 'mj-chauffage',
        audience: 'mj-chauffage-app',
        algorithms: ['HS256'],
        clockTolerance: 30,
      });
    });

    it('should throw an error for an invalid token', () => {
      (mockedJwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => AuthService.verifyToken('invalid-token')).toThrow('Token verification failed');
    });
  });

  describe('hashPassword and comparePassword', () => {
    it('should hash a password', async () => {
      const hashedPassword = 'hashed-password';
      (mockedBcrypt.hash as jest.Mock).mockImplementation(async () => hashedPassword);

      const result = await AuthService.hashPassword('password123');

      expect(result).toBe(hashedPassword);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should compare a password with a hash', async () => {
      (mockedBcrypt.compare as jest.Mock).mockImplementation(async () => true);

      const result = await AuthService.comparePassword('password123', 'hashed-password');

      expect(result).toBe(true);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
    });
  });

  describe('Redis operations', () => {
    it('should store a refresh token', async () => {
      await AuthService.storeRefreshToken('user-123', 'refresh-token');
      expect(mockedRedis.setEx).toHaveBeenCalledWith('refresh_token:user-123', 7 * 24 * 60 * 60, 'refresh-token');
    });

    it('should validate a refresh token', async () => {
      (mockedRedis.get as jest.Mock).mockImplementation(async () => 'refresh-token');
      const isValid = await AuthService.validateRefreshToken('user-123', 'refresh-token');
      expect(isValid).toBe(true);
    });

    it('should return false for an invalid refresh token', async () => {
      (mockedRedis.get as jest.Mock).mockImplementation(async () => 'different-token');
      const isValid = await AuthService.validateRefreshToken('user-123', 'refresh-token');
      expect(isValid).toBe(false);
    });

    it('should revoke a refresh token', async () => {
      await AuthService.revokeRefreshToken('user-123');
      expect(mockedRedis.del).toHaveBeenCalledWith('refresh_token:user-123');
    });
  });

  describe('Session management', () => {
    it('should create a session', async () => {
      const sessionToken = 'session-token';
      (mockedJwt.sign as jest.Mock).mockReturnValue(sessionToken);
      
      await AuthService.createSession('user-123', '127.0.0.1', 'jest');

      expect(mockedPrisma.userSession.create).toHaveBeenCalled();
      expect(mockedJwt.sign).toHaveBeenCalled();
    });

    it('should validate a session', async () => {
      const session = {
        id: 'session-123',
        userId: 'user-123',
        sessionToken: 'session-token',
        ipAddress: '127.0.0.1',
        userAgent: 'jest',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600 * 1000),
        user: { isActive: true },
      };
      (mockedPrisma.userSession.findUnique as jest.Mock).mockImplementation(async () => session);

      const isValid = await AuthService.validateSession('session-token');
      expect(isValid).toBe(true);
    });

    it('should return false for an expired session', async () => {
        const session = {
            expiresAt: new Date(Date.now() - 3600 * 1000),
            user: { isActive: true },
        };
        (mockedPrisma.userSession.findUnique as jest.Mock).mockImplementation(async () => session);
        const isValid = await AuthService.validateSession('session-token');
        expect(isValid).toBe(false);
    });

    it('should revoke a session', async () => {
      (mockedPrisma.userSession.delete as jest.Mock).mockImplementation(async () => ({}));
      await AuthService.revokeSession('session-token');
      expect(mockedPrisma.userSession.delete).toHaveBeenCalledWith({ where: { sessionToken: 'session-token' } });
    });
  });

  describe('Password reset', () => {
    it('should generate a password reset token', async () => {
      const token = 'reset-token';
      (mockedJwt.sign as jest.Mock).mockReturnValue(token);

      const result = await AuthService.generatePasswordResetToken('user-123');

      expect(result).toBe(token);
      expect(mockedPrisma.passwordReset.create).toHaveBeenCalled();
    });

    it('should validate a password reset token', async () => {
        const token = 'reset-token';
        const decoded = { userId: 'user-123' };
        const record = { token, usedAt: null, expiresAt: new Date(Date.now() + 3600 * 1000) };
        (mockedJwt.verify as jest.Mock).mockReturnValue(decoded as any);
        (mockedPrisma.passwordReset.findUnique as jest.Mock).mockImplementation(async () => record);

        const userId = await AuthService.validatePasswordResetToken(token);
        expect(userId).toBe('user-123');
    });

    it('should return null for an invalid password reset token', async () => {
        (mockedJwt.verify as jest.Mock).mockImplementation(() => { throw new Error('Invalid'); });
        const userId = await AuthService.validatePasswordResetToken('invalid-token');
        expect(userId).toBe(null);
    });

    it('should mark password reset token as used', async () => {
        await AuthService.markPasswordResetTokenAsUsed('reset-token');
        expect(mockedPrisma.passwordReset.update).toHaveBeenCalledWith({
            where: { token: 'reset-token' },
            data: { usedAt: expect.any(Date) },
        });
    });
  });

  describe('updateLastLogin', () => {
    it('should update the last login time for a user', async () => {
      await AuthService.updateLastLogin('user-123');
      expect(mockedPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { lastLoginAt: expect.any(Date) },
      });
    });
  });
});
