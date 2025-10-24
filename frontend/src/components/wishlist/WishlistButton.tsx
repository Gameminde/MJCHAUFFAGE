'use client'

import { useState } from 'react'
import { useWishlist } from '@/contexts/WishlistContext'
import { useLanguage } from '@/hooks/useLanguage'
import { Heart } from 'lucide-react'

interface WishlistButtonProps {
  product: {
    id: string
    name: string
    nameAr?: string
    nameFr?: string
    price: number
    sku: string
    images?: { url: string }[]
  }
  variant?: 'icon' | 'text'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function WishlistButton({
  product,
  variant = 'icon',
  size = 'md',
  className = ''
}: WishlistButtonProps) {
  const { addToWishlist, isInWishlist } = useWishlist()
  const { t, locale } = useLanguage()
  const [isProcessing, setIsProcessing] = useState(false)

  const isWishlisted = isInWishlist(product.id)

  const handleToggleWishlist = async () => {
    setIsProcessing(true)
    
    try {
      const wishlistItem = {
        productId: product.id,
        name: product.name,
        nameAr: product.nameAr,
        nameFr: product.nameFr,
        price: product.price,
        sku: product.sku,
        image: product.images?.[0]?.url
      }

      addToWishlist(wishlistItem)
    } catch (error) {
      console.error('Error toggling wishlist:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }

  // Variant classes
  const variantClasses = {
    icon: 'p-2 rounded-full',
    text: 'px-4 py-2 rounded-md flex items-center space-x-2'
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggleWishlist}
        disabled={isProcessing}
        className={`${sizeClasses[size]} ${variantClasses[variant]} ${
          isWishlisted 
            ? 'text-red-500 bg-red-50 hover:bg-red-100' 
            : 'text-gray-400 bg-gray-100 hover:bg-gray-200 hover:text-gray-600'
        } transition-colors ${className}`}
        aria-label={isWishlisted ? t('wishlist.remove') : t('wishlist.add')}
      >
        <Heart 
          className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} 
        />
      </button>
    )
  }

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={isProcessing}
      className={`${variantClasses[variant]} ${
        isWishlisted 
          ? 'text-red-600 bg-red-50 hover:bg-red-100 border border-red-200' 
          : 'text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200'
      } transition-colors ${className}`}
    >
      <Heart 
        className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} 
      />
      <span>
        {isWishlisted ? t('wishlist.remove') : t('wishlist.add')}
      </span>
    </button>
  )
}