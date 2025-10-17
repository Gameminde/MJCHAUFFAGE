'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { useLanguage } from '@/hooks/useLanguage'
import { ShoppingCart } from '@/components/cart/ShoppingCart'
import { ShoppingBag } from 'lucide-react'

export function CartButton() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { itemCount, total, formatPrice } = useCart()
  const { t } = useLanguage()

  return (
    <>
      <button
        onClick={() => setIsCartOpen(true)}
        className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
        aria-label={t('cart.openCart')}
      >
        <ShoppingBag className="h-6 w-6" />
        
        {/* Item Count Badge */}
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>

      {/* Cart Total (Desktop) */}
      {total > 0 && (
        <div className="hidden md:flex flex-col items-end ml-2">
          <span className="text-xs text-gray-500">{t('cart.total')}</span>
          <span className="text-sm font-medium text-gray-900">
            {formatPrice(total)}
          </span>
        </div>
      )}

      {/* Shopping Cart Sidebar */}
      <ShoppingCart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </>
  )
}
