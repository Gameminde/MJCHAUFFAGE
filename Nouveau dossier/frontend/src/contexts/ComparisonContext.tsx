'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useLanguage } from '@/hooks/useLanguage'

export interface ComparisonItem {
  id: string
  productId: string
  name: string
  nameAr?: string
  nameFr?: string
  price: number
  image?: string
  sku: string
  brand: string
  category: string
  power?: string
  efficiency?: string
  warranty?: string
}

interface ComparisonState {
  items: ComparisonItem[]
  maxItems: number
}

interface ComparisonContextType extends ComparisonState {
  addToComparison: (item: Omit<ComparisonItem, 'id'>) => void
  removeFromComparison: (productId: string) => void
  isInComparison: (productId: string) => boolean
  clearComparison: () => void
  formatPrice: (price: number) => string
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined)

interface ComparisonProviderProps {
  children: ReactNode
}

const initialState: ComparisonState = {
  items: [],
  maxItems: 4
}

export function ComparisonProvider({ children }: ComparisonProviderProps) {
  const [state, setState] = useState<ComparisonState>(initialState)
  const { currencyConfig } = useLanguage()

  // Load comparison from localStorage on mount
  useEffect(() => {
    const savedComparison = localStorage.getItem('mj_comparison')
    if (savedComparison) {
      try {
        const comparisonItems = JSON.parse(savedComparison)
        setState(prev => ({
          ...prev,
          items: comparisonItems
        }))
      } catch (error) {
        console.error('Error loading comparison from localStorage:', error)
        localStorage.removeItem('mj_comparison')
      }
    }
  }, [])

  // Save comparison to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('mj_comparison', JSON.stringify(state.items))
    } catch (error) {
      console.error('Error saving comparison to localStorage:', error)
    }
  }, [state.items])

  const addToComparison = (item: Omit<ComparisonItem, 'id'>) => {
    // Check if item is already in comparison
    const existingItem = state.items.find(i => i.productId === item.productId)
    
    if (existingItem) {
      // Remove if already exists (toggle behavior)
      removeFromComparison(item.productId)
      return
    }

    // Check if we've reached the maximum items
    if (state.items.length >= state.maxItems) {
      // Remove the oldest item to make room for the new one
      const newItems = [...state.items.slice(1), { ...item, id: `compare_${Date.now()}_${item.productId}` }]
      setState(prev => ({
        ...prev,
        items: newItems
      }))
      return
    }

    const newItem: ComparisonItem = {
      ...item,
      id: `compare_${Date.now()}_${item.productId}`
    }

    setState(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const removeFromComparison = (productId: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.productId !== productId)
    }))
  }

  const isInComparison = (productId: string) => {
    return state.items.some(item => item.productId === productId)
  }

  const clearComparison = () => {
    setState(prev => ({
      ...prev,
      items: []
    }))
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: currencyConfig.code,
      minimumFractionDigits: currencyConfig.decimalPlaces
    }).format(price)
  }

  const contextValue: ComparisonContextType = {
    ...state,
    addToComparison,
    removeFromComparison,
    isInComparison,
    clearComparison,
    formatPrice
  }

  return (
    <ComparisonContext.Provider value={contextValue}>
      {children}
    </ComparisonContext.Provider>
  )
}

export function useComparison() {
  const context = useContext(ComparisonContext)
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider')
  }
  return context
}