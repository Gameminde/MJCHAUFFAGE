import { Router } from 'express';
import { OrderController } from '@/controllers/orderController';
import { authenticateToken } from '@/middleware/auth';
import { body } from 'express-validator';

const router = Router();

// Validation rules
const orderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),

  body('items.*.productId')
    .isUUID()
    .withMessage('Valid product ID is required'),

  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('items.*.unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),

  body('shippingAddress.street')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address is required'),

  body('shippingAddress.city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City is required'),

  body('shippingAddress.postalCode')
    .optional({ values: 'falsy' })
    .isLength({ min: 3, max: 20 })
    .withMessage('Postal code must be between 3 and 20 characters if provided'),

  body('shippingAddress.country')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country is required'),

  body('subtotal')
    .isFloat({ min: 0 })
    .withMessage('Subtotal must be a positive number'),

  body('totalAmount')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
];

// Guest order validation
const guestOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),

  body('items.*.productId')
    .isUUID()
    .withMessage('Valid product ID is required'),

  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('items.*.unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),

  body('customerInfo.firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name is required (2-50 characters)'),

  body('customerInfo.lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name is required (2-50 characters)'),

  body('customerInfo.phone')
    .trim()
    .matches(/^(\+213|0)[567]\d{8}$/)
    .withMessage('Valid Algerian phone number is required (05, 06, 07 followed by 8 digits)'),

  body('customerInfo.email')
    .optional({ values: 'falsy' })
    .isEmail()
    .withMessage('Valid email address if provided'),

  body('customerInfo.profession')
    .optional({ values: 'falsy' })
    .isIn(['technicien', 'particulier', 'autre'])
    .withMessage('Profession must be one of: technicien, particulier, autre'),

  body('shippingAddress.street')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address is required'),

  body('shippingAddress.city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City is required'),

  body('shippingAddress.postalCode')
    .optional({ values: 'falsy' })
    .isLength({ min: 3, max: 20 })
    .withMessage('Postal code must be between 3 and 20 characters if provided'),

  body('shippingAddress.region')
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Wilaya (region) code is required'),

  body('totalAmount')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
];

// Guest order routes (no authentication required)
router.post('/guest', guestOrderValidation, OrderController.createGuestOrder);
router.get('/track', OrderController.trackGuestOrder); // Track order by orderNumber and phone

// Customer order routes
router.post('/', authenticateToken, orderValidation, OrderController.createOrder);
router.get('/', authenticateToken, OrderController.getUserOrders);
router.get('/statistics', authenticateToken, OrderController.getUserOrderStatistics);
router.get('/:id', authenticateToken, OrderController.getOrder);
router.patch('/:id/cancel', authenticateToken, OrderController.cancelOrder);

export default router;