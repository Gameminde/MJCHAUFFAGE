import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, requireAdmin } from '@/middleware/auth';
import { fileUploadSecurity } from '@/middleware/security';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';

const router = Router();

// Ensure upload directory exists
const uploadDir = path.resolve(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed mime types from configuration
const allowedMimeTypes = new Set(config.upload.allowedTypes);

// Sanitize filename to avoid unsafe characters
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9-_\.]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

// Map mime type to file extension (fallback to original)
function extFromMime(mime: string, original: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
  };
  const fallback = path.extname(original) || '';
  return map[mime] || fallback || '';
}

// Build public URL for a stored file (relative path for frontend consumption)
function toPublicUrl(filename: string): string {
  return `/files/${encodeURIComponent(filename)}`;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const id = uuidv4();
    const baseOriginal = path.parse(file.originalname).name;
    const safeBase = sanitizeFilename(baseOriginal);
    const ext = extFromMime(file.mimetype, file.originalname);
    cb(null, `${safeBase}-${id}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxSize },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error('INVALID_FILE_TYPE'));
    }
    cb(null, true);
  },
});

/**
 * POST /api/uploads
 * Supports single file via field `image` and multiple via `images`.
 * Requires authentication and admin role.
 */
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 },
  ]),
  fileUploadSecurity,
  (req: Request, res: Response) => {
    try {
      const filesField = (req.files || {}) as Record<string, Express.Multer.File[]>;
      const allFiles: Express.Multer.File[] = [];

      if (filesField.image && filesField.image.length) {
        allFiles.push(...filesField.image);
      }
      if (filesField.images && filesField.images.length) {
        allFiles.push(...filesField.images);
      }

      if (allFiles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded',
          code: 'NO_FILES',
        });
      }

      const results = allFiles.map((f) => ({
        filename: f.filename,
        url: toPublicUrl(f.filename),
        mimeType: f.mimetype,
        size: f.size,
      }));

      logger.info('Files uploaded', {
        count: results.length,
        userId: req.user?.id,
      });

      return res.status(201).json({ success: true, files: results });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      if (message === 'INVALID_FILE_TYPE') {
        return res.status(415).json({
          success: false,
          message: 'File type not allowed',
          code: 'INVALID_FILE_TYPE',
          allowedTypes: Array.from(allowedMimeTypes),
        });
      }
      logger.error('Upload error', { error: message });
      return res.status(500).json({ success: false, message: 'Upload failed' });
    }
  }
);

export default router;
