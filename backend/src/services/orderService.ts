import { prisma } from '@/lib/database';
import { RealtimeService } from './realtimeService';
import { CacheService } from './cacheService';

// Define enums locally since they might not be exported
type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export interface OrderFilters {
  customerId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

interface Pagination {
  page: number;
  limit: number;
}

interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

export interface OrderItemData {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface ShippingAddressData {
  street: string;
  city: string;
  postalCode: string;
  region?: string;
  country: string;
}

export interface OrderCreateData {
  customerId: string;
  items: OrderItemData[];
  shippingAddress: ShippingAddressData;
  subtotal: number;
  taxAmount?: number;
  shippingAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  notes?: string;
  paymentMethod?: string;
}

export interface GuestOrderData {
  items: OrderItemData[];
  shippingAddress: ShippingAddressData;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  paymentMethod: string;
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
}

export class OrderService {
  /**
   * Create a guest order (no customer account required)
   */
  static async createGuestOrder(data: GuestOrderData) {
    return prisma.$transaction(async (tx: any) => {
      // Generate unique order number
      const orderNumber = await this.generateOrderNumber();

      // Validate stock availability
      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, stockQuantity: true, isActive: true }
        });

        if (!product || !product.isActive) {
          throw new Error(`Product ${item.productId} not found or inactive`);
        }

        if (product.stockQuantity < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`
          );
        }
      }

      // Create guest customer record
      const guestCustomer = await tx.customer.create({
        data: {
          firstName: data.customerInfo.firstName,
          lastName: data.customerInfo.lastName,
          email: data.customerInfo.email,
          phone: data.customerInfo.phone,
          isGuest: true,
        },
      });

      // Create shipping address
      const address = await tx.address.create({
        data: {
          customerId: guestCustomer.id,
          type: 'SHIPPING',
          street: data.shippingAddress.street,
          city: data.shippingAddress.city,
          postalCode: data.shippingAddress.postalCode,
          region: data.shippingAddress.region,
          country: data.shippingAddress.country,
        },
      });

      // Create the order
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: guestCustomer.id,
          addressId: address.id,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          subtotal: data.subtotal,
          taxAmount: 0,
          shippingAmount: data.shippingAmount,
          discountAmount: 0,
          totalAmount: data.totalAmount,
          notes: `Guest order - Payment on delivery`,
        },
        include: {
          customer: true,
          shippingAddress: true,
        },
      });

      // Create order items and update inventory
      for (const item of data.items) {
        // Create order item
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
          },
        });

        // Update product stock
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stockQuantity: true }
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });

        // Create inventory log
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            type: 'SALE',
            quantity: -item.quantity,
            reason: `Guest Order ${orderNumber}`,
            reference: order.id,
            oldQuantity: product!.stockQuantity,
            newQuantity: product!.stockQuantity - item.quantity,
          },
        });
      }

      // Send order confirmation email
      try {
        await this.sendOrderConfirmationEmail(order, data.customerInfo);
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
        // Don't fail the order creation if email fails
      }

      // Emit realtime event
      RealtimeService.notifyOrderUpdate({
        type: 'order_created',
        data: {
          orderId: order.id,
          order,
          customerId: guestCustomer.id,
        },
        timestamp: new Date(),
      });

      return order;
    });
  }

  /**
   * Create a new order with transaction support
   */
  static async createOrder(data: OrderCreateData) {
    return prisma.$transaction(async (tx: any) => {
      // Generate unique order number
      const orderNumber = await this.generateOrderNumber();

      // Validate stock availability
      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, stockQuantity: true, isActive: true }
        });

        if (!product || !product.isActive) {
          throw new Error(`Product ${item.productId} not found or inactive`);
        }

        if (product.stockQuantity < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`
          );
        }
      }

      // Create or get shipping address
      const address = await tx.address.create({
        data: {
          customerId: data.customerId,
          type: 'SHIPPING',
          street: data.shippingAddress.street,
          city: data.shippingAddress.city,
          postalCode: data.shippingAddress.postalCode,
          region: data.shippingAddress.region,
          country: data.shippingAddress.country,
        },
      });

      // Create the order
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: data.customerId,
          addressId: address.id,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          subtotal: data.subtotal,
          taxAmount: data.taxAmount || 0,
          shippingAmount: data.shippingAmount || 0,
          discountAmount: data.discountAmount || 0,
          totalAmount: data.totalAmount,
          notes: data.notes,
        },
        include: {
          customer: {
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true }
              }
            }
          },
          shippingAddress: true,
        },
      });

      // Create order items and update inventory
      for (const item of data.items) {
        // Create order item
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
          },
        });

        // Update product stock
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stockQuantity: true }
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });

        // Create inventory log
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            type: 'SALE',
            quantity: -item.quantity,
            reason: `Order ${orderNumber}`,
            reference: order.id,
            oldQuantity: product!.stockQuantity,
            newQuantity: product!.stockQuantity - item.quantity,
          },
        });
      }

      // Invalidate cache (after transaction)
      await CacheService.invalidateOrderCache(data.customerId);

      // Emit realtime event
      RealtimeService.notifyOrderUpdate({
        type: 'order_created',
        data: {
          orderId: order.id,
          order,
          customerId: data.customerId,
        },
        timestamp: new Date(),
      });

      return order;
    });
  }

  /**
   * Get orders with filtering, pagination, and search
   */
  static async getOrders(filters: OrderFilters, pagination: Pagination, sort: Sort) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.orderDate = {};
      if (filters.dateFrom) where.orderDate.gte = filters.dateFrom;
      if (filters.dateTo) where.orderDate.lte = filters.dateTo;
    }

    if (filters.search) {
      where.OR = [
        { orderNumber: { contains: filters.search } },
        { customer: { user: { firstName: { contains: filters.search } } } },
        { customer: { user: { lastName: { contains: filters.search } } } },
        { customer: { user: { email: { contains: filters.search } } } },
      ];
    }

    // Build orderBy
    const orderBy: any = {};
    orderBy[sort.field] = sort.order;

    // Execute queries
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: {
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true }
              }
            }
          },
          shippingAddress: true,
          items: {
            include: {
              product: {
                select: { id: true, name: true, sku: true, images: { take: 1 } }
              }
            }
          },
          payments: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get order by ID
   */
  static async getOrderById(id: string, customerId?: string) {
    const where: any = { id };
    
    // If customerId is provided, ensure user can only access their own orders
    if (customerId) {
      where.customerId = customerId;
    }

    return prisma.order.findFirst({
      where,
      include: {
        customer: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true, phone: true }
            }
          }
        },
        shippingAddress: true,
        items: {
          include: {
            product: {
              select: { 
                id: true, 
                name: true, 
                sku: true, 
                images: { take: 1, select: { url: true, altText: true } }
              }
            }
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        },
      },
    });
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(id: string, status: OrderStatus, notes?: string) {
    const updateData: any = { status };

    if (notes) {
      updateData.notes = notes;
    }

    // Set timestamps based on status
    switch (status) {
      case 'SHIPPED':
        updateData.shippedAt = new Date();
        break;
      case 'DELIVERED':
        updateData.deliveredAt = new Date();
        break;
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        items: {
          include: {
            product: {
              select: { name: true }
            }
          }
        },
      },
    });

    // Invalidate cache
    await CacheService.invalidateOrderCache(order.customerId, id);

    // Emit realtime event
    RealtimeService.notifyOrderUpdate({
      type: 'order_status_changed',
      data: {
        orderId: id,
        order,
        status,
        customerId: order.customerId,
      },
      timestamp: new Date(),
    });

    return order;
  }

  /**
   * Cancel order and restore inventory
   */
  static async cancelOrder(id: string, reason?: string, customerId?: string) {
    return prisma.$transaction(async (tx: any) => {
      const where: any = { id };
      
      // If customerId is provided, ensure user can only cancel their own orders
      if (customerId) {
        where.customerId = customerId;
      }

      const order = await tx.order.findFirst({
        where: {
          ...where,
          status: { in: ['PENDING', 'CONFIRMED'] }, // Only allow cancellation of pending/confirmed orders
        },
        include: { items: true },
      });

      if (!order) {
        throw new Error('Order not found or cannot be cancelled');
      }

      // Update order status
      await tx.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          notes: reason ? `Cancelled: ${reason}` : order.notes,
        },
      });

      // Restore inventory
      for (const item of order.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stockQuantity: true }
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } },
        });

        // Create inventory log
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            type: 'RETURN',
            quantity: item.quantity,
            reason: `Order ${order.orderNumber} cancelled`,
            reference: order.id,
            oldQuantity: product!.stockQuantity,
            newQuantity: product!.stockQuantity + item.quantity,
          },
        });
      }

      // Invalidate cache (after transaction)
      await CacheService.invalidateOrderCache(order.customerId, id);

      // Emit realtime event
      RealtimeService.notifyOrderUpdate({
        type: 'order_cancelled',
        data: {
          orderId: id,
          order,
          customerId: order.customerId,
        },
        timestamp: new Date(),
      });

      return order;
    });
  }

  /**
   * Get order statistics
   */
  static async getOrderStatistics(customerId?: string) {
    const where: any = customerId ? { customerId } : {};

    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
    ] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.count({ where: { ...where, status: 'PENDING' } }),
      prisma.order.count({ where: { ...where, status: 'DELIVERED' } }),
      prisma.order.count({ where: { ...where, status: 'CANCELLED' } }),
      prisma.order.aggregate({
        where: { ...where, status: { not: 'CANCELLED' } },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    };
  }

  /**
   * Calculate estimated delivery date
   */
  static calculateEstimatedDelivery(region?: string): Date {
    const majorCities = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida'];
    const businessDays = region && majorCities.includes(region) ? 2 : 5;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + businessDays);

    return deliveryDate;
  }

  /**
   * Generate unique order number
   */
  private static async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `MJ${timestamp}${random}`;

    // Ensure uniqueness
    const existing = await prisma.order.findUnique({
      where: { orderNumber },
      select: { id: true },
    });

    if (existing) {
      // Recursively generate a new number if collision occurs
      return this.generateOrderNumber();
    }

    return orderNumber;
  }

  /**
   * Send order confirmation email
   */
  private static async sendOrderConfirmationEmail(order: any, customerInfo: any) {
    // Simple email template for order confirmation
    const emailContent = `
      <h2>تأكيد الطلب - Order Confirmation</h2>
      <p>مرحباً ${customerInfo.firstName} ${customerInfo.lastName},</p>
      <p>Bonjour ${customerInfo.firstName} ${customerInfo.lastName},</p>
      
      <p>تم استلام طلبكم بنجاح - Votre commande a été reçue avec succès</p>
      
      <h3>تفاصيل الطلب - Détails de la commande:</h3>
      <ul>
        <li>رقم الطلب - Numéro de commande: ${order.orderNumber}</li>
        <li>المبلغ الإجمالي - Montant total: ${order.totalAmount} DZD</li>
        <li>طريقة الدفع - Mode de paiement: الدفع عند الاستلام / Paiement à la livraison</li>
      </ul>
      
      <p>سيتم التواصل معكم قريباً لتأكيد التوصيل</p>
      <p>Nous vous contacterons bientôt pour confirmer la livraison</p>
      
      <p>شكراً لاختياركم MJ CHAUFFAGE</p>
      <p>Merci d'avoir choisi MJ CHAUFFAGE</p>
    `;

    // In a real implementation, you would use a proper email service
    console.log('Order confirmation email would be sent to:', customerInfo.email);
    console.log('Email content:', emailContent);
    
    // TODO: Implement actual email sending using EmailService
    // await EmailService.sendOrderConfirmation(customerInfo.email, emailContent);
  }

  /**
   * Helper method to get customer by user ID
   */
  static async getCustomerByUserId(userId: string) {
    return prisma.customer.findUnique({
      where: { userId },
      select: { id: true },
    });
  }
}