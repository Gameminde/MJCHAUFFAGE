import { Product } from '@/services/productService'
import { ProductCard } from '@/components/products/ProductCard'

interface ProductGridProps {
  products: Product[]
  variant?: 'default' | 'compact' | 'featured'
  className?: string
}

export function ProductGrid({ products, variant = 'default', className = '' }: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        Aucun produit trouvé.
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
