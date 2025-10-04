'use client';

import { useEffect } from 'react';
import { useAnalyticsContext } from './AnalyticsProvider';

interface ProductViewTrackerProps {
  productId: string;
  categoryId?: string;
  value?: number;
  productName?: string;
}

export function ProductViewTracker({ 
  productId, 
  categoryId, 
  value, 
  productName 
}: ProductViewTrackerProps) {
  const { trackProductView } = useAnalyticsContext();

  useEffect(() => {
    // Track product view when component mounts
    trackProductView(productId, categoryId, value);
    
    // Optional: Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Product view tracked:', { productId, productName, categoryId, value });
    }
  }, [productId, categoryId, value, trackProductView, productName]);

  // This component doesn't render anything
  return null;
}