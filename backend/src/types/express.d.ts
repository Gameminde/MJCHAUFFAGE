import { UserRole } from '@prisma/client';
import * as multer from 'multer';

declare global {
  namespace Express {
    // Export Multer interface to be available in global namespace
    export interface Multer {
      File: multer.File;
    }
    
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'ADMIN' | 'SUPER_ADMIN' | 'TECHNICIAN' | 'CUSTOMER';
        firstName: string;
        lastName: string;
        isActive: boolean;
        isVerified: boolean;
      };
      rateLimitKey?: string;
      currentAttempts?: number;
      file?: multer.File;
      files?: multer.File[] | { [fieldname: string]: multer.File[] };
    }
  }
}

export {};
