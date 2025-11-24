import { createClient } from '@/lib/supabase/client';

/**
 * Admin Analytics Service
 * Provides comprehensive analytics data for the admin dashboard
 * All data is fetched from real database tables, no mock data
 */

export interface DateRange {
    startDate: string;
    endDate: string;
}

export interface BusinessMetrics {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    revenueGrowth: number;
    ordersGrowth: number;
    newCustomers: number;
    returningCustomers: number;
    totalCustomers: number;
    customerGrowth: number;
    totalServiceRequests: number;
    serviceGrowth: number;
    conversionRate: number;
    lowStockProducts: number;
}

export interface SalesData {
    date: string;
    revenue: number;
    orders: number;
    averageOrderValue: number;
}

export interface CategoryDistribution {
    name: string;
    value: number;
    percentage: number;
    orders: number;
}

export interface TopProduct {
    id: string;
    name: string;
    category: string;
    revenue: number;
    unitsSold: number;
    orders: number;
    stock: number;
    image: string;
}

export interface CustomerSegment {
    segment: string;
    count: number;
    totalRevenue: number;
    averageOrderValue: number;
    percentage: number;
}

export interface ServiceStats {
    status: string;
    count: number;
    percentage: number;
}

export interface WilayaDistribution {
    wilaya: string;
    orders: number;
    revenue: number;
    percentage: number;
}

/**
 * Calculate date range based on timeframe
 */
export function getDateRange(timeframe: '7d' | '30d' | '90d' | '1y'): DateRange {
    const endDate = new Date();
    const startDate = new Date();

    switch (timeframe) {
        case '7d':
            startDate.setDate(endDate.getDate() - 7);
            break;
        case '30d':
            startDate.setDate(endDate.getDate() - 30);
            break;
        case '90d':
            startDate.setDate(endDate.getDate() - 90);
            break;
        case '1y':
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
    }

    return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
    };
}

/**
 * Get comparison date range (previous period)
 */
function getComparisonRange(currentRange: DateRange): DateRange {
    const start = new Date(currentRange.startDate);
    const end = new Date(currentRange.endDate);
    const duration = end.getTime() - start.getTime();

    return {
        startDate: new Date(start.getTime() - duration).toISOString(),
        endDate: new Date(end.getTime() - duration).toISOString(),
    };
}

/**
 * Calculate percentage growth
 */
function calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
}

/**
 * Fetch business overview metrics
 */
export async function getBusinessMetrics(timeframe: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<BusinessMetrics> {
    const supabase = createClient();
    const currentRange = getDateRange(timeframe);
    const previousRange = getComparisonRange(currentRange);

    // Current period metrics
    const { data: currentOrders } = await supabase
        .from('orders')
        .select('id, total_amount, customer_id, status, created_at')
        .gte('created_at', currentRange.startDate)
        .lte('created_at', currentRange.endDate);

    // Previous period metrics for comparison
    const { data: previousOrders } = await supabase
        .from('orders')
        .select('id, total_amount, customer_id, status')
        .gte('created_at', previousRange.startDate)
        .lte('created_at', previousRange.endDate);

    // Calculate current metrics
    const validCurrentOrders = currentOrders?.filter((o: any) => o.status !== 'CANCELLED') || [];
    const validPreviousOrders = previousOrders?.filter((o: any) => o.status !== 'CANCELLED') || [];

    const totalRevenue = validCurrentOrders.reduce((sum: number, o: any) => sum + o.total_amount, 0);
    const totalOrders = validCurrentOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const previousRevenue = validPreviousOrders.reduce((sum: number, o: any) => sum + o.total_amount, 0);
    const previousOrderCount = validPreviousOrders.length;

    // Get customer metrics
    const uniqueCurrentCustomers = new Set(validCurrentOrders.map((o: any) => o.customer_id));
    const { data: allCustomers } = await supabase
        .from('customers')
        .select('id, created_at')
        .lte('created_at', currentRange.endDate);

    const newCustomers = allCustomers?.filter((c: any) =>
        c.created_at >= currentRange.startDate && c.created_at <= currentRange.endDate
    ).length || 0;

    const returningCustomers = uniqueCurrentCustomers.size - newCustomers;
    const totalCustomers = allCustomers?.length || 0;

    // Previous period customers for growth
    const { data: previousCustomersData } = await supabase
        .from('customers')
        .select('id')
        .gte('created_at', previousRange.startDate)
        .lte('created_at', previousRange.endDate);

    // Service requests
    const { data: currentServices } = await supabase
        .from('service_requests')
        .select('id')
        .gte('created_at', currentRange.startDate)
        .lte('created_at', currentRange.endDate);

    const { data: previousServices } = await supabase
        .from('service_requests')
        .select('id')
        .gte('created_at', previousRange.startDate)
        .lte('created_at', previousRange.endDate);

    // Low stock products
    const { data: allProducts } = await supabase
        .from('products')
        .select('id, stock_quantity, min_stock')
        .eq('is_active', true);

    const lowStock = allProducts?.filter((p: any) => {
        const minStock = p.min_stock || 5;
        return p.stock_quantity <= minStock;
    }) || [];

    // Calculate conversion rate (orders / unique sessions)
    // For now, use a simplified metric: completed orders / total orders initiated
    const completedOrders = validCurrentOrders.filter((o: any) => o.status === 'COMPLETED').length;
    const conversionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    return {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        revenueGrowth: calculateGrowth(totalRevenue, previousRevenue),
        ordersGrowth: calculateGrowth(totalOrders, previousOrderCount),
        newCustomers,
        returningCustomers,
        totalCustomers,
        customerGrowth: calculateGrowth(newCustomers, previousCustomersData?.length || 0),
        totalServiceRequests: currentServices?.length || 0,
        serviceGrowth: calculateGrowth(currentServices?.length || 0, previousServices?.length || 0),
        conversionRate,
        lowStockProducts: lowStock?.length || 0,
    };
}

/**
 * Fetch sales trends over time
 */
export async function getSalesTrends(
    timeframe: '7d' | '30d' | '90d' | '1y' = '30d',
    groupBy: 'day' | 'week' | 'month' = 'day'
): Promise<SalesData[]> {
    const supabase = createClient();
    const { startDate, endDate } = getDateRange(timeframe);

    const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true });

    if (!orders) return [];

    // Group sales by time period
    const salesMap = new Map<string, { revenue: number; orders: number }>();

    orders.forEach((order: any) => {
        if (order.status === 'CANCELLED') return;

        const date = new Date(order.created_at);
        let key = '';

        switch (groupBy) {
            case 'day':
                key = date.toISOString().split('T')[0];
                break;
            case 'week':
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toISOString().split('T')[0];
                break;
            case 'month':
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                break;
        }

        const current = salesMap.get(key) || { revenue: 0, orders: 0 };
        salesMap.set(key, {
            revenue: current.revenue + order.total_amount,
            orders: current.orders + 1,
        });
    });

    return Array.from(salesMap.entries())
        .map(([date, stats]) => ({
            date,
            revenue: stats.revenue,
            orders: stats.orders,
            averageOrderValue: stats.orders > 0 ? stats.revenue / stats.orders : 0,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get real category distribution from order items
 */
export async function getCategoryDistribution(timeframe: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<CategoryDistribution[]> {
    const supabase = createClient();
    const { startDate, endDate } = getDateRange(timeframe);

    // Query order items with product and category info
    const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
      total_price,
      quantity,
      order:orders!inner(created_at, status),
      product:products!inner(
        category:categories!inner(name)
      )
    `)
        .gte('order.created_at', startDate)
        .lte('order.created_at', endDate)
        .neq('order.status', 'CANCELLED');

    if (!orderItems || orderItems.length === 0) return [];

    // Aggregate by category
    const categoryMap = new Map<string, { revenue: number; orders: Set<string> }>();
    let totalRevenue = 0;

    orderItems.forEach((item: any) => {
        const categoryName = item.product?.category?.name || 'Uncategorized';
        const revenue = item.total_price || 0;

        totalRevenue += revenue;

        const current = categoryMap.get(categoryName) || { revenue: 0, orders: new Set() };
        categoryMap.set(categoryName, {
            revenue: current.revenue + revenue,
            orders: current.orders,
        });
    });

    return Array.from(categoryMap.entries())
        .map(([name, stats]) => ({
            name,
            value: stats.revenue,
            percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0,
            orders: stats.orders.size,
        }))
        .sort((a, b) => b.value - a.value);
}

/**
 * Get top performing products
 */
export async function getTopProducts(
    timeframe: '7d' | '30d' | '90d' | '1y' = '30d',
    limit: number = 10
): Promise<TopProduct[]> {
    const supabase = createClient();
    const { startDate, endDate } = getDateRange(timeframe);

    const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
      product_id,
      quantity,
      total_price,
      order:orders!inner(id, created_at, status),
      product:products!inner(
        name,
        stock_quantity,
        category:categories(name),
        images:product_images(url)
      )
    `)
        .gte('order.created_at', startDate)
        .lte('order.created_at', endDate)
        .neq('order.status', 'CANCELLED');

    if (!orderItems) return [];

    // Aggregate by product
    const productMap = new Map<string, {
        name: string;
        category: string;
        revenue: number;
        unitsSold: number;
        orders: Set<string>;
        stock: number;
        image: string;
    }>();

    orderItems.forEach((item: any) => {
        const productId = item.product_id;
        const current = productMap.get(productId) || {
            name: item.product?.name || 'Unknown',
            category: item.product?.category?.name || 'Uncategorized',
            revenue: 0,
            unitsSold: 0,
            orders: new Set(),
            stock: item.product?.stock_quantity || 0,
            image: item.product?.images?.[0]?.url || '',
        };

        current.revenue += item.total_price;
        current.unitsSold += item.quantity;
        current.orders.add(item.order.id);

        productMap.set(productId, current);
    });

    return Array.from(productMap.entries())
        .map(([id, stats]) => ({
            id,
            name: stats.name,
            category: stats.category,
            revenue: stats.revenue,
            unitsSold: stats.unitsSold,
            orders: stats.orders.size,
            stock: stats.stock,
            image: stats.image,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);
}

/**
 * Get customer segments distribution
 */
export async function getCustomerSegments(): Promise<CustomerSegment[]> {
    const supabase = createClient();

    // Try to get from analytics table first
    const { data: segments } = await supabase
        .from('analytics_customer_segments')
        .select('segment, lifetime_value, average_order_value');

    if (segments && segments.length > 0) {
        const segmentStats = new Map<string, { count: number; revenue: number; avgOrder: number }>();
        let totalRevenue = 0;

        segments.forEach((s: any) => {
            const current = segmentStats.get(s.segment) || { count: 0, revenue: 0, avgOrder: 0 };
            current.count++;
            current.revenue += s.lifetime_value || 0;
            current.avgOrder = s.average_order_value || 0;
            totalRevenue += s.lifetime_value || 0;
            segmentStats.set(s.segment, current);
        });

        return Array.from(segmentStats.entries())
            .map(([segment, stats]) => ({
                segment,
                count: stats.count,
                totalRevenue: stats.revenue,
                averageOrderValue: stats.avgOrder,
                percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0,
            }))
            .sort((a, b) => b.totalRevenue - a.totalRevenue);
    }

    // Fallback: calculate on the fly
    // Fetch customers with their orders to calculate metrics
    const { data: customers } = await supabase
        .from('customers')
        .select(`
            id,
            created_at,
            orders (
                id,
                total_amount,
                created_at,
                status
            )
        `);

    if (!customers) return [];

    const customerSegmentData = customers.map((c: any) => {
        const validOrders = c.orders?.filter((o: any) => o.status !== 'CANCELLED') || [];
        const totalSpent = validOrders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
        const orderCount = validOrders.length;

        // Find last order date
        let lastOrderDate = null;
        if (validOrders.length > 0) {
            // Sort orders by date descending
            const sortedOrders = [...validOrders].sort((a: any, b: any) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            lastOrderDate = sortedOrders[0].created_at;
        }

        const daysSinceLastOrder = lastOrderDate
            ? Math.floor((Date.now() - new Date(lastOrderDate).getTime()) / (1000 * 60 * 60 * 24))
            : 999;

        let segment = 'NEW';
        if (totalSpent > 50000) segment = 'VIP';
        else if (daysSinceLastOrder > 180) segment = 'LOST';
        else if (daysSinceLastOrder > 90) segment = 'AT_RISK';
        else if (orderCount > 1) segment = 'REGULAR';

        return {
            segment,
            revenue: totalSpent,
            avgOrder: orderCount > 0 ? totalSpent / orderCount : 0,
        };
    });

    const segmentStats = new Map<string, { count: number; revenue: number; avgOrder: number }>();
    let totalRevenue = 0;

    customerSegmentData.forEach((s: any) => {
        const current = segmentStats.get(s.segment) || { count: 0, revenue: 0, avgOrder: 0 };
        current.count++;
        current.revenue += s.revenue;
        current.avgOrder += s.avgOrder;
        totalRevenue += s.revenue;
        segmentStats.set(s.segment, current);
    });

    return Array.from(segmentStats.entries())
        .map(([segment, stats]) => ({
            segment,
            count: stats.count,
            totalRevenue: stats.revenue,
            averageOrderValue: stats.count > 0 ? stats.avgOrder / stats.count : 0,
            percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0,
        }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

/**
 * Get service request statistics
 */
export async function getServiceStats(timeframe: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<ServiceStats[]> {
    const supabase = createClient();
    const { startDate, endDate } = getDateRange(timeframe);

    const { data: services } = await supabase
        .from('service_requests')
        .select('status')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

    if (!services || services.length === 0) return [];

    const statusCount = new Map<string, number>();
    services.forEach((s: any) => {
        statusCount.set(s.status, (statusCount.get(s.status) || 0) + 1);
    });

    const total = services.length;

    return Array.from(statusCount.entries())
        .map(([status, count]) => ({
            status,
            count,
            percentage: (count / total) * 100,
        }))
        .sort((a, b) => b.count - a.count);
}

/**
 * Get geographic distribution by wilaya
 */
export async function getWilayaDistribution(timeframe: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<WilayaDistribution[]> {
    const supabase = createClient();
    const { startDate, endDate } = getDateRange(timeframe);

    const { data: orders } = await supabase
        .from('orders')
        .select(`
      total_amount,
      status,
      address:addresses!inner(
        wilaya:wilayas!inner(name)
      )
    `)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .neq('status', 'CANCELLED');

    if (!orders) return [];

    const wilayaMap = new Map<string, { orders: number; revenue: number }>();
    let totalRevenue = 0;

    orders.forEach((order: any) => {
        const wilayaName = order.address?.wilaya?.name || 'Unknown';
        const revenue = order.total_amount || 0;
        totalRevenue += revenue;

        const current = wilayaMap.get(wilayaName) || { orders: 0, revenue: 0 };
        wilayaMap.set(wilayaName, {
            orders: current.orders + 1,
            revenue: current.revenue + revenue,
        });
    });

    return Array.from(wilayaMap.entries())
        .map(([wilaya, stats]) => ({
            wilaya,
            orders: stats.orders,
            revenue: stats.revenue,
            percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10); // Top 10 wilayas
}
