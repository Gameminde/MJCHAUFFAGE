'use client'

import { useCart } from '@/hooks/useCart'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ShoppingCart } from 'lucide-react'

interface CartPageProps {
  params: { locale: string }
}

export default function CartPage({ params: { locale } }: CartPageProps) {
  const { 
    items, 
    total, 
    itemCount, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    formatPrice,
    error,
    isLoading 
  } = useCart()
  
  const router = useRouter()
  const [isClearing, setIsClearing] = useState(false)
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())

  const isRTL = locale === 'ar'
  const shippingCost = 500
  const finalTotal = total + (total > 0 ? shippingCost : 0)

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    setUpdatingItems(prev => new Set(prev).add(itemId))
    
    try {
      updateQuantity(itemId, newQuantity)
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300))
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId))
    
    try {
      removeItem(itemId)
      await new Promise(resolve => setTimeout(resolve, 200))
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const handleClearCart = async () => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من إفراغ السلة؟' : 'Êtes-vous sûr de vider le panier?')) {
      return
    }
    
    setIsClearing(true)
    try {
      clearCart()
      await new Promise(resolve => setTimeout(resolve, 500))
    } finally {
      setIsClearing(false)
    }
  }

  const handleCheckout = () => {
    router.push(`/${locale}/checkout`)
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className={`min-h-screen bg-gray-50 py-12 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-300 mb-8" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {locale === 'ar' ? 'سلة التسوق فارغة' : 'Votre panier est vide'}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {locale === 'ar' 
                ? 'أضف بعض المنتجات لبدء التسوق' 
                : 'Ajoutez des produits pour commencer vos achats'
              }
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link
                href={`/${locale}/products`}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {locale === 'ar' ? 'تصفح المنتجات' : 'Parcourir les produits'}
              </Link>
              <Link
                href={`/${locale}`}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                {locale === 'ar' ? 'العودة للرئيسية' : 'Retour à l\'accueil'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 py-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/products`}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {locale === 'ar' ? 'متابعة التسوق' : 'Continuer les achats'}
          </Link>
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'ar' ? 'سلة التسوق' : 'Panier d\'achat'}
              <span className="text-lg font-normal text-gray-600 ml-2">
                ({itemCount} {locale === 'ar' ? 'عنصر' : 'articles'})
              </span>
            </h1>
            
            {items.length > 0 && (
              <button
                onClick={handleClearCart}
                disabled={isClearing}
                className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClearing 
                  ? (locale === 'ar' ? 'جاري الإفراغ...' : 'Vidage...') 
                  : (locale === 'ar' ? 'إفراغ السلة' : 'Vider le panier')
                }
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {locale === 'ar' ? 'المنتجات المضافة' : 'Articles ajoutés'}
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {items.map((item) => {
                  const isUpdating = updatingItems.has(item.id)
                  
                  return (
                    <div key={item.id} className={`p-6 ${isUpdating ? 'opacity-50' : ''}`}>
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <Image
                            src={item.image || '/placeholder-product.jpg'}
                            alt={item.name}
                            width={120}
                            height={120}
                            className="rounded-lg object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {item.name}
                          </h3>
                          
                          <div className="space-y-1 text-sm text-gray-600 mb-4">
                            <p>
                              <span className="font-medium">SKU:</span> {item.sku}
                            </p>
                            <p>
                              <span className="font-medium">
                                {locale === 'ar' ? 'السعر:' : 'Prix:'}
                              </span> {formatPrice(item.price)}
                            </p>
                            <p>
                              <span className="font-medium">
                                {locale === 'ar' ? 'المخزون المتاح:' : 'Stock disponible:'}
                              </span> {item.maxStock}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center border border-gray-300 rounded-md">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={isUpdating || item.quantity <= 1}
                                className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              
                              <input
                                type="number"
                                min="1"
                                max={item.maxStock}
                                value={item.quantity}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value)
                                  if (value >= 1 && value <= item.maxStock) {
                                    handleQuantityChange(item.id, value)
                                  }
                                }}
                                disabled={isUpdating}
                                className="w-16 text-center border-0 focus:ring-0 disabled:opacity-50"
                              />
                              
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={isUpdating || item.quantity >= item.maxStock}
                                className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Stock Warning */}
                            {item.quantity >= item.maxStock && (
                              <span className="text-sm text-orange-600">
                                {locale === 'ar' ? 'الحد الأقصى للمخزون' : 'Stock maximum atteint'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price and Remove */}
                        <div className="flex flex-col items-end space-y-4">
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-sm text-gray-600">
                                {formatPrice(item.price)} × {item.quantity}
                              </p>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isUpdating}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title={locale === 'ar' ? 'حذف المنتج' : 'Supprimer l\'article'}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                {locale === 'ar' ? 'ملخص الطلب' : 'Résumé de la commande'}
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {locale === 'ar' ? 'المجموع الفرعي' : 'Sous-total'}
                  </span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {locale === 'ar' ? 'الشحن' : 'Livraison'}
                  </span>
                  <span className="font-medium">{formatPrice(shippingCost)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>{locale === 'ar' ? 'المجموع الإجمالي' : 'Total'}</span>
                    <span className="text-primary-600">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  {locale === 'ar' 
                    ? 'الضرائب محسوبة عند الخروج' 
                    : 'Taxes calculées lors du checkout'
                  }
                </p>
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={isLoading || items.length === 0}
                className="w-full mt-6 bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading 
                  ? (locale === 'ar' ? 'جاري التحميل...' : 'Chargement...') 
                  : (locale === 'ar' ? 'إتمام الطلب' : 'Procéder au checkout')
                }
              </button>
              
              <div className="mt-4 text-center">
                <Link
                  href={`/${locale}/products`}
                  className="text-primary-600 hover:text-primary-700 text-sm"
                >
                  {locale === 'ar' ? 'متابعة التسوق' : 'Continuer les achats'}
                </Link>
              </div>

              {/* Payment Methods Preview */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-900 mb-3">
                  {locale === 'ar' ? 'طرق الدفع المتاحة:' : 'Méthodes de paiement:'}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">💵</span>
                    <span className="text-sm text-gray-600">
                      {locale === 'ar' ? 'الدفع عند الاستلام' : 'Paiement à la livraison'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">💳</span>
                    <span className="text-sm text-gray-600">
                      {locale === 'ar' ? 'بطاقة الذهبية' : 'Carte Dahabia'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
