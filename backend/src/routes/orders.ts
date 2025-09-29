import express from 'express'
import { OrderController } from '../controllers/orderController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Create new order
router.post('/', authenticateToken, OrderController.createOrder)

// Get user's orders
router.get('/', authenticateToken, OrderController.getUserOrders)

// Get specific order
router.get('/:orderId', authenticateToken, OrderController.getOrder)

// Cancel order
router.patch('/:orderId/cancel', authenticateToken, OrderController.cancelOrder)

export default router