// src/contexts/AuthContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react';


// Define types for user and context - matching backend roles
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'CUSTOMER' | 'TECHNICIAN' | 'SUPER_ADMIN' | null; // Backend role values
  // Add other fields as needed (e.g., name, preferences)
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const defaultContext: AuthContextType = {
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => ({ success: false }),
  logout: async () => {},
};

// Create context
export const AuthContext = createContext<AuthContextType>(defaultContext);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch current user (calls backend API that checks HTTP-only cookie)
  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we're in admin context (window.location.pathname starts with /admin)
      const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
      
      // For admin, check authToken from localStorage or try admin endpoint
      if (isAdminRoute) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        
        if (!token) {
          // No token, not authenticated
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Try to fetch admin user with token
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/admin/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          // Token invalid, clear it
          if (typeof window !== 'undefined') localStorage.removeItem('authToken');
          setUser(null);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        setUser(data.data?.user || data.user || null);
      } else {
        // Regular user authentication - call Next.js API route to avoid cross-origin noise
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });
        
        if (!response.ok) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        setUser(data.data?.user || data.user || null);
      }
    } catch (err) {
      console.error('Auth fetch error:', err);
      setError((err as Error).message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login: Send credentials to backend, which sets HTTP-only cookie and returns user
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Check if we're on admin route
      const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

      let userData = null;

      if (isAdminRoute) {
        // Admin login
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/admin/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();

        // Store token in localStorage for admin
        if (data.token && typeof window !== 'undefined') {
          localStorage.setItem('authToken', data.token);
        }

        userData = data.user || data.data?.user || null;
        setUser(userData);
      } else {
        // Regular user login - call backend API directly
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        userData = data.data?.user || data.user || null;
        setUser(userData);
      }

      return userData; // Return user data for redirection logic
    } catch (err) {
      setError((err as Error).message);
      throw err; // Re-throw so login page can handle it
    } finally {
      setLoading(false);
    }
  };

  // Register: Send registration data to backend
  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      // Call backend API directly
      console.log('Sending registration data:', data);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      return { success: true };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout: Call backend to invalidate session/cookie
  const logout = async () => {
    try {
      setLoading(true);
      
      // Check if we're on admin route
      const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
      
      if (isAdminRoute) {
        // Admin logout - clear localStorage token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
        }
        
        // Call backend to clear cookie
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/admin/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('authToken') || '' : ''}`,
          },
          credentials: 'include',
        });
        
        // Don't throw error if logout fails, just clear local state
      } else {
        // Regular user logout - call backend API directly
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        });
        
        // Don't throw error if logout fails, just clear local state
      }
      
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError((err as Error).message);
      // Always clear user on logout attempt
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for consumption
export const useAuth = () => React.useContext(AuthContext);
