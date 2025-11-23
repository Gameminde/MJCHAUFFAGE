'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie, Legend } from 'recharts'

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
  distribution: {
    categories: Array<{
      name: string
      value: number
      percentage: number
    }>
    sources: Array<{
      name: string
      value: number
      percentage: number
    }>
  }
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState('30d')
  const [groupBy, setGroupBy] = useState('day')
  const [chartType, setChartType] = useState<'trends' | 'distribution'>('trends')

  const supabase = createClient()

  useEffect(() => {
    fetchAnalytics()
  }, [timeframe, groupBy])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      // Calculate date range
      const now = new Date()
      const startDate = new Date()
      if (timeframe === '7d') startDate.setDate(now.getDate() - 7)
      else if (timeframe === '30d') startDate.setDate(now.getDate() - 30)
      else if (timeframe === '90d') startDate.setDate(now.getDate() - 90)

      // Fetch orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_amount, created_at, status')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (ordersError) throw ordersError

      // Process data
      const salesMap = new Map<string, { revenue: number, orders: number }>()
      let totalRevenue = 0
      let totalOrders = 0

      orders?.forEach(order => {
        if (order.status === 'CANCELLED') return

        const date = new Date(order.created_at)
        let key = ''

        if (groupBy === 'day') {
          key = date.toISOString().split('T')[0]
        } else if (groupBy === 'month') {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        } else {
          // Week logic simplified
          const firstDay = new Date(date.setDate(date.getDate() - date.getDay()))
          key = firstDay.toISOString().split('T')[0]
        }

        const current = salesMap.get(key) || { revenue: 0, orders: 0 }
        salesMap.set(key, {
          revenue: current.revenue + order.total_amount,
          orders: current.orders + 1
        })

        totalRevenue += order.total_amount
        totalOrders += 1
      })

      const salesData: SalesData[] = Array.from(salesMap.entries()).map(([date, stats]) => ({
        date,
        revenue: stats.revenue,
        orders: stats.orders
      })).sort((a, b) => a.date.localeCompare(b.date))

      // Mock distribution data for now as we don't have category/source in orders easily accessible without joins
      // In a real app, we would fetch order items and join with products -> categories
      const distributionData = {
        categories: [
          { name: 'Chauffage', value: totalRevenue * 0.4, percentage: 40 },
          { name: 'Plomberie', value: totalRevenue * 0.3, percentage: 30 },
          { name: 'Climatisation', value: totalRevenue * 0.2, percentage: 20 },
          { name: 'Pièces', value: totalRevenue * 0.1, percentage: 10 }
        ],
        sources: [
          { name: 'Site Web', value: totalRevenue * 0.6, percentage: 60 },
          { name: 'Téléphone', value: totalRevenue * 0.3, percentage: 30 },
          { name: 'Autres', value: totalRevenue * 0.1, percentage: 10 }
        ]
      }

      setData({
        sales: salesData,
        summary: {
          totalRevenue,
          totalOrders,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
          revenueGrowth: 0 // Needs previous period comparison, skipping for now
        },
        distribution: distributionData
      })

    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics data')
      console.error('Failed to fetch analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    if (!data) return

    const csvContent = [
      ['Date', 'Orders', 'Revenue', 'Avg Order'],
      ...data.sales.map(item => [
        item.date,
        item.orders,
        item.revenue,
        item.orders > 0 ? (item.revenue / item.orders).toFixed(2) : 0
      ])
    ].map(e => e.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-report-${timeframe}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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
            <span className={`text-sm font-medium ${data.summary.revenueGrowth >= 0 ? 'text-success-600' : 'text-error-600'
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

      {/* Charts Section */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {chartType === 'trends' ? 'Sales Trends' : 'Sales Distribution'}
              </h3>
              <p className="text-sm text-neutral-600">
                {chartType === 'trends'
                  ? `Revenue and orders trends by ${groupBy}`
                  : 'Breakdown by categories and sources'
                }
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setChartType('trends')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${chartType === 'trends'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
              >
                📈 Trends
              </button>
              <button
                onClick={() => setChartType('distribution')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${chartType === 'distribution'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
              >
                🥧 Distribution
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          {chartType === 'trends' ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.sales.map(item => ({
                    ...item,
                    formattedDate: new Date(item.date).toLocaleDateString('fr-FR', {
                      month: groupBy === 'month' ? 'short' : 'numeric',
                      day: groupBy === 'month' ? undefined : 'numeric',
                      year: groupBy === 'month' ? 'numeric' : undefined
                    }),
                    revenueFormatted: item.revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD' }),
                    averageOrder: item.orders > 0 ? Math.round(item.revenue / item.orders) : 0
                  }))}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="formattedDate"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="revenue"
                    orientation="left"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
                      return value.toString()
                    }}
                  />
                  <YAxis
                    yAxisId="orders"
                    orientation="right"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                            <p className="font-medium text-gray-900 mb-2">{label}</p>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-sm text-gray-600">Revenue:</span>
                                <span className="font-semibold text-green-600">{data.revenueFormatted}</span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-sm text-gray-600">Orders:</span>
                                <span className="font-semibold text-blue-600">{data.orders}</span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-sm text-gray-600">Avg Order:</span>
                                <span className="font-semibold text-purple-600">
                                  {data.averageOrder.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD' })}
                                </span>
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
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                    name="Revenue"
                  />
                  <Line
                    yAxisId="orders"
                    type="monotone"
                    dataKey="orders"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2, fill: '#fff' }}
                    name="Orders"
                  />
                </LineChart>
              </ResponsiveContainer>

              {/* Trends Legend */}
              <div className="flex items-center justify-center mt-4 space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Revenue Trend</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Orders Trend</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Categories Pie Chart */}
              <div>
                <h4 className="text-md font-semibold mb-4 text-center">Sales by Categories</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.distribution.categories}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        labelLine={false}
                      >
                        {data.distribution.categories.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={[
                              '#3b82f6', // blue
                              '#10b981', // green
                              '#f59e0b', // amber
                              '#ef4444', // red
                              '#8b5cf6'  // purple
                            ][index % 5]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          value.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD' }),
                          'Revenue'
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sources Pie Chart */}
              <div>
                <h4 className="text-md font-semibold mb-4 text-center">Sales by Sources</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.distribution.sources}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        labelLine={false}
                      >
                        {data.distribution.sources.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={[
                              '#06b6d4', // cyan
                              '#84cc16', // lime
                              '#f97316', // orange
                              '#ec4899', // pink
                              '#6366f1'  // indigo
                            ][index % 5]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          value.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD' }),
                          'Revenue'
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
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
