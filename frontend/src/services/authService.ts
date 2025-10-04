import apiClient from './apiClient';

// ... (interfaces RegisterData, User, AuthResponse restent les mêmes)
interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string; // Computed field
  role: string;
}

interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
  };
  message?: string;
}

class AuthService {
  async login(email: string, password: string): Promise<User | null> {
    try {
      const response = await apiClient.post<any>('/auth/login', { email, password });
      if (response.data.success && response.data.data?.user) {
        const user = response.data.data.user;
        // Store token if provided
        if (response.data.data.token) {
          localStorage.setItem('authToken', response.data.data.token);
        }
        // Add computed name field
        return {
          ...user,
          name: `${user.firstName} ${user.lastName}`
        };
      }
      return null;
    } catch (error: any) {
      console.error("Login error in authService:", error.response?.data || error.message);
      return null;
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, message: 'Network error occurred' };
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Silent fail for logout
    }
  }

  async getProfile(): Promise<User | null> {
    try {
      const response = await apiClient.get<any>('/auth/profile');
      if (response.data.success && response.data.data?.user) {
        const user = response.data.data.user;
        return {
          ...user,
          name: `${user.firstName} ${user.lastName}`
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;