// frontend/src/services/ordersService.ts
// 📦 Service de gestion des commandes (Admin)

import { api } from '@/lib/api';
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

/**
 * Types pour la gestion des commandes
 */
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price?: number; // unitPrice (for backward compatibility)
  unitPrice?: number; // From backend DTO
  total?: number; // totalPrice (for backward compatibility)
  totalPrice?: number; // From backend DTO
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string | null; // Null if no real email (not mock email)
  customerPhone: string | null; // Phone number for contact
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
/**
 * Service de gestion des commandes
 */
export const ordersService = {
  /**
   * Get current user's orders
   */
  async getUserOrders(page = 1, limit = 10): Promise<PaginatedOrders> {
    try {
      const result = await api.get<{ success: boolean; data: { orders: Order[]; pagination: any } }>(
        `/orders?page=${page}&limit=${limit}`
      );

      if (result.success && result.data) {
        return {
          orders: result.data.orders || [],
          total: result.data.pagination?.total || 0,
          page: result.data.pagination?.page || 1,
          limit: result.data.pagination?.limit || 10,
          totalPages: result.data.pagination?.totalPages || 0,
        };
      }
      return { orders: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  /**
   * Liste toutes les commandes avec filtres et pagination
   */
  async getOrders(filters?: OrderFilters): Promise<PaginatedOrders> {
    const qs = toQuery(filters);
    try {
      // api.get returns the full response: { success: true, data: { orders: [...], pagination: {...} } }
      const result = await api.get<{ success: boolean; data?: { orders?: Order[]; pagination?: any } }>(
        `/admin/orders${qs}`
      );

      // Handle response structure
      if (result && typeof result === 'object') {
        // Case 1: { success: true, data: { orders: [...], pagination: {...} } }
        if (result.success && result.data) {
          const orders = result.data.orders || [];
          const pagination = result.data.pagination || {};

          return {
            orders: Array.isArray(orders) ? orders : [],
            total: pagination.total || 0,
            page: pagination.page || 1,
            limit: pagination.limit || 20,
            totalPages: pagination.totalPages || 0,
          };
        }

        // Case 2: Direct { orders: [...], pagination: {...} } structure
        if ('orders' in result && Array.isArray((result as any).orders)) {
          const directResult = result as any;
          return {
            orders: directResult.orders || [],
            total: directResult.pagination?.total || directResult.total || 0,
            page: directResult.pagination?.page || directResult.page || 1,
            limit: directResult.pagination?.limit || directResult.limit || 20,
            totalPages: directResult.pagination?.totalPages || directResult.totalPages || 0,
          };
        }
      }

      console.warn('[ordersService] Unexpected response structure:', result);

      // Fallback
      return {
        orders: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };
    } catch (error) {
      console.error('[ordersService] Error fetching orders:', error);
      throw error;
    }
  },

  /**
   * Récupère une commande par ID
   */
  async getOrderById(orderId: string): Promise<Order> {
    const result = await api.get<{ success: boolean; data: Order }>(
      `/admin/orders/${orderId}`
    );
    return result.data as Order;
  },

  /**
   * Crée une commande manuelle (admin)
   */
  async createOrder(
    data: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>
  ): Promise<Order> {
    const result = await api.post<{ success: boolean; data: Order }>(
      '/admin/orders',
      data
    );
    return result.data as Order;
  },

  /**
   * Met à jour une commande
   */
  async updateOrder(orderId: string, data: UpdateOrderRequest): Promise<Order> {
    const result = await api.patch<{ success: boolean; data: Order }>(
      `/admin/orders/${orderId}`,
      data
    );
    return result.data as Order;
  },

  /**
   * Change le statut d'une commande
   */
  async updateOrderStatus(
    orderId: string,
    status: Order['status'],
    notes?: string
  ): Promise<Order> {
    const result = await api.patch<{ success: boolean; data: Order }>(
      `/admin/orders/${orderId}/status`,
      { status, notes }
    );
    return result.data as Order;
  },
  /**
   * Annule une commande
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const result = await api.post<{ success: boolean; data: Order }>(
      `/admin/orders/${orderId}/cancel`,
      { reason }
    );
    return result.data as Order;
  },

  /**
   * Marque une commande comme expédiée
   */
  async markAsShipped(
    orderId: string,
    trackingNumber: string,
    carrier?: string
  ): Promise<Order> {
    const result = await api.post<{ success: boolean; data: Order }>(
      `/admin/orders/${orderId}/ship`,
      { trackingNumber, carrier }
    );
    return result.data as Order;
  },

  /**
   * Marque une commande comme livrée
   */
  async markAsDelivered(orderId: string): Promise<Order> {
    const result = await api.post<{ success: boolean; data: Order }>(
      `/admin/orders/${orderId}/deliver`,
      {}
    );
    return result.data as Order;
  },

  /**
   * Rembourse une commande (utilise paymentService)
   */
  async refundOrder(
    orderId: string,
    amount?: number,
    reason?: string
  ): Promise<{ order: Order; refundId: string }> {
    const order = await this.getOrderById(orderId);
    if (!order.paymentIntentId) {
      throw new Error('Commande sans intention de paiement');
    }
    const refund = await PaymentService.refundPayment({
      paymentIntentId: order.paymentIntentId,
      amount,
      reason,
    });
    const updatedOrder = await this.updateOrderStatus(orderId, 'refunded');
    return { order: updatedOrder, refundId: refund.refundId };
  },

  /**
   * Récupère les statistiques des commandes
   */
  async getOrderStats(): Promise<OrderStats> {
    const result = await api.get<{ success: boolean; data: OrderStats }>(
      '/admin/orders/stats'
    );
    return result.data as OrderStats;
  },
  /**
   * Exporte les commandes (CSV)
   */
  async exportOrders(filters?: OrderFilters): Promise<Blob> {
    const qs = toQuery({ ...(filters || {}), format: 'csv' });
    const result = await api.get<{ success: boolean; data: any }>(
      `/admin/orders/export${qs}`,
      { headers: { Accept: 'text/csv' } }
    );
    const csvText = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
    return new Blob([csvText], { type: 'text/csv' });
  },

  /**
   * Génère une facture PDF
   */
  async generateInvoice(orderId: string): Promise<Blob> {
    const result = await api.get<{ success: boolean; data: any }>(
      `/admin/orders/${orderId}/invoice`,
      { headers: { Accept: 'application/pdf' } }
    );
    const pdfBytes = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
    return new Blob([pdfBytes], { type: 'application/pdf' });
  },

  /**
   * Envoie une notification au client
   */
  async sendNotification(
    orderId: string,
    type: 'order_confirmation' | 'shipping_update' | 'delivery_confirmation'
  ): Promise<{ sent: boolean }> {
    const result = await api.post<{ success: boolean; data: { sent: boolean } }>(
      `/admin/orders/${orderId}/notify`,
      { type }
    );
    return result.data as { sent: boolean };
  },
  /**
   * Récupère l'historique de suivi
   */
  async getTrackingHistory(orderId: string): Promise<Array<{
    status: string;
    timestamp: string;
    location?: string;
    notes?: string;
  }>> {
    const result = await api.get<{
      success: boolean;
      data: Array<{ status: string; timestamp: string; location?: string; notes?: string }>;
    }>(`/admin/orders/${orderId}/tracking`);
    return (result.data || []) as Array<{
      status: string;
      timestamp: string;
      location?: string;
      notes?: string;
    }>;
  },

  /**
   * Ajoute une note interne à la commande
   */
  async addNote(orderId: string, note: string): Promise<Order> {
    const result = await api.post<{ success: boolean; data: Order }>(
      `/admin/orders/${orderId}/notes`,
      { note }
    );
    return result.data as Order;
  },

  /**
   * Recherche de commandes (autocomplete)
   */
  async searchOrders(query: string, limit = 10): Promise<Order[]> {
    const qs = toQuery({ q: query, limit });
    const result = await api.get<{ success: boolean; data: Order[] }>(
      `/admin/orders/search${qs}`
    );
    return (result.data || []) as Order[];
  },

  /**
   * Récupère les commandes récentes
   */
  async getRecentOrders(limit = 10): Promise<Order[]> {
    const qs = toQuery({ limit });
    const result = await api.get<{ success: boolean; data: Order[] }>(
      `/admin/orders/recent${qs}`
    );
    return (result.data || []) as Order[];
  },
  /**
   * Calcule les tendances des commandes (analytics)
   */
  async getOrderTrends(period: 'day' | 'week' | 'month' | 'year'): Promise<Array<{
    date: string;
    orders: number;
    revenue: number;
  }>> {
    const qs = toQuery({ period });
    const result = await api.get<{
      success: boolean;
      data: Array<{ date: string; orders: number; revenue: number }>;
    }>(`/admin/orders/trends${qs}`);
    return (result.data || []) as Array<{
      date: string;
      orders: number;
      revenue: number;
    }>;
  },

  /**
   * Vérifie les commandes en retard
   */
  async getDelayedOrders(): Promise<Order[]> {
    const result = await api.get<{ success: boolean; data: Order[] }>(
      '/admin/orders/delayed'
    );
    return (result.data || []) as Order[];
  },

  /**
   * Ré-essaye un paiement échoué
   */
  async retryPayment(orderId: string): Promise<Order> {
    const result = await api.post<{ success: boolean; data: Order }>(
      `/admin/orders/${orderId}/retry-payment`,
      {}
    );
    return result.data as Order;
  },
};

/**
 * Helpers pour les statuts
 */
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
