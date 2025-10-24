import apiClient from '@/services/apiClient'

/**
 * Unified Authentication Service
 * Handles both customer and admin authentication
 */

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  name?: string
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN'
  phone?: string
}

export interface LoginResponse {
  success: boolean
  data?: {
    user: User
    token: string
  }
  message?: string
}

export class AuthService {
  /**
   * Customer Authentication - For public site
   */
  async loginCustomer(email: string, password: string): Promise<User | null> {
    try {
      const response = await apiClient.post<any>('/auth/login', { 
        email, 
        password 
      })
      
      if (response.data.success && response.data.data?.user) {
        const user = response.data.data.user
        const token = response.data.data.token
        
        // Store token for customer
        if (token) {
          localStorage.setItem('authToken', token)
        }
        
        return {
          ...user,
          name: `${user.firstName} ${user.lastName}`
        }
      }
      return null
    } catch (error: any) {
      console.error('Customer login error:', error.response?.data || error.message)
      return null
    }
  }

  /**
   * Admin Authentication - For admin panel
   * Uses same endpoint but validates admin role
   */
  async loginAdmin(email: string, password: string): Promise<User | null> {
    try {
      const response = await apiClient.post<any>('/auth/login', { 
        email, 
        password 
      })
      
      if (response.data.success && response.data.data?.user) {
        const user = response.data.data.user
        const token = response.data.data.token
        
        // Verify user has admin role
        if (!this.isAdmin(user)) {
          throw new Error('User does not have admin privileges')
        }
        
        // Store token for admin
        if (token) {
          localStorage.setItem('authToken', token)
        }
        
        return {
          ...user,
          name: `${user.firstName} ${user.lastName}`
        }
      }
      return null
    } catch (error: any) {
      console.error('Admin login error:', error.response?.data || error.message)
      return null
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<any>('/auth/profile')
      
      if (response.data.success && response.data.data?.user) {
        const user = response.data.data.user
        return {
          ...user,
          name: `${user.firstName} ${user.lastName}`
        }
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * Register new customer
   */
  async registerCustomer(data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone: string
  }): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/register', data)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      }
    }
  }

  /**
   * Logout (both customer and admin)
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      // Silent fail for logout
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken')
    }
  }

  /**
   * Check if user has admin privileges
   */
  isAdmin(user: User): boolean {
    return user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken')
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem('authToken')
  }
}

// Export singleton instance
export const authService = new AuthService()
export default authService
