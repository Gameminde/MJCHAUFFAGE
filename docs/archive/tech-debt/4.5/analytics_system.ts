// ========================================
// SYSTÈME D'ANALYTICS COMPLET
// ========================================

// backend/src/services/analyticsService.ts

import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

const prisma = new PrismaClient();

// Redis setup with memory fallback for development
const useRedis = !!process.env.REDIS_URL;
const redis: any = useRedis ? createClient({ url: process.env.REDIS_URL as string }) : null;
if (useRedis) {
  redis.on('error', (err: any) => console.error('Redis error', err));
  redis.connect().catch(() => {});
}

const memoryCache = new Map<string, { value: string; expiresAt: number }>();

async function safeGet<T>(key: string): Promise<T | null> {
  if (!useRedis) {
    const entry = memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      memoryCache.delete(key);
      return null;
    }
    try {
      return JSON.parse(entry.value) as T;
    } catch {
      return null;
    }
  }
  try {
    const val = await redis.get(key);
    return val ? (JSON.parse(val) as T) : null;
  } catch {
    return null;
  }
}

async function safeSetEx(key: string, ttlSeconds: number, payload: any): Promise<void> {
  if (!useRedis) {
    memoryCache.set(key, { value: JSON.stringify(payload), expiresAt: Date.now() + ttlSeconds * 1000 });
    return;
  }
  try {
    await redis.setEx(key, ttlSeconds, JSON.stringify(payload));
  } catch {
    // ignore cache write errors in development
  }
}

interface DashboardMetrics {
  overview: OverviewMetrics;
  sales: SalesMetrics;
  products: ProductMetrics;
  customers: CustomerMetrics;
  inventory: InventoryMetrics;
}

export class AnalyticsService {

  // ========================================
  // 1. MÉTRIQUES OVERVIEW (Temps Réel)
  // ========================================
  async getOverviewMetrics(
    startDate: Date = subDays(new Date(), 30),
    endDate: Date = new Date()
  ): Promise<OverviewMetrics> {
    
    const cacheKey = `analytics:overview:${format(startDate, 'yyyy-MM-dd')}:${format(endDate, 'yyyy-MM-dd')}`;
    
    // ✅ Try cache (5 minutes)
    const cached = await safeGet<OverviewMetrics>(cacheKey);
    if (cached) {
      return cached;
    }

    // ✅ Requêtes parallèles pour performance
    const [
      revenue,
      orders,
      customers,
      avgOrderValue,
      previousRevenue,
      conversionRate
    ] = await Promise.all([
      this.getRevenue(startDate, endDate),
      this.getOrdersCount(startDate, endDate),
      this.getNewCustomers(startDate, endDate),
      this.getAverageOrderValue(startDate, endDate),
      this.getRevenue(
        subDays(startDate, 30),
        subDays(endDate, 30)
      ),
      this.getConversionRate(startDate, endDate)
    ]);

    // ✅ Calcul variations
    const revenueGrowth = previousRevenue > 0 
      ? ((revenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    const metrics: OverviewMetrics = {
      revenue: {
        value: revenue,
        growth: revenueGrowth,
        currency: 'DZD'
      },
      orders: {
        total: orders.total,
        pending: orders.pending,
        completed: orders.completed,
        cancelled: orders.cancelled
      },
      customers: {
        total: customers.total,
        new: customers.new,
        returning: customers.returning
      },
      avgOrderValue: {
        value: avgOrderValue,
        currency: 'DZD'
      },
      conversionRate: {
        value: conversionRate,
        unit: '%'
      }
    };

    // ✅ Cache 5 minutes
    await safeSetEx(cacheKey, 300, metrics);

    return metrics;
  }

  // ========================================
  // 2. ANALYTICS VENTES (Détaillées)
  // ========================================
  async getSalesAnalytics(
    period: 'day' | 'week' | 'month' | 'year',
    startDate?: Date,
    endDate?: Date
  ): Promise<SalesMetrics> {
    
    const start = startDate ?? this.getPeriodStart(period);
    const end = endDate ?? new Date();

    // ✅ Agrégation temporelle
    const salesByPeriod = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC(${period}, order_date) as period,
        COUNT(*) as order_count,
        SUM(total_amount) as revenue,
        AVG(total_amount) as avg_order_value,
        COUNT(DISTINCT customer_id) as unique_customers
      FROM orders
      WHERE order_date BETWEEN ${start} AND ${end}
        AND status = 'DELIVERED'
      GROUP BY period
      ORDER BY period ASC
    `;

    // ✅ Top produits vendus
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: start, lte: end },
          status: 'DELIVERED'
        }
      },
      _sum: {
        quantity: true,
        totalPrice: true
      },
      orderBy: {
        _sum: {
          totalPrice: 'desc'
        }
      },
      take: 10
    });

    // ✅ Répartition par catégorie
    const salesByCategory = await prisma.$queryRaw`
      SELECT 
        c.name as category_name,
        COUNT(DISTINCT o.id) as order_count,
        SUM(oi.quantity) as units_sold,
        SUM(oi.total_price) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.order_date BETWEEN ${start} AND ${end}
        AND o.status = 'DELIVERED'
      GROUP BY c.id, c.name
      ORDER BY revenue DESC
    `;

    // ✅ Performance par wilaya
    const salesByRegion = await this.getSalesByWilaya(start, end);

    return {
      timeline: salesByPeriod,
      topProducts,
      byCategory: salesByCategory,
      byRegion: salesByRegion,
      summary: {
        totalRevenue: salesByPeriod.reduce((sum, s) => sum + Number(s.revenue), 0),
        totalOrders: salesByPeriod.reduce((sum, s) => sum + Number(s.order_count), 0),
        avgOrderValue: salesByPeriod.reduce((sum, s) => sum + Number(s.avg_order_value), 0) / salesByPeriod.length
      }
    };
  }

  // ========================================
  // 3. ANALYTICS PRODUITS (Performance)
  // ========================================
  async getProductAnalytics(): Promise<ProductMetrics> {
    
    const cacheKey = 'analytics:products:current';
    const cached = await safeGet<ProductMetrics>(cacheKey);
    if (cached) return cached;

    const [
      totalProducts,
      activeProducts,
      outOfStock,
      lowStock,
      topPerformers,
      poorPerformers,
      profitability
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { stockQuantity: 0 } }),
      (async () => {
        const rows = await prisma.$queryRaw<{ count: number }[]>`
          SELECT COUNT(*)::int AS count
          FROM products
          WHERE stock_quantity <= min_stock
        `;
        return Number(rows?.[0]?.count ?? 0);
      })(),
      this.getTopPerformingProducts(30),
      this.getPoorPerformingProducts(30),
      this.getProductProfitability()
    ]);

    const metrics: ProductMetrics = {
      inventory: {
        total: totalProducts,
        active: activeProducts,
        inactive: totalProducts - activeProducts,
        outOfStock,
        lowStock
      },
      performance: {
        topSellers: topPerformers,
        poorPerformers,
        avgViewsPerProduct: await this.getAvgProductViews(),
        avgConversionRate: await this.getAvgProductConversion()
      },
      profitability: {
        totalValue: profitability.totalValue,
        avgMargin: profitability.avgMargin,
        bestMargins: profitability.bestMargins
      }
    };

    await safeSetEx(cacheKey, 600, metrics); // 10 min
    return metrics;
  }

  // ========================================
  // 4. ANALYTICS CLIENTS (Segmentation)
  // ========================================
  async getCustomerAnalytics(): Promise<CustomerMetrics> {
    
    const [
      totalCustomers,
      activeCustomers,
      customersByType,
      ltv,
      retention,
      churnRate,
      topCustomers
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({
        where: {
          lastOrderAt: {
            gte: subDays(new Date(), 90)
          }
        }
      }),
      this.getCustomersByType(),
      this.getCustomerLTV(),
      this.getRetentionRate(),
      this.getChurnRate(),
      this.getTopCustomers(10)
    ]);

    // ✅ Segmentation RFM (Recency, Frequency, Monetary)
    const rfmSegments = await this.getRFMSegmentation();

    return {
      overview: {
        total: totalCustomers,
        active: activeCustomers,
        inactive: totalCustomers - activeCustomers,
        byType: customersByType
      },
      behavior: {
        avgOrderFrequency: await this.getAvgOrderFrequency(),
        avgLifetimeValue: ltv,
        retentionRate: retention,
        churnRate
      },
      segmentation: {
        rfm: rfmSegments,
        topSpenders: topCustomers
      }
    };
  }

  // ========================================
  // 5. INVENTAIRE ANALYTICS
  // ========================================
  async getInventoryAnalytics(): Promise<InventoryMetrics> {
    
    const [
      stockValue,
      turnoverRate,
      deadStock,
      stockAlerts,
      stockMovements
    ] = await Promise.all([
      this.calculateStockValue(),
      this.calculateTurnoverRate(),
      this.identifyDeadStock(90), // Produits non vendus 90j
      this.getStockAlerts(),
      this.getStockMovements(7) // 7 derniers jours
    ]);

    return {
      value: {
        total: stockValue.total,
        available: stockValue.available,
        reserved: stockValue.reserved
      },
      turnover: {
        rate: turnoverRate,
        avgDaysInStock: await this.getAvgDaysInStock()
      },
      alerts: {
        outOfStock: stockAlerts.outOfStock,
        lowStock: stockAlerts.lowStock,
        overstock: stockAlerts.overstock
      },
      deadStock: {
        count: deadStock.length,
        value: deadStock.reduce((sum, p) => sum + (p.stockQuantity * p.price), 0),
        products: deadStock
      },
      recentMovements: stockMovements
    };
  }

  // ========================================
  // 6. RAPPORTS AUTOMATISÉS (Cron Jobs)
  // ========================================
  async generateDailyReport(): Promise<void> {
    const yesterday = subDays(new Date(), 1);
    const startOfYesterday = startOfDay(yesterday);
    const endOfYesterday = endOfDay(yesterday);

    const report = {
      date: format(yesterday, 'yyyy-MM-dd'),
      overview: await this.getOverviewMetrics(startOfYesterday, endOfYesterday),
      sales: await this.getSalesAnalytics('day', startOfYesterday, endOfYesterday),
      topProducts: await this.getTopPerformingProducts(1),
      alerts: await this.getStockAlerts()
    };

    // ✅ Sauvegarder le rapport
    await prisma.dailyReport.create({
      data: {
        date: yesterday,
        content: report as any,
        type: 'DAILY'
      }
    });

    // ✅ Envoyer email aux admins
    await this.emailDailyReport(report);
  }

  // ========================================
  // HELPERS PRIVÉS
  // ========================================
  private async getRevenue(start: Date, end: Date): Promise<number> {
    const result = await prisma.order.aggregate({
      where: {
        createdAt: { gte: start, lte: end },
        status: 'DELIVERED'
      },
      _sum: { totalAmount: true }
    });
    return result._sum.totalAmount?.toNumber() ?? 0;
  }

  private async getOrdersCount(start: Date, end: Date) {
    const [total, pending, completed, cancelled] = await Promise.all([
      prisma.order.count({
        where: { createdAt: { gte: start, lte: end } }
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: start, lte: end },
          status: 'PENDING'
        }
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: start, lte: end },
          status: 'DELIVERED'
        }
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: start, lte: end },
          status: 'CANCELLED'
        }
      })
    ]);

    return { total, pending, completed, cancelled };
  }

  private getPeriodStart(period: string): Date {
    switch (period) {
      case 'day': return subDays(new Date(), 1);
      case 'week': return subDays(new Date(), 7);
      case 'month': return subDays(new Date(), 30);
      case 'year': return subDays(new Date(), 365);
      default: return subDays(new Date(), 30);
    }
  }

  private async emailDailyReport(report: any): Promise<void> {
    // TODO: Implémenter envoi email
    console.log('📧 Rapport journalier envoyé');
  }

  // Helpers manquants pour l'overview
  private async getNewCustomers(start: Date, end: Date): Promise<{ total: number; new: number; returning: number }> {
    const [total, newCustomers, returningOrdersCustomers] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { createdAt: { gte: start, lte: end } } }),
      prisma.order.findMany({
        where: { createdAt: { gte: start, lte: end }, customer: { createdAt: { lt: start } } },
        select: { customerId: true }
      })
    ]);
    const returning = new Set(returningOrdersCustomers.map((o: any) => o.customerId)).size;
    return { total, new: newCustomers, returning };
  }

  private async getAverageOrderValue(start: Date, end: Date): Promise<number> {
    const result = await prisma.order.aggregate({
      where: { createdAt: { gte: start, lte: end }, status: 'DELIVERED' },
      _avg: { totalAmount: true }
    });
    return result._avg.totalAmount?.toNumber() ?? 0;
  }

  private async getConversionRate(start: Date, end: Date): Promise<number> {
    const [ordersCount, sessionsCount] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: start, lte: end }, status: 'DELIVERED' } }),
      prisma.analyticsSession.count({ where: { startedAt: { gte: start, lte: end }, isBot: false } })
    ]);
    if (sessionsCount === 0) return 0;
    return (ordersCount / sessionsCount) * 100;
  }

  // Sales by region (Wilaya)
  private async getSalesByWilaya(start: Date, end: Date): Promise<Array<{ wilaya: string | null; orderCount: number; revenue: number }>> {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT 
        COALESCE(a.region, a.city) AS wilaya,
        COUNT(o.id)::int AS order_count,
        SUM(o.total_amount)::numeric AS revenue
      FROM orders o
      JOIN addresses a ON o.address_id = a.id
      WHERE o.order_date BETWEEN ${start} AND ${end}
        AND o.status = 'DELIVERED'
      GROUP BY wilaya
      ORDER BY revenue DESC
    `;
    return rows.map((r) => ({ wilaya: r.wilaya ?? null, orderCount: Number(r.order_count ?? 0), revenue: Number(r.revenue ?? 0) }));
  }

  // Product performance helpers
  private async getTopPerformingProducts(days: number): Promise<Array<{ productId: string; unitsSold: number; revenue: number }>> {
    const since = subDays(new Date(), days);
    const rows = await prisma.$queryRaw<any[]>`
      SELECT 
        oi.product_id as product_id,
        SUM(oi.quantity)::int AS units_sold,
        SUM(oi.total_price)::numeric AS revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= ${since} AND o.status = 'DELIVERED'
      GROUP BY oi.product_id
      ORDER BY revenue DESC
      LIMIT 10
    `;
    return rows.map((r) => ({ productId: r.product_id, unitsSold: Number(r.units_sold ?? 0), revenue: Number(r.revenue ?? 0) }));
  }

  private async getPoorPerformingProducts(days: number): Promise<Array<{ productId: string; unitsSold: number; revenue: number }>> {
    const since = subDays(new Date(), days);
    const rows = await prisma.$queryRaw<any[]>`
      SELECT 
        oi.product_id as product_id,
        COALESCE(SUM(oi.quantity), 0)::int AS units_sold,
        COALESCE(SUM(oi.total_price), 0)::numeric AS revenue
      FROM products p
      LEFT JOIN order_items oi ON oi.product_id = p.id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.created_at >= ${since} AND o.status = 'DELIVERED'
      GROUP BY p.id, oi.product_id
      ORDER BY units_sold ASC, revenue ASC
      LIMIT 10
    `;
    return rows.map((r) => ({ productId: r.product_id, unitsSold: Number(r.units_sold ?? 0), revenue: Number(r.revenue ?? 0) }));
  }

  private async getProductProfitability(): Promise<{ totalValue: number; avgMargin: number; bestMargins: Array<{ productId: string; name: string; marginPercent: number }> }> {
    const [valueRows, marginRows] = await Promise.all([
      prisma.$queryRaw<any[]>`SELECT SUM(price * stock_quantity)::numeric AS total_value FROM products`,
      prisma.$queryRaw<any[]>`
        SELECT id, name, cost_price, sale_price
        FROM products
        WHERE cost_price IS NOT NULL AND sale_price IS NOT NULL AND sale_price > 0
      `
    ]);
    const totalValue = Number(valueRows?.[0]?.total_value ?? 0);
    const margins = marginRows.map((p) => {
      const cost = Number(p.cost_price);
      const sale = Number(p.sale_price);
      const marginPercent = sale > 0 ? ((sale - cost) / sale) * 100 : 0;
      return { productId: p.id as string, name: p.name as string, marginPercent };
    });
    const avgMargin = margins.length ? margins.reduce((s, m) => s + m.marginPercent, 0) / margins.length : 0;
    const bestMargins = margins.sort((a, b) => b.marginPercent - a.marginPercent).slice(0, 10);
    return { totalValue, avgMargin, bestMargins };
  }

  private async getAvgProductViews(): Promise<number> {
    const [views, productCount] = await Promise.all([
      prisma.ecommerceEvent.count({ where: { eventType: 'view_item' } }),
      prisma.product.count({ where: { isActive: true } })
    ]);
    return productCount > 0 ? views / productCount : 0;
  }

  private async getAvgProductConversion(): Promise<number> {
    const [views, purchases] = await Promise.all([
      prisma.ecommerceEvent.count({ where: { eventType: 'view_item' } }),
      prisma.ecommerceEvent.count({ where: { eventType: 'purchase' } })
    ]);
    if (views === 0) return 0;
    return (purchases / views) * 100;
  }

  // Customer analytics helpers
  private async getCustomersByType(): Promise<{ b2c: number; b2b: number }> {
    const [b2c, b2b] = await Promise.all([
      prisma.customer.count({ where: { customerType: 'B2C' } as any }),
      prisma.customer.count({ where: { customerType: 'B2B' } as any })
    ]);
    return { b2c, b2b };
  }

  private async getCustomerLTV(): Promise<number> {
    const result = await prisma.customer.aggregate({ _avg: { totalSpent: true } });
    return result._avg.totalSpent?.toNumber() ?? 0;
  }

  private async getRetentionRate(): Promise<number> {
    const [withOrders, repeatCustomers] = await Promise.all([
      prisma.customer.count({ where: { orderCount: { gte: 1 } } }),
      prisma.customer.count({ where: { orderCount: { gte: 2 } } })
    ]);
    if (withOrders === 0) return 0;
    return (repeatCustomers / withOrders) * 100;
  }

  private async getChurnRate(): Promise<number> {
    const [active, churned] = await Promise.all([
      prisma.customer.count({ where: { lastOrderAt: { gte: subDays(new Date(), 90) } } }),
      prisma.customer.count({ where: { lastOrderAt: { lt: subDays(new Date(), 90) } } })
    ]);
    const total = active + churned;
    if (total === 0) return 0;
    return (churned / total) * 100;
  }

  private async getTopCustomers(limit: number): Promise<Array<{ id: string; name: string | null; totalSpent: number }>> {
    const customers = await prisma.customer.findMany({
      orderBy: { totalSpent: 'desc' },
      take: limit,
      select: { id: true, firstName: true, lastName: true, companyName: true, totalSpent: true }
    });
    return customers.map((c) => ({
      id: c.id,
      name: c.companyName ?? ([c.firstName, c.lastName].filter(Boolean).join(' ') || null),
      totalSpent: Number(c.totalSpent)
    }));
  }

  private async getRFMSegmentation(): Promise<{ champions: number; loyal: number; atRisk: number; lost: number }> {
    const [champions, loyal, atRisk, lost] = await Promise.all([
      prisma.customer.count({ where: { lastOrderAt: { gte: subDays(new Date(), 30) }, orderCount: { gte: 3 } } }),
      prisma.customer.count({ where: { lastOrderAt: { gte: subDays(new Date(), 90) }, orderCount: { gte: 2 } } }),
      prisma.customer.count({ where: { lastOrderAt: { lt: subDays(new Date(), 90) }, orderCount: { gte: 1 } } }),
      prisma.customer.count({ where: { orderCount: 0 } })
    ]);
    return { champions, loyal, atRisk, lost };
  }

  private async getAvgOrderFrequency(): Promise<number> {
    const result = await prisma.customer.aggregate({ _avg: { orderCount: true } });
    return result._avg.orderCount ?? 0;
  }

  // Inventory helpers
  private async getStockAlerts(): Promise<{ outOfStock: number; lowStock: number; overstock: number }> {
    const [outOfStock, lowStock, overstock] = await Promise.all([
      prisma.product.count({ where: { stockQuantity: { lte: 0 } } }),
      prisma.product.count({ where: { stockQuantity: { gt: 0 }, minStock: { gt: 0 }, stockQuantity: { lte: undefined as any } } }),
      prisma.product.count({ where: { maxStock: { not: null }, stockQuantity: { gt: undefined as any } } })
    ]);
    // Fix lowStock and overstock with raw SQL for clarity
    const lowRows = await prisma.$queryRaw<any[]>`SELECT COUNT(*)::int AS count FROM products WHERE stock_quantity <= min_stock`;
    const overRows = await prisma.$queryRaw<any[]>`SELECT COUNT(*)::int AS count FROM products WHERE max_stock IS NOT NULL AND stock_quantity > max_stock`;
    return { outOfStock, lowStock: Number(lowRows?.[0]?.count ?? 0), overstock: Number(overRows?.[0]?.count ?? 0) };
  }

  private async calculateStockValue(): Promise<{ total: number; available: number; reserved: number }> {
    const [totalRows, availableRows, reservedRows] = await Promise.all([
      prisma.$queryRaw<any[]>`SELECT COALESCE(SUM(price * stock_quantity), 0)::numeric AS total FROM products`,
      prisma.$queryRaw<any[]>`SELECT COALESCE(SUM(price * stock_quantity), 0)::numeric AS available FROM products WHERE is_active = true`,
      prisma.$queryRaw<any[]>`
        SELECT COALESCE(SUM(oi.unit_price * oi.quantity), 0)::numeric AS reserved
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status IN ('PENDING','CONFIRMED','PROCESSING')
      `
    ]);
    return {
      total: Number(totalRows?.[0]?.total ?? 0),
      available: Number(availableRows?.[0]?.available ?? 0),
      reserved: Number(reservedRows?.[0]?.reserved ?? 0)
    };
  }

  private async calculateTurnoverRate(): Promise<number> {
    const [soldRows, stockRows] = await Promise.all([
      prisma.$queryRaw<any[]>`
        SELECT COALESCE(SUM(oi.quantity), 0)::int AS sold_units
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.created_at >= ${subDays(new Date(), 30)} AND o.status = 'DELIVERED'
      `,
      prisma.$queryRaw<any[]>`SELECT COALESCE(SUM(stock_quantity), 0)::int AS stock_units FROM products`
    ]);
    const sold = Number(soldRows?.[0]?.sold_units ?? 0);
    const stock = Number(stockRows?.[0]?.stock_units ?? 0);
    if (stock === 0) return 0;
    return sold / stock;
  }

  private async identifyDeadStock(days: number): Promise<Array<{ id: string; name: string; stockQuantity: number; price: number }>> {
    const since = subDays(new Date(), days);
    const rows = await prisma.$queryRaw<any[]>`
      SELECT p.id, p.name, p.stock_quantity::int AS stock_quantity, p.price::numeric AS price
      FROM products p
      LEFT JOIN order_items oi ON oi.product_id = p.id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.created_at >= ${since}
      WHERE o.id IS NULL AND p.stock_quantity > 0 AND p.is_active = true
      ORDER BY p.stock_quantity DESC
      LIMIT 50
    `;
    return rows.map((r) => ({ id: r.id, name: r.name, stockQuantity: Number(r.stock_quantity ?? 0), price: Number(r.price ?? 0) }));
  }

  private async getStockMovements(days: number): Promise<any[]> {
    const since = subDays(new Date(), days);
    const logs = await prisma.inventoryLog.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    return logs;
  }

  private async getAvgDaysInStock(): Promise<number> {
    // Simplified: ratio of current stock units to daily sold units
    const [soldRows, stockRows] = await Promise.all([
      prisma.$queryRaw<any[]>`
        SELECT COALESCE(SUM(oi.quantity), 0)::int AS sold_units
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.created_at >= ${subDays(new Date(), 30)} AND o.status = 'DELIVERED'
      `,
      prisma.$queryRaw<any[]>`SELECT COALESCE(SUM(stock_quantity), 0)::int AS stock_units FROM products`
    ]);
    const soldPerDay = Number(soldRows?.[0]?.sold_units ?? 0) / 30;
    const stockUnits = Number(stockRows?.[0]?.stock_units ?? 0);
    if (soldPerDay === 0) return 0;
    return stockUnits / soldPerDay;
  }
}

// ========================================
// 7. EXPORTS & TYPES
// ========================================
export interface OverviewMetrics {
  revenue: { value: number; growth: number; currency: string };
  orders: { total: number; pending: number; completed: number; cancelled: number };
  customers: { total: number; new: number; returning: number };
  avgOrderValue: { value: number; currency: string };
  conversionRate: { value: number; unit: string };
}

// ... autres types
