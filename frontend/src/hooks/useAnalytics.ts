import { useCallback } from 'react';
import { analyticsService, AnalyticsEvent } from '@/services/analyticsService';

export const useAnalytics = () => {

  const trackEvent = useCallback(async (
    eventType: string,
    data?: {
      productId?: string;
      categoryId?: string;
      [key: string]: any
    }
  ) => {
    try {
      const { productId, categoryId, ...eventData } = data || {};

      await analyticsService.logEvent({
        eventType,
        productId,
        categoryId,
        eventData: Object.keys(eventData).length > 0 ? eventData : undefined
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, []);

  const trackPageView = useCallback(async (path: string) => {
    await analyticsService.logEvent({
      eventType: 'page_view',
      pagePath: path
    });
  }, []);

  return {
    trackEvent,
    trackPageView
  };
};