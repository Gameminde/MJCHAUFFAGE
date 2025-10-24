import { Router } from 'express';
import { ServiceController } from '@/controllers/serviceController';
import { ServiceRequestController } from '@/controllers/serviceRequestController';
import { authenticateToken, requireAdmin, requireTechnician } from '@/middleware/auth';
import { body } from 'express-validator';

const router = Router();

// Validation rules
const serviceRequestValidation = [
  body('serviceTypeId')
    .isUUID()
    .withMessage('Valid service type ID is required'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('requestedDate')
    .isISO8601()
    .withMessage('Valid requested date is required'),
  
  body('priority')
    .optional()
    .isIn(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
    .withMessage('Priority must be LOW, NORMAL, HIGH, or URGENT'),
  
  body('estimatedCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated cost must be a positive number'),
];

const statusUpdateValidation = [
  body('status')
    .isIn(['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
    .withMessage('Invalid status'),
  
  body('technicianId')
    .optional()
    .isUUID()
    .withMessage('Valid technician ID is required'),
  
  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Valid scheduled date is required'),
  
  body('actualCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Actual cost must be a positive number'),
];

const feedbackValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Feedback cannot exceed 1000 characters'),
];

// Service types (public)
router.get('/types', ServiceController.getServices);
router.get('/types/:id', ServiceController.getServiceById);

// Service requests (authenticated)
router.post('/requests', authenticateToken, serviceRequestValidation, ServiceRequestController.createServiceRequest);
router.get('/requests', authenticateToken, ServiceRequestController.getServiceRequests);
router.get('/requests/statistics', authenticateToken, ServiceRequestController.getServiceStatistics);
router.get('/requests/:id', authenticateToken, ServiceRequestController.getServiceRequest);
router.post('/requests/:id/feedback', authenticateToken, feedbackValidation, ServiceRequestController.addServiceFeedback);

// Admin/Technician routes
router.put('/requests/:id/status', authenticateToken, requireTechnician, statusUpdateValidation, ServiceRequestController.updateServiceRequestStatus);
router.get('/technicians/available', authenticateToken, requireAdmin, ServiceRequestController.getAvailableTechnicians);

// Legacy routes (for backward compatibility)
router.get('/', ServiceController.getServices);
router.get('/:id', ServiceController.getServiceById);

export default router;