'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, AlertCircle, Tool } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'
import {
  getBusinessMetrics,
  getSalesTrends,
  getCategoryDistribution,
  getTopProducts,
  getCustomerSegments,
  getServiceStats,
  type BusinessMetrics,
  type SalesData,
  type CategoryDistribution,
  type TopProduct,
  type CustomerSegment,
  type ServiceStats,
} from '@/services/adminAnalyticsService'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null)
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [categories, setCategories] = useState<CategoryDistribution[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([])
  const [serviceStats, setServiceStats] = useState<ServiceStats[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day')
  const [chartView, setChartView] = useState<'trends' | 'categories' | 'segments'>('trends')

  useEffect(() => {
    fetchAllAnalytics()
  }, [timeframe, groupBy])

  const fetchAllAnalytics = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch all analytics data in parallel
      const [
        metricsData,
        trendsData,
        categoriesData,
        productsData,
        segmentsData,
        servicesData,
      ] = await Promise.all([
        getBusinessMetrics(timeframe),
        getSalesTrends(timeframe, groupBy),
        getCategoryDistribution(timeframe),
        getTopProducts(timeframe, 10),
        getCustomerSegments(),
        getServiceStats(timeframe),
      ])

      setMetrics(metricsData)
      setSalesData(trendsData)
      setCategories(categoriesData)
      setTopProducts(productsData)
      setCustomerSegments(segmentsData)
      setServiceStats(servicesData)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics data')
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    if (!salesData || salesData.length === 0) return

    const csvContent = [
      ['Date', 'Revenue (DZD)', 'Orders', 'Average Order Value (DZD)'],
      ...salesData.map(item => [
        item.date,
        item.revenue.toFixed(2),
        item.orders,
        item.averageOrderValue.toFixed(2),
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics-report-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD' })
  }

  const formatGrowth = (growth: number) => {
    const color = growth >= 0 ? 'text-success-600' : 'text-error-600'
    const Icon = growth >= 0 ? TrendingUp : TrendingDown
    return (
      <div className="flex items-center mt-2">
        <Icon className={`w-4 h-4 ${color} mr-1`} />
        <span className={`text-sm font-medium ${color}`}>
          {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
        </span>
        <span className="text-sm text-neutral-500 ml-2">vs last period</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-700">Failed to load analytics</h3>
        <p className="text-red-500 mt-2">{error || 'Could not retrieve analytics data'}</p>
        <button
          onClick={fetchAllAnalytics}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Analytics Dashboard</h2>
          <p className="text-sm text-neutral-600 mt-1">Real-time business insights and performance metrics</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="form-input w-auto text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as any)}
            className="form-input w-auto text-sm"
          >
            <option value="day">By Day</option>
            <option value="week">By Week</option>
            <option value="month">By Month</option>
          </select>
          <button onClick={exportReport} className="btn-secondary text-sm">
            Export CSV
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Total Revenue</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {formatCurrency(metrics.totalRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-success-600" />
            </div>
          </div>
          {formatGrowth(metrics.revenueGrowth)}
        </div>

        {/* Total Orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Total Orders</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{metrics.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          {formatGrowth(metrics.ordersGrowth)}
        </div>

        {/* Average Order Value */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Avg Order Value</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {formatCurrency(metrics.averageOrderValue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-warning-600" />
            </div>
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            Conversion: {metrics.conversionRate.toFixed(1)}%
          </div>
        </div>

        {/* Total Customers */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Customers</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{metrics.totalCustomers}</p>
            </div>
            <div className="w-12 h-12 bg-info-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-info-600" />
            </div>
          </div>
          <div className="mt-2 text-xs text-neutral-600">
            <span className="font-medium text-success-600">{metrics.newCustomers} new</span>
            {' • '}
            <span>{metrics.returningCustomers} returning</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-600 uppercase">Service Requests</p>
              <p className="text-xl font-bold text-neutral-900 mt-1">{metrics.totalServiceRequests}</p>
            </div>
            <Tool className="w-8 h-8 text-primary-600" />
          </div>
          {formatGrowth(metrics.serviceGrowth)}
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-600 uppercase">Low Stock Alerts</p>
              <p className="text-xl font-bold text-neutral-900 mt-1">{metrics.lowStockProducts}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-warning-600" />
          </div>
          <p className="text-xs text-neutral-500 mt-2">Products below min stock</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-600 uppercase">Customer Growth</p>
              <p className="text-xl font-bold text-neutral-900 mt-1">+{metrics.newCustomers}</p>
            </div>
            <Users className="w-8 h-8 text-success-600" />
          </div>
          {formatGrowth(metrics.customerGrowth)}
        </div>
      </div>

      {/* Charts Section */}
      <div className="card">
        <div className="card-header border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                {chartView === 'trends' && 'Sales Trends'}
                {chartView === 'categories' && 'Category Distribution'}
                {chartView === 'segments' && 'Customer Segments'}
              </h3>
              <p className="text-sm text-neutral-600 mt-1">
                {chartView === 'trends' && `Revenue and orders trends by ${groupBy}`}
                {chartView === 'categories' && 'Sales breakdown by product category'}
                {chartView === 'segments' && 'Customer segmentation analysis'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setChartView('trends')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${chartView === 'trends'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
              >
                📈 Trends
              </button>
              <button
                onClick={() => setChartView('categories')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${chartView === 'categories'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
              >
                🥧 Categories
              </button>
              <button
                onClick={() => setChartView('segments')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${chartView === 'segments'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
              >
                👥 Segments
              </button>
            </div>
          </div>
        </div>

        <div className="card-body p-6">
          {chartView === 'trends' && (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      if (groupBy === 'month') return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
                      return date.toLocaleDateString('fr-FR', { month: 'numeric', day: 'numeric' })
                    }}
                  />
                  <YAxis
                    yAxisId="revenue"
                    orientation="left"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                      return value.toString()
                    }}
                  />
                  <YAxis yAxisId="orders" orientation="right" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                            <p className="font-medium text-gray-900 mb-2">{data.date}</p>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between gap-4">
                                <span className="text-gray-600">Revenue:</span>
                                <span className="font-semibold text-green-600">{formatCurrency(data.revenue)}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-gray-600">Orders:</span>
                                <span className="font-semibold text-blue-600">{data.orders}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-gray-600">Avg Order:</span>
                                <span className="font-semibold text-purple-600">{formatCurrency(data.averageOrderValue)}</span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    yAxisId="revenue"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Revenue"
                  />
                  <Line
                    yAxisId="orders"
                    type="monotone"
                    dataKey="orders"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartView === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-neutral-900 mb-3">Category Breakdown</h4>
                {categories.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{formatCurrency(cat.value)}</div>
                      <div className="text-xs text-neutral-500">{cat.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {chartView === 'segments' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={customerSegments}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="segment" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="totalRevenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-neutral-900">Customer Insights</h4>
                {customerSegments.map((seg, idx) => (
                  <div key={idx} className="p-3 bg-neutral-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-neutral-900">{seg.segment}</span>
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">{seg.count} customers</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-neutral-600">Revenue:</span>
                        <div className="font-semibold">{formatCurrency(seg.totalRevenue)}</div>
                      </div>
                      <div>
                        <span className="text-neutral-600">Avg Order:</span>
                        <div className="font-semibold">{formatCurrency(seg.averageOrderValue)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Products Table */}
      <div className="card">
        <div className="card-header border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Top Performing Products</h3>
          <p className="text-sm text-neutral-600 mt-1">Best sellers by revenue for selected period</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">Units Sold</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">Stock</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {topProducts.map((product, idx) => (
                <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-neutral-100 rounded">
                        {product.image && <img src={product.image} alt={product.name} className="h-10 w-10 rounded object-cover" />}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-neutral-900">{product.name}</div>
                        <div className="text-xs text-neutral-500">#{idx + 1} bestseller</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-neutral-900">
                    {formatCurrency(product.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-neutral-600">{product.unitsSold}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-neutral-600">{product.orders}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-medium ${product.stock < 10 ? 'text-warning-600' : 'text-neutral-600'}`}>
                      {product.stock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Requests Status */}
      {serviceStats.length > 0 && (
        <div className="card">
          <div className="card-header border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">Service Requests Status</h3>
            <p className="text-sm text-neutral-600 mt-1">Distribution of service requests by status</p>
          </div>
          <div className="card-body p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {serviceStats.map((stat, idx) => (
                <div key={idx} className="text-center p-4 bg-neutral-50 rounded-lg">
                  <div className="text-2xl font-bold text-neutral-900">{stat.count}</div>
                  <div className="text-sm text-neutral-600 mt-1">{stat.status}</div>
                  <div className="text-xs text-neutral-500 mt-1">{stat.percentage.toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
