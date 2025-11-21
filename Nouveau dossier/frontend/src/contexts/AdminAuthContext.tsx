// frontend/src/contexts/AdminAuthContext.tsx
// Dedicated authentication context for admin panel
// Uses localStorage for token persistence across refreshes

import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import { config } from '@/lib/config';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  avatar?: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current admin user using token from localStorage
  const fetchAdminUser = useCallback(async () => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('🔍 AdminAuth: Fetching admin user...');
    }
    
    try {
      setLoading(true);
      setError(null);

      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        if (process.env.NODE_ENV === 'development') {
          console.debug('❌ AdminAuth: No token found in localStorage');
        }
        setUser(null);
        setLoading(false);
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        console.debug('✅ AdminAuth: Token found, calling /admin/me');
      }
      
      // Call backend /admin/me endpoint
      const response = await fetch(`${config.api.baseURL}/admin/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.debug('❌ AdminAuth: /admin/me returned', response.status);
        }
        // Token invalid or expired
        localStorage.removeItem('authToken');
        setUser(null);
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.debug('✅ AdminAuth: User fetched successfully', data);
      }
      
      // Backend returns { success: true, data: { user: {...} } }
      const adminUser = data.data?.user || data.user;
      
      if (adminUser && ['ADMIN', 'SUPER_ADMIN'].includes(adminUser.role)) {
        setUser(adminUser);
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.debug('❌ AdminAuth: User is not admin', adminUser);
        }
        localStorage.removeItem('authToken');
        setUser(null);
      }
    } catch (err) {
      console.error('❌ AdminAuth: Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
      localStorage.removeItem('authToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin login
  const login = async (email: string, password: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('🔐 AdminAuth: Logging in...');
    }
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${config.api.baseURL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.debug('✅ AdminAuth: Login successful', data);
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      // Set user from response
      const adminUser = data.user || data.data?.user;
      setUser(adminUser);
    } catch (err) {
      console.error('❌ AdminAuth: Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Admin logout
  const logout = async () => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('🚪 AdminAuth: Logging out...');
    }
    
    try {
      setLoading(true);
      
      const token = localStorage.getItem('authToken');
      
      // Call backend logout endpoint
      if (token) {
        await fetch(`${config.api.baseURL}/admin/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });
      }
    } catch (err) {
      console.error('AdminAuth: Logout error:', err);
    } finally {
      // Always clear local state
      localStorage.removeItem('authToken');
      setUser(null);
      setLoading(false);
    }
  };

  // Fetch user on mount
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('🚀 AdminAuth: Provider mounted, fetching user...');
    }
    // Run once on mount
    fetchAdminUser();
  }, [fetchAdminUser]);

  return (
    <AdminAuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// Custom hook to use admin auth context
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export default AdminAuthContext;
