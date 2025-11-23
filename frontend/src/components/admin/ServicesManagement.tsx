'use client'

import { useState, useEffect } from 'react'
import { Search, Calendar, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Types matching Supabase schema
interface ServiceRequest {
  id: string
  request_number: string
  status: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  description: string
  notes: string
  created_at: string
  scheduled_date: string | null
  completed_date: string | null
  contact_name: string | null
  contact_phone: string | null
  address: string | null
  equipment_details: string | null
  user: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
  } | null
  service: {
    id: string
    name: string
  } | null
  technician: {
    id: string
    user: {
      first_name: string
      last_name: string
    }
  } | null
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

const statusIcons: Record<string, any> = {
  PENDING: Clock,
  SCHEDULED: Calendar,
  IN_PROGRESS: AlertCircle,
  COMPLETED: CheckCircle,
  CANCELLED: XCircle
}

const priorityColors: Record<string, string> = {
  LOW: 'text-green-600',
  NORMAL: 'text-blue-600',
  HIGH: 'text-orange-600',
  URGENT: 'text-red-600'
}

export function ServicesManagement() {
  const [services, setServices] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedService, setSelectedService] = useState<ServiceRequest | null>(null)
  const [technicians, setTechnicians] = useState<any[]>([])
  const [assignFormData, setAssignFormData] = useState({
    technicianId: '',
    scheduledDate: ''
  })

  const supabase = createClient()

  const fetchServices = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          user:users(id, first_name, last_name, email),
          service:services(id, name),
          technician:technicians(
            id,
            user:users(first_name, last_name)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setServices(data || [])
    } catch (err: any) {
      console.error('Error fetching services:', err)
      setError(err.message || 'Failed to fetch service requests')
    } finally {
      setLoading(false)
    }
  }

  const fetchTechnicians = async () => {
    try {
      const { data, error } = await supabase
        .from('technicians')
        .select(`
          id,
          specialties,
          user:users(first_name, last_name)
        `)
        .eq('status', 'active')

      if (error) throw error
      setTechnicians(data || [])
    } catch (err) {
      console.error('Error fetching technicians:', err)
    }
  }

  useEffect(() => {
    fetchServices()
    fetchTechnicians()
  }, [])

  const handleAssignTechnician = async () => {
    if (!selectedService || !assignFormData.technicianId || !assignFormData.scheduledDate) {
      alert('Please fill all required fields')
      return
    }

    try {
      const { error } = await supabase
        .from('service_requests')
        .update({
          technician_id: assignFormData.technicianId,
          scheduled_date: new Date(assignFormData.scheduledDate).toISOString(),
          status: 'SCHEDULED'
        })
        .eq('id', selectedService.id)

      if (error) throw error

      await fetchServices()
      setShowAssignModal(false)
      setSelectedService(null)
      setAssignFormData({ technicianId: '', scheduledDate: '' })
      alert('Technician assigned successfully!')
    } catch (err: any) {
      console.error('Error assigning technician:', err)
      alert('Failed to assign technician: ' + err.message)
    }
  }

  const filteredServices = services.filter(service => {
    const matchesStatus = !selectedStatus || service.status === selectedStatus
    const matchesPriority = !selectedPriority || service.priority === selectedPriority

    const customerName = service.user
      ? `${service.user.first_name} ${service.user.last_name}`
      : service.contact_name || ''

    const matchesSearch = !searchQuery ||
      (service.request_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.service?.name.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesStatus && matchesPriority && matchesSearch
  })

  if (loading && services.length === 0) {
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
        <h2 className="text-2xl font-bold text-neutral-900">Services Management</h2>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
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
            <option value="PENDING">Pending</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="form-input w-auto"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Services Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Service Requests ({filteredServices.length})</h3>
        </div>
        <div className="card-body p-0">
          {filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900">No Service Requests Found</h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredServices.map((service) => {
                    const StatusIcon = statusIcons[service.status]
                    const customerName = service.user
                      ? `${service.user.first_name} ${service.user.last_name}`
                      : service.contact_name || 'N/A'
                    const technicianName = service.technician?.user
                      ? `${service.technician.user.first_name} ${service.technician.user.last_name}`
                      : null

                    return (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{service.request_number || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{new Date(service.created_at).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.service?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[service.status]}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {service.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${priorityColors[service.priority || 'NORMAL']}`}>
                            {service.priority || 'NORMAL'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {technicianName || (
                            <button
                              onClick={() => {
                                setSelectedService(service)
                                setShowAssignModal(true)
                              }}
                              className="text-primary-600 hover:text-primary-800 font-medium"
                            >
                              Assign
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {service.scheduled_date ? new Date(service.scheduled_date).toLocaleString() : 'Not scheduled'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedService(service)
                              setShowViewModal(true)
                            }}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              setSelectedService(service)
                              setShowAssignModal(true)
                            }}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Edit
                          </button>
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

      {/* View Details Modal */}
      {showViewModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h3 className="text-lg font-semibold">Service Request Details</h3>
                <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">×</button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Request Info</h4>
                    <p className="text-sm text-gray-900"><span className="font-medium">ID:</span> {selectedService.request_number}</p>
                    <p className="text-sm text-gray-900"><span className="font-medium">Date:</span> {new Date(selectedService.created_at).toLocaleString()}</p>
                    <p className="text-sm text-gray-900"><span className="font-medium">Status:</span> {selectedService.status}</p>
                    <p className="text-sm text-gray-900"><span className="font-medium">Priority:</span> {selectedService.priority}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Service Type</h4>
                    <p className="text-sm text-gray-900 font-medium">{selectedService.service?.name}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 border-b pb-2">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Contact Name</p>
                      <p className="text-sm font-medium">
                        {selectedService.user
                          ? `${selectedService.user.first_name} ${selectedService.user.last_name}`
                          : selectedService.contact_name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Contact Phone</p>
                      <p className="text-sm font-medium">
                        {selectedService.user?.phone || selectedService.contact_phone || 'N/A'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm font-medium">{selectedService.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedService.description}
                  </div>
                </div>

                {selectedService.equipment_details && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Equipment Details</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedService.equipment_details}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Scheduling</h4>
                    <p className="text-sm text-gray-900"><span className="font-medium">Scheduled:</span> {selectedService.scheduled_date ? new Date(selectedService.scheduled_date).toLocaleString() : 'Not scheduled'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Technician</h4>
                    <p className="text-sm text-gray-900">
                      {selectedService.technician?.user
                        ? `${selectedService.technician.user.first_name} ${selectedService.technician.user.last_name}`
                        : 'Unassigned'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Technician Modal */}
      {showAssignModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Assign Technician</h3>
                <button onClick={() => setShowAssignModal(false)} className="text-gray-500 hover:text-gray-700">×</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Request</label>
                  <p className="text-sm text-gray-900">{selectedService.request_number}</p>
                  <p className="text-sm text-gray-500">{selectedService.service?.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Technician *</label>
                  <select
                    value={assignFormData.technicianId}
                    onChange={(e) => setAssignFormData(prev => ({ ...prev, technicianId: e.target.value }))}
                    className="form-input w-full"
                    required
                  >
                    <option value="">Select a technician</option>
                    {technicians.map(tech => (
                      <option key={tech.id} value={tech.id}>
                        {tech.user.first_name} {tech.user.last_name} - {Array.isArray(tech.specialties) ? tech.specialties.join(', ') : tech.specialties || ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date *</label>
                  <input
                    type="datetime-local"
                    value={assignFormData.scheduledDate}
                    onChange={(e) => setAssignFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="form-input w-full"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <button onClick={() => setShowAssignModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleAssignTechnician} className="btn-primary">Assign Technician</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
