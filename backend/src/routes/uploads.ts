import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, requireAdmin } from '@/middleware/auth';
import { fileUploadSecurity } from '@/middleware/security';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';
import { StorageService } from '@/services/storageService';

const router = Router();

// Keep local storage for dev environment fallback OR if R2 config is missing
const uploadDir = path.resolve(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedMimeTypes = new Set(config.upload.allowedTypes);

// Configure Multer to use MemoryStorage if we want to upload to R2 directly from buffer
// or DiskStorage if we want to save locally first (or as fallback)
// For R2 upload via AWS SDK lib-storage, MemoryStorage is easiest but watch out for RAM usage on large files
const useR2 = !!(config.storage?.accessKeyId && config.storage?.bucketName);

const storage = useR2 
  ? multer.memoryStorage() 
  : multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, uploadDir);
      },
      filename: (_req, file, cb) => {
        const id = uuidv4();
        const ext = path.extname(file.originalname);
        // Basic sanitization
        const safeName = file.originalname.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        cb(null, `${safeName}-${id}${ext}`);
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
  async (req: Request, res: Response) => {
    try {
      const filesField = (req.files || {}) as Record<string, Express.Multer.File[]>;
      const filesToProcess: Express.Multer.File[] = [];

      if (filesField.image) filesToProcess.push(...filesField.image);
      if (filesField.images) filesToProcess.push(...filesField.images);

      if (filesToProcess.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded',
          code: 'NO_FILES',
        });
      }

      const results = [];

      for (const file of filesToProcess) {
        let publicUrl: string;

        if (useR2) {
          // Upload to R2
          publicUrl = await StorageService.uploadFile(file);
        } else {
          // Local file fallback (dev mode only usually)
          publicUrl = `/files/${file.filename}`;
        }

        results.push({
          filename: file.originalname, // Return original name or generated key?
          url: publicUrl,
          mimeType: file.mimetype,
          size: file.size,
        });
      }

      logger.info('Files uploaded', {
        count: results.length,
        userId: req.user?.id,
        mode: useR2 ? 'R2' : 'Local',
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
