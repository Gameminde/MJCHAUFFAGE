// frontend/src/contexts/AdminAuthContext.tsx
// Dedicated authentication context for admin panel
// Uses localStorage for token persistence across refreshes

import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import { config } from '@/lib/config';
import { createClient } from '@/lib/supabase/client';

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
  const supabase = createClient();

  // Fetch current admin user using Supabase session
  const fetchAdminUser = useCallback(async () => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('🔍 AdminAuth: Fetching admin user...');
    }

    try {
      setLoading(true);
      setError(null);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session?.user) {
        if (process.env.NODE_ENV === 'development') {
          console.debug('❌ AdminAuth: No active session found');
        }
        setUser(null);
        setLoading(false);
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        console.debug('✅ AdminAuth: Session found, fetching profile');
      }

      // Fetch user profile from public.users to check role
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('❌ AdminAuth: Profile fetch error:', profileError);
        // Fallback to metadata if profile fetch fails but session exists? 
        // Better to enforce profile existence for admins.
        throw profileError;
      }

      const adminUser: AdminUser = {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
        avatar: profile.avatar
      };

      if (adminUser && ['ADMIN', 'SUPER_ADMIN'].includes(adminUser.role)) {
        setUser(adminUser);
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.debug('❌ AdminAuth: User is not admin', adminUser);
        }
        await supabase.auth.signOut();
        setUser(null);
        setError('Unauthorized: Admin access required');
      }
    } catch (err) {
      console.error('❌ AdminAuth: Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Admin login
  const login = async (email: string, password: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('🔐 AdminAuth: Logging in...');
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (process.env.NODE_ENV === 'development') {
        console.debug('✅ AdminAuth: Login successful', data);
      }

      // Fetch profile to verify role immediately
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError || !['ADMIN', 'SUPER_ADMIN'].includes(profile?.role)) {
          await supabase.auth.signOut();
          throw new Error('Unauthorized: Admin access required');
        }

        const adminUser: AdminUser = {
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
          role: profile.role,
          avatar: profile.avatar
        };
        setUser(adminUser);
      }

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
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('AdminAuth: Logout error:', err);
    } finally {
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
