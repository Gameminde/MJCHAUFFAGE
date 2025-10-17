'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { useLanguage } from '@/hooks/useLanguage'
import Link from 'next/link'
import Image from 'next/image'
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'

interface ShoppingCartProps {
  isOpen: boolean
  onClose: () => void
}

export function ShoppingCart({ isOpen, onClose }: ShoppingCartProps) {
  const { items, total, itemCount, updateQuantity, removeItem, clearCart, formatPrice } = useCart()
  const { t, locale, dir } = useLanguage()
  const [isClearing, setIsClearing] = useState(false)

  const handleClearCart = async () => {
    setIsClearing(true)
    await new Promise(resolve => setTimeout(resolve, 500)) // Show loading state
    clearCart()
    setIsClearing(false)
  }

  const handleQuantityChange = (itemId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change
    if (newQuantity >= 0) {
      updateQuantity(itemId, newQuantity)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Cart Panel */}
      <div className={`fixed inset-y-0 ${dir === 'rtl' ? 'left-0' : 'right-0'} flex max-w-full pl-10`}>
        <div className="w-screen max-w-md">
          <div className="flex h-full flex-col bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-6 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">
                {t('cart.title')} ({itemCount})
              </h2>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-500"
                onClick={onClose}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">{t('cart.empty')}</p>
                  <Link
                    href="/products"
                    className="btn-primary"
                    onClick={onClose}
                  >
                    {t('cart.startShopping')}
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <Image
                          src={item.image || '/placeholder-product.jpg'}
                          alt={locale === 'ar' ? item.nameAr || item.name : item.nameFr || item.name}
                          width={80}
                          height={80}
                          className="rounded-md object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {locale === 'ar' ? item.nameAr || item.name : item.nameFr || item.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {t('cart.sku')}: {item.sku}
                        </p>
                        <p className="text-sm font-medium text-primary-600">
                          {formatPrice(item.price)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center mt-2 space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                            className="p-1 rounded-md border border-gray-300 hover:bg-gray-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                            className="p-1 rounded-md border border-gray-300 hover:bg-gray-50"
                            disabled={item.quantity >= item.maxStock}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Stock Warning */}
                        {item.quantity >= item.maxStock && (
                          <p className="text-xs text-orange-600 mt-1">
                            {t('cart.maxStock')}
                          </p>
                        )}
                      </div>

                      {/* Remove Button */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Clear Cart Button */}
                  {items.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={handleClearCart}
                        disabled={isClearing}
                        className="w-full text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        {isClearing ? t('cart.clearing') : t('cart.clearAll')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                {/* Total */}
                <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                  <p>{t('cart.subtotal')}</p>
                  <p>{formatPrice(total)}</p>
                </div>

                {/* Shipping Note */}
                <p className="text-sm text-gray-500 mb-4">
                  {t('cart.shippingNote')}
                </p>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    className="btn-primary w-full text-center"
                    onClick={onClose}
                  >
                    {t('cart.checkout')}
                  </Link>
                  <button
                    type="button"
                    className="btn-secondary w-full"
                    onClick={onClose}
                  >
                    {t('cart.continueShopping')}
                  </button>
                </div>

                {/* Payment Methods Preview */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">{t('cart.paymentMethods')}:</p>
                  <div className="flex items-center space-x-2">
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {t('paymentMethods.cashOnDelivery')}
                    </div>
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {t('paymentMethods.dahabiaCard')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
