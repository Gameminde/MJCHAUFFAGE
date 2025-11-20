'use client'

import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { useLocale } from 'next-intl'
import { Search, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

function TrackOrderContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const locale = useLocale()
  const initialOrderNumber = searchParams?.get('orderNumber') || ''
  
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber)
  const [phone, setPhone] = useState('')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!orderNumber.trim() || !phone.trim()) {
      setError(locale === 'ar' ? 'يرجى إدخال رقم الطلب ورقم الهاتف' : 'Veuillez entrer le numéro de commande et le numéro de téléphone')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Order not found')
      }

      const result = await response.json()
      
      if (result.success && result.data?.order) {
        setOrder(result.data.order)
      } else {
        throw new Error('Order not found')
      }
    } catch (err) {
      setError(
        err instanceof Error 
          ? err.message 
          : (locale === 'ar' ? 'لم يتم العثور على الطلب' : 'Commande introuvable')
      )
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'delivered' || statusLower === 'livrée') return 'text-green-600 bg-green-100'
    if (statusLower === 'shipped' || statusLower === 'expédiée') return 'text-blue-600 bg-blue-100'
    if (statusLower === 'processing' || statusLower === 'en traitement') return 'text-purple-600 bg-purple-100'
    if (statusLower === 'cancelled' || statusLower === 'annulée') return 'text-red-600 bg-red-100'
    return 'text-yellow-600 bg-yellow-100'
  }

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'delivered' || statusLower === 'livrée') return CheckCircle
    if (statusLower === 'shipped' || statusLower === 'expédiée') return Truck
    if (statusLower === 'cancelled' || statusLower === 'annulée') return XCircle
    return Clock
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            {locale === 'ar' ? 'تتبع الطلب' : 'Suivre ma commande'}
          </h1>
          <p className="text-lg text-neutral-600">
            {locale === 'ar'
              ? 'أدخل رقم الطلب ورقم هاتفك لمتابعة حالة طلبك'
              : 'Entrez votre numéro de commande et votre numéro de téléphone pour suivre l\'état de votre commande'}
          </p>
        </div>

        {/* Track Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {locale === 'ar' ? 'رقم الطلب' : 'Numéro de commande'}
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={locale === 'ar' ? 'مثال: ORD-2024-001' : 'Ex: ORD-2024-001'}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {locale === 'ar' ? 'رقم الهاتف' : 'Numéro de téléphone'}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={locale === 'ar' ? 'مثال: 0555123456' : 'Ex: 0555123456'}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {locale === 'ar' ? 'جاري البحث...' : 'Recherche en cours...'}
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  {locale === 'ar' ? 'تتبع الطلب' : 'Suivre la commande'}
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">
                {locale === 'ar' ? 'تفاصيل الطلب' : 'Détails de la commande'}
              </h2>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${getStatusColor(order.status)}`}>
                {(() => {
                  const StatusIcon = getStatusIcon(order.status)
                  return <StatusIcon className="w-4 h-4" />
                })()}
                {order.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-neutral-600 mb-1">
                  {locale === 'ar' ? 'رقم الطلب' : 'Numéro de commande'}
                </p>
                <p className="font-semibold text-lg">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">
                  {locale === 'ar' ? 'تاريخ الطلب' : 'Date de commande'}
                </p>
                <p className="font-semibold text-lg">
                  {new Date(order.orderDate || order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">
                  {locale === 'ar' ? 'المجموع' : 'Total'}
                </p>
                <p className="font-semibold text-lg">
                  {new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
                    style: 'currency',
                    currency: 'DZD',
                  }).format(order.totalAmount || 0)}
                </p>
              </div>
              {order.trackingNumber && (
                <div>
                  <p className="text-sm text-neutral-600 mb-1">
                    {locale === 'ar' ? 'رقم التتبع' : 'Numéro de suivi'}
                  </p>
                  <p className="font-semibold text-lg">{order.trackingNumber}</p>
                </div>
              )}
            </div>

            {/* Items */}
            {order.items && order.items.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  {locale === 'ar' ? 'المنتجات' : 'Produits'}
                </h3>
                <div className="space-y-2">
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName || 'Produit'}</p>
                        <p className="text-sm text-neutral-600">
                          {locale === 'ar' ? 'الكمية' : 'Quantité'}: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-FR', {
                          style: 'currency',
                          currency: 'DZD',
                        }).format(item.totalPrice || 0)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  {locale === 'ar' ? 'عنوان التوصيل' : 'Adresse de livraison'}
                </h3>
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}
                    {order.shippingAddress.postalCode && `, ${order.shippingAddress.postalCode}`}
                  </p>
                  {order.shippingAddress.region && (
                    <p>{order.shippingAddress.region}</p>
                  )}
                  <p>{order.shippingAddress.country || 'Algeria'}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  )
}

