import axios, { AxiosError, AxiosResponse } from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

// Configuration du client API
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  (config) => {
    // Guard for browser-only cookie access
    const token = typeof document !== 'undefined' ? Cookies.get('accessToken') : undefined
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les réponses et erreurs
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide (client-side only)
      if (typeof document !== 'undefined') {
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
      }
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Types pour l'authentification
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    role: string
    firstName?: string
    lastName?: string
  }
}

// Services d'authentification
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', credentials)
    // Backend principal retourne { success, data: { accessToken, refreshToken, user } }
    const payload = response.data?.data ?? response.data
    return {
      accessToken: payload?.accessToken ?? payload?.tokens?.accessToken,
      refreshToken: payload?.refreshToken ?? payload?.tokens?.refreshToken,
      user: payload?.user ?? payload?.data?.user,
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout')
    } catch (e) {
      // ignore network/logout errors
      console.warn('Logout request failed, clearing local tokens anyway')
    }
    Cookies.remove('accessToken')
    Cookies.remove('refreshToken')
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me')
    // Backend principal retourne { success, data: { user } }
    const payload = response.data?.data ?? response.data
    return payload?.user ?? payload
  }
}

// Types pour les produits
export interface Product {
  id: string
  name: string
  description?: string
  price: number
  category: string
  stock: number
  images: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateProductRequest {
  name: string
  description?: string
  price: number
  category: string
  stock: number
  images?: string[]
  isActive?: boolean
}

// Services pour les produits
export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    try {
      const response = await apiClient.get('/products')
      const payload = response.data?.data ?? response.data
      // Support multiple shapes: { products: [...] }, { items: [...] }, or direct array
      let items: any = payload?.products ?? payload?.items ?? payload
      if (!Array.isArray(items)) {
        items = payload?.products ?? []
      }

      return items.map((p: any) => ({
        id: String(p.id ?? p._id ?? ''),
        name: String(p.name ?? p.title ?? ''),
        description: String(p.description ?? ''),
        price: Number(p.price ?? p.salePrice ?? p.costPrice ?? 0),
        category: String(p?.category?.name ?? p?.category ?? 'Général'),
        stock: Number(p.stockQuantity ?? p.stock ?? 0),
        images: Array.isArray(p.images)
          ? p.images.map((img: any) => (typeof img === 'string' ? img : (img?.url ?? ''))).filter(Boolean)
          : [],
        isActive: Boolean(p.isActive ?? true),
        createdAt: String(p.createdAt ?? new Date().toISOString()),
        updatedAt: String(p.updatedAt ?? p.createdAt ?? new Date().toISOString()),
      }))
    } catch (error) {
      console.warn('productsApi.getAll failed', error)
      return []
    }
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`)
    return response.data
  },

  create: async (product: CreateProductRequest): Promise<Product> => {
    const response = await apiClient.post('/products', product)
    const payload = (response as any)?.data?.data ?? (response as any)?.data
    const p = payload?.product ?? payload
    return {
      id: String(p?.id ?? p?._id ?? ''),
      name: String(p?.name ?? p?.title ?? product.name),
      description: String(p?.description ?? product.description ?? ''),
      price: Number(p?.price ?? p?.salePrice ?? product.price ?? 0),
      category: String(p?.category?.name ?? p?.category ?? product.category ?? 'Général'),
      stock: Number(p?.stockQuantity ?? p?.stock ?? product.stock ?? 0),
      images: Array.isArray(p?.images)
        ? p.images.map((img: any) => (typeof img === 'string' ? img : (img?.url ?? ''))).filter(Boolean)
        : (product.images ?? []),
      isActive: Boolean(p?.isActive ?? product.isActive ?? true),
      createdAt: String(p?.createdAt ?? new Date().toISOString()),
      updatedAt: String(p?.updatedAt ?? p?.createdAt ?? new Date().toISOString()),
    }
  },

  update: async (id: string, product: Partial<CreateProductRequest>): Promise<Product> => {
    const response = await apiClient.put(`/products/${id}`, product)
    const payload = (response as any)?.data?.data ?? (response as any)?.data
    const p = payload?.product ?? payload
    return {
      id: String(p?.id ?? id),
      name: String(p?.name ?? p?.title ?? ''),
      description: String(p?.description ?? ''),
      price: Number(p?.price ?? p?.salePrice ?? 0),
      category: String(p?.category?.name ?? p?.category ?? 'Général'),
      stock: Number(p?.stockQuantity ?? p?.stock ?? 0),
      images: Array.isArray(p?.images)
        ? p.images.map((img: any) => (typeof img === 'string' ? img : (img?.url ?? ''))).filter(Boolean)
        : [],
      isActive: Boolean(p?.isActive ?? true),
      createdAt: String(p?.createdAt ?? new Date().toISOString()),
      updatedAt: String(p?.updatedAt ?? p?.createdAt ?? new Date().toISOString()),
    }
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`)
  }
}

// Types pour les commandes
export interface Order {
  id: string
  orderNumber: string
  customerEmail: string
  customerName: string
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
  total: number
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
}

// Services pour les commandes
export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    try {
      // Admin endpoint peut retourner { data: { orders, pagination } } ou directement { orders }
      const response = await apiClient.get('/admin/orders')
      const payload = response.data?.data ?? response.data
      const orders = (payload?.orders ?? payload ?? []) as any[]
      return orders.map((o) => {
        const firstName = o?.customer?.user?.firstName ?? 'Guest'
        const lastName = o?.customer?.user?.lastName ?? 'Customer'
        const email = o?.customer?.user?.email ?? o?.customer?.email ?? ''
        return {
          id: o.id,
          orderNumber: o.orderNumber,
          customerEmail: email,
          customerName: `${firstName} ${lastName}`.trim(),
          status: o.status,
          total: Number(o.totalAmount ?? 0),
          items: (o.items || []).map((i: any) => ({
            id: i.id,
            productId: i.productId,
            productName: i.product?.name ?? 'Produit',
            quantity: i.quantity,
            price: Number((i.product?.price ?? i.unitPrice) ?? 0),
          })),
          createdAt: o.orderDate,
          updatedAt: o.updatedAt ?? o.orderDate,
        } as Order
      })
    } catch (error) {
      console.warn('ordersApi.getAll failed', error)
      return []
    }
  },

  getById: async (id: string): Promise<Order> => {
    // Fallback to public order route for details if needed
    const response = await apiClient.get(`/orders/${id}`)
    const o = response.data as any
    const firstName = o?.customer?.user?.firstName ?? 'Guest'
    const lastName = o?.customer?.user?.lastName ?? 'Customer'
    const email = o?.customer?.user?.email ?? o?.customer?.email ?? ''
    return {
      id: o.id,
      orderNumber: o.orderNumber,
      customerEmail: email,
      customerName: `${firstName} ${lastName}`.trim(),
      status: o.status,
      total: Number(o.totalAmount ?? 0),
      items: (o.items || []).map((i: any) => ({
        id: i.id,
        productId: i.productId,
        productName: i.product?.name ?? 'Produit',
        quantity: i.quantity,
        price: Number((i.product?.price ?? i.unitPrice) ?? 0),
      })),
      createdAt: o.orderDate,
      updatedAt: o.updatedAt ?? o.orderDate,
    }
  },

  updateStatus: async (
    id: string,
    status: Order['status'],
    options?: { trackingNumber?: string; notes?: string }
  ): Promise<Order> => {
    const response = await apiClient.put(`/admin/orders/${id}/status`, {
      status,
      ...(options?.trackingNumber ? { trackingNumber: options.trackingNumber } : {}),
      ...(options?.notes ? { notes: options.notes } : {}),
    })
    const payload = response.data?.data ?? response.data
    const o = (payload?.order ?? payload) as any
    const firstName = o?.customer?.user?.firstName ?? 'Guest'
    const lastName = o?.customer?.user?.lastName ?? 'Customer'
    const email = o?.customer?.user?.email ?? o?.customer?.email ?? ''
    return {
      id: o.id,
      orderNumber: o.orderNumber,
      customerEmail: email,
      customerName: `${firstName} ${lastName}`.trim(),
      status: o.status,
      total: Number(o.totalAmount ?? 0),
      items: (o.items || []).map((i: any) => ({
        id: i.id,
        productId: i.productId,
        productName: i.product?.name ?? 'Produit',
        quantity: i.quantity,
        price: Number((i.product?.price ?? i.unitPrice) ?? 0),
      })),
      createdAt: o.orderDate,
      updatedAt: o.updatedAt ?? o.orderDate,
    }
  }
}

// Service pour les uploads (images)
export const uploadsApi = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const payload = response.data?.data ?? response.data;
    const url: string = payload?.url ?? '';
    if (!url) {
      throw new Error('Upload failed: no URL returned');
    }
    return url;
  },
};