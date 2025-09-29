'use client'

export function TechniciansManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">Technicians Management</h2>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search technicians..."
            className="form-input w-64"
          />
          <select className="form-input w-auto">
            <option value="">All Specialties</option>
            <option value="Boiler Installation">Boiler Installation</option>
            <option value="Heat Pump Service">Heat Pump Service</option>
            <option value="System Maintenance">System Maintenance</option>
            <option value="Emergency Repair">Emergency Repair</option>
          </select>
          <button className="btn-primary">
            Add Technician
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-neutral-900">Technicians Management</h3>
            <p className="text-neutral-500 mt-2">
              Complete technician management interface will be implemented here.
              Features include technician profiles, schedules, availability, performance tracking, and assignment management.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}