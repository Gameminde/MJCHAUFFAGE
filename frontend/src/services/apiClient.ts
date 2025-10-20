import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

/**
 * Create axios instance with auth interceptor
 */
function createApiClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor: Add auth token
  client.interceptors.request.use(
    (config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor: Handle auth errors
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken')
          // Redirect to login based on current location
          const isAdmin = window.location.pathname.startsWith('/admin')
          window.location.href = isAdmin ? '/admin/login' : '/fr/auth/login'
        }
      }
      return Promise.reject(error)
    }
  )

  return client
}

/**
 * API Client Structure
 * Using API v1 endpoints for all new requests
 */
export const apiClient = {
  // Main API client (general purpose) - API v1
  main: createApiClient(`${API_BASE_URL}/api/v1`),

  // Public endpoints (no auth required) - API v1
  public: {
    products: createApiClient(`${API_BASE_URL}/api/v1/products`),
    categories: createApiClient(`${API_BASE_URL}/api/v1/categories`),
  },

  // Admin endpoints (auth required) - API v1
  admin: {
    dashboard: createApiClient(`${API_BASE_URL}/api/v1/admin/dashboard`),
    products: createApiClient(`${API_BASE_URL}/api/v1/admin/products`),
    orders: createApiClient(`${API_BASE_URL}/api/v1/admin/orders`),
    customers: createApiClient(`${API_BASE_URL}/api/v1/admin/customers`),
    analytics: createApiClient(`${API_BASE_URL}/api/v1/admin/analytics`),
  },
}

// Export default for backward compatibility
export default apiClient.main
