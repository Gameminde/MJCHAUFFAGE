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
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Postal code is required'),
  
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
    .withMessage('First name is required'),
  
  body('customerInfo.lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name is required'),
  
  body('customerInfo.email')
    .isEmail()
    .withMessage('Valid email is required'),
  
  body('customerInfo.phone')
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Valid phone number is required'),
  
  body('shippingAddress.street')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address is required'),
  
  body('shippingAddress.city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City is required'),
  
  body('shippingAddress.region')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Region is required'),
  
  body('totalAmount')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
];

// Guest order routes (no authentication required)
router.post('/guest', guestOrderValidation, OrderController.createGuestOrder);

// Customer order routes
router.post('/', authenticateToken, orderValidation, OrderController.createOrder);
router.get('/', authenticateToken, OrderController.getUserOrders);
router.get('/statistics', authenticateToken, OrderController.getUserOrderStatistics);
router.get('/:id', authenticateToken, OrderController.getOrder);
router.patch('/:id/cancel', authenticateToken, OrderController.cancelOrder);

export default router;