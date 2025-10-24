'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useLanguage } from '@/hooks/useLanguage'

export interface WishlistItem {
  id: string
  productId: string
  name: string
  nameAr?: string
  nameFr?: string
  price: number
  image?: string
  sku: string
  addedAt: Date
}

interface WishlistState {
  items: WishlistItem[]
  itemCount: number
}

interface WishlistContextType extends WishlistState {
  addToWishlist: (item: Omit<WishlistItem, 'id' | 'addedAt'>) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  formatPrice: (price: number) => string
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

interface WishlistProviderProps {
  children: ReactNode
}

const initialState: WishlistState = {
  items: [],
  itemCount: 0
}

export function WishlistProvider({ children }: WishlistProviderProps) {
  const [state, setState] = useState<WishlistState>(initialState)
  const { currencyConfig } = useLanguage()

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('mj_wishlist')
    if (savedWishlist) {
      try {
        const wishlistItems = JSON.parse(savedWishlist).map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }))
        setState({
          items: wishlistItems,
          itemCount: wishlistItems.length
        })
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error)
        localStorage.removeItem('mj_wishlist')
      }
    }
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('mj_wishlist', JSON.stringify(state.items))
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error)
    }
  }, [state.items])

  const addToWishlist = (item: Omit<WishlistItem, 'id' | 'addedAt'>) => {
    // Check if item is already in wishlist
    const existingItem = state.items.find(i => i.productId === item.productId)
    
    if (existingItem) {
      // Remove if already exists (toggle behavior)
      removeFromWishlist(item.productId)
      return
    }

    const newItem: WishlistItem = {
      ...item,
      id: `wishlist_${Date.now()}_${item.productId}`,
      addedAt: new Date()
    }

    setState(prev => ({
      items: [...prev.items, newItem],
      itemCount: prev.items.length + 1
    }))
  }

  const removeFromWishlist = (productId: string) => {
    setState(prev => ({
      items: prev.items.filter(item => item.productId !== productId),
      itemCount: prev.items.length - 1
    }))
  }

  const isInWishlist = (productId: string) => {
    return state.items.some(item => item.productId === productId)
  }

  const clearWishlist = () => {
    setState({
      items: [],
      itemCount: 0
    })
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: currencyConfig.code,
      minimumFractionDigits: currencyConfig.decimalPlaces
    }).format(price)
  }

  const contextValue: WishlistContextType = {
    ...state,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    formatPrice
  }

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}