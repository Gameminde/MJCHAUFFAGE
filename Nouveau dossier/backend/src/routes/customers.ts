import { Router } from 'express';
import { CustomerController } from '@/controllers/customerController';
import { authenticateToken, requireAdmin } from '@/middleware/auth';
import { body } from 'express-validator';

const router = Router();

// Validation rules
const customerValidation = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
  
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Valid phone number is required'),
  
  body('customerType')
    .optional()
    .isIn(['B2C', 'B2B'])
    .withMessage('Customer type must be B2C or B2B'),
];

const addressValidation = [
  body('type')
    .isIn(['BILLING', 'SHIPPING'])
    .withMessage('Address type must be BILLING or SHIPPING'),
  
  body('street')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
  
  body('city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  
  body('postalCode')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Postal code must be between 3 and 20 characters'),
  
  body('country')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country is required'),
];

// Admin routes
router.get('/', authenticateToken, requireAdmin, CustomerController.getCustomers);
router.get('/statistics', authenticateToken, requireAdmin, CustomerController.getCustomerStatistics);
router.post('/', authenticateToken, requireAdmin, customerValidation, CustomerController.createCustomer);
router.get('/:id', authenticateToken, requireAdmin, CustomerController.getCustomer);
router.put('/:id', authenticateToken, requireAdmin, CustomerController.updateCustomer);
router.patch('/:id/deactivate', authenticateToken, requireAdmin, CustomerController.deactivateCustomer);
router.patch('/:id/activate', authenticateToken, requireAdmin, CustomerController.activateCustomer);

// Customer self-service routes
router.get('/profile/me', authenticateToken, CustomerController.getProfile);
router.put('/profile/me', authenticateToken, CustomerController.updateProfile);
router.get('/orders/history', authenticateToken, CustomerController.getOrderHistory);

// Address management
router.post('/addresses', authenticateToken, addressValidation, CustomerController.addAddress);
router.put('/addresses/:addressId', authenticateToken, addressValidation, CustomerController.updateAddress);
router.delete('/addresses/:addressId', authenticateToken, CustomerController.deleteAddress);

export default router;