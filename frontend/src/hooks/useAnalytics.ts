import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import analyticsService from '../services/analyticsService';

// Hook for page view tracking
export function usePageTracking() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view when pathname changes (handle null safely)
    if (analyticsService) {
      analyticsService.trackPageView(pathname ?? undefined);
    }
  }, [pathname]);
}

// Hook for ecommerce tracking
export function useEcommerceTracking() {
  const trackProductView = useCallback((productId: string, categoryId?: string, value?: number) => {
    if (analyticsService) {
      analyticsService.trackProductView(productId, categoryId, value);
    }
  }, []);

  const trackAddToCart = useCallback((productId: string, quantity: number, value: number, categoryId?: string) => {
    if (analyticsService) {
      analyticsService.trackAddToCart(productId, quantity, value, categoryId);
    }
  }, []);

  const trackRemoveFromCart = useCallback((productId: string, quantity: number, value: number) => {
    if (analyticsService) {
      analyticsService.trackRemoveFromCart(productId, quantity, value);
    }
  }, []);

  const trackBeginCheckout = useCallback((value: number, items: Array<{productId: string, quantity: number, value: number}>) => {
    if (analyticsService) {
      analyticsService.trackBeginCheckout(value, items);
    }
  }, []);

  const trackPurchase = useCallback((orderId: string, value: number, items: Array<{productId: string, quantity: number, value: number}>) => {
    if (analyticsService) {
      analyticsService.trackPurchase(orderId, value, items);
    }
  }, []);

  const trackCategoryView = useCallback((categoryId: string, categoryName?: string) => {
    if (analyticsService) {
      analyticsService.trackCategoryView(categoryId, categoryName);
    }
  }, []);

  const trackSearch = useCallback((searchTerm: string, resultsCount?: number) => {
    if (analyticsService) {
      analyticsService.trackSearch(searchTerm, resultsCount);
    }
  }, []);

  return {
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackBeginCheckout,
    trackPurchase,
    trackCategoryView,
    trackSearch
  };
}

// Hook for user identification
export function useUserTracking() {
  const setUserId = useCallback((userId: string) => {
    if (analyticsService) {
      analyticsService.setUserId(userId);
    }
  }, []);

  return { setUserId };
}

// Hook for performance tracking
export function usePerformanceTracking() {
  useEffect(() => {
    // Track Core Web Vitals
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Track page load time
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.fetchStart;
          
          // Send performance data to analytics (using custom event type)
          if (analyticsService) {
            analyticsService.trackEcommerceEvent({
              eventType: 'view_item', // Use existing event type for now
              metadata: {
                type: 'performance_metric',
                loadTime,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
                firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
                firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
              }
            });
          }
        }
      });

      // Track Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            if (analyticsService) {
              analyticsService.trackEcommerceEvent({
                eventType: 'view_item', // Use existing event type for now
                value: lastEntry.startTime,
                metadata: {
                  type: 'lcp_metric',
                  element: (lastEntry as any).element?.tagName || 'unknown'
                }
              });
            }
          });
          
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (error) {
          console.warn('LCP tracking not supported:', error);
        }
      }
    }
  }, []);
}

// Combined analytics hook
export function useAnalytics() {
  usePageTracking();
  usePerformanceTracking();
  
  const ecommerce = useEcommerceTracking();
  const user = useUserTracking();

  return {
    ...ecommerce,
    ...user
  };
}