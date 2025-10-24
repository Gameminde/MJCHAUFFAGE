'use client'

import { CustomersManagement } from '@/components/admin/CustomersManagement'

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Customers Management</h2>
        <p className="text-gray-600 mt-1">
          View customer profiles, order history, and analytics
        </p>
      </div>
      <CustomersManagement />
    </div>
  )
}
