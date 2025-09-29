'use client'

export function InventoryManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">Inventory Management</h2>
        <div className="flex space-x-4">
          <select className="form-input w-auto">
            <option value="">All Products</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
            <option value="overstocked">Overstocked</option>
          </select>
          <button className="btn-primary">
            Stock Adjustment
          </button>
        </div>
      </div>

      {/* Inventory Alerts */}
      <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-warning-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-warning-800 font-medium">8 products are running low on stock</span>
          <button className="ml-auto text-warning-600 hover:text-warning-800 text-sm font-medium">
            View Details
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <h3 className="text-lg font-medium text-neutral-900">Inventory Management</h3>
            <p className="text-neutral-500 mt-2">
              Complete inventory management interface will be implemented here.
              Features include stock tracking, reorder alerts, supplier management, and inventory analytics.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}