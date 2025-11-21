import { prisma } from '@/lib/database';

// Define enums locally since they might not be exported
type CustomerType = 'B2C' | 'B2B';
type AddressType = 'BILLING' | 'SHIPPING';
import bcrypt from 'bcryptjs';

export interface CustomerFilters {
  search?: string;
  customerType?: CustomerType;
  isActive?: boolean;
}

interface Pagination {
  page: number;
  limit: number;
}

interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

export interface CustomerCreateData {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  phone?: string;
  companyName?: string;
  customerType?: CustomerType;
  vatNumber?: string;
}

export interface CustomerUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
  customerType?: CustomerType;
  vatNumber?: string;
}

export interface AddressCreateData {
  customerId: string;
  type: AddressType;
  label?: string;
  street: string;
  city: string;
  postalCode: string;
  region?: string;
  country: string;
  isDefault?: boolean;
}

export class CustomerService {
  /**
   * Create a new customer with user account
   */
  static async createCustomer(data: CustomerCreateData) {
    return prisma.$transaction(async (tx: any) => {
      // Check if user already exists
      const existingUser = await tx.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password if provided
      let hashedPassword: string | undefined;
      if (data.password) {
        hashedPassword = await bcrypt.hash(data.password, 12);
      }

      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          password: hashedPassword,
          phone: data.phone,
          role: 'CUSTOMER',
          isActive: true,
          isVerified: !data.password, // If no password, assume verified (admin created)
        },
      });

      // Create customer profile
      const customer = await tx.customer.create({
        data: {
          userId: user.id,
          companyName: data.companyName,
          customerType: data.customerType || 'B2C',
          vatNumber: data.vatNumber,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              isActive: true,
              isVerified: true,
              createdAt: true,
            },
          },
        },
      });

      return customer;
    });
  }

  /**
   * Get customers with filtering, pagination, and search
   */
  static async getCustomers(filters: CustomerFilters, pagination: Pagination, sort: Sort) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (filters.customerType) {
      where.customerType = filters.customerType;
    }

    if (filters.search) {
      where.OR = [
        { user: { firstName: { contains: filters.search } } },
        { user: { lastName: { contains: filters.search } } },
        { user: { email: { contains: filters.search } } },
        { companyName: { contains: filters.search } },
        { vatNumber: { contains: filters.search } },
      ];
    }

    if (filters.isActive !== undefined) {
      where.user = { isActive: filters.isActive };
    }

    // Build orderBy
    const orderBy: any = {};
    if (sort.field.startsWith('user.')) {
      const userField = sort.field.replace('user.', '');
      orderBy.user = { [userField]: sort.order };
    } else {
      orderBy[sort.field] = sort.order;
    }

    // Execute queries
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              isActive: true,
              isVerified: true,
              createdAt: true,
              lastLoginAt: true,
            },
          },
          addresses: {
            where: { isDefault: true },
            take: 1,
          },
          _count: {
            select: {
              orders: true,
              reviews: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      customers,
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
   * Get customer by ID
   */
  static async getCustomerById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            isActive: true,
            isVerified: true,
            createdAt: true,
            lastLoginAt: true,
          },
        },
        addresses: {
          orderBy: { createdAt: 'desc' },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            orderDate: true,
          },
          orderBy: { orderDate: 'desc' },
          take: 5,
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            title: true,
            createdAt: true,
            product: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  /**
   * Get customer by user ID
   */
  static async getCustomerByUserId(userId: string) {
    return prisma.customer.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            isActive: true,
            isVerified: true,
            createdAt: true,
          },
        },
        addresses: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Update customer information
   */
  static async updateCustomer(id: string, data: CustomerUpdateData) {
    return prisma.$transaction(async (tx: any) => {
      const customer = await tx.customer.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Update user information
      const userUpdateData: any = {};
      if (data.firstName) userUpdateData.firstName = data.firstName;
      if (data.lastName) userUpdateData.lastName = data.lastName;
      if (data.phone) userUpdateData.phone = data.phone;

      if (Object.keys(userUpdateData).length > 0) {
        if (customer.userId) {
          await tx.user.update({
            where: { id: customer.userId },
            data: userUpdateData,
          });
        }
      }

      // Update customer information
      const customerUpdateData: any = {};
      if (data.companyName !== undefined) customerUpdateData.companyName = data.companyName;
      if (data.customerType) customerUpdateData.customerType = data.customerType;
      if (data.vatNumber !== undefined) customerUpdateData.vatNumber = data.vatNumber;

      if (Object.keys(customerUpdateData).length > 0) {
        await tx.customer.update({
          where: { id },
          data: customerUpdateData,
        });
      }

      // Return updated customer
      return tx.customer.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              isActive: true,
              isVerified: true,
            },
          },
        },
      });
    });
  }

  /**
   * Deactivate customer (soft delete)
   */
  static async deactivateCustomer(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    if (customer.userId) {
      await prisma.user.update({
        where: { id: customer.userId },
        data: { isActive: false },
      });
    }

    return true;
  }

  /**
   * Activate customer
   */
  static async activateCustomer(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    if (customer.userId) {
      await prisma.user.update({
        where: { id: customer.userId },
        data: { isActive: true },
      });
    }

    return true;
  }

  /**
   * Add customer address
   */
  static async addCustomerAddress(data: AddressCreateData) {
    return prisma.$transaction(async (tx: any) => {
      // If this is set as default, unset other default addresses of the same type
      if (data.isDefault) {
        await tx.address.updateMany({
          where: {
            customerId: data.customerId,
            type: data.type,
          },
          data: { isDefault: false },
        });
      }

      // Create the new address
      return tx.address.create({
        data,
      });
    });
  }

  /**
   * Update customer address
   */
  static async updateCustomerAddress(
    addressId: string,
    customerId: string,
    data: Partial<AddressCreateData>
  ) {
    return prisma.$transaction(async (tx: any) => {
      // Verify address belongs to customer
      const address = await tx.address.findFirst({
        where: { id: addressId, customerId },
      });

      if (!address) {
        throw new Error('Address not found');
      }

      // If setting as default, unset other default addresses of the same type
      if (data.isDefault && data.type) {
        await tx.address.updateMany({
          where: {
            customerId,
            type: data.type,
            id: { not: addressId },
          },
          data: { isDefault: false },
        });
      }

      // Update the address
      return tx.address.update({
        where: { id: addressId },
        data,
      });
    });
  }

  /**
   * Delete customer address
   */
  static async deleteCustomerAddress(addressId: string, customerId: string) {
    const address = await prisma.address.findFirst({
      where: { id: addressId, customerId },
    });

    if (!address) {
      throw new Error('Address not found');
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    return true;
  }

  /**
   * Get customer statistics
   */
  static async getCustomerStatistics() {
    const [
      totalCustomers,
      activeCustomers,
      b2bCustomers,
      b2cCustomers,
      recentCustomers,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({
        where: { user: { isActive: true } },
      }),
      prisma.customer.count({
        where: { customerType: 'B2B' },
      }),
      prisma.customer.count({
        where: { customerType: 'B2C' },
      }),
      prisma.customer.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    return {
      totalCustomers,
      activeCustomers,
      b2bCustomers,
      b2cCustomers,
      recentCustomers,
    };
  }

  /**
   * Get customer order history
   */
  static async getCustomerOrderHistory(customerId: string, pagination: Pagination) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { customerId },
        include: {
          items: {
            include: {
              product: {
                select: { name: true, images: { take: 1 } },
              },
            },
          },
          shippingAddress: true,
        },
        orderBy: { orderDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { customerId } }),
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
}