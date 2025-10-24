'use client'

import { useState, useEffect } from 'react'
import { Search, Download, Eye, Edit, Trash2, User, Mail, Phone, MapPin, Calendar, ShoppingBag } from 'lucide-react'
import { customersService, type Customer, type CustomerFilters } from '@/services/customersService'
import { ApiError } from '@/lib/api'

export function CustomersManagement() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerDetails, setShowCustomerDetails] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    setError(null)
    try {
      const filters: CustomerFilters = {}
      if (searchQuery.trim()) filters.search = searchQuery.trim()
      if (selectedType) filters.customerType = selectedType as 'B2B' | 'B2C'
      const result = await customersService.getCustomers(filters)
      setCustomers(result.customers || [])
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch customers'
      setError(message)
      console.error('Error fetching customers:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleCustomerStatus = async (customerId: string, status: 'active' | 'inactive') => {
    try {
      await customersService.toggleCustomerStatus(customerId, status)
      await fetchCustomers()
      alert('Customer status updated successfully!')
    } catch (err) {
      console.error('Error updating customer status:', err)
      alert('Failed to update customer status')
    }
  }

  const deleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return
    }

    try {
      await customersService.deleteCustomer(customerId)
      await fetchCustomers()
      alert('Customer deleted successfully!')
    } catch (err) {
      console.error('Error deleting customer:', err)
      alert('Failed to delete customer')
    }
  }

  const exportCustomers = async () => {
    try {
      const filters: CustomerFilters = {}
      if (searchQuery.trim()) filters.search = searchQuery.trim()
      if (selectedType) filters.customerType = selectedType as 'B2B' | 'B2C'
      const blob = await customersService.exportCustomers(filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'customers.csv'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error exporting customers:', err)
      alert('Failed to export customers')
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase()
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (customer.phone && customer.phone.includes(searchQuery))
    const matchesType = !selectedType || customer.customerType === selectedType
    return matchesSearch && matchesType
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
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="form-input w-auto"
          >
            <option value="">All Types</option>
            <option value="B2B">B2B</option>
            <option value="B2C">B2C</option>
          </select>
          <button 
            onClick={exportCustomers}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Customers
          </button>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Active Customers</p>
              <p className="text-2xl font-bold text-neutral-900">{customers.filter(c => c.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">B2B Customers</p>
              <p className="text-2xl font-bold text-neutral-900">{customers.filter(c => c.customerType === 'B2B').length}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">B2C Customers</p>
              <p className="text-2xl font-bold text-neutral-900">{customers.filter(c => c.customerType === 'B2C').length}</p>
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
              <button 
                onClick={fetchCustomers} 
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900">No Customers Found</h3>
              <p className="text-neutral-500 mt-2">
                {searchQuery || selectedType ? 'No customers match your current filters.' : 'No customers have registered yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
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
                              {customer.firstName} {customer.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              Registered {new Date(customer.createdAt).toLocaleDateString()}
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
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          customer.customerType === 'B2B' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {customer.customerType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <ShoppingBag className="h-4 w-4 mr-1 text-gray-400" />
                          {customer.totalOrders}
                        </div>
                        {customer.lastOrderAt && (
                          <div className="text-sm text-gray-500">
                            Last: {new Date(customer.lastOrderAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.totalSpent.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          customer.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {customer.status === 'active' ? 'Active' : customer.status === 'inactive' ? 'Inactive' : 'Blocked'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => viewCustomerDetails(customer)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleCustomerStatus(customer.id, customer.status === 'active' ? 'inactive' : 'active')}
                            className={`${customer.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                            title={customer.status === 'active' ? 'Deactivate' : 'Activate'}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteCustomer(customer.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Customer"
                          >
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
                <button
                  onClick={() => setShowCustomerDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Customer Type</p>
                        <p className="font-medium">{selectedCustomer.customerType}</p>
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

                {/* Address */}
                {selectedCustomer.address && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Address</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p>{selectedCustomer.address.street}</p>
                      <p>{selectedCustomer.address.city}, {selectedCustomer.address.postalCode}</p>
                      <p>{selectedCustomer.address.country}</p>
                    </div>
                  </div>
                )}

                {/* Order Statistics */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Order Statistics</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Total Orders</p>
                        <p className="font-medium">{selectedCustomer.totalOrders}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Spent</p>
                        <p className="font-medium">
                          {selectedCustomer.totalSpent.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Registration Date</p>
                        <p className="font-medium">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Order</p>
                        <p className="font-medium">
                          {selectedCustomer.lastOrderAt 
                            ? new Date(selectedCustomer.lastOrderAt).toLocaleDateString()
                            : 'No orders yet'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Account Status</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      selectedCustomer.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedCustomer.status === 'active' ? 'Active Account' : selectedCustomer.status === 'inactive' ? 'Inactive Account' : 'Blocked Account'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-6 border-t">
                <button
                  onClick={() => setShowCustomerDetails(false)}
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