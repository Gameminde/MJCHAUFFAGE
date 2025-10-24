// frontend/src/services/customersService.ts
// 👥 Service de gestion des clients (Admin)

import { api } from '@/lib/api';

/**
 * Types pour la gestion des clients
 */
export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  lastOrderAt?: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive' | 'blocked';
  customerType?: 'B2B' | 'B2C';
  notes?: string;
}

export interface CustomerFilters {
  search?: string;
  status?: Customer['status'];
  customerType?: 'B2B' | 'B2C';
  minSpent?: number;
  maxSpent?: number;
  hasOrders?: boolean;
  createdAfter?: string;
  createdBefore?: string;
  sortBy?: 'createdAt' | 'lastName' | 'totalSpent' | 'lastOrderAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
  newThisMonth: number;
  averageOrderValue: number;
  lifetimeValue: number;
}

export interface PaginatedCustomers {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
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
 * Service de gestion des clients
 */
export const customersService = {
  /**
   * Liste tous les clients avec filtres et pagination
   */
  async getCustomers(filters?: CustomerFilters): Promise<PaginatedCustomers> {
    const qs = toQuery(filters);
    const result = await api.get<{ success: boolean; data: PaginatedCustomers }>(
      `/admin/customers${qs}`
    );
    return result.data as PaginatedCustomers;
  },

  /**
   * Récupère un client par ID
   */
  async getCustomerById(customerId: string): Promise<Customer> {
    const result = await api.get<{ success: boolean; data: Customer }>(
      `/admin/customers/${customerId}`
    );
    return result.data as Customer;
  },

  /**
   * Crée un nouveau client (admin only)
   */
  async createCustomer(
    data: Omit<Customer, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent'>
  ): Promise<Customer> {
    const result = await api.post<{ success: boolean; data: Customer }>(
      '/admin/customers',
      data
    );
    return result.data as Customer;
  },
  /**
   * Met à jour un client existant
   */
  async updateCustomer(customerId: string, data: Partial<Customer>): Promise<Customer> {
    const result = await api.patch<{ success: boolean; data: Customer }>(
      `/admin/customers/${customerId}`,
      data
    );
    return result.data as Customer;
  },

  /**
   * Supprime un client
   */
  async deleteCustomer(customerId: string): Promise<{ deleted: boolean }> {
    const result = await api.delete<{ success: boolean; data: { deleted: boolean } }>(
      `/admin/customers/${customerId}`
    );
    return result.data as { deleted: boolean };
  },

  /**
   * Active/Désactive un client
   */
  async toggleCustomerStatus(
    customerId: string,
    status: Customer['status']
  ): Promise<Customer> {
    const result = await api.patch<{ success: boolean; data: Customer }>(
      `/admin/customers/${customerId}/status`,
      { status }
    );
    return result.data as Customer;
  },

  /**
   * Statistiques globales des clients
   */
  async getCustomerStats(): Promise<CustomerStats> {
    const result = await api.get<{ success: boolean; data: CustomerStats }>(
      '/admin/customers/stats'
    );
    return result.data as CustomerStats;
  },
  /**
   * Commandes du client
   */
  async getCustomerOrders(customerId: string, limit?: number): Promise<any[]> {
    const qs = toQuery(limit ? { limit } : undefined);
    const result = await api.get<{ success: boolean; data: any[] }>(
      `/admin/customers/${customerId}/orders${qs}`
    );
    return (result.data || []) as any[];
  },

  /**
   * Recherche clients
   */
  async searchCustomers(query: string, limit = 10): Promise<Customer[]> {
    const qs = toQuery({ q: query, limit });
    const result = await api.get<{ success: boolean; data: Customer[] }>(
      `/admin/customers/search${qs}`
    );
    return (result.data || []) as Customer[];
  },

  /**
   * Export des clients (CSV)
   */
  async exportCustomers(filters?: CustomerFilters): Promise<Blob> {
    const qs = toQuery({ ...(filters || {}), format: 'csv' });
    const result = await api.get<{ success: boolean; data: any }>(
      `/admin/customers/export${qs}`,
      {
        headers: { Accept: 'text/csv' },
      }
    );
    const csvText = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
    return new Blob([csvText], { type: 'text/csv' });
  },

  /**
   * Envoi d'email à un client
   */
  async sendEmail(
    customerId: string,
    payload: { subject: string; html?: string; text?: string }
  ): Promise<{ sent: boolean }> {
    const result = await api.post<{ success: boolean; data: { sent: boolean } }>(
      `/admin/customers/${customerId}/email`,
      payload
    );
    return result.data as { sent: boolean };
  },
  /**
   * Ajoute une note au client
   */
  async addNote(customerId: string, note: string): Promise<Customer> {
    const result = await api.post<{ success: boolean; data: Customer }>(
      `/admin/customers/${customerId}/notes`,
      { note }
    );
    return result.data as Customer;
  },

  /**
   * Segments clients (RFM, fidélité etc.)
   */
  async getCustomerSegments(): Promise<string[]> {
    const result = await api.get<{ success: boolean; data: string[] }>(
      '/admin/customers/segments'
    );
    return (result.data || []) as string[];
  },

  /**
   * Calcul du LTV (LifeTime Value)
   */
  async calculateCLV(customerId: string): Promise<{
    clv: number;
    averageOrderValue: number;
    averageOrderFrequency: number;
    lastOrderAt?: string;
  }> {
    const result = await api.get<{
      success: boolean;
      data: {
        clv: number;
        averageOrderValue: number;
        averageOrderFrequency: number;
        lastOrderAt?: string;
      };
    }>(`/admin/customers/${customerId}/clv`);
    return result.data;
  },
};
