'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Download, Eye, Trash2, Package, Truck, CheckCircle, XCircle, Clock, Cog } from 'lucide-react'
import { ordersService, type Order as OrderType } from '@/services/ordersService'
import { ApiError } from '@/lib/api'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string | null // Null if no real email (not mock email)
  customerPhone: string | null // Phone number for contact
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  total: number
  items: Array<{
    id: string
    productName: string
    quantity: number
    price?: number // unitPrice
    unitPrice?: number
    totalPrice?: number
  }>
  shippingAddress: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  createdAt: string
  updatedAt: string
}

const statusColors: Record<Order['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-orange-100 text-orange-800'
}

const statusIcons: Record<Order['status'], any> = {
  pending: Package,
  processing: Cog,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  refunded: XCircle
}

export function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)

  // Prevent state updates during render
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {
    if (isMounted) {
      fetchOrders()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]) // Only run once when component is mounted

  const fetchOrders = async () => {
    if (!isMounted) return; // Don't fetch if component is unmounted
    
    setLoading(true)
    setError(null)
    try {
      console.log('[OrdersManagement] Fetching orders...')
      const result = await ordersService.getOrders({
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
      
      console.log('[OrdersManagement] Received result:', result)
      console.log('[OrdersManagement] Orders count:', result.orders?.length || 0, 'Total:', result.total)
      
      if (isMounted) {
        const ordersList = Array.isArray(result.orders) ? result.orders : []
        console.log('[OrdersManagement] Setting orders:', ordersList.length)
        setOrders(ordersList)
        
        if (ordersList.length === 0 && result.total > 0) {
          console.warn('[OrdersManagement] WARNING: No orders in array but total > 0. Result:', result)
          setError('Orders data structure mismatch. Check console for details.')
        }
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch orders'
      if (isMounted) {
        setError(message)
        setOrders([]) // Clear orders on error
      }
      console.error('[OrdersManagement] Error fetching orders:', err)
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await ordersService.updateOrderStatus(orderId, newStatus)
      await fetchOrders()
      alert('Order status updated successfully!')
    } catch (err) {
      console.error('Error updating order status:', err)
      const message = err instanceof ApiError ? err.message : 'Failed to update order status'
      alert(message)
    }
  }

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return
    }

    try {
      await ordersService.cancelOrder(orderId, 'Cancelled by admin')
      await fetchOrders()
      alert('Order cancelled successfully!')
    } catch (err) {
      console.error('Error cancelling order:', err)
      const message = err instanceof ApiError ? err.message : 'Failed to cancel order'
      alert(message)
    }
  }

  const exportOrders = () => {
    const csvContent = [
      ['Order Number', 'Customer', 'Status', 'Total', 'Date'].join(','),
      ...filteredOrders.map(order => [
        order.orderNumber,
        order.customerName,
        order.status,
        order.total,
        new Date(order.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'orders.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (order.customerEmail && order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (order.customerPhone && order.customerPhone.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = !selectedStatus || order.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">Orders Management</h2>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10 w-64"
            />
          </div>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="form-input w-auto"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
          <button 
            onClick={exportOrders}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Orders
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Orders ({filteredOrders.length})</h3>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-red-50 rounded-lg">
              <h3 className="text-lg font-semibold text-red-700">Error Loading Orders</h3>
              <p className="text-red-500 mt-2">{error}</p>
              <button 
                onClick={fetchOrders} 
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900">No Orders Found</h3>
              <p className="text-neutral-500 mt-2">
                {searchQuery || selectedStatus ? 'No orders match your current filters.' : 'No orders have been placed yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => {
                    const StatusIcon = statusIcons[order.status] || Package; // Fallback icon
                    return (
                      <tr key={order.id || Math.random()} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.orderNumber || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {Array.isArray(order.items) ? order.items.length : 0} item{(Array.isArray(order.items) && order.items.length !== 1) ? 's' : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.customerName || 'N/A'}
                          </div>
                          {order.customerPhone && (
                            <div className="text-sm text-gray-600">
                              📞 {order.customerPhone}
                            </div>
                          )}
                          {order.customerEmail && (
                            <div className="text-sm text-gray-500">
                              ✉️ {order.customerEmail}
                            </div>
                          )}
                          {!order.customerPhone && !order.customerEmail && (
                            <div className="text-sm text-gray-400 italic">
                              Pas de contact
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {order.status || 'unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(typeof order.total === 'number' ? order.total : 0).toLocaleString('fr-FR', { style: 'currency', currency: 'DZD' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => viewOrderDetails(order)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                              className="text-xs border rounded px-2 py-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="refunded">Refunded</option>
                            </select>
                            <button
                              onClick={() => deleteOrder(order.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Cancel Order"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
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

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Order Details - {selectedOrder.orderNumber}</h3>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                    {selectedOrder.customerPhone && (
                      <p><strong>Téléphone:</strong> <a href={`tel:${selectedOrder.customerPhone}`} className="text-blue-600 hover:underline">{selectedOrder.customerPhone}</a></p>
                    )}
                    {selectedOrder.customerEmail && (
                      <p><strong>Email:</strong> <a href={`mailto:${selectedOrder.customerEmail}`} className="text-blue-600 hover:underline">{selectedOrder.customerEmail}</a></p>
                    )}
                    {!selectedOrder.customerPhone && !selectedOrder.customerEmail && (
                      <p className="text-gray-500 italic">Aucune information de contact disponible</p>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedOrder.shippingAddress ? (
                      <>
                        <p>{selectedOrder.shippingAddress.street || 'N/A'}</p>
                        <p>{selectedOrder.shippingAddress.city || 'N/A'}, {selectedOrder.shippingAddress.postalCode || 'N/A'}</p>
                        <p>{selectedOrder.shippingAddress.country || 'N/A'}</p>
                      </>
                    ) : (
                      <p className="text-gray-500">No shipping address available</p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedOrder.items.map((item, index) => {
                      // Use totalPrice if available, otherwise calculate from unitPrice
                      const itemTotal = typeof item.totalPrice === 'number' && !isNaN(item.totalPrice)
                        ? item.totalPrice
                        : (typeof item.unitPrice === 'number' && !isNaN(item.unitPrice) && item.quantity)
                        ? item.unitPrice * item.quantity
                        : 0;
                      
                      return (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-medium">
                            {itemTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD' })}
                          </p>
                        </div>
                      );
                    })}
                    <div className="pt-4 border-t border-gray-300 mt-4">
                      <div className="flex justify-between items-center font-bold">
                        <span>Total:</span>
                        <span>{selectedOrder.total.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD' })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Status */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Order Status</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedOrder.status]}`}>
                        {selectedOrder.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        Last updated: {new Date(selectedOrder.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-6 border-t">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
