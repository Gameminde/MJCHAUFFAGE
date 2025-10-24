import { DashboardOverview } from '@/components/admin/DashboardOverview'
import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import { RealtimeStatus } from '@/components/admin/RealtimeStatus'

export default function AdminPage() {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Simple Admin Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">MJ Admin Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <RealtimeStatus />
                <a 
                  href="/"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ← Back to Site
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            <DashboardOverview />
          </div>
        </main>
      </div>
    </AdminAuthGuard>
  )
}
