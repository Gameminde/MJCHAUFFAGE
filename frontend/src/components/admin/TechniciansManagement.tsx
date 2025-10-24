'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, User, Mail, Phone, Briefcase, Star } from 'lucide-react'
import { api } from '@/lib/api'

interface Technician {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  employeeId: string
  specialties: string[]
  isAvailable?: boolean
  rating?: number
  completedJobs?: number
}

export function TechniciansManagement() {
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null)
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    employeeId: '',
    specialties: ['']
  })

  useEffect(() => {
    fetchTechnicians()
  }, [])

  const fetchTechnicians = async () => {
    setLoading(true)
    setError(null)
    try {
      const result: any = await api.get('/admin/technicians')
      const responseData = result.data || result
      setTechnicians(responseData.technicians || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch technicians')
      console.error('Error fetching technicians:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTechnician = async () => {
    try {
      const cleanedData = {
        ...formData,
        specialties: formData.specialties.filter(s => s.trim() !== '')
      }
      
      if (cleanedData.specialties.length === 0) {
        alert('Please add at least one specialty')
        return
      }

      await api.post('/admin/technicians', cleanedData)
      await fetchTechnicians()
      setShowAddForm(false)
      resetForm()
      alert('Technician added successfully!')
    } catch (err: any) {
      console.error('Error adding technician:', err)
      alert(err.message || 'Failed to add technician')
    }
  }

  const handleUpdateTechnician = async () => {
    if (!editingTechnician) return
    
    try {
      const cleanedData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        specialties: formData.specialties.filter(s => s.trim() !== '')
      }

      await api.put(`/admin/technicians/${editingTechnician.id}`, cleanedData)
      await fetchTechnicians()
      setEditingTechnician(null)
      resetForm()
      alert('Technician updated successfully!')
    } catch (err: any) {
      console.error('Error updating technician:', err)
      alert(err.message || 'Failed to update technician')
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      employeeId: '',
      specialties: ['']
    })
  }

  const startEdit = (technician: Technician) => {
    setEditingTechnician(technician)
    setFormData({
      email: technician.email,
      firstName: technician.firstName,
      lastName: technician.lastName,
      phone: technician.phone || '',
      employeeId: technician.employeeId,
      specialties: [...technician.specialties, '']
    })
  }

  const addSpecialtyField = () => {
    setFormData(prev => ({
      ...prev,
      specialties: [...prev.specialties, '']
    }))
  }

  const updateSpecialty = (index: number, value: string) => {
    const newSpecialties = [...formData.specialties]
    newSpecialties[index] = value
    setFormData(prev => ({ ...prev, specialties: newSpecialties }))
  }

  const removeSpecialty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }))
  }

  const filteredTechnicians = technicians.filter(tech => {
    const fullName = `${tech.firstName} ${tech.lastName}`.toLowerCase()
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                         tech.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tech.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSpecialty = !selectedSpecialty || tech.specialties.includes(selectedSpecialty)
    return matchesSearch && matchesSpecialty
  })

  const allSpecialties = Array.from(new Set(technicians.flatMap(t => t.specialties)))

  if (loading && technicians.length === 0) {
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
        <h2 className="text-2xl font-bold text-neutral-900">Technicians Management</h2>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search technicians..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10 w-64"
            />
          </div>
          <select 
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="form-input w-auto"
          >
            <option value="">All Specialties</option>
            {allSpecialties.map(specialty => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>
          <button 
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Technician
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Technicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTechnicians.map((technician) => (
          <div key={technician.id} className="card hover:shadow-lg transition-shadow">
            <div className="card-body">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-neutral-900">
                      {technician.firstName} {technician.lastName}
                    </h3>
                    <p className="text-sm text-neutral-500">{technician.employeeId}</p>
                  </div>
                </div>
                <button
                  onClick={() => startEdit(technician)}
                  className="text-primary-600 hover:text-primary-800"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-neutral-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {technician.email}
                </div>
                {technician.phone && (
                  <div className="flex items-center text-neutral-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {technician.phone}
                  </div>
                )}
                <div className="flex items-start text-neutral-600">
                  <Briefcase className="h-4 w-4 mr-2 mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {technician.specialties.map((specialty, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {technician.rating !== undefined && (
                <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                    <span className="text-sm font-medium">{technician.rating.toFixed(1)}</span>
                  </div>
                  {technician.completedJobs !== undefined && (
                    <span className="text-sm text-neutral-500">{technician.completedJobs} jobs completed</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTechnicians.length === 0 && !loading && (
        <div className="text-center py-12 bg-neutral-50 rounded-lg">
          <User className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900">No Technicians Found</h3>
          <p className="text-neutral-500 mt-2">
            {searchQuery || selectedSpecialty ? 'No technicians match your current filters.' : 'No technicians have been added yet.'}
          </p>
        </div>
      )}

      {/* Add/Edit Technician Modal */}
      {(showAddForm || editingTechnician) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {editingTechnician ? 'Edit Technician' : 'Add New Technician'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingTechnician(null)
                    resetForm()
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="form-input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="form-input w-full"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="form-input w-full"
                    disabled={!!editingTechnician}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="form-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                      className="form-input w-full"
                      disabled={!!editingTechnician}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialties *</label>
                  {formData.specialties.map((specialty, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={specialty}
                        onChange={(e) => updateSpecialty(index, e.target.value)}
                        className="form-input flex-1"
                        placeholder="e.g., Boiler Installation"
                      />
                      {formData.specialties.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSpecialty(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSpecialtyField}
                    className="text-sm text-primary-600 hover:text-primary-800"
                  >
                    + Add Specialty
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingTechnician(null)
                    resetForm()
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={editingTechnician ? handleUpdateTechnician : handleAddTechnician}
                  className="btn-primary"
                >
                  {editingTechnician ? 'Update' : 'Add'} Technician
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
