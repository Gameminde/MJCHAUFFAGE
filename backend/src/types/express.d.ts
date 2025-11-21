import * as multer from 'multer';

declare global {
  namespace Express {
    // Define Multer as a namespace, not an interface
    namespace Multer {
      // Re-export File interface from multer
      // We need to ensure this matches what's expected
      interface File extends multer.File {}
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
      // Use the namespaced File type
      file?: Multer.File;
      files?: Multer.File[] | { [fieldname: string]: Multer.File[] };
    }
  }
}

export {};
