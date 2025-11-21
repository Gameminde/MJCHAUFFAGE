'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext'

// ✅ Import admin styles to prevent theme loss
import '@/styles/admin.css'

interface AdminLayoutProps {
  children: React.ReactNode
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { logout, user } = useAdminAuth()

  const handleLogout = async () => {
    await logout()
    router.push('/admin/login')
  }

  // Close mobile sidebar on navigation
  const handleNavigation = (path: string) => {
    router.push(path)
    setIsMobileSidebarOpen(false)
  }

  // Don't apply layout to login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }


  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { id: 'products', label: 'Products', path: '/admin/products', icon: '📦' },
    { id: 'orders', label: 'Orders', path: '/admin/orders', icon: '🛍️' },
    { id: 'customers', label: 'Customers', path: '/admin/customers', icon: '👥' },
    { id: 'services', label: 'Services', path: '/admin/services', icon: '🔧' },
    { id: 'technicians', label: 'Technicians', path: '/admin/technicians', icon: '👷' },
    { id: 'analytics', label: 'Analytics', path: '/admin/analytics', icon: '📈' },
  ]

  return (
    <AdminAuthGuard>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            bg-gray-900 text-white transition-all duration-300
            flex flex-col
            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${isSidebarOpen ? 'w-64' : 'w-20'}
            lg:flex
          `}
        >
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-gray-800 flex-shrink-0">
            {isSidebarOpen ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">MJ</span>
                </div>
                <span className="text-xl font-bold">Admin Panel</span>
              </div>
            ) : (
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">MJ</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.path
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  {isSidebarOpen && <span className="ml-3">{item.label}</span>}
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-gray-800 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
              title={!isSidebarOpen ? 'Logout' : undefined}
            >
              <span className="text-xl">🚪</span>
              {isSidebarOpen && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-4 lg:px-6 flex-shrink-0">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 mr-4"
              aria-label="Open Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Desktop Toggle Sidebar Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 text-gray-600 mr-4"
              aria-label="Toggle Sidebar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <h1 className="text-lg lg:text-xl font-semibold text-gray-800 truncate">
              MJ CHAUFFAGE
            </h1>
            
            <div className="ml-auto flex items-center space-x-2 lg:space-x-4">
              {user && (
                <div className="hidden md:block text-sm text-gray-600">
                  <span className="font-medium">{user.firstName} {user.lastName}</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {user.role}
                  </span>
                </div>
              )}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-blue-600 flex items-center"
              >
                <span className="mr-1">🌐</span>
                <span className="hidden sm:inline">View Website</span>
              </a>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50 w-full">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  )
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  )
}
