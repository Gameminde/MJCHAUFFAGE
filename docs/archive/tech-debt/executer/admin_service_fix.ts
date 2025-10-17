// backend/src/services/adminService.ts - CORRECTIONS

import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '@/utils/logger';

const prisma = new PrismaClient();

// ========================================
// TYPES & INTERFACES
// ========================================

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
}

interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  id: string;
  name: string;
  revenue: number;
  quantity: number;
  image?: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  category: string;
}

// ========================================
// HELPER: DECIMAL TO NUMBER
// ========================================

function decimalToNumber(value: Prisma.Decimal | null | undefined): number {
  if (!value) return 0;
  return typeof value === 'number' ? value : parseFloat(value.toString());
}

// ========================================
// DASHBOARD STATISTICS
// ========================================

export class AdminService {
  
  /**
   * Get comprehensive dashboard statistics
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Current month stats
      const [currentRevenue, currentOrders, currentCustomers] = await Promise.all([
        prisma.order.aggregate({
          where: {
            createdAt: { gte: startOfMonth },
            status: { notIn: ['CANCELLED', 'REFUNDED'] }
          },
          _sum: { totalAmount: true }
        }),
        prisma.order.count({
          where: {
            createdAt: { gte: startOfMonth }
          }
        }),
        prisma.customer.count({
          where: {
            createdAt: { gte: startOfMonth }
          }
        })
      ]);

      // Last month stats for comparison
      const [lastRevenue, lastOrders, lastCustomers] = await Promise.all([
        prisma.order.aggregate({
          where: {
            createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
            status: { notIn: ['CANCELLED', 'REFUNDED'] }
          },
          _sum: { totalAmount: true }
        }),
        prisma.order.count({
          where: {
            createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
          }
        }),
        prisma.customer.count({
          where: {
            createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
          }
        })
      ]);

      // Total products
      const totalProducts = await prisma.product.count({
        where: { isActive: true }
      });

      // Calculate changes (safe division)
      const currentRevenueNum = decimalToNumber(currentRevenue._sum.totalAmount);
      const lastRevenueNum = decimalToNumber(lastRevenue._sum.totalAmount);
      
      const revenueChange = lastRevenueNum > 0 
        ? ((currentRevenueNum - lastRevenueNum) / lastRevenueNum) * 100 
        : 0;

      const ordersChange = lastOrders > 0 
        ? ((currentOrders - lastOrders) / lastOrders) * 100 
        : 0;

      const customersChange = lastCustomers > 0 
        ? ((currentCustomers - lastCustomers) / lastCustomers) * 100 
        : 0;

      return {
        totalRevenue: currentRevenueNum,
        totalOrders: currentOrders,
        totalCustomers: currentCustomers,
        totalProducts,
        revenueChange: Math.round(revenueChange * 100) / 100,
        ordersChange: Math.round(ordersChange * 100) / 100,
        customersChange: Math.round(customersChange * 100) / 100
      };

    } catch (error) {
      logger.error('Error getting dashboard stats:', error);
      throw new Error('Failed to retrieve dashboard statistics');
    }
  }

  /**
   * Get revenue data for chart (last 30 days)
   */
  static async getRevenueData(days: number = 30): Promise<RevenueDataPoint[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const orders = await prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
          status: { notIn: ['CANCELLED', 'REFUNDED'] }
        },
        select: {
          createdAt: true,
          totalAmount: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Group by date
      const revenueMap = new Map<string, { revenue: number; count: number }>();

      orders.forEach(order => {
        const dateKey = order.createdAt.toISOString().split('T')[0];
        const current = revenueMap.get(dateKey) || { revenue: 0, count: 0 };
        
        revenueMap.set(dateKey, {
          revenue: current.revenue + decimalToNumber(order.totalAmount),
          count: current.count + 1
        });
      });

      // Convert to array and sort
      return Array.from(revenueMap.entries())
        .map(([date, data]) => ({
          date,
          revenue: Math.round(data.revenue * 100) / 100,
          orders: data.count
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

    } catch (error) {
      logger.error('Error getting revenue data:', error);
      throw new Error('Failed to retrieve revenue data');
    }
  }

  /**
   * Get top selling products
   */
  static async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    try {
      const topProducts = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true,
          totalPrice: true
        },
        orderBy: {
          _sum: {
            totalPrice: 'desc'
          }
        },
        take: limit
      });

      // Fetch product details
      const productIds = topProducts.map(item => item.productId);
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds }
        },
        select: {
          id: true,
          name: true,
          images: {
            select: { url: true },
            take: 1
          }
        }
      });

      // Create lookup map
      const productMap = new Map(
        products.map(p => [p.id, p])
      );

      // Combine data
      return topProducts.map(item => {
        const product = productMap.get(item.productId);
        return {
          id: item.productId,
          name: product?.name || 'Unknown Product',
          revenue: decimalToNumber(item._sum.totalPrice),
          quantity: item._sum.quantity || 0,
          image: product?.images?.[0]?.url
        };
      });

    } catch (error) {
      logger.error('Error getting top products:', error);
      throw new Error('Failed to retrieve top products');
    }
  }

  /**
   * Get low stock products (FIXED: minStock property)
   */
  static async getLowStockProducts(): Promise<LowStockProduct[]> {
    try {
      // FIX: Use stockQuantity comparison instead of minStock field
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          stockQuantity: {
            lte: 10 // Low stock threshold (can be made configurable)
          }
        },
        select: {
          id: true,
          name: true,
          sku: true,
          stockQuantity: true,
          category: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          stockQuantity: 'asc'
        },
        take: 20
      });

      return products.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        stock: product.stockQuantity,
        minStock: 10, // Default threshold
        category: product.category?.name || 'Uncategorized'
      }));

    } catch (error) {
      logger.error('Error getting low stock products:', error);
      throw new Error('Failed to retrieve low stock products');
    }
  }

  /**
   * Get recent orders
   */
  static async getRecentOrders(limit: number = 10) {
    try {
      const orders = await prisma.order.findMany({
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          customer: {
            select: {
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

      return orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: decimalToNumber(order.totalAmount),
        date: order.createdAt.toISOString(),
        customer: {
          name: order.customer?.user 
            ? `${order.customer.user.firstName} ${order.customer.user.lastName}`
            : 'Guest Customer',
          email: order.customer?.user?.email || 'N/A'
        }
      }));

    } catch (error) {
      logger.error('Error getting recent orders:', error);
      throw new Error('Failed to retrieve recent orders');
    }
  }
}

export default AdminService;
