'use client'

import { ModernCheckoutForm as CheckoutForm } from '@/components/checkout/ModernCheckoutForm'
import { useCart } from '@/hooks/useCart'
import { Metadata } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Props {
  params: { locale: string }
}

export default function CheckoutPage({ params: { locale } }: Props) {
  const { items, itemCount } = useCart()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect to cart if empty (but allow navigation to success page)
  useEffect(() => {
    if (mounted && itemCount === 0 && !window.location.pathname.includes('/checkout/success')) {
      router.push(`/${locale}/cart`)
    }
  }, [mounted, itemCount, router, locale])

  // Show nothing or loading state during SSR/Hydration to avoid mismatch
  if (!mounted) {
    return <div className="min-h-screen bg-gray-50" />
  }

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            سلة التسوق فارغة | Panier vide
          </h2>
          <p className="text-gray-600 mb-6">
            أضف بعض المنتجات لبدء التسوق | Ajoutez des produits pour commencer vos achats
          </p>
          <button
            onClick={() => router.push(`/${locale}/products`)}
            className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors"
          >
            تصفح المنتجات | Parcourir les produits
          </button>
        </div>
      </div>
    )
  }

  return (
    <CheckoutForm />
  )
}
