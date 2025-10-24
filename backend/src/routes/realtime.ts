import { Router } from 'express';
import { RealtimeController } from '@/controllers/realtimeController';
import { authenticateToken, requireAdmin } from '@/middleware/auth';
import { body } from 'express-validator';

const router = Router();

// Validation rules
const notificationValidation = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters'),
  
  body('adminOnly')
    .optional()
    .isBoolean()
    .withMessage('adminOnly must be a boolean'),
];

const cacheValidation = [
  body('pattern')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Cache pattern is required'),
  
  body('message')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Message cannot exceed 200 characters'),
];

const broadcastValidation = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  
  body('eventType')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Event type cannot exceed 50 characters'),
];

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Connection and room management
router.get('/stats/connections', RealtimeController.getConnectionStats);
router.get('/rooms/:roomName', RealtimeController.getRoomInfo);

// System notifications
router.post('/notifications/system', notificationValidation, RealtimeController.sendSystemNotification);
router.post('/broadcast', broadcastValidation, RealtimeController.broadcastMessage);
router.post('/force-refresh', RealtimeController.forceRefresh);

// Cache management
router.get('/cache/stats', RealtimeController.getCacheStats);
router.post('/cache/invalidate', cacheValidation, RealtimeController.invalidateCache);
router.post('/cache/clear', RealtimeController.clearAllCache);
router.post('/cache/clean-expired', RealtimeController.cleanExpiredCache);

// Testing
router.post('/test', RealtimeController.testRealtimeConnection);

export default router;