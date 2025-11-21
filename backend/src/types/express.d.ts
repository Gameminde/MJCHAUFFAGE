import * as multer from 'multer';

declare global {
  namespace Express {
    namespace Multer {
      // Explicitly define the File interface to avoid any import/extension issues
      interface File {
        /** Name of the form field associated with this file. */
        fieldname: string;
        /** Name of the file on the uploader's computer. */
        originalname: string;
        /** Value of the `Content-Transfer-Encoding` header for this file. */
        encoding: string;
        /** Value of the `Content-Type` header for this file. */
        mimetype: string;
        /** Size of the file in bytes. */
        size: number;
        /** The folder to which the file has been saved (DiskStorage) */
        destination: string;
        /** The name of the file within the destination (DiskStorage) */
        filename: string;
        /** The full path to the uploaded file (DiskStorage) */
        path: string;
        /** A Buffer of the entire file (MemoryStorage) */
        buffer: Buffer;
      }
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
      file?: Multer.File;
      files?: Multer.File[] | { [fieldname: string]: Multer.File[] };
    }
  }
}

export {};
