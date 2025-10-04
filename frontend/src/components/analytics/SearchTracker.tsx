'use client';

import { useEffect } from 'react';
import { useAnalyticsContext } from './AnalyticsProvider';

interface SearchTrackerProps {
  searchTerm: string;
  resultsCount?: number;
}

export function SearchTracker({ searchTerm, resultsCount }: SearchTrackerProps) {
  const { trackSearch } = useAnalyticsContext();

  useEffect(() => {
    // Only track if search term is not empty
    if (searchTerm.trim()) {
      trackSearch(searchTerm, resultsCount);
      
      // Optional: Log for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('Search tracked:', { searchTerm, resultsCount });
      }
    }
  }, [searchTerm, resultsCount, trackSearch]);

  // This component doesn't render anything
  return null;
}