'use client'

import { useState, useEffect } from 'react'
import { Search, Download, Eye, Trash2, Package, Truck, CheckCircle, XCircle, Cog } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Types matching Supabase schema
interface Order {
  id: string
  order_number: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  total_amount: number
  created_at: string
  updated_at: string
  customer: {
    id: string
    email: string
    first_name: string
    last_name: string
    phone: string
  } | null
  shipping_address: {
    street: string
    city: string
    postal_code: string
    country: string
  } | null
  order_items: Array<{
    id: string
    quantity: number
    unit_price: number
    total_price: number
    product: {
      name: string
    } | null
  }>
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-orange-100 text-orange-800'
}

const statusIcons: Record<string, any> = {
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

  const supabase = createClient()

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(id, email, first_name, last_name, phone),
          order_items(
            id, 
            quantity, 
            unit_price, 
            total_price,
            product:products(name)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Parse shipping_address if it's a string (JSON)
      const parsedOrders = data?.map(order => ({
        ...order,
        shipping_address: typeof order.shipping_address === 'string'
          ? JSON.parse(order.shipping_address)
          : order.shipping_address
      }))

      setOrders(parsedOrders || [])
    } catch (err: any) {
      console.error('Error fetching orders:', err)
      setError(err.message || 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      await fetchOrders()
      alert('Order status updated successfully!')
    } catch (err: any) {
      console.error('Error updating order status:', err)
      alert('Failed to update order status: ' + err.message)
    }
  }

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' }) // Soft delete/cancel prefered
        .eq('id', orderId)

      if (error) throw error

      await fetchOrders()
      alert('Order cancelled successfully!')
    } catch (err: any) {
      console.error('Error cancelling order:', err)
      alert('Failed to cancel order: ' + err.message)
    }
  }

  const filteredOrders = orders.filter(order => {
    const customerName = order.customer ? `${order.customer.first_name} ${order.customer.last_name}` : 'Guest'
    const matchesSearch = (order.order_number?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase())
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
              <button onClick={fetchOrders} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Retry</button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900">No Orders Found</h3>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => {
                      const StatusIcon = statusIcons[order.status] || Package
                      return (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{order.order_number || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{order.order_items?.length || 0} items</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {order.customer ? `${order.customer.first_name} ${order.customer.last_name}` : 'Guest'}
                            </div>
                            <div className="text-sm text-gray-500">{order.customer?.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.total_amount?.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button onClick={() => viewOrderDetails(order)} className="text-blue-600 hover:text-blue-900 p-2">
                                <Eye className="h-5 w-5" />
                              </button>
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                className="text-xs border rounded px-2 py-1 h-8"
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
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
                <h3 className="text-lg font-semibold">Order Details - {selectedOrder.order_number}</h3>
                <button onClick={() => setShowOrderDetails(false)} className="text-gray-500 hover:text-gray-700">×</button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Name:</strong> {selectedOrder.customer ? `${selectedOrder.customer.first_name} ${selectedOrder.customer.last_name}` : 'Guest'}</p>
                    <p><strong>Email:</strong> {selectedOrder.customer?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customer?.phone || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedOrder.shipping_address ? (
                      <>
                        <p>{selectedOrder.shipping_address.street}</p>
                        <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.postal_code}</p>
                        <p>{selectedOrder.shipping_address.country}</p>
                      </>
                    ) : <p className="text-gray-500">No address provided</p>}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedOrder.order_items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p>{item.total_price?.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 })}</p>
                      </div>
                    ))}
                    <div className="pt-4 mt-4 border-t flex justify-between font-bold">
                      <span>Total</span>
                      <span>{selectedOrder.total_amount?.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
