import { prisma } from '@/lib/database';
import { Prisma } from '@prisma/client';
import { AuthService } from './authService';

const DEFAULT_LOW_STOCK_THRESHOLD = 10;

const decimalToNumber = (value: Prisma.Decimal | number | null | undefined): number => {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === 'number') {
    return value;
  }
  return Number(value);
};

// Define string constants for enum-like values
const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED'
} as const;

type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];

const ServiceRequestStatus = {
  PENDING: 'PENDING',
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

type ServiceRequestStatusType = typeof ServiceRequestStatus[keyof typeof ServiceRequestStatus];

interface DashboardFilters {
  status?: string;
  customerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

interface ServiceFilters {
  status?: string;
  priority?: string;
  technicianId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

interface CustomerFilters {
  search?: string;
  customerType?: string;
}

interface Pagination {
  page: number;
  limit: number;
}

interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

interface TechnicianCreateData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  employeeId: string;
  specialties: string[];
}

export class AdminService {
  /**
   * Get dashboard overview statistics
   */
  static async getDashboardStats(timeframe: string) {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [totalRevenue, totalOrders, totalCustomers, totalServices] = await Promise.all([
      prisma.order.aggregate({
        where: {
          orderDate: { gte: startDate },
          status: { not: 'CANCELLED' }
        },
        _sum: { totalAmount: true }
      }),
      prisma.order.count({
        where: { orderDate: { gte: startDate } }
      }),
      prisma.customer.count(),
      prisma.serviceRequest.count({
        where: { createdAt: { gte: startDate } }
      })
    ]);

    // Calculate growth
    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const [previousRevenue, previousOrders, previousCustomers] = await Promise.all([
      prisma.order.aggregate({
        where: {
          orderDate: { gte: previousStartDate, lt: startDate },
          status: { not: 'CANCELLED' }
        },
        _sum: { totalAmount: true }
      }),
      prisma.order.count({
        where: { orderDate: { gte: previousStartDate, lt: startDate } }
      }),
      prisma.customer.count({
        where: { createdAt: { gte: previousStartDate, lt: startDate } }
      })
    ]);

    const totalRevenueValue = decimalToNumber(totalRevenue._sum.totalAmount);
    const previousRevenueValue = decimalToNumber(previousRevenue._sum.totalAmount);

    const revenueGrowth = previousRevenueValue > 0
      ? ((totalRevenueValue - previousRevenueValue) / previousRevenueValue) * 100
      : 0;
    const orderGrowth = previousOrders > 0
      ? ((totalOrders - previousOrders) / previousOrders) * 100
      : 0;
    const customerGrowth = previousCustomers > 0
      ? ((totalCustomers - previousCustomers) / previousCustomers) * 100
      : 0;

    return {
      summary: {
        totalRevenue: totalRevenueValue,
        totalOrders,
        totalCustomers,
        totalServices,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        orderGrowth: Math.round(orderGrowth * 100) / 100,
        customerGrowth: Math.round(customerGrowth * 100) / 100,
      }
    };
  }

  /**
   * Get recent activities across the system
   */
  static async getRecentActivities(limit: number) {
    const [recentOrders, recentCustomers] = await Promise.all([
      prisma.order.findMany({
        take: Math.floor(limit / 2),
        orderBy: { orderDate: 'desc' },
        include: {
          customer: {
            include: { user: { select: { firstName: true, lastName: true } } }
          }
        }
      }),
      prisma.customer.findMany({
        take: Math.floor(limit / 2),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } }
        }
      })
    ]);

    const activities = [
      ...recentOrders.map(order => ({
        type: 'order' as const,
        id: order.id,
        title: `New Order ${order.orderNumber}`,
        description: `${order.customer?.user?.firstName || 'Guest'} placed an order`,
        timestamp: order.orderDate,
        status: order.status
      })),
      ...recentCustomers.map(customer => ({
        type: 'customer' as const,
        id: customer.id,
        title: 'New Customer',
        description: `${customer.user?.firstName || 'Guest'} joined`,
        timestamp: customer.createdAt,
        status: 'active'
      }))
    ];

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get orders with admin filtering
   */
  static async getOrders(filters: DashboardFilters, pagination: Pagination, sort: Sort) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (filters.status) {
      where.status = filters.status as OrderStatusType;
    }
    if (filters.customerId) {
      where.customerId = filters.customerId;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.orderDate = {};
      if (filters.dateFrom) where.orderDate.gte = filters.dateFrom;
      if (filters.dateTo) where.orderDate.lte = filters.dateTo;
    }

    // Use createdAt as default if orderDate is requested but doesn't exist
    const orderByField = sort.field === 'orderDate' ? 'createdAt' : sort.field;
    const orderBy: Prisma.OrderOrderByWithRelationInput = {};
    orderBy[orderByField as keyof Prisma.OrderOrderByWithRelationInput] = sort.order;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true } }
            }
          },
          shippingAddress: true, // Include shipping address
          items: {
            include: {
              product: { 
                select: { 
                  name: true, 
                  price: true,
                  images: {
                    take: 1,
                    select: { url: true, altText: true }
                  }
                } 
              }
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    orderId: string,
    status: OrderStatusType,
    trackingNumber?: string,
    notes?: string
  ) {
    return prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(trackingNumber && { trackingNumber }),
        ...(notes && { notes }),
        ...(status === 'SHIPPED' && { shippedAt: new Date() }),
        ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
      } as any,
      include: {
        customer: {
          include: { user: true }
        }
      }
    });
  }

  /**
   * Get order details by ID
   */
  static async getOrderDetails(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          include: { user: true }
        },
        items: {
          include: { product: true }
        },
        shippingAddress: true,
      }
    });
  }

  /**
   * Create a manual order
   */
  static async createOrder(data: any) {
    // Get customer to get default address
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
      include: {
        addresses: {
          where: { isDefault: true },
          take: 1
        }
      }
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Use provided addressId or customer's default address
    let addressId = data.addressId;
    if (!addressId && customer.addresses.length > 0) {
      addressId = customer.addresses[0].id;
    }

    if (!addressId) {
      throw new Error('No address found for customer. Please provide addressId.');
    }

    // Calculate totals
    const subtotal = data.subtotal || data.totalAmount || 0;
    const taxAmount = data.taxAmount || 0;
    const shippingAmount = data.shippingAmount || 0;
    const discountAmount = data.discountAmount || 0;
    const totalAmount = data.totalAmount || (subtotal + taxAmount + shippingAmount - discountAmount);

    // Create order first
    const order = await prisma.order.create({
      data: {
        customerId: data.customerId,
        addressId,
        orderNumber: `ORD-${Date.now()}`,
        subtotal,
        taxAmount,
        shippingAmount,
        discountAmount,
        totalAmount,
        status: data.status || 'PENDING',
        paymentStatus: data.paymentStatus || 'PENDING',
        notes: data.notes || null,
      }
    });

    // Then create items
    if (data.items && data.items.length > 0) {
      await prisma.orderItem.createMany({
        data: data.items.map((item: any) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice || item.price || 0,
          totalPrice: item.totalPrice || (item.quantity * (item.unitPrice || item.price || 0))
        }))
      });
    }

    // Return order with items
    return prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: { product: true }
        },
        shippingAddress: true
      }
    });
  }

  /**
   * Update order details
   */
  static async updateOrder(orderId: string, data: any) {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) return null;

    return prisma.order.update({
      where: { id: orderId },
      data: {
        notes: data.notes,
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    });
  }

  /**
   * Cancel an order
   */
  static async cancelOrder(orderId: string, reason?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) return null;

    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        notes: reason ? `Cancelled: ${reason}` : 'Cancelled by admin',
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    });
  }

  /**
   * Mark order as shipped
   */
  static async shipOrder(orderId: string, trackingNumber: string, carrier?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) return null;

    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'SHIPPED',
        trackingNumber,
        shippedAt: new Date(),
        notes: carrier ? `Shipped via ${carrier}` : 'Shipped',
      } as any,
      include: {
        items: {
          include: { product: true }
        }
      }
    });
  }

  /**
   * Mark order as delivered
   */
  static async deliverOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) return null;

    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date(),
      } as any,
      include: {
        items: {
          include: { product: true }
        }
      }
    });
  }

  /**
   * Get order statistics
   */
  static async getOrderStats() {
    const [totalOrders, pendingOrders, shippedOrders, deliveredOrders, cancelledOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'SHIPPED' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
    ]);

    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ['DELIVERED', 'SHIPPED', 'PROCESSING']
        }
      },
      select: { totalAmount: true }
    });

    const totalRevenue = orders.reduce((sum, order) => sum + decimalToNumber(order.totalAmount), 0);

    return {
      totalOrders,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
    };
  }

  /**
   * Get customers with admin filtering
   */
  static async getCustomers(filters: CustomerFilters, pagination: Pagination, sort: Sort) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {};

    if (filters.search) {
      where.OR = [
        { user: { firstName: { contains: filters.search } } },
        { user: { lastName: { contains: filters.search } } },
        { user: { email: { contains: filters.search } } },
      ];
    }

    if (filters.customerType) {
      where.customerType = filters.customerType as 'B2B' | 'B2C';
    }

    const orderBy: Prisma.CustomerOrderByWithRelationInput = {};
    if (sort.field === 'name') {
      orderBy.user = { firstName: sort.order };
    } else {
      orderBy[sort.field as keyof Prisma.CustomerOrderByWithRelationInput] = sort.order;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              createdAt: true,
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.customer.count({ where })
    ]);

    return {
      customers,
      total,
      page: pagination.page,
      totalPages: Math.ceil(total / pagination.limit)
    };
  }

  /**
   * Get customer details
   */
  static async getCustomerDetails(customerId: string) {
    return prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            createdAt: true,
          }
        },
        orders: {
          include: {
            items: {
              include: {
                product: { select: { name: true, price: true } }
              }
            }
          },
          orderBy: { orderDate: 'desc' }
        },
      }
    });
  }

  /**
   * Create a new customer
   */
  static async createCustomer(data: any) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Customer with this email already exists');
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: 'CUSTOMER',
        password: await AuthService.hashPassword(Math.random().toString(36)),
      }
    });

    return prisma.customer.create({
      data: {
        userId: user.id,
        customerType: data.customerType || 'B2C',
      },
      include: {
        user: true
      }
    });
  }

  /**
   * Update customer information
   */
  static async updateCustomer(customerId: string, data: any) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { user: true }
    });

    if (!customer) return null;

    if (data.firstName || data.lastName || data.phone) {
      await prisma.user.update({
        where: { id: customer.userId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        }
      });
    }

    return prisma.customer.update({
      where: { id: customerId },
      data: {
        customerType: data.customerType,
      },
      include: {
        user: true
      }
    });
  }

  /**
   * Delete a customer
   */
  static async deleteCustomer(customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) return null;

    await prisma.customer.delete({
      where: { id: customerId }
    });

    return true;
  }

  /**
   * Toggle customer status
   */
  static async toggleCustomerStatus(customerId: string, _status: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) return null;

    return prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        user: true
      }
    });
  }

  /**
   * Get customer statistics
   */
  static async getCustomerStats() {
    const [totalCustomers, activeCustomers, newCustomersThisMonth] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({
        where: {
          lastOrderAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.customer.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);

    return {
      totalCustomers,
      activeCustomers,
      newCustomersThisMonth,
      inactiveCustomers: totalCustomers - activeCustomers,
    };
  }

  /**
   * Get customer orders
   */
  static async getCustomerOrders(customerId: string, limit: number) {
    return prisma.order.findMany({
      where: { customerId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { orderDate: 'desc' },
      take: limit
    });
  }

  /**
   * Get service requests with admin filtering
   */
  static async getServiceRequests(filters: ServiceFilters, pagination: Pagination, sort: Sort) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.ServiceRequestWhereInput = {};

    if (filters.status) {
      where.status = filters.status as ServiceRequestStatusType;
    }
    if (filters.priority) {
      where.priority = filters.priority as any;
    }
    if (filters.technicianId) {
      where.technicianId = filters.technicianId;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    const orderBy: Prisma.ServiceRequestOrderByWithRelationInput = {};
    orderBy[sort.field as keyof Prisma.ServiceRequestOrderByWithRelationInput] = sort.order;

    const [serviceRequests, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        include: {
          customer: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true } }
            }
          },
          serviceType: true,
          technician: {
            include: {
              user: { select: { firstName: true, lastName: true } }
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.serviceRequest.count({ where })
    ]);

    return {
      serviceRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  /**
   * Assign technician to service request
   */
  static async assignTechnician(serviceId: string, technicianId: string, scheduledDate: Date) {
    return prisma.serviceRequest.update({
      where: { id: serviceId },
      data: {
        technicianId,
        scheduledDate,
        status: 'SCHEDULED'
      },
      include: {
        customer: {
          include: { user: true }
        },
        serviceType: true,
        technician: {
          include: { user: true }
        }
      }
    });
  }

  /**
   * Get all technicians
   */
  static async getTechnicians() {
    return prisma.technician.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          }
        }
      },
      orderBy: {
        user: { firstName: 'asc' }
      }
    });
  }

  /**
   * Create new technician
   */
  static async createTechnician(data: TechnicianCreateData) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await AuthService.hashPassword(tempPassword);

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || null,
          password: hashedPassword,
          role: 'TECHNICIAN',
        }
      });

      return tx.technician.create({
        data: {
          userId: user.id,
          employeeId: data.employeeId,
          specialties: data.specialties.join(', ')
        },
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
      });
    });
  }

  /**
   * Update technician
   */
  static async updateTechnician(technicianId: string, data: Partial<TechnicianCreateData>) {
    return prisma.$transaction(async (tx) => {
      const technician = await tx.technician.findUnique({
        where: { id: technicianId },
        select: { userId: true }
      });

      if (!technician) return null;

      if (data.firstName || data.lastName || data.phone) {
        const updateData: any = {};
        if (data.firstName) updateData.firstName = data.firstName;
        if (data.lastName) updateData.lastName = data.lastName;
        if (data.phone) updateData.phone = data.phone;
        
        await tx.user.update({
          where: { id: technician.userId },
          data: updateData
        });
      }

      const technicianData: any = {};
      if (data.specialties) {
        technicianData.specialties = data.specialties.join(', ');
      }

      return tx.technician.update({
        where: { id: technicianId },
        data: technicianData,
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
      });
    });
  }

  /**
   * Get sales analytics
   */
  static async getSalesAnalytics(timeframe: string, _groupBy: string) {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const orders = await prisma.order.findMany({
      where: {
        orderDate: { gte: startDate },
        status: { not: 'CANCELLED' }
      },
      select: {
        orderDate: true,
        totalAmount: true
      },
      orderBy: { orderDate: 'asc' }
    });

    // Group by day
    const salesByDate = orders.reduce((acc: any, order) => {
      const date = order.orderDate.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { revenue: 0, orders: 0 };
      }
      acc[date].revenue += decimalToNumber(order.totalAmount);
      acc[date].orders += 1;
      return acc;
    }, {});

    const sales = Object.entries(salesByDate).map(([date, data]: [string, any]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders
    }));

    const totalRevenue = sales.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = sales.reduce((sum, item) => sum + item.orders, 0);

    // Calculate growth
    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const previousRevenue = await prisma.order.aggregate({
      where: {
        orderDate: { gte: previousStartDate, lt: startDate },
        status: { not: 'CANCELLED' }
      },
      _sum: { totalAmount: true }
    });

    const previousRevenueValue = decimalToNumber(previousRevenue._sum.totalAmount);
    const revenueGrowth = previousRevenueValue > 0
      ? ((totalRevenue - previousRevenueValue) / previousRevenueValue) * 100
      : 0;

    return {
      sales,
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      }
    };
  }

  /**
   * Get inventory alerts
   */
  static async getInventoryAlerts() {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        stockQuantity: { lte: DEFAULT_LOW_STOCK_THRESHOLD }
      },
      select: {
        id: true,
        name: true,
        stockQuantity: true,
      },
      orderBy: { stockQuantity: 'asc' }
    });

    return products.map(product => ({
      id: product.id,
      productId: product.id,
      productName: product.name,
      currentStock: product.stockQuantity,
      minimumStock: DEFAULT_LOW_STOCK_THRESHOLD,
      status: product.stockQuantity === 0 ? 'OUT_OF_STOCK' : 
              product.stockQuantity <= 5 ? 'CRITICAL' : 'LOW_STOCK'
    }));
  }

  /**
   * Export data in various formats
   */
  static async exportData(type: string, format: string, filters: any) {
    let data: any[] = [];

    switch (type) {
      case 'orders':
        data = await prisma.order.findMany({
          where: {
            orderDate: {
              ...(filters.dateFrom && { gte: filters.dateFrom }),
              ...(filters.dateTo && { lte: filters.dateTo })
            }
          },
          include: {
            customer: {
              include: { user: true }
            }
          }
        });
        break;

      case 'customers':
        data = await prisma.customer.findMany({
          where: {
            createdAt: {
              ...(filters.dateFrom && { gte: filters.dateFrom }),
              ...(filters.dateTo && { lte: filters.dateTo })
            }
          },
          include: { user: true }
        });
        break;

      default:
        return null;
    }

    if (format === 'csv') {
      if (data.length === 0) return '';
      const csvHeader = Object.keys(data[0] || {}).join(',');
      const csvRows = data.map(row => Object.values(row).join(','));
      return [csvHeader, ...csvRows].join('\n');
    }

    return JSON.stringify(data, null, 2);
  }

  /**
   * Get system settings
   */
  static async getSystemSettings() {
    return {
      siteName: 'MJ CHAUFFAGE',
      currency: 'DZD',
      taxRate: 19,
      shippingMethods: ['Standard', 'Express'],
      paymentMethods: ['Credit Card', 'Dahabia'],
      emailNotifications: true,
      maintenanceMode: false
    };
  }

  /**
   * Update system settings
   */
  static async updateSystemSettings(settings: any) {
    return settings;
  }
}
