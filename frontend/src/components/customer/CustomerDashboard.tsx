'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  User,
  ShoppingBag,
  Calendar,
  Heart,
  Settings,
  LogOut,
  Package,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Edit,
  ChevronRight,
} from 'lucide-react'
import { formatCurrency } from '@/lib/i18n'

interface CustomerDashboardProps {
  locale: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    address?: string
  }
}

type DashboardSection = 'overview' | 'orders' | 'services' | 'profile' | 'addresses' | 'favorites'

export function CustomerDashboard({ locale, user }: CustomerDashboardProps) {
  const t = useTranslations('dashboard')
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview')
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    recentOrders: [],
    upcomingServices: [],
  })

  const isRTL = locale === 'ar'

  const sidebarItems = [
    { id: 'overview', icon: User, label: t('overview') },
    { id: 'orders', icon: ShoppingBag, label: t('orders') },
    { id: 'services', icon: Calendar, label: t('services') },
    { id: 'favorites', icon: Heart, label: t('favorites') },
    { id: 'addresses', icon: MapPin, label: t('addresses') },
    { id: 'profile', icon: Settings, label: t('profile') },
  ]

  useEffect(() => {
    // Fetch user stats and data
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // TODO: Implement API calls
      setStats({
        totalOrders: 12,
        totalSpent: 125000,
        recentOrders: [],
        upcomingServices: [],
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('welcome', { name: user.firstName })}
        </h1>
        <p className="text-gray-600">{t('dashboardSubtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-primary-600" />
            </div>
            <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
              <p className="text-sm text-gray-600">{t('totalOrders')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-secondary-600" />
            </div>
            <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
              <p className="text-sm text-gray-600">{t('totalSpent')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalSpent, locale as 'fr' | 'ar')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <Calendar className="h-6 w-6 text-success-600" />
            </div>
            <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
              <p className="text-sm text-gray-600">{t('upcomingServices')}</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('recentOrders')}
          </h2>
          <div className="space-y-4">
            {/* Sample order items */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
              <div>
                <p className="font-medium text-gray-900">#ORD-001234</p>
                <p className="text-sm text-gray-600">{t('orderDate')}: 15/01/2024</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatCurrency(45000, locale as 'fr' | 'ar')}
                </p>
                <span className="inline-flex px-2 py-1 text-xs font-medium bg-success-100 text-success-800 rounded-full">
                  {t('delivered')}
                </span>
              </div>
            </div>
          </div>
          <button className="w-full mt-4 text-center text-primary-600 hover:text-primary-700 font-medium">
            {t('viewAllOrders')}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('upcomingServices')}
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
              <div>
                <p className="font-medium text-gray-900">{t('maintenanceService')}</p>
                <p className="text-sm text-gray-600">25/01/2024 - 14:00</p>
              </div>
              <div className="text-right">
                <span className="inline-flex px-2 py-1 text-xs font-medium bg-warning-100 text-warning-800 rounded-full">
                  {t('scheduled')}
                </span>
              </div>
            </div>
          </div>
          <button className="w-full mt-4 text-center text-primary-600 hover:text-primary-700 font-medium">
            {t('viewAllServices')}
          </button>
        </div>
      </div>
    </div>
  )

  const renderProfile = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('profile')}</h1>
        <p className="text-gray-600">{t('manageProfile')}</p>
      </div>

      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t('personalInfo')}</h2>
          <button className="flex items-center text-primary-600 hover:text-primary-700">
            <Edit className="h-4 w-4 mr-1" />
            {t('edit')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('firstName')}
            </label>
            <p className="text-gray-900">{user.firstName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('lastName')}
            </label>
            <p className="text-gray-900">{user.lastName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('email')}
            </label>
            <div className="flex items-center">
              <Mail className="h-4 w-4 text-gray-400 mr-2" />
              <p className="text-gray-900">{user.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('phone')}
            </label>
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-gray-400 mr-2" />
              <p className="text-gray-900">{user.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview()
      case 'profile':
        return renderProfile()
      case 'orders':
        return <div className="p-6">Orders Section - {t('comingSoon')}</div>
      case 'services':
        return <div className="p-6">Services Section - {t('comingSoon')}</div>
      case 'favorites':
        return <div className="p-6">Favorites Section - {t('comingSoon')}</div>
      case 'addresses':
        return <div className="p-6">Addresses Section - {t('comingSoon')}</div>
      default:
        return renderOverview()
    }
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="text-xl font-bold text-primary-600">MJ CHAUFFAGE</div>
          </div>

          <nav className="mt-6">
            <div className="px-3">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as DashboardSection)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg mb-1 transition-colors ${
                    activeSection === item.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  {item.label}
                  {activeSection === item.id && (
                    <ChevronRight className={`h-4 w-4 ${isRTL ? 'mr-auto' : 'ml-auto'}`} />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-8 px-3">
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                {t('logout')}
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}