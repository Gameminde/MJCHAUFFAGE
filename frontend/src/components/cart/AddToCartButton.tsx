'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import type { AddItemInput } from '@/hooks/useCart'
import { useLanguage } from '@/hooks/useLanguage'
import { useAnalyticsContext } from '../analytics/AnalyticsProvider'
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    nameAr?: string
    nameFr?: string
    price: number
    sku: string
    stockQuantity: number
    categoryId?: string
    images?: { url: string }[]
  }
  variant?: 'primary' | 'secondary' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  showQuantitySelector?: boolean
  className?: string
}

export function AddToCartButton({
  product,
  variant = 'primary',
  size = 'md',
  showQuantitySelector = false,
  className = ''
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [error, setError] = useState('')
  const { addItem, items, formatPrice } = useCart()
  const { t, locale } = useLanguage()
  const { trackAddToCart } = useAnalyticsContext()
  const supabase = createClient()

  // Check if item is already in cart
  const cartItem = items.find(item => item.productId === product.id)
  const isInCart = !!cartItem
  const availableStock = cartItem?.maxStock ?? product.stockQuantity
  const maxQuantity = Math.max(0, availableStock - (cartItem?.quantity || 0))

  const handleAddToCart = async () => {
    if (maxQuantity <= 0) return

    setIsAdding(true)
    setError('')

    try {
      // Validate stock before adding by fetching latest product data
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', product.id)
        .single()

      let currentStock = product.stockQuantity

      if (!productError && productData) {
        currentStock = productData.stock_quantity
      }

      // Check if we have enough stock
      const currentCartQuantity = cartItem?.quantity || 0
      const totalRequestedQuantity = currentCartQuantity + quantity

      if (totalRequestedQuantity > currentStock) {
        setError(`Stock insuffisant. Disponible: ${currentStock - currentCartQuantity}`)
        setTimeout(() => setError(''), 3000)
        return
      }

      const cartItemData: AddItemInput = {
        productId: product.id,
        name: product.name,
        nameAr: product.nameAr,
        nameFr: product.nameFr,
        price: product.price,
        sku: product.sku,
        maxStock: currentStock,
        image: product.images?.[0]?.url,
        quantity
      }

      addItem(cartItemData)

      // Track analytics event
      trackAddToCart(
        product.id,
        quantity,
        product.price * quantity,
        product.categoryId
      )

      // Show success state
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 2000)

      // Reset quantity selector
      setQuantity(1)
    } catch (error) {
      setError('Erreur lors de l\'ajout au panier')
      console.error('Error adding to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const incrementQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(prev => prev + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  // Button size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  // Button variant classes
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    icon: 'p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50'
  }

  // Out of stock state
  if (product.stockQuantity <= 0) {
    return (
      <button
        disabled
        className={`${sizeClasses[size]} ${className} bg-gray-300 text-gray-500 cursor-not-allowed rounded-md font-medium`}
      >
        {t('product.outOfStock')}
      </button>
    )
  }

  // No more stock available (all in cart)
  if (maxQuantity <= 0) {
    return (
      <button
        disabled
        className={`${sizeClasses[size]} ${className} bg-orange-100 text-orange-600 cursor-not-allowed rounded-md font-medium`}
      >
        {t('product.maxInCart')}
      </button>
    )
  }

  // Icon variant
  if (variant === 'icon') {
    return (
      <button
        onClick={handleAddToCart}
        disabled={isAdding || justAdded}
        className={`${variantClasses[variant]} ${className} transition-colors`}
        aria-label="Ajouter au panier"
      >
        {justAdded ? (
          <Check className="h-5 w-5" />
        ) : isAdding ? (
          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <ShoppingCart className="h-5 w-5" />
        )}
      </button>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Quantity Selector */}
      {showQuantitySelector && (
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700">
            {t('product.quantity')}:
          </span>
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              type="button"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center font-medium">
              {quantity}
            </span>
            <button
              type="button"
              onClick={incrementQuantity}
              disabled={quantity >= maxQuantity}
              className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="text-sm text-gray-500">
            {t('product.available')}: {maxQuantity}
          </span>
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={isAdding || justAdded}
        className={`${variantClasses[variant]} ${sizeClasses[size]} w-full flex items-center justify-center space-x-2 transition-all duration-200 ${justAdded ? 'bg-green-600 hover:bg-green-600' : ''
          }`}
      >
        {justAdded ? (
          <>
            <Check className="h-5 w-5" />
            <span>{t('cart.added')}</span>
          </>
        ) : isAdding ? (
          <>
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{t('cart.adding')}</span>
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" />
            <span>
              {showQuantitySelector
                ? `Ajouter au panier - ${formatPrice(product.price * quantity)}`
                : 'Ajouter au panier'
              }
            </span>
          </>
        )}
      </button>

      {/* Low Stock Warning */}
      {maxQuantity <= 5 && maxQuantity > 0 && (
        <p className="text-sm text-orange-600">
          {t('product.lowStock')}: {maxQuantity} {t('product.remaining')}
        </p>
      )}

      {/* In Cart Indicator */}
      {isInCart && (
        <p className="text-sm text-green-600">
          {t('product.inCart')}: {cartItem.quantity} {t('product.items')}
        </p>
      )}
    </div>
  )
}
