'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, Heart, ShoppingCart, ArrowRight, Eye } from 'lucide-react'
import { useState } from 'react'
import { Product } from '@/services/productService'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { useLanguage } from '@/hooks/useLanguage'

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'compact' | 'featured'
  showQuickView?: boolean
  showWishlist?: boolean
  className?: string
}

export function ProductCard({
  product,
  variant = 'default',
  showQuickView = true,
  showWishlist = true,
  className = ''
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { t, locale } = useLanguage()
  const isArabic = locale === 'ar'

  // Calculate discount percentage
  const discountPercentage = product.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0

  // Get current price (sale price if available, otherwise regular price)
  const currentPrice = product.salePrice || product.price
  const originalPrice = product.salePrice ? product.price : null

  // Format price for display
  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} ${isArabic ? 'د.ج' : 'DA'}`
  }

  // Handle wishlist toggle
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
    // TODO: Implement wishlist API call
  }

  // Get product name based on locale
  const productName = product.name

  // Get main product image
  const mainImage = product.images?.[0]

  // Variant-specific classes
  const cardClasses = {
    default: 'group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden',
    compact: 'group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden',
    featured: 'group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden'
  }

  const imageHeightClasses = {
    default: 'h-64',
    compact: 'h-48',
    featured: 'h-80'
  }

  return (
    <div className={`${cardClasses[variant]} ${className}`}>
      {/* Product Image */}
      <div className={`relative ${imageHeightClasses[variant]} bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden`}>
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {product.isFeatured && (
            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">
              {isArabic ? 'مميز' : 'Vedette'}
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold">
              -{discountPercentage}%
            </span>
          )}
          {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
            <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-semibold">
              {isArabic ? 'كمية قليلة' : 'Stock limité'}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          {showWishlist && (
            <button
              onClick={handleWishlistToggle}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isWishlisted
                  ? 'bg-red-500 text-white'
                  : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-red-500'
              }`}
              aria-label={isArabic ? 'إضافة للمفضلة' : 'Ajouter aux favoris'}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          )}
          {showQuickView && (
            <Link
              href={`/${locale}/products/${product.slug}`}
              className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all text-gray-600 hover:text-blue-600"
              aria-label={isArabic ? 'عرض سريع' : 'Aperçu rapide'}
            >
              <Eye className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Product Image */}
        {mainImage && !imageError ? (
          <Image
            src={mainImage.url}
            alt={mainImage.altText || productName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl opacity-50">🔥</div>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-transparent group-hover:from-black/10 transition-all"></div>

        {/* Stock Status Overlay */}
        {product.stockQuantity <= 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
              {isArabic ? 'غير متوفر' : 'Rupture de stock'}
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className={`p-${variant === 'compact' ? '4' : '6'}`}>
        {/* Category */}
        <div className="mb-2">
          <Link
            href={`/${locale}/products?category=${product.category.slug}`}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {product.category.name}
          </Link>
        </div>

        {/* Product Name */}
        <h3 className={`font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 ${
          variant === 'featured' ? 'text-xl' : variant === 'compact' ? 'text-base' : 'text-lg'
        }`}>
          <Link href={`/${locale}/products/${product.slug}`}>
            {productName}
          </Link>
        </h3>

        {/* Short Description */}
        {product.shortDescription && variant !== 'compact' && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.shortDescription}
          </p>
        )}

        {/* Features */}
        {product.features && product.features.length > 0 && variant !== 'compact' && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full"
              >
                {feature}
              </span>
            ))}
            {product.features.length > 3 && (
              <span className="text-xs text-gray-500">
                +{product.features.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < 4 // Mock rating of 4 stars
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            4.0 (12 {isArabic ? 'تقييم' : 'avis'})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className={`font-bold text-gray-900 ${
              variant === 'featured' ? 'text-2xl' : 'text-xl'
            }`}>
              {formatPrice(currentPrice)}
            </span>
            {originalPrice && (
              <>
                <span className="text-sm text-gray-500 line-through ml-2">
                  {formatPrice(originalPrice)}
                </span>
                <div className="text-sm text-green-600 font-medium">
                  {isArabic ? 'وفر' : 'Économisez'} {formatPrice(originalPrice - currentPrice)}
                </div>
              </>
            )}
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            product.stockQuantity > 0
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {product.stockQuantity > 0
              ? (isArabic ? 'متوفر' : 'En stock')
              : (isArabic ? 'غير متوفر' : 'Rupture')
            }
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <div className="flex-1">
            <AddToCartButton
              product={{
                id: product.id,
                name: productName,
                price: currentPrice,
                sku: product.sku,
                stockQuantity: product.stockQuantity,
                images: product.images
              }}
              variant="primary"
              size={variant === 'compact' ? 'sm' : 'md'}
              className="w-full"
            />
          </div>
          <Link
            href={`/${locale}/products/${product.slug}`}
            className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex items-center justify-center"
            aria-label={isArabic ? 'عرض التفاصيل' : 'Voir détails'}
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
