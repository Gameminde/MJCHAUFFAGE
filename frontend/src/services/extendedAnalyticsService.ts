import { createClient } from '@/lib/supabase/client';

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  image_url?: string;
}

export interface OrderStats {
  date: string;
  orders: number;
}

class ExtendedAnalyticsService {
  private supabase = createClient();

  /**
   * Get Top Selling Products
   */
  async getTopProducts(range: { startDate: Date; endDate: Date }, limit: number = 5): Promise<TopProduct[]> {
    const { startDate, endDate } = range;

    // Get order items within date range
    const { data: orderItems } = await this.supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        price,
        orders!inner(created_at)
      `)
      .gte('orders.created_at', startDate.toISOString())
      .lte('orders.created_at', endDate.toISOString());

    // Aggregate by product
    const productMap = new Map<string, { sales: number; revenue: number }>();
    
    orderItems?.forEach((item: any) => {
      const existing = productMap.get(item.product_id) || { sales: 0, revenue: 0 };
      productMap.set(item.product_id, {
        sales: existing.sales + item.quantity,
        revenue: existing.revenue + (item.quantity * item.price)
      });
    });

    // Get product details
    const productIds = Array.from(productMap.keys());
    if (productIds.length === 0) return [];

    const { data: products } = await this.supabase
      .from('products')
      .select('id, name, image_url')
      .in('id', productIds);

    // Combine data and sort
    const topProducts = products?.map((p: any) => ({
      id: p.id,
      name: p.name,
      image_url: p.image_url,
      sales: productMap.get(p.id)?.sales || 0,
      revenue: productMap.get(p.id)?.revenue || 0
    })) || [];

    return topProducts
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  /**
   * Get Daily Order Statistics
   */
  async getOrderStats(range: { startDate: Date; endDate: Date }): Promise<OrderStats[]> {
    const { startDate, endDate } = range;

    const { data: orders } = await this.supabase
      .from('orders')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .neq('status', 'CANCELLED')
      .order('created_at', { ascending: true });

    const dailyMap = new Map<string, number>();

    // Initialize all days
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dailyMap.set(d.toISOString().split('T')[0], 0);
    }

    orders?.forEach((o: any) => {
      const date = o.created_at.split('T')[0];
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    });

    return Array.from(dailyMap.entries()).map(([date, orders]) => ({
      date,
      orders
    }));
  }
}

export const extendedAnalyticsService = new ExtendedAnalyticsService();
