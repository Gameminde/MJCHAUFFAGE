'use client';

import { ReactNode } from 'react';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { ComparisonProvider } from '@/contexts/ComparisonContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

interface ProvidersProps {
  children: ReactNode;
  locale?: string;
}

export function Providers({ children, locale }: ProvidersProps) {
  return (
    <AuthProvider>
      <WishlistProvider>
        <ComparisonProvider>
          {children}
          <Toaster position="bottom-right" />
        </ComparisonProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
