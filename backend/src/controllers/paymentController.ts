import { Request, Response } from 'express'
import { prisma } from '../config/database'
import { PaymentService } from '../services/paymentService'

export class PaymentController {
  static async processPayment(req: Request, res: Response): Promise<void> {
    try {
      const {
        amount,
        currency,
        method,
        orderId,
        customerInfo,
        shippingAddress,
        cardData
      }: {
        amount: number;
        currency: 'DZD';
        method: string;
        orderId: string;
        customerInfo: any;
        shippingAddress: any;
        cardData?: any;
      } = req.body

      // Validate required fields
      if (!amount || !currency || !method || !orderId || !customerInfo || !shippingAddress) {
        res.status(400).json({
          success: false,
          error: 'Missing required payment information'
        })
        return
      }

      // Validate payment method
      if (!['CASH_ON_DELIVERY', 'DAHABIA_CARD'].includes(method)) {
        res.status(400).json({
          success: false,
          error: 'Invalid payment method'
        })
        return
      }

      // Validate Dahabia card data if required
      if (method === 'DAHABIA_CARD' && !cardData) {
        res.status(400).json({
          success: false,
          error: 'Card data required for Dahabia payment'
        })
        return
      }

      // Process payment based on method
      let paymentResult
      if (method === 'CASH_ON_DELIVERY') {
        paymentResult = await PaymentService.processCashOnDelivery({
          amount,
          currency,
          orderId,
          customerInfo,
          shippingAddress
        })
      } else if (method === 'DAHABIA_CARD') {
        paymentResult = await PaymentService.processDahabiaPayment({
          amount,
          currency,
          orderId,
          customerInfo,
          shippingAddress,
          cardData
        })
      }

      if (paymentResult?.success) {
        // Create payment record in database
        const payment = await prisma.payment.create({
          data: {
            orderId,
            amount,
            currency,
            method,
            status: method === 'CASH_ON_DELIVERY' ? 'PENDING' : 'COMPLETED',
            provider: 'internal',
            providerPaymentId: paymentResult.transactionId || null,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })

        // Update order status
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: method === 'CASH_ON_DELIVERY' ? 'CONFIRMED' : 'PAID',
            paymentStatus: method === 'CASH_ON_DELIVERY' ? 'PENDING' : 'COMPLETED',
            updatedAt: new Date()
          }
        })

        res.json({
          success: true,
          data: {
            transactionId: paymentResult.transactionId,
            status: payment.status,
            redirectUrl: paymentResult.redirectUrl
          }
        })
      } else {
        res.status(400).json({
          success: false,
          error: paymentResult?.error || 'Payment processing failed'
        })
      }
    } catch (error) {
      console.error('Payment processing error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error during payment processing'
      })
    }
  }

  static async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params

      if (!transactionId) {
        res.status(400).json({
          success: false,
          error: 'Transaction ID is required'
        })
        return
      }

      // Get payment from database
      const payment = await prisma.payment.findUnique({
        where: { id: transactionId },
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: true
                }
              }
            }
          }
        }
      })

      if (!payment) {
        res.status(404).json({
          success: false,
          error: 'Payment not found'
        })
        return
      }

      // For Dahabia payments, verify with Algeria Post gateway
      if (payment.method === 'DAHABIA_CARD') {
        const verificationResult = await PaymentService.verifyDahabiaPayment(transactionId)
        
        if (verificationResult.success) {
          // Update payment status
          await prisma.payment.update({
            where: { id: transactionId },
            data: {
              status: 'COMPLETED',
              updatedAt: new Date()
            }
          })

          // Update order status
          await prisma.order.update({
            where: { id: payment.orderId },
            data: {
              status: 'PAID',
              paymentStatus: 'COMPLETED',
              updatedAt: new Date()
            }
          })
        }

        res.json({
          success: verificationResult.success,
          data: {
            payment,
            verificationStatus: verificationResult.success ? 'VERIFIED' : 'FAILED'
          }
        })
      } else {
        // Cash on delivery payments are verified upon delivery
        res.json({
          success: true,
          data: {
            payment,
            verificationStatus: 'PENDING_DELIVERY'
          }
        })
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error during payment verification'
      })
    }
  }

  static async getPaymentMethods(_req: Request, res: Response): Promise<void> {
    try {
      const paymentMethods = [
        {
          id: 'CASH_ON_DELIVERY',
          name: 'Cash on Delivery',
          nameAr: 'الدفع عند الاستلام',
          nameFr: 'Paiement à la livraison',
          description: 'Pay when you receive your order',
          enabled: true,
          fees: 0,
          icon: 'truck'
        },
        {
          id: 'DAHABIA_CARD',
          name: 'Dahabia Card',
          nameAr: 'بطاقة الذهبية',
          nameFr: 'Carte Dahabia',
          description: 'Algeria Post electronic payment card',
          enabled: true,
          fees: 0,
          provider: 'Algeria Post',
          icon: 'credit-card'
        }
      ]

      res.json({
        success: true,
        data: paymentMethods
      })
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  static async calculateShipping(req: Request, res: Response): Promise<void> {
    try {
      const { wilaya, totalAmount } = req.body

      if (!wilaya || !totalAmount) {
        res.status(400).json({
          success: false,
          error: 'Wilaya and total amount are required'
        })
        return
      }

      const shippingCost = PaymentService.calculateShippingCost(wilaya, totalAmount)

      res.json({
        success: true,
        data: {
          wilaya,
          shippingCost,
          freeShippingThreshold: 50000,
          isFreeShipping: totalAmount >= 50000
        }
      })
    } catch (error) {
      console.error('Error calculating shipping:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  static async updatePaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params
      const { status } = req.body

      if (!transactionId || !status) {
        res.status(400).json({
          success: false,
          error: 'Transaction ID and status are required'
        })
        return
      }

      const validStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid status'
        })
        return
      }

      const payment = await prisma.payment.update({
        where: { id: transactionId },
        data: {
          status,
          updatedAt: new Date()
        }
      })

      // Update corresponding order status
      if (status === 'COMPLETED') {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            status: 'PAID',
            paymentStatus: 'COMPLETED',
            updatedAt: new Date()
          }
        })
      } else if (status === 'FAILED' || status === 'CANCELLED') {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            status: 'CANCELLED',
            paymentStatus: status,
            updatedAt: new Date()
          }
        })
      }

      res.json({
        success: true,
        data: payment
      })
    } catch (error) {
      console.error('Error updating payment status:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  static async handleDahabiaWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId, status, signature } = req.body
      // const { amount, timestamp } = req.body // Unused variables

      // Verify webhook signature (in production, verify with Algeria Post secret)
      if (!signature) {
        res.status(400).json({
          success: false,
          error: 'Missing webhook signature'
        })
        return
      }

      // Find payment record
      const payment = await prisma.payment.findUnique({
        where: { id: transactionId }
      })

      if (!payment) {
        res.status(404).json({
          success: false,
          error: 'Payment not found'
        })
        return
      }

      // Update payment status based on webhook
      await prisma.payment.update({
        where: { id: transactionId },
        data: {
          status: status === 'SUCCESS' ? 'COMPLETED' : 'FAILED',
          updatedAt: new Date()
        }
      })

      // Update order status
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: status === 'SUCCESS' ? 'PAID' : 'CANCELLED',
          paymentStatus: status === 'SUCCESS' ? 'COMPLETED' : 'FAILED',
          updatedAt: new Date()
        }
      })

      res.json({
        success: true,
        message: 'Webhook processed successfully'
      })
    } catch (error) {
      console.error('Webhook processing error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
}