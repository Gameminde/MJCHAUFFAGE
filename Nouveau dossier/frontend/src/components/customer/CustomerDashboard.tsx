'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useAuth } from '@/contexts/AuthContext'
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
  Plus,
  Trash2,
  Clock,
  Menu,
  X
} from 'lucide-react'
import { formatCurrency } from '@/lib/i18n'
import { Product } from '@/services/productService'
import { ModernProductCard } from '@/components/products/ModernProductCard'
import { Button } from '@/components/ui/Button'

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

// Mock Data for development
const MOCK_FAVORITES: Product[] = [
  {
    id: '1',
    name: 'Chaudière Murale Gaz',
    slug: 'chaudiere-murale-gaz',
    sku: 'CH-GAZ-001',
    description: 'Chaudière haute performance',
    shortDescription: 'Chaudière gaz',
    price: 125000,
    salePrice: null,
    stockQuantity: 10,
    weight: 25,
    dimensions: null,
    specifications: {},
    features: [],
    images: [{ id: '1', url: '/chaudiere-a-gaz-1024x683-removebg-preview.png', altText: 'Chaudière' }],
    category: { id: '1', name: 'Chaudières', slug: 'chaudieres' },
    manufacturer: { id: '1', name: 'Saunier Duval', slug: 'saunier-duval' },
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

import AppointmentModal from '@/components/services/AppointmentModal'

export function CustomerDashboard({ locale, user }: CustomerDashboardProps) {
  const t = useTranslations('dashboard')
  const router = useRouter()
  const { logout } = useAuth()
  const { data: session } = useSession()
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
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


  const [orders, setOrders] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [addresses, setAddresses] = useState<any[]>([])
  const [favorites, setFavorites] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add Authorization header if we have a session access token (for social login)
      const accessToken = (session?.user as any)?.accessToken;
      if (accessToken) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
      }

      // Fetch Orders
      try {
        const ordersRes = await fetch(`${apiUrl}/orders`, { 
          credentials: 'include',
          headers 
        });
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          // Check structure based on AdminController response which is { data: { orders: [], pagination: {} } }
          // Customer order controller might be different. Let's assume it returns { data: [] } or { data: { orders: [] } }
          setOrders(data.data?.orders || (Array.isArray(data.data) ? data.data : []) || []);
          
          // Calculate stats from orders
          const ordersList = data.data?.orders || (Array.isArray(data.data) ? data.data : []) || [];
          const totalSpent = ordersList.reduce((sum: number, order: any) => sum + Number(order.totalAmount || 0), 0);
          
          setStats(prev => ({
            ...prev,
            totalOrders: ordersList.length,
            totalSpent: totalSpent,
            recentOrders: ordersList.slice(0, 5)
          }));
        }
      } catch (e) {
        console.error('Failed to fetch orders', e);
      }

          // Fetch Services
          try {
            const servicesRes = await fetch(`${apiUrl}/services/requests`, { 
              credentials: 'include',
              headers
            });
            if (servicesRes.ok) {
              const data = await servicesRes.json();
              // Handle structured response { data: { serviceRequests: [] } } or direct array
              const servicesList = data.data?.serviceRequests || (Array.isArray(data.data) ? data.data : []) || [];
              
              setServices(servicesList);
              
              // Update upcoming services stats
              const upcoming = servicesList.filter((s: any) => 
                ['PENDING', 'SCHEDULED', 'IN_PROGRESS'].includes(s.status)
              );
              
              setStats(prev => ({
                ...prev,
                upcomingServices: upcoming.slice(0, 5)
              }));
            }
          } catch (e) {
            console.error('Failed to fetch services', e);
          }

      // Fetch Addresses (via Profile)
      try {
        const profileRes = await fetch(`${apiUrl}/customers/profile/me`, { 
          credentials: 'include',
          headers
        });
        if (profileRes.ok) {
          const data = await profileRes.json();
          if (data.data && data.data.addresses) {
            setAddresses(data.data.addresses);
          } else if (data.data && data.data.customer && data.data.customer.addresses) {
             setAddresses(data.data.customer.addresses);
          }
        }
      } catch (e) {
        console.error('Failed to fetch profile', e);
      }
      
      // Favorites - Mock for now as no endpoint exists
      setFavorites(MOCK_FAVORITES);

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push(`/${locale}`)
  }

  const handlePlaceholderAction = (action: string) => {
    console.log(`Action triggered: ${action}`)
    // Could add a toast notification here
  }

  const renderStatusBadge = (status: string) => {
    const styles = {
      delivered: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      scheduled: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    const statusKey = `status_${status}` as any;
    // Fallback for untranslated status or specific keys
    const label = t(statusKey) === statusKey ? status : t(statusKey); 

    return (
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {label}
      </span>
    )
  }

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('orders')}</h1>
      </div>
      
      {orders.length > 0 ? (
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('orderNumber')}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('date')}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('status')}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('total')}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber || order.id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString(locale)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(order.totalAmount, locale as 'fr' | 'ar')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => handlePlaceholderAction(`View details for order ${order.id}`)}
                        className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                      >
                        {t('viewDetails')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-card">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noOrders')}</h3>
          <div className="mt-6">
            <Button onClick={() => router.push(`/${locale}/products`)}>
              {t('browseProducts')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  const handleBookService = () => {
    setIsAppointmentModalOpen(true)
  }

  const renderServices = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('services')}</h1>
        <Button size="sm" className="hidden sm:flex" onClick={handleBookService}>
          <Plus className="w-4 h-4 mr-2" />
          {t('bookService')}
        </Button>
      </div>

      {services.length > 0 ? (
        <div className="grid gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-xl shadow-card p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${service.serviceType?.name?.toLowerCase().includes('maintenance') ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {service.serviceType?.name || service.serviceTypeId}
                      {service.description && <span className="text-gray-500 font-normal"> - {service.description.substring(0, 50)}{service.description.length > 50 ? '...' : ''}</span>}
                    </h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(service.requestedDate).toLocaleDateString(locale)}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {service.technician ? `${service.technician.firstName} ${service.technician.lastName}` : t('status_pending')}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-4">
                  {renderStatusBadge(service.status)}
                  <button 
                    onClick={() => handlePlaceholderAction(`View details for service ${service.id}`)}
                    className="text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-card">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noServices')}</h3>
          <div className="mt-6">
            <Button onClick={handleBookService}>
              {t('bookService')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  const renderFavorites = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('favorites')}</h1>
      
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((product) => (
            <ModernProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-card">
          <Heart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noFavorites')}</h3>
          <div className="mt-6">
            <Button onClick={() => router.push(`/${locale}/products`)}>
              {t('browseProducts')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  const renderAddresses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('addresses')}</h1>
        <Button size="sm" onClick={() => handlePlaceholderAction('Add New Address')}>
          <Plus className="w-4 h-4 mr-2" />
          {t('addNewAddress')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((address) => (
          <div key={address.id} className="bg-white rounded-xl shadow-card p-6 border border-gray-100 relative group hover:border-primary-200 transition-colors">
            {address.isDefault && (
              <span className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full font-medium`}>
                {t('defaultAddress')}
              </span>
            )}
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{address.label || address.type}</h3>
                <p className="text-gray-600 mt-1 text-sm">{address.street}</p>
                <p className="text-gray-600 text-sm">{address.city} {address.postalCode ? `, ${address.postalCode}` : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50">
              <button 
                onClick={() => handlePlaceholderAction(`Edit address ${address.id}`)}
                className="flex items-center text-sm text-gray-600 hover:text-primary-600 font-medium transition-colors"
              >
                <Edit className="w-4 h-4 mr-1" />
                {t('edit')}
              </button>
              <button 
                onClick={() => handlePlaceholderAction(`Delete address ${address.id}`)}
                className="flex items-center text-sm text-gray-600 hover:text-red-600 font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {t('delete')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

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
        <div className="bg-white rounded-xl shadow-card p-6 border border-gray-50">
          <div className="flex items-center">
            <div className="p-3 bg-primary-50 rounded-xl">
              <ShoppingBag className="h-6 w-6 text-primary-600" />
            </div>
            <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
              <p className="text-sm font-medium text-gray-500">{t('totalOrders')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6 border border-gray-50">
          <div className="flex items-center">
            <div className="p-3 bg-secondary-50 rounded-xl">
              <CreditCard className="h-6 w-6 text-secondary-600" />
            </div>
            <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
              <p className="text-sm font-medium text-gray-500">{t('totalSpent')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalSpent, locale as 'fr' | 'ar')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6 border border-gray-50">
          <div className="flex items-center">
            <div className="p-3 bg-success-50 rounded-xl">
              <Calendar className="h-6 w-6 text-success-600" />
            </div>
            <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
              <p className="text-sm font-medium text-gray-500">{t('upcomingServices')}</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-card p-6 border border-gray-50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">
            {t('recentOrders')}
          </h2>
            <button 
              onClick={() => setActiveSection('orders')}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              {t('viewAllOrders')}
            </button>
          </div>
          <div className="space-y-4">
            {/* Sample order items */}
            <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
              <div>
                <p className="font-medium text-gray-900">#ORD-001234</p>
                <p className="text-sm text-gray-500">{t('orderDate')}: 15/01/2024</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">
                  {formatCurrency(45000, locale as 'fr' | 'ar')}
                </p>
                <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full mt-1">
                  {t('delivered')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6 border border-gray-50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">
            {t('upcomingServices')}
          </h2>
            <button 
              onClick={() => setActiveSection('services')}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              {t('viewAllServices')}
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                  <Calendar className="w-5 h-5" />
                </div>
              <div>
                <p className="font-medium text-gray-900">{t('maintenanceService')}</p>
                  <p className="text-sm text-gray-500">25/01/2024 - 14:00</p>
                </div>
              </div>
              <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  {t('scheduled')}
                </span>
            </div>
          </div>
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

      <div className="bg-white rounded-xl shadow-card p-8 border border-gray-50">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" />
            {t('personalInfo')}
          </h2>
          <Button variant="outline" size="sm" onClick={() => handlePlaceholderAction('Edit Profile')}>
            <Edit className="h-4 w-4 mr-2" />
            {t('edit')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500">
              {t('firstName')}
            </label>
            <p className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">{user.firstName}</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500">
              {t('lastName')}
            </label>
            <p className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">{user.lastName}</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500">
              {t('email')}
            </label>
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <p className="text-base font-semibold text-gray-900">{user.email}</p>
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500">
              {t('phone')}
            </label>
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <p className="text-base font-semibold text-gray-900">{user.phone}</p>
              <Phone className="h-4 w-4 text-gray-400" />
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
        return renderOrders()
      case 'services':
        return renderServices()
      case 'favorites':
        return renderFavorites()
      case 'addresses':
        return renderAddresses()
      default:
        return renderOverview()
    }
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm sticky top-[80px] z-30 px-4 py-4 flex items-center justify-between border-t border-gray-100">
        <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
          {sidebarItems.find(i => i.id === activeSection)?.label}
        </h2>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[140px] bg-white shadow-lg z-20 border-b border-gray-200 p-4 animate-slideDown">
          <div className="grid grid-cols-2 gap-3">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id as DashboardSection)
                  setIsMobileMenuOpen(false)
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                  activeSection === item.id
                    ? 'bg-primary-50 border-primary-200 text-primary-700 shadow-sm'
                    : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="col-span-2 flex flex-col items-center justify-center p-4 rounded-xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 transition-all"
            >
              <LogOut className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">{t('logout')}</span>
            </button>
          </div>
        </div>
      )}

      <div className="container-modern mx-auto py-8 px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white shadow-card rounded-2xl overflow-hidden sticky top-24">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-xl">
                    {user.firstName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{user.email}</p>
                  </div>
                </div>
          </div>

              <nav className="p-4 space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as DashboardSection)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    activeSection === item.id
                        ? 'bg-primary-50 text-primary-700 shadow-sm translate-x-1'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1'
                  }`}
                >
                    <item.icon className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'} ${activeSection === item.id ? 'text-primary-600' : 'text-gray-400'}`} />
                  {item.label}
                  {activeSection === item.id && (
                      <ChevronRight className={`h-4 w-4 ${isRTL ? 'mr-auto' : 'ml-auto'} text-primary-400`} />
                  )}
                </button>
              ))}
              </nav>

              <div className="p-4 border-t border-gray-100 mt-2">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                <LogOut className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                {t('logout')}
              </button>
              </div>
            </div>
        </div>

        {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="animate-fadeIn">
          {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Modal */}
      {isAppointmentModalOpen && (
        <AppointmentModal
          isOpen={isAppointmentModalOpen}
          onClose={() => {
            setIsAppointmentModalOpen(false)
            // Refresh data after booking
            fetchDashboardData()
          }}
          selectedService={null}
          services={[]}
          locale={locale}
        />
      )}
    </div>
  )
}
