
'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('orderId')

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
          Merci pour votre commande !
        </h1>
        <p className="text-gray-600 mb-6">
          Votre commande a été passée avec succès. Vous recevrez bientôt un email de confirmation.
        </p>
        <div className="bg-gray-100 rounded-md p-4 mb-8">
          <p className="text-lg font-medium text-gray-800">
            Numéro de commande : <span className="text-primary-600">{orderId}</span>
          </p>
        </div>
        <div className="space-x-4">
          <Link
            href="/products"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors"
          >
            Continuer les achats
          </Link>
          <Link
            href="/dashboard/orders"
            className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors"
          >
            Voir mes commandes
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
