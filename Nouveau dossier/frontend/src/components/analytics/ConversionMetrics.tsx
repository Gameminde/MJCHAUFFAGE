'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Eye, 
  CreditCard, 
  TrendingUp,
  Users,
  Package
} from 'lucide-react';

interface ConversionFunnelStep {
  step: string;
  count: number;
  percentage: number;
  dropoffRate?: number;
}

interface ConversionMetrics {
  funnel: ConversionFunnelStep[];
  conversionRate: number;
  averageOrderValue: number;
  totalRevenue: number;
  totalOrders: number;
  cartAbandonmentRate: number;
}

export function ConversionMetrics() {
  const [metrics, setMetrics] = useState<ConversionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('7d');

  useEffect(() => {
    fetchConversionData();
  }, [timeframe]);

  const fetchConversionData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from API
      const response = await fetch(`/api/analytics/conversions?timeframe=${timeframe}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMetrics(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch conversion data');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
    } catch (err) {
      setError('Failed to load conversion data');
      console.error('Conversion data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'Product Views':
        return <Eye className="h-5 w-5" />;
      case 'Add to Cart':
        return <ShoppingCart className="h-5 w-5" />;
      case 'Begin Checkout':
        return <Package className="h-5 w-5" />;
      case 'Complete Purchase':
        return <CreditCard className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  const getStepColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-yellow-500',
      'bg-purple-500'
    ];
    return colors[index] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchConversionData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Conversion Metrics</h3>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {metrics && (
        <div className="space-y-6">
          {/* Empty State Check */}
          {metrics.totalOrders === 0 && metrics.funnel.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No conversion data available</h4>
              <p className="text-gray-600 mb-1">
                {(metrics as any).message || 'Conversion data will appear here once customers start making purchases.'}
              </p>
              <p className="text-sm text-gray-500">
                Make sure your analytics tracking is properly configured.
              </p>
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Conversion Rate</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-2">{metrics.conversionRate}%</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Avg Order Value</span>
              </div>
              <p className="text-lg font-bold text-green-900 mt-2">
                {formatCurrency(metrics.averageOrderValue)}
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Total Orders</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 mt-2">{metrics.totalOrders}</p>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Cart Abandonment</span>
              </div>
              <p className="text-2xl font-bold text-orange-900 mt-2">{metrics.cartAbandonmentRate}%</p>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4">Conversion Funnel</h4>
            <div className="space-y-3">
              {metrics.funnel.map((step, index) => (
                <div key={step.step} className="relative">
                  <div className="flex items-center space-x-4">
                    {/* Step Icon */}
                    <div className={`p-3 rounded-full text-white ${getStepColor(index)}`}>
                      {getStepIcon(step.step)}
                    </div>

                    {/* Step Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium text-gray-900">{step.step}</h5>
                        <div className="text-right">
                          <span className="text-lg font-semibold text-gray-900">
                            {step.count.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({step.percentage}%)
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${getStepColor(index)}`}
                          style={{ width: `${step.percentage}%` }}
                        ></div>
                      </div>

                      {/* Drop-off Rate */}
                      {step.dropoffRate && (
                        <p className="text-xs text-red-600 mt-1">
                          {step.dropoffRate}% drop-off to next step
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < metrics.funnel.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-6 bg-gray-300"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(metrics.totalRevenue)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                from {metrics.totalOrders} orders
              </p>
            </div>
          </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}