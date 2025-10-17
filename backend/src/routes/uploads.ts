import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, requireAdmin } from '@/middleware/auth';

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage for multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext)
      .replace(/\s+/g, '-')
      .toLowerCase();
    const stamp = Date.now();
    cb(null, `${base}-${stamp}${ext}`);
  },
});

// Only accept image files
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// POST /api/uploads — Upload a single image file
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  upload.single('file'),
  (req: Request, res: Response) => {
    const file: Express.Multer.File | undefined = (req as any).file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

    return res.status(201).json({
      success: true,
      data: {
        url: publicUrl,
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      },
    });
  }
);

export default router;