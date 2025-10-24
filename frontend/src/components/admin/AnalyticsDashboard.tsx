'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react'

interface SalesData {
  date: string
  revenue: number
  orders: number
}

interface AnalyticsData {
  sales: SalesData[]
  summary: {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    revenueGrowth: number
  }
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState('30d')
  const [groupBy, setGroupBy] = useState('day')

  useEffect(() => {
    fetchAnalytics()
  }, [timeframe, groupBy])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const result: any = await api.get(`/admin/analytics/sales?timeframe=${timeframe}&groupBy=${groupBy}`)
      
      // Extract data from response
      const responseData = result.data || result
      const salesData = responseData.chartData || responseData.sales || []
      const summary = responseData.summary || {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        revenueGrowth: 0
      }

      setData({
        sales: salesData,
        summary: summary
      })
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics data')
      console.error('Failed to fetch analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async () => {
    try {
      const result: any = await api.get(`/admin/export?type=orders&format=csv&timeframe=${timeframe}`)
      const csvText = typeof result === 'string' ? result : (typeof result.data === 'string' ? result.data : JSON.stringify(result.data || result))
      const blob = new Blob([csvText], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-report-${timeframe}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export report:', err)
      alert('Failed to export report')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg">
        <h3 className="text-lg font-semibold text-red-700">Failed to load analytics data</h3>
        <p className="text-red-500 mt-2">{error || 'Could not retrieve analytics.'}</p>
        <button 
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">Analytics Dashboard</h2>
        <div className="flex space-x-4">
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="form-input w-auto"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <select 
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="form-input w-auto"
          >
            <option value="day">By Day</option>
            <option value="week">By Week</option>
            <option value="month">By Month</option>
          </select>
          <button onClick={exportReport} className="btn-secondary">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Revenue</p>
              <p className="text-2xl font-bold text-neutral-900">
                {data.summary.totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD' })}
              </p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-success-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {data.summary.revenueGrowth >= 0 ? (
              <TrendingUp className="w-4 h-4 text-success-600 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-error-600 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              data.summary.revenueGrowth >= 0 ? 'text-success-600' : 'text-error-600'
            }`}>
              {data.summary.revenueGrowth >= 0 ? '+' : ''}{data.summary.revenueGrowth.toFixed(1)}%
            </span>
            <span className="text-sm text-neutral-500 ml-2">vs last period</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Orders</p>
              <p className="text-2xl font-bold text-neutral-900">{data.summary.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Average Order Value</p>
              <p className="text-2xl font-bold text-neutral-900">
                {data.summary.averageOrderValue.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD' })}
              </p>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-neutral-900">
                {((data.summary.totalOrders / Math.max(data.sales.length * 100, 1)) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-info-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-info-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Sales Over Time</h3>
        </div>
        <div className="card-body">
          <div className="h-64 flex items-end space-x-2">
            {data.sales.map((item, index) => {
              const maxRevenue = Math.max(...data.sales.map(s => s.revenue))
              const height = (item.revenue / maxRevenue) * 100
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="relative w-full">
                    <div 
                      className="w-full bg-primary-500 hover:bg-primary-600 rounded-t transition-all cursor-pointer"
                      style={{ height: `${height * 2}px`, minHeight: '4px' }}
                      title={`${new Date(item.date).toLocaleDateString()}: ${item.revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD' })}`}
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-2 transform rotate-45 origin-left">
                    {new Date(item.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Detailed Sales Data</h3>
        </div>
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Order</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.sales.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.orders > 0 ? (item.revenue / item.orders).toLocaleString('fr-FR', { style: 'currency', currency: 'DZD' }) : '0 DZD'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
