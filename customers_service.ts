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
  notes?: string;
}

export interface CustomerFilters {
  search?: string;
  status?: Customer['status'];
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

export interface UpdateCustomerRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: Customer['address'];
  status?: Customer['status'];
  notes?: string;
}

/**
 * Service de gestion des clients
 */
export const customersService = {
  /**
   * Liste tous les clients avec filtres et pagination
   */
  async getCustomers(filters?: CustomerFilters): Promise<PaginatedCustomers> {
    const response = await api.get<PaginatedCustomers>('/admin/customers', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Récupère un client par ID
   */
  async getCustomerById(customerId: string): Promise<Customer> {
    const response = await api.get<Customer>(`/admin/customers/${customerId}`);
    return response.data;
  },

  /**
   * Crée un nouveau client (admin only)
   */
  async createCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent'>): Promise<Customer> {
    const response = await api.post<Customer>('/admin/customers', data);
    return response.data;
  },

  /**
   * Met à jour un client
   */
  async updateCustomer(
    customerId: string,
    data: UpdateCustomerRequest
  ): Promise<Customer> {
    const response = await api.patch<Customer>(
      `/admin/customers/${customerId}`,
      data
    );
    return response.data;
  },

  /**
   * Supprime un client (soft delete)
   */
  async deleteCustomer(customerId: string): Promise<void> {
    await api.delete(`/admin/customers/${customerId}`);
  },

  /**
   * Bloque/Débloque un client
   */
  async toggleCustomerStatus(
    customerId: string,
    status: 'active' | 'blocked'
  ): Promise<Customer> {
    const response = await api.patch<Customer>(
      `/admin/customers/${customerId}/status`,
      { status }
    );
    return response.data;
  },

  /**
   * Récupère les statistiques globales
   */
  async getCustomerStats(): Promise<CustomerStats> {
    const response = await api.get<CustomerStats>('/admin/customers/stats');
    return response.data;
  },

  /**
   * Récupère l'historique des commandes d'un client
   */
  async getCustomerOrders(customerId: string, limit = 10): Promise<any[]> {
    const response = await api.get<any[]>(
      `/admin/customers/${customerId}/orders`,
      { params: { limit } }
    );
    return response.data;
  },

  /**
   * Recherche de clients (autocomplete)
   */
  async searchCustomers(query: string, limit = 10): Promise<Customer[]> {
    const response = await api.get<Customer[]>('/admin/customers/search', {
      params: { q: query, limit },
    });
    return response.data;
  },

  /**
   * Exporte les clients (CSV)
   */
  async exportCustomers(filters?: CustomerFilters): Promise<Blob> {
    const response = await api.get('/admin/customers/export', {
      params: { ...filters, format: 'csv' },
      headers: {
        Accept: 'text/csv',
      },
    });
    
    // Le client API retourne déjà du JSON, on doit gérer le CSV manuellement
    // Alternative : utiliser fetch() direct pour les téléchargements
    return new Blob([JSON.stringify(response.data)], { type: 'text/csv' });
  },

  /**
   * Envoie un email à un client
   */
  async sendEmail(customerId: string, data: {
    subject: string;
    body: string;
    template?: string;
  }): Promise<{ sent: boolean }> {
    const response = await api.post<{ sent: boolean }>(
      `/admin/customers/${customerId}/email`,
      data
    );
    return response.data;
  },

  /**
   * Ajoute une note à un client
   */
  async addNote(customerId: string, note: string): Promise<Customer> {
    const response = await api.post<Customer>(
      `/admin/customers/${customerId}/notes`,
      { note }
    );
    return response.data;
  },

  /**
   * Récupère les segments de clients (pour le marketing)
   */
  async getCustomerSegments(): Promise<Array<{
    id: string;
    name: string;
    count: number;
    criteria: any;
  }>> {
    const response = await api.get<Array<{
      id: string;
      name: string;
      count: number;
      criteria: any;
    }>>('/admin/customers/segments');
    return response.data;
  },

  /**
   * Calcule la Customer Lifetime Value (CLV)
   */
  async calculateCLV(customerId: string): Promise<{
    clv: number;
    averageOrderValue: number;
    purchaseFrequency: number;
    customerLifespan: number;
  }> {
    const response = await api.get<{
      clv: number;
      averageOrderValue: number;
      purchaseFrequency: number;
      customerLifespan: number;
    }>(`/admin/customers/${customerId}/clv`);
    return response.data;
  },
};

/**
 * Hook React pour gérer les clients (optionnel)
 */
export function useCustomers(filters?: CustomerFilters) {
  // Exemple avec React Query (à adapter selon votre state management)
  /*
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['customers', filters],
    queryFn: () => customersService.getCustomers(filters),
  });

  return { 
    customers: data?.customers, 
    total: data?.total,
    isLoading, 
    error, 
    refetch 
  };
  */
}

export default customersService;
