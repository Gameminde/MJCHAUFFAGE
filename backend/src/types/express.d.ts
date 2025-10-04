import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        firstName: string;
        lastName: string;
        isActive: boolean;
        isVerified: boolean;
      };
      rateLimitKey?: string;
      currentAttempts?: number;
    }
  }
}

export {};