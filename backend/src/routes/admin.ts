import { Router } from 'express';
import { AdminController } from '@/controllers/adminController';
import { authenticateToken, requireAdmin, requireSuperAdmin } from '@/middleware/auth';
import { body, param } from 'express-validator';

const router = Router();

// Apply admin authentication to all routes
router.use(authenticateToken, requireAdmin);

// Validation rules
const updateOrderStatusValidation = [
  param('orderId').isUUID().withMessage('Order ID must be a valid UUID'),
  body('status')
    .isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])
    .withMessage('Invalid order status'),
  body('trackingNumber')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Tracking number cannot exceed 100 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

const assignTechnicianValidation = [
  param('serviceId').isUUID().withMessage('Service ID must be a valid UUID'),
  body('technicianId').isUUID().withMessage('Technician ID must be a valid UUID'),
  body('scheduledDate').isISO8601().withMessage('Scheduled date must be a valid ISO date'),
];

const createTechnicianValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('employeeId')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Employee ID must be between 3 and 20 characters'),
  body('specialties')
    .isArray({ min: 1 })
    .withMessage('At least one specialty is required'),
];

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard overview statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get('/dashboard', AdminController.getDashboardStats);

/**
 * @swagger
 * /api/admin/activities:
 *   get:
 *     summary: Get recent activities for admin dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Recent activities retrieved successfully
 */
router.get('/activities', AdminController.getRecentActivities);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders with admin filters
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: orderDate
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 */
router.get('/orders', AdminController.getOrders);

/**
 * @swagger
 * /api/admin/orders/{orderId}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED]
 *               trackingNumber:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Order not found
 */
router.put('/orders/:orderId/status', updateOrderStatusValidation, AdminController.updateOrderStatus);

/**
 * @swagger
 * /api/admin/customers:
 *   get:
 *     summary: Get all customers with admin filters
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: customerType
 *         schema:
 *           type: string
 *           enum: [B2B, B2C]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Customers retrieved successfully
 */
router.get('/customers', AdminController.getCustomers);

/**
 * @swagger
 * /api/admin/customers/{customerId}:
 *   get:
 *     summary: Get customer details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer details retrieved successfully
 *       404:
 *         description: Customer not found
 */
router.get('/customers/:customerId', AdminController.getCustomerDetails);

/**
 * @swagger
 * /api/admin/services:
 *   get:
 *     summary: Get all service requests with admin filters
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *       - in: query
 *         name: technicianId
 *         schema:
 *           type: string
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Service requests retrieved successfully
 */
router.get('/services', AdminController.getServiceRequests);

/**
 * @swagger
 * /api/admin/services/{serviceId}/assign:
 *   put:
 *     summary: Assign technician to service request
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - technicianId
 *               - scheduledDate
 *             properties:
 *               technicianId:
 *                 type: string
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Technician assigned successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Service request not found
 */
router.put('/services/:serviceId/assign', assignTechnicianValidation, AdminController.assignTechnician);

/**
 * @swagger
 * /api/admin/technicians:
 *   get:
 *     summary: Get all technicians
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Technicians retrieved successfully
 */
router.get('/technicians', AdminController.getTechnicians);

/**
 * @swagger
 * /api/admin/technicians:
 *   post:
 *     summary: Create new technician
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstName
 *               - lastName
 *               - employeeId
 *               - specialties
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               employeeId:
 *                 type: string
 *               specialties:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Technician created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User with this email already exists
 */
router.post('/technicians', createTechnicianValidation, AdminController.createTechnician);

/**
 * @swagger
 * /api/admin/technicians/{technicianId}:
 *   put:
 *     summary: Update technician
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: technicianId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               specialties:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Technician updated successfully
 *       404:
 *         description: Technician not found
 */
router.put('/technicians/:technicianId', AdminController.updateTechnician);

/**
 * @swagger
 * /api/admin/analytics/sales:
 *   get:
 *     summary: Get sales analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *           default: 30d
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *     responses:
 *       200:
 *         description: Sales analytics retrieved successfully
 */
router.get('/analytics/sales', AdminController.getSalesAnalytics);

/**
 * @swagger
 * /api/admin/inventory/alerts:
 *   get:
 *     summary: Get inventory alerts
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory alerts retrieved successfully
 */
router.get('/inventory/alerts', AdminController.getInventoryAlerts);

/**
 * @swagger
 * /api/admin/export:
 *   get:
 *     summary: Export data (orders, customers, etc.)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [orders, customers, products, services]
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *           default: csv
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Data exported successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid export type or no data found
 */
router.get('/export', AdminController.exportData);

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     summary: Get system settings (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System settings retrieved successfully
 *       403:
 *         description: Super Admin access required
 */
router.get('/settings', requireSuperAdmin, AdminController.getSystemSettings);

/**
 * @swagger
 * /api/admin/settings:
 *   put:
 *     summary: Update system settings (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               siteName:
 *                 type: string
 *               currency:
 *                 type: string
 *               taxRate:
 *                 type: number
 *               emailNotifications:
 *                 type: boolean
 *               maintenanceMode:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: System settings updated successfully
 *       403:
 *         description: Super Admin access required
 */
router.put('/settings', requireSuperAdmin, AdminController.updateSystemSettings);

export default router;