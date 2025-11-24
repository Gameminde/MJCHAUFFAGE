'use client'

import { useState, useEffect } from 'react'
import { Search, Download, Eye, Edit, Trash2, User, Mail, Phone, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Types matching Supabase schema
interface Customer {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  role: string
  created_at: string
  last_sign_in_at: string | null
  // Aggregated fields
  total_orders: number
  total_spent: number
  last_order_at: string | null
  status: 'active' | 'inactive' | 'blocked'
}

export function CustomersManagement() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerDetails, setShowCustomerDetails] = useState(false)

  const supabase = createClient()

  const fetchCustomers = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch users with role 'CUSTOMER'
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'CUSTOMER')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // Fetch orders for aggregation
      // Note: In a real production app with many users, this should be done via a View or RPC function
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('customer_id, total_amount, created_at')

      if (ordersError) throw ordersError

      // Aggregate data
      const customersWithStats = users.map(user => {
        // Join via customer table (which links user_id to customer_id)
        // Ideally we should fetch customers table first, but for now we will rely on the fact 
        // that we need to map user_id (from users) -> customer_id (in orders)
        // This logic is slightly flawed because orders use customer_id, not user_id directly.

        // Let's fetch customers table mapping first
        return user
      })

      // 1. Get all customers (which links user_id <-> customer_id)
      const { data: customersData, error: custError } = await supabase
        .from('customers')
        .select('*')

      if (custError) throw custError

      const customersMap = new Map(customersData.map(c => [c.user_id, c]))
      const customerIds = customersData.map(c => c.id)

      // 2. Get orders for these customers
      let allOrders: any[] = [];
      if (customerIds.length > 0) {
        const { data, error: ordError } = await supabase
          .from('orders')
          .select('customer_id, total_amount, created_at')
          .in('customer_id', customerIds)

        if (ordError) {
          console.warn("Orders fetch failed (likely 406 due to empty list or RLS). Continuing without orders data.");
          // We don't throw here to avoid crashing the whole page if just orders fail
        } else {
          allOrders = data || [];
        }
      }

      const finalCustomers = users.map(user => {
        const customerProfile = customersMap.get(user.id)
        const customerId = customerProfile?.id

        const userOrders = customerId ? (allOrders?.filter(o => o.customer_id === customerId) || []) : []
        const totalSpent = userOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
        const lastOrder = userOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

        return {
          ...user,
          // Use profile data if available, fallback to user data
          phone: customerProfile?.phone || user.phone,
          total_orders: userOrders.length,
          total_spent: totalSpent,
          last_order_at: lastOrder ? lastOrder.created_at : null,
          status: 'active'
        } as Customer
      })

      setCustomers(finalCustomers)
    } catch (err: any) {
      console.error('Error fetching customers:', err)
      setError(err.message || 'Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const deleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return

    try {
      // Delete from Auth (requires Service Role, so we can only delete from public.users here if RLS allows)
      // Assuming RLS allows admin to delete users
      const { error } = await supabase.from('users').delete().eq('id', customerId)
      if (error) throw error

      setCustomers(prev => prev.filter(c => c.id !== customerId))
      alert('Customer deleted successfully!')
    } catch (err: any) {
      console.error('Error deleting customer:', err)
      alert('Failed to delete customer: ' + err.message)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase()
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchQuery))
    return matchesSearch
  })

  const viewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowCustomerDetails(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">Customers Management</h2>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Total Customers</p>
              <p className="text-2xl font-bold text-neutral-900">{customers.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Total Orders</p>
              <p className="text-2xl font-bold text-neutral-900">
                {customers.reduce((acc, c) => acc + c.total_orders, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">New This Month</p>
              <p className="text-2xl font-bold text-neutral-900">
                {customers.filter(c => {
                  const date = new Date(c.created_at)
                  const now = new Date()
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customers List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Customers ({filteredCustomers.length})</h3>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-red-50 rounded-lg">
              <h3 className="text-lg font-semibold text-red-700">Error Loading Customers</h3>
              <p className="text-red-500 mt-2">{error}</p>
              <button onClick={fetchCustomers} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Retry</button>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900">No Customers Found</h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.first_name} {customer.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Registered {new Date(customer.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-gray-400" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-4 w-4 mr-1 text-gray-400" />
                            {customer.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <ShoppingBag className="h-4 w-4 mr-1 text-gray-400" />
                          {customer.total_orders}
                        </div>
                        {customer.last_order_at && (
                          <div className="text-sm text-gray-500">
                            Last: {new Date(customer.last_order_at).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.total_spent.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button onClick={() => viewCustomerDetails(customer)} className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button onClick={() => deleteCustomer(customer.id)} className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Customer Details Modal */}
      {showCustomerDetails && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Customer Details</h3>
                <button onClick={() => setShowCustomerDetails(false)} className="text-gray-500 hover:text-gray-700">×</button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{selectedCustomer.first_name} {selectedCustomer.last_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedCustomer.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{selectedCustomer.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Stats</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Total Orders</p>
                        <p className="font-medium">{selectedCustomer.total_orders}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Spent</p>
                        <p className="font-medium">{selectedCustomer.total_spent.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 })}</p>
                      </div>
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