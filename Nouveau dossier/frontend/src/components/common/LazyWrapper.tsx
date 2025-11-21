'use client';

import { Suspense, lazy, ComponentType } from 'react';
import { Skeleton } from './Skeleton';

interface LazyWrapperProps {
  fallback?: React.ReactNode;
  className?: string;
}

export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);
  
  return function WrappedLazyComponent(props: React.ComponentProps<T> & LazyWrapperProps) {
    const { fallback: customFallback, className, ...componentProps } = props;
    
    return (
      <Suspense fallback={customFallback || fallback || <Skeleton className={className} />}>
        <LazyComponent {...(componentProps as any)} />
      </Suspense>
    );
  };
}

// Pre-configured lazy components for common use cases
export const LazyAnalyticsDashboard = createLazyComponent(
  () => import('../analytics/AnalyticsDashboard').then(mod => ({ default: mod.AnalyticsDashboard })),
  <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />
);

export const LazyCheckout = createLazyComponent(
  () => import('../checkout/Checkout').then(mod => ({ default: mod.Checkout })),
  <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />
);