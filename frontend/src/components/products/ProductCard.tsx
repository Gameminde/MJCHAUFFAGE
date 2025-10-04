'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, Heart, ShoppingCart, ArrowRight, Eye, Sparkles } from 'lucide-react'
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

  // Get main product image - handle both string and object formats
  const mainImage = product.images?.[0] 
    ? (typeof product.images[0] === 'string' 
        ? { url: product.images[0], altText: productName }
        : product.images[0])
    : null

  // Modern 2025 variant-specific classes
  const cardClasses = {
    default: 'group card card-hover bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-2 border border-neutral-200/50 overflow-hidden backdrop-blur-sm',
    compact: 'group card card-hover bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 border border-neutral-200/50 overflow-hidden',
    featured: 'group card card-hover bg-white rounded-3xl shadow-elevated hover:shadow-elevated-lg transition-all duration-300 transform hover:-translate-y-3 border border-neutral-200/30 overflow-hidden relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary-50/50 before:to-accent-50/30 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300'
  }

  const imageHeightClasses = {
    default: 'h-64',
    compact: 'h-48',
    featured: 'h-80'
  }

  return (
    <div className={`${cardClasses[variant]} ${className}`}>
      {/* Product Image */}
      <div className={`relative ${imageHeightClasses[variant]} bg-gradient-to-br from-neutral-100 to-neutral-200 overflow-hidden`}>
        {/* Modern Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {product.isFeatured && (
            <span className="badge badge-primary flex items-center gap-1 px-3 py-1.5 bg-gradient-primary text-white rounded-xl text-xs font-semibold shadow-glow animate-fade-in-down backdrop-blur-sm">
              <Sparkles className="w-3 h-3" />
              {isArabic ? 'مميز' : 'Vedette'}
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="badge badge-error px-3 py-1.5 bg-gradient-to-r from-error-500 to-error-600 text-white rounded-xl text-xs font-semibold shadow-sm animate-fade-in-down">
              -{discountPercentage}%
            </span>
          )}
          {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
            <span className="badge badge-warning px-3 py-1.5 bg-gradient-to-r from-warning-500 to-warning-600 text-white rounded-xl text-xs font-semibold shadow-sm animate-fade-in-down">
              {isArabic ? 'كمية قليلة' : 'Stock limité'}
            </span>
          )}
        </div>

        {/* Modern Action Buttons */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          {showWishlist && (
            <button
              onClick={handleWishlistToggle}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 interactive-scale ${
                isWishlisted
                  ? 'bg-gradient-to-r from-error-500 to-error-600 text-white shadow-glow-accent'
                  : 'glass-effect text-neutral-600 hover:bg-white/90 hover:text-error-500 hover:shadow-card'
              }`}
              aria-label={isArabic ? 'إضافة للمفضلة' : 'Ajouter aux favoris'}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          )}
          {showQuickView && (
            <Link
              href={`/${locale}/products/${product.slug}`}
              className="w-11 h-11 glass-effect rounded-xl flex items-center justify-center hover:bg-white/90 transition-all duration-200 text-neutral-600 hover:text-primary-600 interactive-scale hover:shadow-card"
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
            priority={variant === 'featured'}
            loading={variant === 'featured' ? 'eager' : 'lazy'}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl opacity-50">🔥</div>
          </div>
        )}

        {/* Modern Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-transparent group-hover:from-black/5 group-hover:via-black/2 transition-all duration-300"></div>

        {/* Stock Status Overlay */}
        {product.stockQuantity <= 0 && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-gradient-to-r from-error-500 to-error-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-elevated animate-fade-in">
              {isArabic ? 'غير متوفر' : 'Rupture de stock'}
            </span>
          </div>
        )}
      </div>

      {/* Modern Product Info */}
      <div className={`p-${variant === 'compact' ? '5' : '6'} relative z-10`}>
        {/* Category */}
        <div className="mb-3">
          <Link
            href={`/${locale}/products?category=${product.category.slug}`}
            className="text-body-xs text-primary-600 hover:text-primary-700 font-medium uppercase tracking-wider transition-colors duration-200"
          >
            {product.category.name}
          </Link>
        </div>

        {/* Product Name */}
        <h3 className={`font-display font-bold text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2 ${
          variant === 'featured' ? 'text-heading-lg' : variant === 'compact' ? 'text-heading-sm' : 'text-heading-md'
        }`}>
          <Link href={`/${locale}/products/${product.slug}`} className="hover:underline decoration-2 underline-offset-2">
            {productName}
          </Link>
        </h3>

        {/* Short Description */}
        {product.shortDescription && variant !== 'compact' && (
          <p className="text-neutral-600 text-body-sm mb-4 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        )}

        {/* Modern Features */}
        {product.features && product.features.length > 0 && variant !== 'compact' && (
          <div className="flex flex-wrap gap-2 mb-4">
            {product.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="text-body-xs bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg font-medium border border-primary-100"
              >
                {feature}
              </span>
            ))}
            {product.features.length > 3 && (
              <span className="text-body-xs text-neutral-500 px-3 py-1.5 bg-neutral-100 rounded-lg">
                +{product.features.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Modern Rating */}
        <div className="flex items-center mb-5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 transition-colors ${
                  i < Math.floor((product as any).averageRating || 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-neutral-300'
                }`}
              />
            ))}
          </div>
          <span className="text-body-sm text-neutral-600 ml-3 font-medium">
            {(product as any).averageRating?.toFixed(1) || '0.0'}
          </span>
          <span className="text-body-xs text-neutral-500 ml-1">
            ({(product as any).reviewCount || 0} {isArabic ? 'تقييم' : 'avis'})
          </span>
        </div>

        {/* Modern Price */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <span className={`font-display font-bold text-neutral-900 ${
                variant === 'featured' ? 'text-display-md' : 'text-heading-lg'
              }`}>
                {formatPrice(currentPrice)}
              </span>
              {originalPrice && (
                <span className="text-body-sm text-neutral-500 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
            {originalPrice && (
              <div className="text-body-sm text-green-600 font-semibold">
                {isArabic ? 'وفر' : 'Économisez'} {formatPrice(originalPrice - currentPrice)}
              </div>
            )}
          </div>
          <span className={`text-body-xs px-3 py-2 rounded-xl font-semibold border ${
            product.stockQuantity > 0
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {product.stockQuantity > 0
              ? (isArabic ? 'متوفر' : 'En stock')
              : (isArabic ? 'غير متوفر' : 'Rupture')
            }
          </span>
        </div>

        {/* Modern Actions */}
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
              className="w-full btn-primary"
            />
          </div>
          <Link
            href={`/${locale}/products/${product.slug}`}
            className="px-4 py-3 border-2 border-primary-500 text-primary-600 hover:bg-primary-500 hover:text-white rounded-xl transition-all duration-200 flex items-center justify-center interactive-scale hover:shadow-card"
            aria-label={isArabic ? 'عرض التفاصيل' : 'Voir détails'}
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
