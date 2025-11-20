'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { CheckCircle, Package, Truck, Phone, MapPin, Calendar } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'

interface OrderDetails {
  orderNumber: string
  total: number
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  shippingAddress?: {
    street: string
    city: string
    postalCode?: string
    region?: string
  }
  createdAt: string
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const locale = useLocale()
  const orderNumber = searchParams ? searchParams.get('orderNumber') : null
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!orderNumber) {
      // Redirect to home if orderNumber is missing
      if (typeof window !== 'undefined') {
        router.push('/')
      }
      return
    }

    // Try to fetch order details if available
    // This is optional - we can show success even without details
    setLoading(false)
  }, [orderNumber, router])

  if (!orderNumber) {
    return null
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            {locale === 'ar' ? 'شكراً لطلبكم!' : 'Merci pour votre commande !'}
          </h1>
          <p className="text-lg text-neutral-600 mb-6">
            {locale === 'ar' 
              ? 'تم استلام طلبكم بنجاح. سيتم التواصل معكم قريباً لتأكيد التوصيل.'
              : 'Votre commande a été reçue avec succès. Nous vous contacterons bientôt pour confirmer la livraison.'}
          </p>
          
          {/* Order Number */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-200 rounded-xl p-6 mb-6">
            <p className="text-sm text-neutral-600 mb-2">
              {locale === 'ar' ? 'رقم الطلب' : 'Numéro de commande'}
            </p>
            <p className="text-2xl md:text-3xl font-bold text-primary-700 font-mono">
              {orderNumber}
            </p>
          </div>

          {/* Order Tracking Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-4 flex items-center justify-center gap-2">
              <Package className="w-5 h-5" />
              {locale === 'ar' ? 'معلومات التتبع' : 'Suivi de commande'}
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              {locale === 'ar'
                ? 'يمكنك تتبع حالة طلبك باستخدام رقم الطلب ورقم هاتفك'
                : 'Vous pouvez suivre l\'état de votre commande en utilisant le numéro de commande et votre numéro de téléphone'}
            </p>
            <Link
              href={`/${locale}/track-order?orderNumber=${orderNumber}`}
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {locale === 'ar' ? 'تتبع الطلب' : 'Suivre ma commande'}
            </Link>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary-600" />
            {locale === 'ar' ? 'الخطوات التالية' : 'Prochaines étapes'}
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Phone className="w-4 h-4 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900 mb-1">
                  {locale === 'ar' ? '1. الاتصال' : '1. Contact'}
                </h3>
                <p className="text-sm text-neutral-600">
                  {locale === 'ar'
                    ? 'سيتصل بكم فريق التوصيل خلال 24 ساعة لتأكيد العنوان وموعد التوصيل'
                    : 'Notre équipe vous contactera dans les 24 heures pour confirmer l\'adresse et le moment de la livraison'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Package className="w-4 h-4 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900 mb-1">
                  {locale === 'ar' ? '2. التحضير' : '2. Préparation'}
                </h3>
                <p className="text-sm text-neutral-600">
                  {locale === 'ar'
                    ? 'سيتم تحضير طلبك وتجهيزه للشحن'
                    : 'Votre commande sera préparée et expédiée'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Truck className="w-4 h-4 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900 mb-1">
                  {locale === 'ar' ? '3. التوصيل' : '3. Livraison'}
                </h3>
                <p className="text-sm text-neutral-600">
                  {locale === 'ar'
                    ? 'سيتم توصيل طلبك إلى العنوان المحدد. الدفع نقداً عند الاستلام'
                    : 'Votre commande sera livrée à l\'adresse indiquée. Paiement en espèces à la livraison'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary-600" />
            {locale === 'ar' ? 'معلومات الدفع' : 'Informations de paiement'}
          </h2>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>{locale === 'ar' ? 'ملاحظة:' : 'Note:'}</strong>{' '}
              {locale === 'ar'
                ? 'الدفع نقداً عند الاستلام. سيتم الاتصال بك لتأكيد المبلغ الإجمالي قبل التوصيل.'
                : 'Paiement en espèces à la livraison. Vous serez contacté pour confirmer le montant total avant la livraison.'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/${locale}/products`}
            className="flex-1 bg-primary-600 text-white px-6 py-4 rounded-xl hover:bg-primary-700 transition-colors text-center font-semibold shadow-lg"
          >
            {locale === 'ar' ? 'متابعة التسوق' : 'Continuer les achats'}
          </Link>
          <Link
            href={`/${locale}/track-order?orderNumber=${orderNumber}`}
            className="flex-1 bg-neutral-200 text-neutral-800 px-6 py-4 rounded-xl hover:bg-neutral-300 transition-colors text-center font-semibold"
          >
            {locale === 'ar' ? 'تتبع الطلب' : 'Suivre ma commande'}
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-600 mb-2">
            {locale === 'ar' ? 'تحتاج مساعدة؟' : 'Besoin d\'aide ?'}
          </p>
          <a
            href="tel:0774102255"
            className="text-primary-600 hover:text-primary-700 font-semibold text-lg"
          >
            0774 102 255
          </a>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  const locale = useLocale()
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
