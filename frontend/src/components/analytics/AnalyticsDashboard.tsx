'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Eye, 
  ShoppingCart, 
  TrendingUp, 
  Clock,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';

interface RealTimeMetrics {
  activeSessions: number;
  pageViews: {
    lastHour: number;
    last24Hours: number;
  };
  recentEvents: Array<{
    id: string;
    eventType: string;
    createdAt: string;
    metadata?: any;
  }>;
  topPages: Array<{
    path: string;
    views: number;
  }>;
}

interface DashboardKPIs {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalServices: number;
    revenueGrowth: number;
    customerGrowth: number;
  };
  sales: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    revenueGrowth: number;
    orderGrowth: number;
  };
}

export function AnalyticsDashboard() {
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [dashboardKPIs, setDashboardKPIs] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => {
    fetchAnalyticsData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchRealTimeMetrics, 30000);
    
    return () => clearInterval(interval);
  }, [timeframe]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchRealTimeMetrics(),
        fetchDashboardKPIs()
      ]);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealTimeMetrics = async () => {
    try {
      const response = await fetch('/api/analytics/realtime');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRealTimeMetrics(data.data);
        }
      }
    } catch (err) {
      console.error('Real-time metrics fetch error:', err);
    }
  };

  const fetchDashboardKPIs = async () => {
    try {
      const response = await fetch(`/api/analytics/dashboard?timeframe=${timeframe}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardKPIs(data.data);
        }
      }
    } catch (err) {
      console.error('Dashboard KPIs fetch error:', err);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatGrowth = (growth: number): string => {
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 h-64 rounded-lg"></div>
            <div className="bg-gray-200 h-64 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={fetchAnalyticsData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex items-center space-x-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        </div>
      </div>

      {/* Real-time Metrics */}
      {realTimeMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Active Visitors"
            value={realTimeMetrics.activeSessions}
            icon={<Users className="h-6 w-6" />}
            color="blue"
            isRealTime
          />
          <MetricCard
            title="Page Views (1h)"
            value={realTimeMetrics.pageViews.lastHour}
            icon={<Eye className="h-6 w-6" />}
            color="green"
          />
          <MetricCard
            title="Page Views (24h)"
            value={realTimeMetrics.pageViews.last24Hours}
            icon={<Globe className="h-6 w-6" />}
            color="purple"
          />
          <MetricCard
            title="Recent Events"
            value={realTimeMetrics.recentEvents.length}
            icon={<TrendingUp className="h-6 w-6" />}
            color="orange"
          />
        </div>
      )}

      {/* KPI Cards */}
      {dashboardKPIs && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(dashboardKPIs.summary.totalRevenue)}
            growth={dashboardKPIs.summary.revenueGrowth}
            icon={<TrendingUp className="h-6 w-6" />}
            color="green"
          />
          <MetricCard
            title="Total Orders"
            value={dashboardKPIs.summary.totalOrders}
            growth={dashboardKPIs.sales.orderGrowth}
            icon={<ShoppingCart className="h-6 w-6" />}
            color="blue"
          />
          <MetricCard
            title="Total Customers"
            value={dashboardKPIs.summary.totalCustomers}
            growth={dashboardKPIs.summary.customerGrowth}
            icon={<Users className="h-6 w-6" />}
            color="purple"
          />
          <MetricCard
            title="Avg Order Value"
            value={formatCurrency(dashboardKPIs.sales.averageOrderValue)}
            icon={<TrendingUp className="h-6 w-6" />}
            color="orange"
          />
        </div>
      )}

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        {realTimeMetrics && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages (Last Hour)</h3>
            <div className="space-y-3">
              {realTimeMetrics.topPages.slice(0, 5).map((page, index) => (
                <div key={page.path} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="text-sm text-gray-900 truncate max-w-xs">{page.path}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{page.views} views</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {realTimeMetrics && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {realTimeMetrics.recentEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-900 capitalize">
                      {event.eventType.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(event.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  growth?: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  isRealTime?: boolean;
}

function MetricCard({ title, value, growth, icon, color, isRealTime }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  const growthColorClass = growth && growth >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {isRealTime && (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Live</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="flex items-baseline space-x-2">
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {growth !== undefined && (
            <span className={`text-sm font-medium ${growthColorClass}`}>
              {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}