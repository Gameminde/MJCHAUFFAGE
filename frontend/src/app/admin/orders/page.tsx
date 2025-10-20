'use client'

import { OrdersManagement } from '@/components/admin/OrdersManagement'

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
        <p className="text-gray-600 mt-1">
          View and manage customer orders, track shipments
        </p>
      </div>
      <OrdersManagement />
    </div>
  )
}
