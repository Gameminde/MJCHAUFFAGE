
'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { CheckCircle } from 'lucide-react'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams ? searchParams.get('orderId') : null
  const locale = useLocale()

  if (!orderId) {
    // Redirect to home if orderId is missing
    if (typeof window !== 'undefined') {
      router.push('/')
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          شكراً لطلبكم! / Merci pour votre commande !
        </h1>
        <p className="text-gray-600 mb-6">
          تم استلام طلبكم بنجاح. سيتم التواصل معكم قريباً لتأكيد التوصيل.
          <br />
          Votre commande a été reçue avec succès. Nous vous contacterons bientôt pour confirmer la livraison.
        </p>
        <div className="bg-gray-100 rounded-md p-4 mb-8">
          <p className="text-lg font-medium text-gray-800">
            رقم الطلب / Numéro de commande : <span className="text-primary-600">{orderId}</span>
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">
            الخطوات التالية / Prochaines étapes
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• سيتصل بكم فريق التوصيل خلال 24 ساعة</li>
            <li>• Notre équipe vous contactera dans les 24 heures</li>
            <li>• الدفع نقداً عند الاستلام</li>
            <li>• Paiement en espèces à la livraison</li>
          </ul>
        </div>

        <div className="space-x-4">
          <Link
            href={`/${locale}/products`}
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors"
          >
            متابعة التسوق / Continuer les achats
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  const locale = useLocale()
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
