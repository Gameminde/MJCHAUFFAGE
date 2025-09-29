'use client'

import { useComparison } from '@/contexts/ComparisonContext'
import { useRouter } from 'next/navigation'
import { X, Layers } from 'lucide-react'

interface FloatingComparisonBarProps {
  locale?: string
}

export function FloatingComparisonBar({ locale = 'fr' }: FloatingComparisonBarProps) {
  const { items, clearComparison } = useComparison()
  const router = useRouter()
  const isRTL = locale === 'ar'

  if (items.length === 0) return null

  const handleViewComparison = () => {
    router.push(`/${locale}/comparison`)
  }

  const handleClear = () => {
    if (confirm(locale === 'ar' ? 'هل أنت متأكد من إزالة جميع المنتجات من المقارنة؟' : 'Êtes-vous sûr de supprimer tous les produits de la comparaison?')) {
      clearComparison()
    }
  }

  return (
    <div className={`fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} z-50`}>
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Layers className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-medium text-gray-900">
              {locale === 'ar' ? 'مقارنة المنتجات' : 'Comparer les produits'}
            </span>
          </div>
          <button
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
            title={locale === 'ar' ? 'إزالة الكل' : 'Tout supprimer'}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">
            {items.length} {locale === 'ar' ? 'عناصر محددة' : 'articles sélectionnés'}
          </span>
          <span className="text-xs text-gray-500">
            {locale === 'ar' ? 'الحد الأقصى: 4' : 'Max: 4'}
          </span>
        </div>

        <button
          onClick={handleViewComparison}
          disabled={items.length < 2}
          className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            items.length >= 2
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {items.length < 2 
            ? (locale === 'ar' ? 'اختر منتجين على الأقل' : 'Sélectionnez au moins 2 produits')
            : (locale === 'ar' ? 'عرض المقارنة' : 'Voir la comparaison')
          }
        </button>

        {items.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex -space-x-2">
              {items.slice(0, 4).map((item, index) => (
                <div 
                  key={item.id} 
                  className="relative"
                  style={{ zIndex: items.length - index }}
                >
                  <img
                    src={item.image || '/placeholder-product.jpg'}
                    alt={item.name}
                    className="w-8 h-8 rounded-md object-cover border-2 border-white"
                  />
                </div>
              ))}
              {items.length > 4 && (
                <div className="w-8 h-8 rounded-md bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                  +{items.length - 4}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}