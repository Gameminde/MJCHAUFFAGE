import { Request, Response } from 'express'
import { prisma } from '../config/database'
import { authenticateToken as authenticateToken } from '../middleware/auth'

interface OrderItem {
  productId: string
  quantity: number
  price: number
}

interface OrderData {
  items: OrderItem[]
  shippingAddress: {
    firstName: string
    lastName: string
    company?: string
    street: string
    city: string
    postalCode: string
    region: string
    phone: string
  }
  orderNotes?: string
  subtotal: number
  shippingCost: number
  total: number
  currency: string
}

export class OrderController {
  // Create a new order
  static async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const orderData: OrderData = req.body

      // Validate required fields
      if (!orderData.items || orderData.items.length === 0) {
        res.status(400).json({ message: 'Order must contain at least one item' });
        return;
      }

      if (!orderData.shippingAddress) {
        res.status(400).json({ message: 'Shipping address is required' });
        return;
      }

      // For cash on delivery orders
      // const paymentMethod = 'cash_on_delivery';

      // Validate stock availability
      for (const item of orderData.items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        })

        if (!product) {
          res.status(400).json({ 
            message: `Product ${item.productId} not found` 
          });
          return;
        }

        if (product.stockQuantity < item.quantity) {
          res.status(400).json({ 
            message: `Insufficient stock for product ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}` 
          });
          return;
        }
      }

      // Generate order number
      const orderNumber = `MJ${Date.now().toString().slice(-8)}`

      // Create order with transaction
      const order = await prisma.$transaction(async (tx: any) => {
        // Create the order
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            customerId: userId,
            status: 'PENDING',
            paymentStatus: 'PENDING',
            
            // Totals
            subtotal: orderData.subtotal,
            shippingCost: orderData.shippingCost,
            tax: 0, // No tax for Algeria initially
            discount: 0,
            total: orderData.total,
            currency: orderData.currency,
            
            // Notes
            notes: orderData.orderNotes,
            
            // Shipping address
            shippingAddress: {
              create: {
                customerId: userId,
                type: 'SHIPPING',
                street: orderData.shippingAddress.street,
                city: orderData.shippingAddress.city,
                postalCode: orderData.shippingAddress.postalCode,
                region: orderData.shippingAddress.region,
                country: 'Algeria'
              }
            }
          }
        })

        // Create order items and update stock
        for (const item of orderData.items) {
          // Create order item
          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.price,
              totalPrice: item.price * item.quantity
            }
          })

          // Update product stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity
              }
            }
          })

          // Create inventory log
          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              type: 'STOCK_OUT',
              quantity: -item.quantity,
              reason: `Order ${orderNumber}`,
              performedBy: userId
            }
          })
        }

        return newOrder
      })

      // Send order confirmation email (in production)
      // await sendOrderConfirmationEmail(order.id)

      // For cash on delivery, no payment info needed
      const paymentInfo = null

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentInfo,
        estimatedDelivery: OrderController.calculateDeliveryDate(orderData.shippingAddress.region)
      })

    } catch (error) {
      console.error('Error creating order:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to create order'
      })
    }
  }

  // Get orders for current user
  static async getUserOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' })
        return
      }

      const { page = 1, limit = 10, status } = req.query

      const where: any = { customerId: userId }
      if (status) {
        where.status = status
      }

      const orders = await prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  images: {
                    take: 1,
                    select: { url: true }
                  }
                }
              }
            }
          },
          shippingAddress: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      })

      const totalOrders = await prisma.order.count({ where })

      res.json({
        success: true,
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalOrders,
          pages: Math.ceil(totalOrders / Number(limit))
        }
      })

    } catch (error) {
      console.error('Error fetching orders:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders'
      })
    }
  }

  // Get specific order details
  static async getOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params
      const userId = req.user?.id
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          customerId: userId // Ensure user can only access their own orders
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  images: {
                    take: 1,
                    select: { url: true }
                  }
                }
              }
            }
          },
          shippingAddress: true,
          customer: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true
                }
              }
            }
          }
        }
      })

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        })
        return
      }

      res.json({
        success: true,
        order
      })

    } catch (error) {
      console.error('Error fetching order:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order'
      })
    }
  }

  // Cancel order (only if pending)
  static async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params
      const userId = req.user?.id
      const { reason } = req.body
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          customerId: userId,
          status: 'PENDING' // Only allow cancellation of pending orders
        },
        include: {
          items: true
        }
      })

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found or cannot be cancelled'
        })
        return
      }

      // Cancel order and restore stock
      await prisma.$transaction(async (tx: any) => {
        // Update order status
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
            notes: reason ? `Cancelled: ${reason}` : 'Cancelled by customer'
          }
        })

        // Restore product stock
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                increment: item.quantity
              }
            }
          })

          // Create inventory log
          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              type: 'STOCK_IN',
              quantity: item.quantity,
              reason: `Order ${order.orderNumber} cancelled`,
              performedBy: userId
            }
          })
        }
      })

      res.json({
        success: true,
        message: 'Order cancelled successfully'
      })

    } catch (error) {
      console.error('Error cancelling order:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to cancel order'
      })
    }
  }

  // Calculate estimated delivery date based on region
  private static calculateDeliveryDate(region: string): string {
    const majorCities = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida']
    const businessDays = majorCities.includes(region) ? 2 : 5

    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + businessDays)

    return deliveryDate.toISOString().split('T')[0] // Return YYYY-MM-DD format
  }
}

// Apply auth middleware to all routes
export const orderRoutes = [
  { method: 'post', path: '/orders', handler: [authenticateToken, OrderController.createOrder] },
  { method: 'get', path: '/orders', handler: [authenticateToken, OrderController.getUserOrders] },
  { method: 'get', path: '/orders/:orderId', handler: [authenticateToken, OrderController.getOrder] },
  { method: 'patch', path: '/orders/:orderId/cancel', handler: [authenticateToken, OrderController.cancelOrder] }
]