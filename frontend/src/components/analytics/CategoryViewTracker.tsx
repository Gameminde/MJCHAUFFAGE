'use client';

import { useEffect } from 'react';
import { useAnalyticsContext } from './AnalyticsProvider';

interface CategoryViewTrackerProps {
  categoryId: string;
  categoryName?: string;
}

export function CategoryViewTracker({ categoryId, categoryName }: CategoryViewTrackerProps) {
  const { trackCategoryView } = useAnalyticsContext();

  useEffect(() => {
    // Track category view when component mounts
    trackCategoryView(categoryId, categoryName);
    
    // Optional: Log for debugging
    if (process.env.NODE_ENV === 'development') {
      if (process.env.NODE_ENV === 'development') {
          console.debug('Category view tracked:', { categoryId, categoryName });
        }
    }
  }, [categoryId, categoryName, trackCategoryView]);

  // This component doesn't render anything
  return null;
}