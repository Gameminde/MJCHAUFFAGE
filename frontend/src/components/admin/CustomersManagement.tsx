'use client'

export function CustomersManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">Customers Management</h2>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search customers..."
            className="form-input w-64"
          />
          <select className="form-input w-auto">
            <option value="">All Types</option>
            <option value="B2B">B2B</option>
            <option value="B2C">B2C</option>
          </select>
          <button className="btn-primary">
            Export Customers
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="text-lg font-medium text-neutral-900">Customer Management</h3>
            <p className="text-neutral-500 mt-2">
              Complete customer management interface will be implemented here.
              Features include customer profiles, order history, service requests, and customer analytics.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}