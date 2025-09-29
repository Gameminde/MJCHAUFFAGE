import { CustomersManagement } from '@/components/admin/CustomersManagement'

export default function AdminCustomersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Customers Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/admin"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back to Dashboard
              </a>
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
          <CustomersManagement />
        </div>
      </main>
    </div>
  )
}
