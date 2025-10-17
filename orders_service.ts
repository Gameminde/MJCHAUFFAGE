// frontend/src/services/ordersService.ts
// 📦 Service de gestion des commandes (Admin)

import { api } from '@/lib/api';
import { paymentService } from './paymentService';

/**
 * Types pour la gestion des commandes
 */
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
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
   * Liste toutes les commandes avec filtres et pagination
   */
  async getOrders(filters?: OrderFilters): Promise<PaginatedOrders> {
    const response = await api.get<PaginatedOrders>('/admin/orders', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Récupère une commande par ID
   */
  async getOrderById(orderId: string): Promise<Order> {
    const response = await api.get<Order>(`/admin/orders/${orderId}`);
    return response.data;
  },

  /**
   * Crée une commande manuelle (admin)
   */
  async createOrder(data: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const response = await api.post<Order>('/admin/orders', data);
    return response.data;
  },

  /**
   * Met à jour une commande
   */
  async updateOrder(orderId: string, data: UpdateOrderRequest): Promise<Order> {
    const response = await api.patch<Order>(`/admin/orders/${orderId}`, data);
    return response.data;
  },

  /**
   * Change le statut d'une commande
   */
  async updateOrderStatus(
    orderId: string,
    status: Order['status'],
    notes?: string
  ): Promise<Order> {
    const response = await api.patch<Order>(
      `/admin/orders/${orderId}/status`,
      { status, notes }
    );
    return response.data;
  },

  /**
   * Annule une commande
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const response = await api.post<Order>(`/admin/orders/${orderId}/cancel`, {
      reason,
    });
    return response.data;
  },

  /**
   * Marque une commande comme expédiée
   */
  async markAsShipped(
    orderId: string,
    trackingNumber: string,
    carrier?: string
  ): Promise<Order> {
    const response = await api.post<Order>(`/admin/orders/${orderId}/ship`, {
      trackingNumber,
      carrier,
    });
    return response.data;
  },

  /**
   * Marque une commande comme livrée
   */
  async markAsDelivered(orderId: string): Promise<Order> {
    const response = await api.post<Order>(
      `/admin/orders/${orderId}/deliver`,
      {}
    );
    return response.data;
  },

  /**
   * Rembourse une commande (utilise paymentService)
   */
  async refundOrder(
    orderId: string,
    amount?: number,
    reason?: string
  ): Promise<{ order: Order; refundId: string }> {
    // 1. Récupérer la commande pour avoir le paymentIntentId
    const order = await this.getOrderById(orderId);

    if (!order.paymentIntentId) {
      throw new Error('Commande sans intention de paiement');
    }

    // 2. Créer le remboursement via paymentService
    const refund = await paymentService.refundPayment({
      paymentIntentId: order.paymentIntentId,
      amount,
      reason,
    });

    // 3. Mettre à jour le statut de la commande
    const updatedOrder = await this.updateOrderStatus(orderId, 'refunded');

    return {
      order: updatedOrder,
      refundId: refund.refundId,
    };
  },

  /**
   * Récupère les statistiques des commandes
   */
  async getOrderStats(): Promise<OrderStats> {
    const response = await api.get<OrderStats>('/admin/orders/stats');
    return response.data;
  },

  /**
   * Exporte les commandes (CSV)
   */
  async exportOrders(filters?: OrderFilters): Promise<Blob> {
    const response = await api.get('/admin/orders/export', {
      params: { ...filters, format: 'csv' },
      headers: {
        Accept: 'text/csv',
      },
    });

    return new Blob([JSON.stringify(response.data)], { type: 'text/csv' });
  },

  /**
   * Génère une facture PDF
   */
  async generateInvoice(orderId: string): Promise<Blob> {
    const response = await api.get(`/admin/orders/${orderId}/invoice`, {
      headers: {
        Accept: 'application/pdf',
      },
    });

    return new Blob([JSON.stringify(response.data)], { type: 'application/pdf' });
  },

  /**
   * Envoie une notification au client
   */
  async sendNotification(
    orderId: string,
    type: 'order_confirmation' | 'shipping_update' | 'delivery_confirmation'
  ): Promise<{ sent: boolean }> {
    const response = await api.post<{ sent: boolean }>(
      `/admin/orders/${orderId}/notify`,
      { type }
    );
    return response.data;
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
    const response = await api.get<Array<{
      status: string;
      timestamp: string;
      location?: string;
      notes?: string;
    }>>(`/admin/orders/${orderId}/tracking`);
    return response.data;
  },

  /**
   * Ajoute une note interne à la commande
   */
  async addNote(orderId: string, note: string): Promise<Order> {
    const response = await api.post<Order>(
      `/admin/orders/${orderId}/notes`,
      { note }
    );
    return response.data;
  },

  /**
   * Recherche de commandes (autocomplete)
   */
  async searchOrders(query: string, limit = 10): Promise<Order[]> {
    const response = await api.get<Order[]>('/admin/orders/search', {
      params: { q: query, limit },
    });
    return response.data;
  },

  /**
   * Récupère les commandes récentes
   */
  async getRecentOrders(limit = 10): Promise<Order[]> {
    const response = await api.get<Order[]>('/admin/orders/recent', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Calcule les tendances des commandes (analytics)
   */
  async getOrderTrends(period: 'day' | 'week' | 'month' | 'year'): Promise<Array<{
    date: string;
    orders: number;
    revenue: number;
  }>> {
    const response = await api.get<Array<{
      date: string;
      orders: number;
      revenue: number;
    }>>('/admin/orders/trends', {
      params: { period },
    });
    return response.data;
  },

  /**
   * Vérifie les commandes en retard
   */
  async getDelayedOrders(): Promise<Order[]> {
    const response = await api.get<Order[]>('/admin/orders/delayed');
    return response.data;
  },

  /**
   * Ré-essaye un paiement échoué
   */
  async retryPayment(orderId: string): Promise<Order> {
    const response = await api.post<Order>(
      `/admin/orders/${orderId}/retry-payment`,
      {}
    );
    return response.data;
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
    return order.paymentStatus === 'paid' && 
           ['processing', 'shipped', 'delivered'].includes(order.status);
  },
};

export default ordersService;
