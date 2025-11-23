'use client'

import { useState, useRef, useEffect } from 'react'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, X, Plus, Minus, ShoppingCart, ExternalLink } from 'lucide-react'

interface MiniCartProps {
  locale?: string
}

export function MiniCart({ locale = 'fr' }: MiniCartProps) {
  const [isOpen, setIsOpen] = useState(false)
  const {
    items,
    total,
    itemCount,
    updateQuantity,
    removeItem,
    formatPrice
  } = useCart()

  const dropdownRef = useRef<HTMLDivElement>(null)
  const isRTL = locale === 'ar'

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId)
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  if (!mounted) {
    return (
      <button className="relative p-2 text-gray-600">
        <ShoppingBag className="h-6 w-6" />
      </button>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md"
        aria-label={locale === 'ar' ? 'فتح سلة التسوق' : 'Ouvrir le panier'}
      >
        <ShoppingBag className="h-6 w-6" />

        {/* Item Count Badge */}
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>

      {/* Cart Total (Desktop) */}
      {total > 0 && (
        <div className="hidden lg:flex flex-col items-end ml-2 absolute top-0 left-full whitespace-nowrap">
          <span className="text-xs text-gray-500">
            {locale === 'ar' ? 'المجموع' : 'Total'}
          </span>
          <span className="text-sm font-medium text-gray-900">
            {formatPrice(total)}
          </span>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 ${isRTL ? 'left-0' : 'right-0'
          }`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {locale === 'ar' ? 'سلة التسوق' : 'Panier'}
                <span className="text-sm text-gray-600 ml-2">({itemCount})</span>
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-6 text-center">
                <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-3">
                  {locale === 'ar' ? 'سلة التسوق فارغة' : 'Votre panier est vide'}
                </p>
                <Link
                  href={`/${locale}/products`}
                  onClick={() => setIsOpen(false)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  {locale === 'ar' ? 'تصفح المنتجات' : 'Parcourir les produits'}
                </Link>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {items.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <Image
                        src={item.image || '/placeholder-product.jpg'}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="rounded-md object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {formatPrice(item.price)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center mt-1 space-x-1">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="p-0.5 rounded border border-gray-300 hover:bg-gray-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-medium min-w-[1.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="p-0.5 rounded border border-gray-300 hover:bg-gray-50"
                          disabled={item.quantity >= item.maxStock}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Price and Remove */}
                    <div className="flex flex-col items-end space-y-1">
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title={locale === 'ar' ? 'حذف' : 'Supprimer'}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Show More Items Indicator */}
                {items.length > 4 && (
                  <div className="text-center pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      {locale === 'ar'
                        ? `و ${items.length - 4} منتجات أخرى`
                        : `et ${items.length - 4} autres articles`
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t border-gray-200 space-y-3">
              {/* Subtotal */}
              <div className="flex justify-between text-base font-medium">
                <span className="text-gray-900">
                  {locale === 'ar' ? 'المجموع الفرعي' : 'Sous-total'}
                </span>
                <span className="text-gray-900">{formatPrice(total)}</span>
              </div>

              {/* Shipping Note */}
              <p className="text-xs text-gray-500">
                {locale === 'ar'
                  ? 'الشحن محسوب عند الخروج'
                  : 'Frais de livraison calculés à la commande'
                }
              </p>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Link
                  href={`/${locale}/cart`}
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-gray-100 text-gray-900 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-center text-sm font-medium flex items-center justify-center"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {locale === 'ar' ? 'عرض السلة' : 'Voir le panier'}
                </Link>

                <Link
                  href={`/${locale}/checkout`}
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors text-center text-sm font-medium flex items-center justify-center"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {locale === 'ar' ? 'إتمام الطلب' : 'Commander'}
                </Link>
              </div>

              {/* Payment Methods */}
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">
                  {locale === 'ar' ? 'طرق الدفع:' : 'Moyens de paiement:'}
                </p>
                <div className="flex space-x-2">
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    💵 {locale === 'ar' ? 'نقداً' : 'Espèces'}
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    💳 {locale === 'ar' ? 'الذهبية' : 'Dahabia'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
