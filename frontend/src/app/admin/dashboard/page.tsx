'use client'

import { DashboardOverview } from '@/components/admin/DashboardOverview'

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600 mt-1">
          Welcome to the MJ CHAUFFAGE administration panel
        </p>
      </div>
      <DashboardOverview />
    </div>
  )
}


