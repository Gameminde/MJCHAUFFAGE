import { Product } from '@/services/productService'
import { ProductCard } from '@/components/products/ProductCard'
import { useLanguage } from '@/hooks/useLanguage'

interface ProductGridProps {
  products: Product[]
  variant?: 'default' | 'compact' | 'featured'
  className?: string
}

export function ProductGrid({ products, variant = 'default', className = '' }: ProductGridProps) {
  const { t } = useLanguage()
  
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {t('products.noProducts')}
        </h3>
        <p className="text-gray-500">
          {t('products.noProductsDescription')}
        </p>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} variant={variant} />
      ))}
    </div>
  )
}

export default ProductGrid
