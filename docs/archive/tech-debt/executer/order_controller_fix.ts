// backend/src/controllers/orderController.ts - CORRECTIONS

import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { validationResult } from 'express-validator';
import { logger } from '@/utils/logger';

const prisma = new PrismaClient();

// ========================================
// TYPES & INTERFACES
// ========================================

interface OrderDTO {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  orderDate: string;
  shippedAt?: string;
  deliveredAt?: string;
  estimatedDelivery?: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  items: OrderItemDTO[];
  shippingAddress: any;
}

interface OrderItemDTO {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function decimalToNumber(value: Prisma.Decimal | null | undefined): number {
  if (!value) return 0;
  return typeof value === 'number' ? value : parseFloat(value.toString());
}

function formatOrderForResponse(order: any): OrderDTO {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus || 'PENDING',
    paymentMethod: order.payments?.[0]?.method || order.payment?.method || 'UNKNOWN',
    subtotal: decimalToNumber(order.subtotal),
    taxAmount: decimalToNumber(order.taxAmount),
    shippingAmount: decimalToNumber(order.shippingAmount),
    discountAmount: decimalToNumber(order.discountAmount),
    totalAmount: decimalToNumber(order.totalAmount),
    orderDate: order.orderDate?.toISOString() || order.createdAt.toISOString(),
    shippedAt: order.shippedAt?.toISOString(),
    deliveredAt: order.deliveredAt?.toISOString(),
    estimatedDelivery: order.estimatedDelivery?.toISOString(),
    customer: {
      id: order.customer?.id || order.customerId,
      name: order.customer?.user 
        ? `${order.customer.user.firstName} ${order.customer.user.lastName}`
        : order.customer?.firstName && order.customer?.lastName
        ? `${order.customer.firstName} ${order.customer.lastName}`
        : 'Guest Customer',
      email: order.customer?.user?.email || order.customer?.email || 'N/A'
    },
    items: order.items?.map((item: any) => formatOrderItem(item)) || [],
    shippingAddress: order.shippingAddress || {}
  };
}

function formatOrderItem(item: any): OrderItemDTO {
  return {
    id: item.id,
    productId: item.productId,
    productName: item.product?.name || 'Unknown Product',
    quantity: item.quantity,
    unitPrice: decimalToNumber(item.unitPrice),
    totalPrice: decimalToNumber(item.totalPrice),
    image: item.product?.images?.[0]?.url
  };
}

// ========================================
// CONTROLLERS
// ========================================

export class OrderController {
  
  /**
   * Get all orders (with pagination and filters)
   */
  static async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const customerId = req.query.customerId as string;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};
      
      if (status) {
        where.status = status;
      }

      if (customerId) {
        where.customerId = customerId;
      }

      // For non-admin users, filter by their customer ID
      if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
        const customer = await prisma.customer.findUnique({
          where: { userId: req.user?.id }
        });
        
        if (customer) {
          where.customerId = customer.id;
        } else {
          res.status(200).json({
            success: true,
            data: {
              orders: [],
              pagination: { page, limit, total: 0, pages: 0 }
            }
          });
          return;
        }
      }

      // Execute queries
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            },
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    images: {
                      select: { url: true },
                      take: 1
                    }
                  }
                }
              }
            },
            payments: {
              select: {
                method: true,
                status: true
              },
              take: 1
            }
          }
        }),
        prisma.order.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          orders: orders.map(formatOrderForResponse),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Error fetching orders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders'
      });
    }
  }

  /**
   * Get single order by ID
   */
  static async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          customer: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true
                }
              }
            }
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  sku: true,
                  images: {
                    select: { url: true },
                    take: 1
                  }
                }
              }
            }
          },
          payments: {
            select: {
              method: true,
              status: true,
              amount: true,
              paidAt: true
            }
          }
        }
      });

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }

      // Check authorization
      if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
        const customer = await prisma.customer.findUnique({
          where: { userId: req.user?.id }
        });

        if (!customer || customer.id !== order.customerId) {
          res.status(403).json({
            success: false,
            message: 'Access denied'
          });
          return;
        }
      }

      res.json({
        success: true,
        data: formatOrderForResponse(order)
      });

    } catch (error) {
      logger.error('Error fetching order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order'
      });
    }
  }

  /**
   * Create new order
   */
  static async createOrder(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { items, shippingAddress, billingAddress, notes } = req.body;

      // Get customer
      const customer = await prisma.customer.findUnique({
        where: { userId: req.user?.id }
      });

      if (!customer) {
        res.status(400).json({
          success: false,
          message: 'Customer profile not found'
        });
        return;
      }

      // Calculate totals
      let subtotal = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          res.status(400).json({
            success: false,
            message: `Product ${item.productId} not found`
          });
          return;
        }

        if (product.stockQuantity < item.quantity) {
          res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}`
          });
          return;
        }

        const itemTotal = decimalToNumber(product.price) * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: itemTotal
        });
      }

      const taxAmount = subtotal * 0.19; // 19% TVA Algeria
      const shippingAmount = 500; // DZD
      const totalAmount = subtotal + taxAmount + shippingAmount;

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create order
      const order = await prisma.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          subtotal,
          taxAmount,
          shippingAmount,
          discountAmount: 0,
          totalAmount,
          shippingAddress: shippingAddress || {},
          billingAddress: billingAddress || shippingAddress || {},
          notes,
          orderDate: new Date(),
          items: {
            create: orderItems
          }
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  images: { select: { url: true }, take: 1 }
                }
              }
            }
          },
          customer: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        }
      });

      // Update stock
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity
            }
          }
        });
      }

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: formatOrderForResponse(order)
      });

    } catch (error) {
      logger.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create order'
      });
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, trackingNumber, shippingCarrier } = req.body;

      const order = await prisma.order.update({
        where: { id },
        data: {
          status,
          trackingNumber,
          shippingCarrier,
          shippedAt: status === 'SHIPPED' ? new Date() : undefined,
          deliveredAt: status === 'DELIVERED' ? new Date() : undefined
        },
        include: {
          customer: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  images: { select: { url: true }, take: 1 }
                }
              }
            }
          }
        }
      });

      res.json({
        success: true,
        message: 'Order status updated',
        data: formatOrderForResponse(order)
      });

    } catch (error) {
      logger.error('Error updating order status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update order status'
      });
    }
  }
}

export default OrderController;
