import { Router } from 'express';
import { AdminController } from '@/controllers/adminController';
import { adminLogin, adminMe } from '@/controllers/adminAuthController';
import { authenticateToken, requireAdmin, requireSuperAdmin } from '@/middleware/auth';
import { body, param } from 'express-validator';

const router = Router();

// ============================================
// PUBLIC ADMIN ROUTES (NO AUTH REQUIRED)
// ============================================

/**
 * @swagger
 * /api/v1/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Not an admin user
 */
router.post('/login', adminLogin);

// ============================================
// PROTECTED ADMIN ROUTES (AUTH REQUIRED)
// ============================================

// Apply admin authentication to all routes below
router.use(authenticateToken, requireAdmin);

/**
 * @swagger
 * /api/v1/admin/me:
 *   get:
 *     summary: Get current admin user info
 *     tags: [Admin Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User info retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/me', adminMe);

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
 *     router.put('/orders/:orderId/status', updateOrderStatusValidation, AdminController.updateOrderStatus);

/**
 * @swagger
 * /api/admin/orders/{orderId}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
 *       404:
 *         description: Order not found
 */
router.get('/orders/:orderId', AdminController.getOrderDetails);

/**
 * @swagger
 * /api/admin/orders:
 *   post:
 *     summary: Create a manual order (admin only)
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
 *               - customerId
 *               - items
 *               - shippingAddress
 *             properties:
 *               customerId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *               shippingAddress:
 *                 type: object
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation error
 */
router.post('/orders', AdminController.createOrder);

/**
 * @swagger
 * /api/admin/orders/{orderId}:
 *   patch:
 *     summary: Update order details
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
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       404:
 *         description: Order not found
 */
router.patch('/orders/:orderId', AdminController.updateOrder);

/**
 * @swagger
 * /api/admin/orders/{orderId}/cancel:
 *   post:
 *     summary: Cancel an order
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       404:
 *         description: Order not found
 */
router.post('/orders/:orderId/cancel', AdminController.cancelOrder);

/**
 * @swagger
 * /api/admin/orders/{orderId}/ship:
 *   post:
 *     summary: Mark order as shipped
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
 *               - trackingNumber
 *             properties:
 *               trackingNumber:
 *                 type: string
 *               carrier:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order marked as shipped
 *       404:
 *         description: Order not found
 */
router.post('/orders/:orderId/ship', AdminController.shipOrder);

/**
 * @swagger
 * /api/admin/orders/{orderId}/deliver:
 *   post:
 *     summary: Mark order as delivered
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order marked as delivered
 *       404:
 *         description: Order not found
 */
router.post('/orders/:orderId/deliver', AdminController.deliverOrder);

/**
 * @swagger
 * /api/admin/orders/stats:
 *   get:
 *     summary: Get order statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order statistics retrieved successfully
 */
router.get('/orders/stats', AdminController.getOrderStats);

/**
 * @swagger
 * /api/admin/customers:      description: Order not found
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
 *         namrouter.get('/customers/:customerId', AdminController.getCustomerDetails);

/**
 * @swagger
 * /api/admin/customers:
 *   post:
 *     summary: Create a new customer (admin only)
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
 *               company:
 *                 type: string
 *               customerType:
 *                 type: string
 *                 enum: [B2B, B2C]
 *     responses:
 *       201:
 *         description: Customer created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Customer with this email already exists
 */
router.post('/customers', AdminController.createCustomer);

/**
 * @swagger
 * /api/admin/customers/{customerId}:
 *   patch:
 *     summary: Update customer information
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
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
 *               company:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *       404:
 *         description: Customer not found
 */
router.patch('/customers/:customerId', AdminController.updateCustomer);

/**
 * @swagger
 * /api/admin/customers/{customerId}:
 *   delete:
 *     summary: Delete a customer
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
 *         description: Customer deleted successfully
 *       404:
 *         description: Customer not found
 */
router.delete('/customers/:customerId', AdminController.deleteCustomer);

/**
 * @swagger
 * /api/admin/customers/{customerId}/status:
 *   patch:
 *     summary: Toggle customer status (active/inactive)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
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
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Customer status updated successfully
 *       404:
 *         description: Customer not found
 */
router.patch('/customers/:customerId/status', AdminController.toggleCustomerStatus);

/**
 * @swagger
 * /api/admin/customers/stats:
 *   get:
 *     summary: Get customer statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer statistics retrieved successfully
 */
router.get('/customers/stats', AdminController.getCustomerStats);

/**
 * @swagger
 * /api/admin/customers/{customerId}/orders:
 *   get:
 *     summary: Get customer orders
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Customer orders retrieved successfully
 *       404:
 *         description: Customer not found
 */
router.get('/customers/:customerId/orders', AdminController.getCustomerOrders);

/**
 * @swagger
 * /api/admin/services:   200:
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