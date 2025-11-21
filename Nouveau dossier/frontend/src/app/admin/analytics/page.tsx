'use client'

import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard'

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <p className="text-gray-600 mt-1">
          Track sales performance, customer behavior, and business metrics
        </p>
      </div>
      <AnalyticsDashboard />
    </div>
  )
}
