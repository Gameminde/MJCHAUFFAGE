// frontend/src/services/ordersService.ts
// 📦 Service de gestion des commandes (Admin)

import { supabase } from '@/lib/supabaseClient';
import PaymentService from './paymentService';

// Helpers
function toQuery(params?: Record<string, any>): string {
  if (!params) return '';
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => sp.append(key, String(v)));
    } else {
      sp.append(key, String(value));
    }
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price?: number;
  unitPrice?: number;
  total?: number;
  totalPrice?: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentIntentId?: string;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface OrderFilters {
  search?: string;
  status?: Order['status'] | Order['status'][];
  paymentStatus?: Order['paymentStatus'];
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'createdAt' | 'total' | 'orderNumber';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  refunded: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersToday: number;
  ordersThisMonth: number;
}

export interface PaginatedOrders {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateOrderRequest {
  status?: Order['status'];
  trackingNumber?: string;
  notes?: string;
  shippingAddress?: Order['shippingAddress'];
}

const convertSupabaseOrder = (data: any): Order => {
  // Helper to safely parse address
  const parseAddress = (addr: any) => {
    if (typeof addr === 'string') {
      try { return JSON.parse(addr); } catch { return {}; }
    }
    return addr || {};
  };

  // Map items
  const items = (data.order_items || []).map((item: any) => ({
    id: item.id,
    productId: item.product_id,
    productName: item.product?.name || 'Unknown Product',
    quantity: item.quantity,
    unitPrice: Number(item.unit_price),
    totalPrice: Number(item.total_price),
    imageUrl: item.product?.product_images?.[0]?.url
  }));

  const customer = data.customer || {};
  const address = data.shipping_address || {}; // Assuming joined address table

  return {
    id: data.id,
    orderNumber: data.order_number,
    customerId: data.customer_id,
    customerName: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Guest',
    customerEmail: customer.email,
    customerPhone: customer.phone,
    items,
    subtotal: Number(data.subtotal),
    tax: Number(data.tax_amount),
    shipping: Number(data.shipping_amount),
    discount: Number(data.discount_amount),
    total: Number(data.total_amount),
    status: data.status?.toLowerCase() || 'pending',
    paymentStatus: data.payment_status?.toLowerCase() || 'pending',
    paymentMethod: data.payments?.[0]?.method,
    paymentIntentId: data.payments?.[0]?.provider_payment_id,
    shippingAddress: {
      street: address.street || '',
      city: address.city || '',
      postalCode: address.postal_code || '',
      country: address.country || 'Algeria'
    },
    trackingNumber: data.tracking_number,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    shippedAt: data.shipped_at,
    deliveredAt: data.delivered_at
  };
};

export const ordersService = {
  async getUserOrders(page = 1, limit = 10): Promise<PaginatedOrders> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get customer ID for user
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!customer) return { orders: [], total: 0, page, limit, totalPages: 0 };

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              name,
              product_images (url)
            )
          ),
          customer:customers (*),
          shipping_address:addresses (*),
          payments (*)
        `, { count: 'exact' })
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const orders = (data || []).map(convertSupabaseOrder);
      const total = count || 0;

      return {
        orders,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return { orders: [], total: 0, page, limit, totalPages: 0 };
    }
  },

  async getOrders(filters?: OrderFilters): Promise<PaginatedOrders> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              name,
              product_images (url)
            )
          ),
          customer:customers (*),
          shipping_address:addresses (*),
          payments (*)
        `, { count: 'exact' });

      if (filters?.search) {
        query = query.or(`order_number.ilike.%${filters.search}%`);
      }
      if (filters?.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        query = query.in('status', statuses);
      }
      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }

      // Sorting
      const sortColumn = filters?.sortBy === 'total' ? 'total_amount' : 'created_at';
      const ascending = filters?.sortOrder === 'asc';
      query = query.order(sortColumn, { ascending });

      // Pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      const orders = (data || []).map(convertSupabaseOrder);
      const total = count || 0;

      return {
        orders,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { orders: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    }
  },

  async getOrderById(orderId: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products (
            name,
            product_images (url)
          )
        ),
        customer:customers (*),
        shipping_address:addresses (*),
        payments (*)
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return convertSupabaseOrder(data);
  },

  async createOrder(
    data: any // Typed as any for flexibility during migration, but should be strictly typed
  ): Promise<Order> {
    const { items, shippingAddress, customerInfo, paymentMethod, subtotal, shippingAmount, totalAmount, userId } = data;

    // 1. Get or Create Customer
    let customerId = data.customerId;

    if (!customerId) {
      if (userId) {
        // Ensure user exists in public.users to satisfy FK constraint
        // This is a fallback for when triggers fail or don't exist
        const { data: publicUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .maybeSingle();

        if (!publicUser) {
           console.log('User not found in public.users, creating sync record...');
           const { error: userError } = await supabase
             .from('users')
             .insert({
               id: userId,
               email: customerInfo?.email || `missing-email-${userId}@placeholder.com`,
               first_name: customerInfo?.firstName,
               last_name: customerInfo?.lastName,
               role: 'CUSTOMER'
             });
            
           if (userError) {
             console.error('Error creating public user:', userError);
             // We continue, hoping for the best (or explicit failure downstream)
           }
        }

        // Try to find existing customer for user
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          // Create customer for user
          const { data: newCustomer, error: custError } = await supabase
            .from('customers')
            .insert({
              user_id: userId,
              first_name: customerInfo?.firstName,
              last_name: customerInfo?.lastName,
              email: customerInfo?.email,
              phone: customerInfo?.phone,
            })
            .select()
            .single();

          if (custError) throw custError;
          customerId = newCustomer.id;
        }
      } else {
        // Guest customer
        const { data: newCustomer, error: custError } = await supabase
          .from('customers')
          .insert({
            first_name: customerInfo?.firstName,
            last_name: customerInfo?.lastName,
            email: customerInfo?.email,
            phone: customerInfo?.phone,
            customer_type: 'GUEST'
          })
          .select()
          .single();

        if (custError) throw custError;
        customerId = newCustomer.id;
      }
    }

    // 2. Create Address
    const { data: address, error: addrError } = await supabase
      .from('addresses')
      .insert({
        customer_id: customerId,
        type: 'SHIPPING',
        street: shippingAddress.street,
        city: shippingAddress.city,
        postal_code: shippingAddress.postalCode,
        country: shippingAddress.country || 'Algeria',
        // region: shippingAddress.region // Add if schema supports it
      })
      .select()
      .single();

    if (addrError) throw addrError;

    // 3. Create Order
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        address_id: address.id,
        status: 'pending',
        payment_status: 'pending', // Cash on delivery
        subtotal,
        shipping_amount: shippingAmount,
        total_amount: totalAmount,
        tax_amount: 0,
        discount_amount: 0
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 4. Create Order Items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // 5. Create Payment Record (Pending)
    await supabase.from('payments').insert({
      order_id: order.id,
      method: paymentMethod || 'CASH_ON_DELIVERY',
      provider: 'MANUAL',
      amount: totalAmount,
      status: 'pending'
    });

    return this.getOrderById(order.id);
  },

  async updateOrder(orderId: string, data: UpdateOrderRequest): Promise<Order> {
    const updates: any = {};
    if (data.status) updates.status = data.status;
    if (data.trackingNumber) updates.tracking_number = data.trackingNumber;
    if (data.notes) updates.notes = data.notes;

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (error) throw error;
    return this.getOrderById(orderId);
  },

  async updateOrderStatus(
    orderId: string,
    status: Order['status'],
    notes?: string
  ): Promise<Order> {
    return this.updateOrder(orderId, { status, notes });
  },

  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    return this.updateOrderStatus(orderId, 'cancelled', reason);
  },

  async markAsShipped(
    orderId: string,
    trackingNumber: string,
    carrier?: string
  ): Promise<Order> {
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'shipped',
        tracking_number: trackingNumber,
        shipping_carrier: carrier,
        shipped_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) throw error;
    return this.getOrderById(orderId);
  },

  async markAsDelivered(orderId: string): Promise<Order> {
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) throw error;
    return this.getOrderById(orderId);
  },

  async refundOrder(
    orderId: string,
    amount?: number,
    reason?: string
  ): Promise<{ order: Order; refundId: string }> {
    // Mock refund
    await this.updateOrderStatus(orderId, 'refunded', reason);
    return { order: await this.getOrderById(orderId), refundId: 'mock-refund-id' };
  },

  async getOrderStats(): Promise<OrderStats> {
    // Mock stats or implement aggregation query
    return {
      total: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      ordersToday: 0,
      ordersThisMonth: 0
    };
  },

  async exportOrders(filters?: OrderFilters): Promise<Blob> {
    throw new Error('Not implemented');
  },

  async generateInvoice(orderId: string): Promise<Blob> {
    throw new Error('Not implemented');
  },

  async sendNotification(
    orderId: string,
    type: 'order_confirmation' | 'shipping_update' | 'delivery_confirmation'
  ): Promise<{ sent: boolean }> {
    return { sent: true }; // Mock
  },

  async getTrackingHistory(orderId: string): Promise<Array<{
    status: string;
    timestamp: string;
    location?: string;
    notes?: string;
  }>> {
    return [];
  },

  async addNote(orderId: string, note: string): Promise<Order> {
    return this.updateOrder(orderId, { notes: note });
  },

  async searchOrders(query: string, limit = 10): Promise<Order[]> {
    return (await this.getOrders({ search: query, limit })).orders;
  },

  async getRecentOrders(limit = 10): Promise<Order[]> {
    return (await this.getOrders({ limit, sortBy: 'createdAt', sortOrder: 'desc' })).orders;
  },

  async getOrderTrends(period: 'day' | 'week' | 'month' | 'year'): Promise<Array<{
    date: string;
    orders: number;
    revenue: number;
  }>> {
    return [];
  },

  async getDelayedOrders(): Promise<Order[]> {
    return [];
  },

  async retryPayment(orderId: string): Promise<Order> {
    return this.getOrderById(orderId);
  },
};

export const OrderStatusUtils = {
  getStatusColor(status: Order['status']): string {
    const colors: Record<Order['status'], string> = {
      pending: 'yellow',
      processing: 'blue',
      shipped: 'purple',
      delivered: 'green',
      cancelled: 'red',
      refunded: 'orange',
    };
    return colors[status];
  },

  getStatusLabel(status: Order['status']): string {
    const labels: Record<Order['status'], string> = {
      pending: 'En attente',
      processing: 'En traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
      refunded: 'Remboursée',
    };
    return labels[status];
  },

  canCancel(order: Order): boolean {
    return ['pending', 'processing'].includes(order.status);
  },

  canShip(order: Order): boolean {
    return order.status === 'processing' && order.paymentStatus === 'paid';
  },

  canRefund(order: Order): boolean {
    return order.paymentStatus === 'paid' && ['processing', 'shipped', 'delivered'].includes(order.status);
  },
};

export default ordersService;
