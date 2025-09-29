interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
}

interface AuthResponse {
  success: boolean
  data?: {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      role: string
    }
    token: string
    refreshToken: string
  }
  message?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class AuthService {
  private token: string | null = null
  private refreshToken: string | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken')
      this.refreshToken = localStorage.getItem('refreshToken')
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success && result.data) {
        this.token = result.data.token
        this.refreshToken = result.data.refreshToken
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', result.data.token)
          localStorage.setItem('refreshToken', result.data.refreshToken)
          localStorage.setItem('user', JSON.stringify(result.data.user))
        }
      }

      return result
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      return result
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        })
      }
    } catch (error) {
      // Silent fail for logout
    } finally {
      this.token = null
      this.refreshToken = null
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      })

      const result = await response.json()

      if (result.success && result.data?.token) {
        this.token = result.data.token
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', result.data.token)
        }
        
        return true
      }

      return false
    } catch (error) {
      return false
    }
  }

  getToken(): string | null {
    return this.token
  }

  getUser(): any {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    }
    return null
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    let response = await fetch(url, {
      ...options,
      headers,
    })

    // If unauthorized, try to refresh token
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshAccessToken()
      
      if (refreshed && this.token) {
        headers['Authorization'] = `Bearer ${this.token}`
        response = await fetch(url, {
          ...options,
          headers,
        })
      }
    }

    return response
  }
}

export const authService = new AuthService()
export default authService