'use client'

import { useState } from 'react'
import { DashboardOverview } from './DashboardOverview'
import { OrdersManagement } from './OrdersManagement'
import { CustomersManagement } from './CustomersManagement'
import { ProductsManagement } from './ProductsManagement'
import { ServicesManagement } from './ServicesManagement'
import { TechniciansManagement } from './TechniciansManagement'
import { AnalyticsDashboard } from './AnalyticsDashboard'
import { InventoryManagement } from './InventoryManagement'
import { SystemSettings } from './SystemSettings'

type AdminSection = 
  | 'dashboard'
  | 'orders'
  | 'customers'
  | 'products'
  | 'services'
  | 'technicians'
  | 'analytics'
  | 'inventory'
  | 'settings'

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard')

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview />
      case 'orders':
        return <OrdersManagement />
      case 'customers':
        return <CustomersManagement />
      case 'products':
        return <ProductsManagement />
      case 'services':
        return <ServicesManagement />
      case 'technicians':
        return <TechniciansManagement />
      case 'analytics':
        return <AnalyticsDashboard />
      case 'inventory':
        return <InventoryManagement />
      case 'settings':
        return <SystemSettings />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {(['dashboard', 'orders', 'customers', 'products', 'services', 'technicians', 'analytics', 'inventory', 'settings'] as AdminSection[]).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                activeSection === section
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  )
}