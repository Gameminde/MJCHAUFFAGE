'use client'

import { ProductsManagement } from '@/components/admin/ProductsManagement'

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
        <p className="text-gray-600 mt-1">
          Manage your product catalog, inventory, and pricing
        </p>
      </div>
      <ProductsManagement />
    </div>
  )
}
