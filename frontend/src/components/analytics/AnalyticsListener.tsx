'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAnalytics } from '@/hooks/useAnalytics';
import { analyticsService } from '@/services/analyticsService';

export function AnalyticsListener() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { trackPageView } = useAnalytics();
    const initialized = useRef(false);

    // Initialize session on mount
    useEffect(() => {
        if (!initialized.current) {
            analyticsService.startSession();
            initialized.current = true;
        }
    }, []);

    // Track page views on route change
    useEffect(() => {
        const url = `${pathname}${searchParams ? `?${searchParams.toString()}` : ''}`;
        trackPageView(url);
    }, [pathname, searchParams, trackPageView]);

    return null; // This component renders nothing
}
