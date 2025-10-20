'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Package, TrendingDown, TrendingUp, Search } from 'lucide-react'
import { api } from '@/lib/api'

interface InventoryAlert {
  id: string
  productName: string
  productId: string
  currentStock: number
  minimumStock: number
  status: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'CRITICAL'
}

export function InventoryManagement() {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchInventoryAlerts()
  }, [])

  const fetchInventoryAlerts = async () => {
    setLoading(true)
    setError(null)
    try {
      const result: any = await api.get('/admin/inventory/alerts')
      const responseData = result.data || result
      setAlerts(responseData.alerts || responseData || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch inventory alerts')
      console.error('Error fetching inventory alerts:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = !filter || 
      (filter === 'low-stock' && alert.status === 'LOW_STOCK') ||
      (filter === 'out-of-stock' && alert.status === 'OUT_OF_STOCK') ||
      (filter === 'critical' && alert.status === 'CRITICAL')
    const matchesSearch = !searchQuery || 
      alert.productName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return 'text-red-600 bg-red-100'
      case 'OUT_OF_STOCK':
        return 'text-red-600 bg-red-50'
      case 'LOW_STOCK':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CRITICAL':
      case 'OUT_OF_STOCK':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'LOW_STOCK':
        return <TrendingDown className="w-5 h-5 text-yellow-600" />
      default:
        return <Package className="w-5 h-5 text-gray-600" />
    }
  }

  if (loading && alerts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">Inventory Management</h2>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10 w-64"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-input w-auto"
          >
            <option value="">All Products</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-600">
                {alerts.filter(a => a.status === 'CRITICAL').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">
                {alerts.filter(a => a.status === 'LOW_STOCK').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {alerts.filter(a => a.status === 'OUT_OF_STOCK').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Alerts Banner */}
      {alerts.length > 0 && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-warning-600 mr-2" />
            <span className="text-warning-800 font-medium">
              {alerts.length} product{alerts.length !== 1 ? 's' : ''} {alerts.length !== 1 ? 'require' : 'requires'} attention
            </span>
            <button 
              onClick={fetchInventoryAlerts}
              className="ml-auto text-warning-600 hover:text-warning-800 text-sm font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Inventory Alerts Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Inventory Alerts ({filteredAlerts.length})</h3>
        </div>
        <div className="card-body p-0">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              {alerts.length === 0 ? (
                <>
                  <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900">All Stock Levels Good!</h3>
                  <p className="text-neutral-500 mt-2">
                    No inventory alerts at this time. All products have sufficient stock levels.
                  </p>
                </>
              ) : (
                <>
                  <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900">No Alerts Match Your Filters</h3>
                  <p className="text-neutral-500 mt-2">
                    Try adjusting your search or filter criteria.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Minimum Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Deficit
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAlerts.map((alert) => {
                    const deficit = alert.minimumStock - alert.currentStock
                    return (
                      <tr key={alert.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(alert.status)}
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {alert.productName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {alert.productId.substring(0, 8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-semibold ${
                            alert.currentStock === 0 ? 'text-red-600' : 
                            alert.currentStock <= alert.minimumStock ? 'text-yellow-600' : 
                            'text-gray-900'
                          }`}>
                            {alert.currentStock} units
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {alert.minimumStock} units
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                            {alert.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                          {deficit > 0 ? `-${deficit} units` : 'N/A'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
