import { prisma } from '../lib/database'

export interface SalesMetrics {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  revenueGrowth: number
  orderGrowth: number
  topWilayas: Array<{
    wilaya: string
    revenue: number
    orders: number
  }>
  paymentMethodDistribution: Array<{
    method: string
    count: number
    percentage: number
  }>
}

export interface CustomerMetrics {
  totalCustomers: number
  newCustomers: number
  returningCustomers: number
  customerGrowth: number
  customersByWilaya: Array<{
    wilaya: string
    count: number
  }>
  topCustomers: Array<{
    id: string
    name: string
    totalSpent: number
    orderCount: number
  }>
}

export interface ProductMetrics {
  topSellingProducts: Array<{
    id: string
    name: string
    nameAr?: string
    nameFr?: string
    salesCount: number
    revenue: number
  }>
  lowStockProducts: Array<{
    id: string
    name: string
    nameAr?: string
    nameFr?: string
    currentStock: number
    reorderLevel: number
  }>
  categoryPerformance: Array<{
    categoryId: string
    categoryName: string
    revenue: number
    orderCount: number
  }>
}

export interface ServiceMetrics {
  totalServiceBookings: number
  completedServices: number
  pendingServices: number
  averageServiceRating: number
  servicesByType: Array<{
    type: string
    count: number
    revenue: number
  }>
  servicesByWilaya: Array<{
    wilaya: string
    count: number
  }>
}

export class AnalyticsService {
  static async getSalesMetrics(
    startDate: Date,
    endDate: Date,
    compareWithPrevious = true
  ): Promise<SalesMetrics> {
    const currentPeriod = await this.getSalesPeriodData(startDate, endDate)
    
    let previousPeriod = null
    if (compareWithPrevious) {
      const periodLength = endDate.getTime() - startDate.getTime()
      const previousStart = new Date(startDate.getTime() - periodLength)
      const previousEnd = new Date(endDate.getTime() - periodLength)
      previousPeriod = await this.getSalesPeriodData(previousStart, previousEnd)
    }

    // Get top wilayas by revenue
    const topWilayas = await prisma.order.groupBy({
      by: ['addressId'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { not: 'CANCELLED' }
      },
      _sum: { totalAmount: true },
      _count: { id: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: 10
    })

    // Get payment method distribution
    const paymentMethods = await prisma.payment.groupBy({
      by: ['method'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: 'COMPLETED'
      },
      _count: { id: true }
    })

    const totalPayments = paymentMethods.reduce((sum, pm) => sum + pm._count.id, 0)

    return {
      totalRevenue: currentPeriod.revenue,
      totalOrders: currentPeriod.orders,
      averageOrderValue: currentPeriod.orders > 0 ? currentPeriod.revenue / currentPeriod.orders : 0,
      revenueGrowth: previousPeriod ? 
        this.calculateGrowthRate(previousPeriod.revenue, currentPeriod.revenue) : 0,
      orderGrowth: previousPeriod ? 
        this.calculateGrowthRate(previousPeriod.orders, currentPeriod.orders) : 0,
      topWilayas: topWilayas.map(tw => ({
        wilaya: 'Wilaya ' + tw.addressId, // TODO: Get actual wilaya name from address
        revenue: Number(tw._sum?.totalAmount || 0),
        orders: tw._count?.id || 0
      })),
      paymentMethodDistribution: paymentMethods.map(pm => ({
        method: pm.method,
        count: pm._count.id,
        percentage: totalPayments > 0 ? (pm._count.id / totalPayments) * 100 : 0
      }))
    }
  }

  static async getCustomerMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<CustomerMetrics> {
    const totalCustomers = await prisma.user.count({
      where: { role: 'CUSTOMER' }
    })

    const newCustomers = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        createdAt: { gte: startDate, lte: endDate }
      }
    })

    // Calculate previous period for growth
    const periodLength = endDate.getTime() - startDate.getTime()
    const previousStart = new Date(startDate.getTime() - periodLength)
    const previousEnd = new Date(endDate.getTime() - periodLength)
    
    const previousNewCustomers = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        createdAt: { gte: previousStart, lte: previousEnd }
      }
    })

    // Get returning customers (customers who made more than one order)
    const returningCustomers = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        customer: { orders: { some: { createdAt: { gte: startDate, lte: endDate } } } }
      }
    })

    // Top customers by total spent
    const topCustomers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
        customer: { orders: { some: { createdAt: { gte: startDate, lte: endDate } } } }
      },
      include: {
        customer: {
          include: {
            orders: {
              where: { status: { not: 'CANCELLED' } },
              select: { totalAmount: true }
            }
          }
        }
      },
      take: 10
    })

    const topCustomersData = topCustomers.map(customer => ({
      id: customer.id,
      name: `${customer.firstName} ${customer.lastName}`,
      totalSpent: customer.customer?.orders.reduce((sum: number, order: { totalAmount: any; }) => sum + Number(order.totalAmount), 0) || 0,
      orderCount: customer.customer?.orders.length || 0
    })).sort((a, b) => (b.totalSpent - a.totalSpent))

    return {
      totalCustomers,
      newCustomers,
      returningCustomers,
      customerGrowth: this.calculateGrowthRate(previousNewCustomers, newCustomers),
      customersByWilaya: [], // TODO: Implement based on customer addresses
      topCustomers: topCustomersData
    }
  }

  static async getProductMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<ProductMetrics> {
    // Top selling products
    const topSellingProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: startDate, lte: endDate },
          status: { not: 'CANCELLED' }
        }
      },
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10
    })

    const topProductsData = await Promise.all(
      topSellingProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true }
        })
        return {
          id: item.productId,
          name: product?.name || 'Unknown',
          salesCount: item._sum.quantity || 0,
          revenue: Number(item._sum.totalPrice || 0)
        }
      })
    )

    // Low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stockQuantity: { lte: 5 } // TODO: Use actual minStock field from product model
      },
      select: {
        id: true,
        name: true,
        stockQuantity: true,
        minStock: true
      },
      take: 20
    })

    // Category performance
    // const categoryPerformance = await prisma.orderItem.groupBy({
    //   by: ['productId'],
    //   where: {
    //     order: {
    //       createdAt: { gte: startDate, lte: endDate },
    //       status: { not: 'CANCELLED' }
    //     }
    //   },
    //   _sum: { totalPrice: true },
    //   _count: { id: true }
    // })

    return {
      topSellingProducts: topProductsData,
      lowStockProducts: lowStockProducts.map(product => ({
        id: product.id,
        name: product.name,
        currentStock: product.stockQuantity,
        reorderLevel: product.minStock || 0
      })),
      categoryPerformance: [] // TODO: Implement category grouping
    }
  }

  static async getServiceMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<ServiceMetrics> {
    const totalServiceBookings = await prisma.serviceRequest.count({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      }
    })

    const completedServices = await prisma.serviceRequest.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: 'COMPLETED'
      }
    })

    const pendingServices = await prisma.serviceRequest.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { in: ['PENDING', 'SCHEDULED', 'IN_PROGRESS'] }
      }
    })

    // Services by type
    const servicesByType = await prisma.serviceRequest.groupBy({
      by: ['serviceTypeId'],
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: { id: true }
    })

    const servicesData = await Promise.all(
      servicesByType.map(async (service) => {
        const serviceType = await prisma.serviceType.findUnique({
          where: { id: service.serviceTypeId },
          select: { name: true, price: true }
        })
        return {
          type: serviceType?.name || 'Unknown',
          count: service._count.id,
          revenue: Number(serviceType?.price || 0) * service._count.id
        }
      })
    )

    return {
      totalServiceBookings,
      completedServices,
      pendingServices,
      averageServiceRating: 4.5, // TODO: Implement rating calculation
      servicesByType: servicesData,
      servicesByWilaya: [] // TODO: Implement wilaya grouping
    }
  }

  static async getDashboardKPIs(
    startDate: Date,
    endDate: Date
  ) {
    const [sales, customers, products, services] = await Promise.all([
      this.getSalesMetrics(startDate, endDate),
      this.getCustomerMetrics(startDate, endDate),
      this.getProductMetrics(startDate, endDate),
      this.getServiceMetrics(startDate, endDate)
    ])

    return {
      sales,
      customers,
      products,
      services,
      summary: {
        totalRevenue: sales.totalRevenue,
        totalOrders: sales.totalOrders,
        totalCustomers: customers.totalCustomers,
        totalServices: services.totalServiceBookings,
        revenueGrowth: sales.revenueGrowth,
        customerGrowth: customers.customerGrowth
      }
    }
  }

  static async getAlgeriaMarketInsights(
    startDate: Date,
    endDate: Date
  ) {
    // Algeria-specific analytics
    const wilayaPerformance = await this.getWilayaPerformance(startDate, endDate)
    const paymentMethodPreferences = await this.getPaymentMethodAnalytics(startDate, endDate)
    const seasonalTrends = await this.getSeasonalTrends(startDate, endDate)

    return {
      wilayaPerformance,
      paymentMethodPreferences,
      seasonalTrends,
      insights: this.generateMarketInsights(wilayaPerformance, paymentMethodPreferences)
    }
  }

  private static async getSalesPeriodData(startDate: Date, endDate: Date) {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { not: 'CANCELLED' }
      },
      select: { totalAmount: true }
    })

    return {
      revenue: orders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
      orders: orders.length
    }
  }

  private static calculateGrowthRate(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  private static async getWilayaPerformance(_startDate: Date, _endDate: Date) {
    // Implementation for wilaya-specific performance metrics
    return []
  }

  private static async getPaymentMethodAnalytics(startDate: Date, endDate: Date) {
    const payments = await prisma.payment.groupBy({
      by: ['method'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: 'COMPLETED'
      },
      _count: { id: true },
      _sum: { amount: true }
    })

    return payments.map(payment => ({
      method: payment.method,
      transactions: payment._count.id,
      volume: Number(payment._sum.amount || 0),
      percentage: 0 // Calculate based on total
    }))
  }

  private static async getSeasonalTrends(_startDate: Date, _endDate: Date) {
    // Implementation for seasonal analysis specific to Algeria market
    return {
      heatingSeasonSales: 0,
      maintenanceRequests: 0,
      peakMonths: []
    }
  }

  private static generateMarketInsights(_wilayaData: any[], paymentData: any[]) {
    const insights = []

    // Cash on delivery preference insight
    const codPayments = paymentData.find(p => p.method === 'CASH_ON_DELIVERY')
    if (codPayments && codPayments.percentage > 60) {
      insights.push({
        type: 'payment_preference',
        message: 'Cash on Delivery is the preferred payment method in Algeria',
        actionable: 'Consider expanding COD coverage to more wilayas'
      })
    }

    // Dahabia card adoption
    const dahabiaPayments = paymentData.find(p => p.method === 'DAHABIA_CARD')
    if (dahabiaPayments && dahabiaPayments.percentage > 20) {
      insights.push({
        type: 'digital_adoption',
        message: 'Strong Dahabia card adoption indicates digital payment growth',
        actionable: 'Promote digital payment incentives'
      })
    }

    return insights
  }
}