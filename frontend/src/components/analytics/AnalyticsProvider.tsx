'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { useAnalytics } from '../../hooks/useAnalytics';

interface AnalyticsContextType {
  trackProductView: (productId: string, categoryId?: string, value?: number) => void;
  trackAddToCart: (productId: string, quantity: number, value: number, categoryId?: string) => void;
  trackRemoveFromCart: (productId: string, quantity: number, value: number) => void;
  trackBeginCheckout: (value: number, items: Array<{ productId: string, quantity: number, value: number }>) => void;
  trackPurchase: (orderId: string, value: number, items: Array<{ productId: string, quantity: number, value: number }>) => void;
  trackCategoryView: (categoryId: string, categoryName?: string) => void;
  trackSearch: (searchTerm: string, resultsCount?: number) => void;
  setUserId: (userId: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
  userId?: string;
}

export function AnalyticsProvider({ children, userId }: AnalyticsProviderProps) {
  const analytics = useAnalytics();

  useEffect(() => {
    // Set user ID if provided
    if (userId) {
      analytics.setUserId(userId);
    }

    // Initialize analytics service (non-blocking)
    // Avoid noisy logs in production; keep debug info only in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      console.debug('Analytics provider initialized');
      // Don't initialize analytics service immediately to avoid blocking auth
    }

    // Cleanup on unmount
    return () => {
      if (typeof window !== 'undefined' && analyticsService) {
        try {
          analyticsService.destroy();
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          console.debug('Analytics cleanup failed:', msg);
        }
      }
    };
  }, [userId, analytics]);

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
}