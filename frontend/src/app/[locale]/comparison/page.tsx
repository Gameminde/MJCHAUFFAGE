'use client'

import { useComparison } from '@/contexts/ComparisonContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Layers, ShoppingCart, ArrowLeft, X, Check } from 'lucide-react'

interface ComparisonPageProps {
  params: { locale: string }
}

export default function ComparisonPage({ params: { locale } }: ComparisonPageProps) {
  const { items, removeFromComparison, clearComparison, formatPrice } = useComparison()
  const router = useRouter()
  const isRTL = locale === 'ar'

  const handleClearComparison = () => {
    if (confirm(locale === 'ar' ? 'هل أنت متأكد من إزالة جميع المنتجات من المقارنة؟' : 'Êtes-vous sûr de supprimer tous les produits de la comparaison?')) {
      clearComparison()
    }
  }

  const handleRemoveItem = (productId: string) => {
    removeFromComparison(productId)
  }

  // Empty comparison state
  if (items.length === 0) {
    return (
      <div className={`min-h-screen bg-gray-50 py-12 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Layers className="mx-auto h-24 w-24 text-gray-300 mb-8" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {locale === 'ar' ? 'قائمة المقارنة فارغة' : 'Votre liste de comparaison est vide'}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {locale === 'ar' 
                ? 'أضف منتجات للمقارنة لعرضها هنا' 
                : 'Ajoutez des produits à comparer pour les voir ici'
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

  // Get all unique features for comparison
  const allFeatures = Array.from(
    new Set(
      items.flatMap(item => [
        'brand',
        'category',
        'power',
        'efficiency',
        'warranty',
        ...(item as any).features ? Object.keys((item as any).features) : []
      ])
    )
  )

  return (
    <div className={`min-h-screen bg-gray-50 py-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              {locale === 'ar' ? 'مقارنة المنتجات' : 'Comparer les produits'}
              <span className="text-lg font-normal text-gray-600 ml-2">
                ({items.length} {locale === 'ar' ? 'منتجات' : 'produits'})
              </span>
            </h1>
            
            <button
              onClick={handleClearComparison}
              className="text-red-600 hover:text-red-700"
            >
              {locale === 'ar' ? 'إزالة الكل' : 'Tout supprimer'}
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ar' ? 'المنتج' : 'Produit'}
                  </th>
                  {items.map((item) => (
                    <th key={item.id} className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative">
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                        title={locale === 'ar' ? 'إزالة من المقارنة' : 'Supprimer de la comparaison'}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Image Row */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {locale === 'ar' ? 'الصورة' : 'Image'}
                  </td>
                  {items.map((item) => (
                    <td key={item.id} className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center">
                        <Image
                          src={item.image || '/placeholder-product.jpg'}
                          alt={item.name}
                          width={100}
                          height={100}
                          className="rounded-lg object-cover"
                        />
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Name Row */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {locale === 'ar' ? 'الاسم' : 'Nom'}
                  </td>
                  {items.map((item) => (
                    <td key={item.id} className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </td>
                  ))}
                </tr>

                {/* Price Row */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {locale === 'ar' ? 'السعر' : 'Prix'}
                  </td>
                  {items.map((item) => (
                    <td key={item.id} className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-lg font-semibold text-primary-600">{formatPrice(item.price)}</div>
                    </td>
                  ))}
                </tr>

                {/* Brand Row */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {locale === 'ar' ? 'العلامة التجارية' : 'Marque'}
                  </td>
                  {items.map((item) => (
                    <td key={item.id} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {item.brand}
                    </td>
                  ))}
                </tr>

                {/* Category Row */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {locale === 'ar' ? 'الفئة' : 'Catégorie'}
                  </td>
                  {items.map((item) => (
                    <td key={item.id} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {item.category}
                    </td>
                  ))}
                </tr>

                {/* Power Row */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {locale === 'ar' ? 'الطاقة' : 'Puissance'}
                  </td>
                  {items.map((item) => (
                    <td key={item.id} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {item.power || '-'}
                    </td>
                  ))}
                </tr>

                {/* Efficiency Row */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {locale === 'ar' ? 'الكفاءة' : 'Efficacité'}
                  </td>
                  {items.map((item) => (
                    <td key={item.id} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {item.efficiency || '-'}
                    </td>
                  ))}
                </tr>

                {/* Warranty Row */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {locale === 'ar' ? 'الضمان' : 'Garantie'}
                  </td>
                  {items.map((item) => (
                    <td key={item.id} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {item.warranty || '-'}
                    </td>
                  ))}
                </tr>

                {/* Actions Row */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {locale === 'ar' ? 'الإجراءات' : 'Actions'}
                  </td>
                  {items.map((item) => (
                    <td key={item.id} className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => router.push(`/${locale}/products/${item.productId}`)}
                          className="px-3 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
                        >
                          {locale === 'ar' ? 'عرض' : 'Voir'}
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.productId)}
                          className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center"
                        >
                          <X className="h-3 w-3 mr-1" />
                          {locale === 'ar' ? 'إزالة' : 'Supprimer'}
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Add to Cart Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {locale === 'ar' ? 'إضافة إلى السلة' : 'Ajouter au panier'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Image
                    src={item.image || '/placeholder-product.jpg'}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="rounded-md object-cover mr-3"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                      {item.name}
                    </div>
                    <div className="text-sm text-primary-600 font-medium">
                      {formatPrice(item.price)}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => router.push(`/${locale}/products/${item.productId}`)}
                  className="p-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  title={locale === 'ar' ? 'إضافة إلى السلة' : 'Ajouter au panier'}
                >
                  <ShoppingCart className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}