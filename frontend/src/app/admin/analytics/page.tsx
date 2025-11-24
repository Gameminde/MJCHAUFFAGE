import { Suspense } from 'react';
import { analyticsDashboardService } from '@/services/analyticsDashboardService';
import { AnalyticsCards } from '@/components/admin/analytics/AnalyticsCards';
import { RevenueTrendChart, ConversionFunnelChart, DeviceBreakdownChart } from '@/components/admin/analytics/AnalyticsCharts';
import { DateRangeFilter } from '@/components/admin/analytics/DateRangeFilter';
import { LowStockList } from '@/components/admin/analytics/LowStockList';
import { ExportButton } from '@/components/admin/analytics/ExportButton';
import { TopProductsList } from '@/components/admin/analytics/TopProductsList';
import { extendedAnalyticsService } from '@/services/extendedAnalyticsService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: {
    range?: string;
    from?: string;
    to?: string;
  };
}

function getDateRange(range: string = '7d') {
  const endDate = new Date();
  const startDate = new Date();

  switch (range) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(endDate.getDate() - 7);
  }

  return { startDate, endDate };
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const range = searchParams.range || '7d';
  const dateRange = getDateRange(range);

  // Fetch all data in parallel
  const [metrics, funnel, revenueTrend, deviceBreakdown, lowStockProducts, topProducts] = await Promise.all([
    analyticsDashboardService.getDashboardMetrics(dateRange),
    analyticsDashboardService.getConversionFunnel(dateRange),
    analyticsDashboardService.getRevenueTrend(dateRange),
    analyticsDashboardService.getDeviceBreakdown(dateRange),
    analyticsDashboardService.getLowStockProducts(),
    extendedAnalyticsService.getTopProducts(dateRange, 5)
  ]);

  const exportData = {
    metrics,
    funnel,
    revenueTrend,
    deviceBreakdown,
    lowStockProducts
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your store's performance and visitor behavior.</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangeFilter />
          <ExportButton data={exportData} />
        </div>
      </div>

      {/* KPI Cards */}
      <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse rounded-xl" />}>
        <AnalyticsCards metrics={metrics} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Revenue Trend */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trend</h3>
            <RevenueTrendChart data={revenueTrend} />
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
            <ConversionFunnelChart data={funnel} />
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Top Products */}
          <TopProductsList products={topProducts} />

          {/* Low Stock Alert */}
          <LowStockList products={lowStockProducts} />

          {/* Device Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Device Breakdown</h3>
            </div>
            <div className="h-[300px] flex items-center justify-center">
              <DeviceBreakdownChart data={deviceBreakdown} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
