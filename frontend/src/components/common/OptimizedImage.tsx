'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { ImageIcon } from 'lucide-react'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  fill?: boolean
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
  onError?: () => void
  enableIntersectionObserver?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  objectFit = 'cover',
  loading = 'lazy',
  onLoad,
  onError,
  enableIntersectionObserver = true
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(!enableIntersectionObserver || priority)
  
  const { ref, isVisible } = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true,
  })

  useEffect(() => {
    if (enableIntersectionObserver && !priority && isVisible) {
      setShouldLoad(true)
    }
  }, [isVisible, enableIntersectionObserver, priority])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  // Generate blur placeholder for better UX
  const generateBlurDataURL = (w: number, h: number) => {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(0, 0, w, h)
    }
    return canvas.toDataURL()
  }

  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ width, height }}
      >
        <ImageIcon className="w-8 h-8 text-gray-400" />
      </div>
    )
  }

  const imageProps = {
    src,
    alt,
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    priority,
    quality,
    placeholder,
    blurDataURL: blurDataURL || (width && height ? generateBlurDataURL(width, height) : undefined),
    sizes: sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    onLoad: handleLoad,
    onError: handleError,
    loading: priority ? 'eager' : loading,
    style: { objectFit }
  }

  if (fill) {
    return (
      <div ref={ref as any} className={`relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded" />
        )}
        {shouldLoad && (
          <Image
            {...imageProps}
            fill
            className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
          />
        )}
      </div>
    )
  }

  return (
    <div ref={ref as any} className="relative">
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded"
          style={{ width, height }}
        />
      )}
      {shouldLoad && (
        <Image
          {...imageProps}
          width={width}
          height={height}
        />
      )}
    </div>
  )
}

// Specialized components for common use cases
export function ProductImage({ 
  src, 
  alt, 
  className = "w-full h-48 object-cover rounded-lg",
  priority = false 
}: {
  src: string
  alt: string
  className?: string
  priority?: boolean
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={400}
      height={300}
      className={className}
      priority={priority}
      quality={80}
      placeholder="blur"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
    />
  )
}

export function HeroImage({ 
  src, 
  alt, 
  className = "w-full h-96 object-cover" 
}: {
  src: string
  alt: string
  className?: string
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      className={className}
      priority={true}
      quality={90}
      placeholder="blur"
      sizes="100vw"
    />
  )
}

export function ThumbnailImage({ 
  src, 
  alt, 
  className = "w-16 h-16 object-cover rounded" 
}: {
  src: string
  alt: string
  className?: string
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={64}
      height={64}
      className={className}
      quality={60}
      sizes="64px"
    />
  )
}