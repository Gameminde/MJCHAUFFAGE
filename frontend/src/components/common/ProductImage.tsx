'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Package } from 'lucide-react'
import { getImageUrl } from '@/lib/images'

interface ProductImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
}

export function ProductImage({
  src,
  alt,
  className = '',
  width = 600,
  height = 400,
  priority = false
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Convert to full URL
  const imageUrl = getImageUrl(src)

  // ✅ Si pas de src ou erreur → Afficher placeholder SVG
  if (!src || imageError) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto" />
          <p className="text-sm text-gray-500 mt-2">
            Image produit indisponible
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        className={`object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={() => {
          console.error('❌ Erreur chargement image:', src)
          setImageError(true)
        }}
        onLoad={() => setIsLoading(false)}
        priority={priority}
        unoptimized // ✅ Important si images viennent de backend custom
      />
    </div>
  )
}




