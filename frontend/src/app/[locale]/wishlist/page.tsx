'use client'

import { useWishlist } from '@/contexts/WishlistContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, ArrowLeft, Trash2, X } from 'lucide-react'

interface WishlistPageProps {
  params: { locale: string }
}

export default function WishlistPage({ params: { locale } }: WishlistPageProps) {
  const { items, itemCount, removeFromWishlist, clearWishlist, formatPrice } = useWishlist()
  const router = useRouter()
  const isRTL = locale === 'ar'

  const handleClearWishlist = () => {
    if (confirm(locale === 'ar' ? 'هل أنت متأكد من إفراغ قائمة الأمنيات؟' : 'Êtes-vous sûr de vider la liste de souhaits?')) {
      clearWishlist()
    }
  }

  const handleRemoveItem = (productId: string) => {
    removeFromWishlist(productId)
  }

  // Empty wishlist state
  if (items.length === 0) {
    return (
      <div className={`min-h-screen bg-gray-50 py-12 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Heart className="mx-auto h-24 w-24 text-gray-300 mb-8" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {locale === 'ar' ? 'قائمة الأمنيات فارغة' : 'Votre liste de souhaits est vide'}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {locale === 'ar' 
                ? 'أضف منتجات إلى قائمة الأمنيات لعرضها هنا' 
                : 'Ajoutez des produits à votre liste de souhaits pour les voir ici'
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
                {locale === 'ar' ? 'العودة للرئيسية' : "Retour à l'accueil"}
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
              {locale === 'ar' ? 'قائمة الأمنيات' : 'Liste de souhaits'}
              <span className="text-lg font-normal text-gray-600 ml-2">
                ({itemCount} {locale === 'ar' ? 'عنصر' : 'articles'})
              </span>
            </h1>
            
            <button
              onClick={handleClearWishlist}
              className="text-red-600 hover:text-red-700"
            >
              {locale === 'ar' ? 'إفراغ القائمة' : 'Vider la liste'}
            </button>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              {locale === 'ar' ? 'المنتجات المفضلة' : 'Articles favoris'}
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {items.map((item) => (
              <div key={item.id} className="p-6">
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
                      <p className="text-lg font-semibold text-primary-600">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => router.push(`/${locale}/products/${item.productId}`)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
                      >
                        {locale === 'ar' ? 'عرض التفاصيل' : 'Voir les détails'}
                      </button>
                      
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {locale === 'ar' ? 'حذف' : 'Supprimer'}
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item.productId)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
                    title={locale === 'ar' ? 'حذف من قائمة الأمنيات' : 'Supprimer de la liste de souhaits'}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}