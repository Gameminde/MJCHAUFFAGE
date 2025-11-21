'use client'

import { useState } from 'react'
import { useComparison } from '@/contexts/ComparisonContext'
import { useLanguage } from '@/hooks/useLanguage'
import { Layers } from 'lucide-react'

interface ComparisonButtonProps {
  product: {
    id: string
    name: string
    nameAr?: string
    nameFr?: string
    price: number
    sku: string
    images?: { url: string }[]
    brand: string
    category: string
    power?: string
    efficiency?: string
    warranty?: string
  }
  variant?: 'icon' | 'text'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ComparisonButton({
  product,
  variant = 'icon',
  size = 'md',
  className = ''
}: ComparisonButtonProps) {
  const { addToComparison, isInComparison, items } = useComparison()
  const { t, locale } = useLanguage()
  const [isProcessing, setIsProcessing] = useState(false)

  const isComparing = isInComparison(product.id)

  const handleToggleComparison = async () => {
    setIsProcessing(true)
    
    try {
      const comparisonItem = {
        productId: product.id,
        name: product.name,
        nameAr: product.nameAr,
        nameFr: product.nameFr,
        price: product.price,
        sku: product.sku,
        image: product.images?.[0]?.url,
        brand: product.brand,
        category: product.category,
        power: product.power,
        efficiency: product.efficiency,
        warranty: product.warranty
      }

      addToComparison(comparisonItem)
    } catch (error) {
      console.error('Error toggling comparison:', error)
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
        onClick={handleToggleComparison}
        disabled={isProcessing || (!isComparing && items.length >= 4)}
        className={`${sizeClasses[size]} ${variantClasses[variant]} ${
          isComparing 
            ? 'text-blue-500 bg-blue-50 hover:bg-blue-100' 
            : 'text-gray-400 bg-gray-100 hover:bg-gray-200 hover:text-gray-600'
        } transition-colors ${className} ${(items.length >= 4 && !isComparing) ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={isComparing ? t('comparison.remove') : t('comparison.add')}
      >
        <Layers 
          className={`h-4 w-4 ${isComparing ? 'fill-current' : ''}`} 
        />
      </button>
    )
  }

  return (
    <button
      onClick={handleToggleComparison}
      disabled={isProcessing || (!isComparing && items.length >= 4)}
      className={`${variantClasses[variant]} ${
        isComparing 
          ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200' 
          : 'text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200'
      } transition-colors ${className} ${(items.length >= 4 && !isComparing) ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Layers 
        className={`h-4 w-4 ${isComparing ? 'fill-current' : ''}`} 
      />
      <span>
        {isComparing ? t('comparison.remove') : t('comparison.add')}
      </span>
    </button>
  )
}