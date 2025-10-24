import { Router } from 'express';
import { body } from 'express-validator';
import { CartController } from '@/controllers/cartController';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

// Validate cart items against current stock
router.post('/validate', [
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.productId').isUUID().withMessage('Product ID must be a valid UUID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
], CartController.validateCart);

// Get user's cart (requires authentication)
router.get('/', authenticateToken, CartController.getCart);

// Sync cart with server (requires authentication)
router.post('/sync', authenticateToken, [
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.productId').isUUID().withMessage('Product ID must be a valid UUID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
], CartController.syncCart);

// Clear user's cart (requires authentication)
router.delete('/', authenticateToken, CartController.clearCart);

// Add item to cart (requires authentication)
router.post('/items', authenticateToken, [
  body('productId').isUUID().withMessage('Product ID must be a valid UUID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
], CartController.addItem);

// Update cart item quantity (requires authentication)
router.put('/items/:itemId', authenticateToken, [
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
], CartController.updateItem);

// Remove item from cart (requires authentication)
router.delete('/items/:itemId', authenticateToken, CartController.removeItem);

export default router;