import { createClient } from '@/lib/supabase/client';

export interface DashboardMetrics {
    totalRevenue: number;
    revenueGrowth: number;
    totalOrders: number;
    averageOrderValue: number;
    conversionRate: number;
    liveVisitors: number;
}

export interface FunnelStep {
    step: string;
    count: number;
    dropOff: number;
}

export interface RevenueData {
    date: string;
    revenue: number;
}

export interface DeviceData {
    name: string;
    value: number;
}

export interface DateRange {
    startDate: Date;
    endDate: Date;
}

class AnalyticsDashboardService {
    private supabase = createClient();

    /**
     * Get aggregated KPI metrics
     */
    async getDashboardMetrics(range: DateRange): Promise<DashboardMetrics> {
        const { startDate, endDate } = range;

        // 1. Revenue & Orders (from orders table for accuracy)
        const { data: orders } = await this.supabase
            .from('orders')
            .select('total_amount, created_at')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .neq('status', 'CANCELLED');

        const totalRevenue = orders?.reduce((sum, o) => sum + o.total_amount, 0) || 0;
        const totalOrders = orders?.length || 0;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // 2. Previous Period Revenue (for growth calculation)
        const duration = endDate.getTime() - startDate.getTime();
        const prevStart = new Date(startDate.getTime() - duration);
        const prevEnd = new Date(endDate.getTime() - duration);

        const { data: prevOrders } = await this.supabase
            .from('orders')
            .select('total_amount')
            .gte('created_at', prevStart.toISOString())
            .lte('created_at', prevEnd.toISOString())
            .neq('status', 'CANCELLED');

        const prevRevenue = prevOrders?.reduce((sum, o) => sum + o.total_amount, 0) || 0;
        const revenueGrowth = prevRevenue === 0 ? 100 : ((totalRevenue - prevRevenue) / prevRevenue) * 100;

        // 3. Conversion Rate (Orders / Unique Sessions)
        const { count: sessionCount } = await this.supabase
            .from('analytics_sessions')
            .select('*', { count: 'exact', head: true })
            .gte('started_at', startDate.toISOString())
            .lte('started_at', endDate.toISOString());

        const conversionRate = (sessionCount || 0) > 0 ? (totalOrders / (sessionCount || 1)) * 100 : 0;

        // 4. Live Visitors (Active in last 15 mins)
        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
        const { count: liveCount } = await this.supabase
            .from('analytics_sessions')
            .select('*', { count: 'exact', head: true })
            .gte('last_active_at', fifteenMinsAgo.toISOString());

        return {
            totalRevenue,
            revenueGrowth,
            totalOrders,
            averageOrderValue,
            conversionRate,
            liveVisitors: liveCount || 0
        };
    }

    /**
     * Get Conversion Funnel Data
     */
    async getConversionFunnel(range: DateRange): Promise<FunnelStep[]> {
        const { startDate, endDate } = range;

        // 1. Sessions
        const { count: sessions } = await this.supabase
            .from('analytics_sessions')
            .select('*', { count: 'exact', head: true })
            .gte('started_at', startDate.toISOString())
            .lte('started_at', endDate.toISOString());

        // 2. Product Views (Unique Sessions)
        const { data: productViews } = await this.supabase
            .from('analytics_events')
            .select('session_id')
            .eq('event_type', 'page_view') // Assuming product pages are identified by path or specific event
            .ilike('page_path', '%/products/%') // Simple path check for now
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString());

        const uniqueProductViews = new Set(productViews?.map(e => e.session_id)).size;

        // 3. Add to Cart (Unique Sessions)
        const { data: addToCarts } = await this.supabase
            .from('analytics_events')
            .select('session_id')
            .eq('event_type', 'add_to_cart')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString());

        const uniqueAddToCarts = new Set(addToCarts?.map(e => e.session_id)).size;

        // 4. Orders (Unique Sessions/Customers)
        // Note: Linking orders to sessions is tricky without session_id in orders table.
        // We use raw count of orders for this step as a proxy.
        const { count: orders } = await this.supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .neq('status', 'CANCELLED');

        const steps = [
            { step: 'Sessions', count: sessions || 0 },
            { step: 'Product Views', count: uniqueProductViews },
            { step: 'Add to Cart', count: uniqueAddToCarts },
            { step: 'Orders', count: orders || 0 }
        ];

        // Calculate drop-offs
        return steps.map((s, i) => {
            const prev = steps[i - 1];
            const dropOff = prev ? ((prev.count - s.count) / prev.count) * 100 : 0;
            return { ...s, dropOff: Math.max(0, dropOff) };
        });
    }

    /**
     * Get Daily Revenue Trend
     */
    async getRevenueTrend(range: DateRange): Promise<RevenueData[]> {
        const { startDate, endDate } = range;

        // Use the pre-aggregated daily_sales table if available and populated
        // For now, querying orders directly for real-time accuracy
        const { data: orders } = await this.supabase
            .from('orders')
            .select('total_amount, created_at')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .neq('status', 'CANCELLED')
            .order('created_at', { ascending: true });

        const dailyMap = new Map<string, number>();

        // Initialize all days in range with 0
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            dailyMap.set(d.toISOString().split('T')[0], 0);
        }

        orders?.forEach(o => {
            const date = o.created_at.split('T')[0];
            dailyMap.set(date, (dailyMap.get(date) || 0) + o.total_amount);
        });

        return Array.from(dailyMap.entries()).map(([date, revenue]) => ({
            date,
            revenue
        }));
    }

    /**
     * Get Device Breakdown
     */
    async getDeviceBreakdown(range: DateRange): Promise<DeviceData[]> {
        const { startDate, endDate } = range;

        const { data: sessions } = await this.supabase
            .from('analytics_sessions')
            .select('device_type')
            .gte('started_at', startDate.toISOString())
            .lte('started_at', endDate.toISOString());

        const deviceMap = new Map<string, number>();

        sessions?.forEach(s => {
            const device = s.device_type || 'Unknown';
            deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
        });

        return Array.from(deviceMap.entries()).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
            value
        }));
    }

    /**
     * Get Low Stock Products
     */
    async getLowStockProducts(): Promise<{ id: string; name: string; stock: number; minStock: number }[]> {
        const { data: products } = await this.supabase
            .from('products')
            .select('id, name, stock_quantity, min_stock')
            .eq('is_active', true);

        return products?.filter((p: any) => {
            const minStock = p.min_stock || 5;
            return p.stock_quantity <= minStock;
        }).map((p: any) => ({
            id: p.id,
            name: p.name,
            stock: p.stock_quantity,
            minStock: p.min_stock || 5
        })) || [];
    }
}

export const analyticsDashboardService = new AnalyticsDashboardService();
