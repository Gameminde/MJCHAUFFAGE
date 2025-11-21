'use client';

import { SessionProvider } from 'next-auth/react';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { ComparisonProvider } from '@/contexts/ComparisonContext';
import { AuthProvider } from '@/contexts/AuthContext';

interface ProvidersProps {
  children: React.ReactNode;
  locale?: string;
}

export function Providers({ children, locale }: ProvidersProps) {
  return (
    <SessionProvider>
      <AuthProvider>
        <WishlistProvider>
          <ComparisonProvider>
            {children}
          </ComparisonProvider>
        </WishlistProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
