'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from './Skeleton';
import { Loading } from './Loading';

// Create a simple loading component
const AnalyticsLoading = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
    <Skeleton className="h-96" />
  </div>
);

const CheckoutLoading = () => (
  <div className="max-w-4xl mx-auto space-y-8">
    <Skeleton className="h-8 w-48" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
      <Skeleton className="h-80" />
    </div>
  </div>
);

// Simplified dynamic imports with proper named export handling
export const DynamicAnalyticsDashboard = dynamic(
  () => import('../analytics/AnalyticsDashboard').then(mod => ({ default: mod.AnalyticsDashboard })),
  {
    loading: AnalyticsLoading,
    ssr: false,
  }
);

export const DynamicTrafficSourceChart = dynamic(
  () => import('../analytics/TrafficSourceChart').then(mod => ({ default: mod.TrafficSourceChart })),
  {
    loading: () => <Skeleton className="h-80" />,
    ssr: false,
  }
);

export const DynamicConversionMetrics = dynamic(
  () => import('../analytics/ConversionMetrics').then(mod => ({ default: mod.ConversionMetrics })),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    ),
    ssr: false,
  }
);

export const DynamicCheckout = dynamic(
  () => import('../checkout/Checkout').then(mod => ({ default: mod.Checkout })),
  {
    loading: CheckoutLoading,
  }
);

// Simplified dynamic imports for existing components
export const DynamicCustomersManagement = dynamic(
  () => import('../admin/CustomersManagement').then(mod => ({ default: mod.CustomersManagement })),
  {
    loading: () => <Loading text="Loading customer management..." />,
    ssr: false,
  }
);

export const DynamicOrdersManagement = dynamic(
  () => import('../admin/OrdersManagement').then(mod => ({ default: mod.OrdersManagement })),
  {
    loading: () => <Loading text="Loading order management..." />,
    ssr: false,
  }
);

// Export all dynamic components for easy importing
export const DynamicComponents = {
  AnalyticsDashboard: DynamicAnalyticsDashboard,
  TrafficSourceChart: DynamicTrafficSourceChart,
  ConversionMetrics: DynamicConversionMetrics,
  Checkout: DynamicCheckout,
  CustomersManagement: DynamicCustomersManagement,
  OrdersManagement: DynamicOrdersManagement,
};