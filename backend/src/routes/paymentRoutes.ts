import { Router } from 'express'
import { PaymentController } from '../controllers/paymentController'
import { authenticateToken } from '../middleware/auth'
import { validatePaymentRequest, validateVerificationRequest } from '../middleware/validation'

const router = Router()

// Payment processing routes
router.post('/process', authenticateToken, validatePaymentRequest, PaymentController.processPayment)
router.get('/verify/:transactionId', authenticateToken, validateVerificationRequest, PaymentController.verifyPayment)
router.put('/status/:transactionId', authenticateToken, PaymentController.updatePaymentStatus)

// Payment configuration routes
router.get('/methods', PaymentController.getPaymentMethods)
router.post('/shipping-cost', PaymentController.calculateShipping)

// Webhook routes for Algeria Post Dahabia notifications
router.post('/webhook/dahabia', PaymentController.handleDahabiaWebhook)

export default router