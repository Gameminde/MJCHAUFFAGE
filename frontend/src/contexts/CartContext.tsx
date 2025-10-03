import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'
import { useLanguage } from '@/hooks/useLanguage'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  sku: string
  maxStock: number
  nameAr?: string
  nameFr?: string
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  currency: string
  isLoading: boolean
  error: string | null
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_CART'; payload: CartItem[] }

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  currency: 'DZD',
  isLoading: false,
  error: null
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.productId === action.payload.productId)
      
      let newItems: CartItem[]
      if (existingItem) {
        const newQuantity = existingItem.quantity + (action.payload.quantity || 1)
        if (newQuantity > existingItem.maxStock) {
          return {
            ...state,
            error: 'Stock insuffisant pour ce produit'
          }
        }
        newItems = state.items.map(item =>
          item.productId === action.payload.productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      } else {
        const quantity = action.payload.quantity || 1
        if (quantity > action.payload.maxStock) {
          return {
            ...state,
            error: 'Stock insuffisant pour ce produit'
          }
        }
        newItems = [...state.items, {
          ...action.payload,
          id: `cart_${Date.now()}`,
          quantity
        }]
      }

      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return {
        ...state,
        items: newItems,
        total,
        itemCount,
        error: null
      }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload)
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return {
        ...state,
        items: newItems,
        total,
        itemCount
      }
    }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: action.payload.id })
      }

      const item = state.items.find(item => item.id === action.payload.id)
      if (item && action.payload.quantity > item.maxStock) {
        return {
          ...state,
          error: 'Stock insuffisant pour ce produit'
        }
      }

      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      )

      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return {
        ...state,
        items: newItems,
        total,
        itemCount,
        error: null
      }
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
        error: null
      }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      }

    case 'LOAD_CART':
      const total = action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const itemCount = action.payload.reduce((sum, item) => sum + item.quantity, 0)
      return {
        ...state,
        items: action.payload,
        total,
        itemCount
      }

    default:
      return state
  }
}

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  formatPrice: (price: number) => string
  validateStock: (productId: string, quantity: number) => Promise<boolean>
  refreshItemStock: (productId: string) => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const { currencyConfig } = useLanguage()

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('mj_cart')
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', payload: cartItems })
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
        // Clear invalid cart data
        localStorage.removeItem('mj_cart')
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('mj_cart', JSON.stringify(state.items))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Error saving cart data' })
    }
  }, [state.items])

  // Validate cart items against current stock (simulated)
  useEffect(() => {
    const validateCartStock = async () => {
      if (state.items.length === 0) return
      
      // In a real app, this would call an API to check stock
      // For now, we'll just log the validation
  
      
      // TODO: Implement real stock validation API call
    }
    
    validateCartStock()
  }, [state.items])

  const addItem = (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: currencyConfig.code,
      minimumFractionDigits: currencyConfig.decimalPlaces
    }).format(price)
  }

  const validateStock = async (productId: string, quantity: number): Promise<boolean> => {
    try {
      // TODO: Implement API call to validate stock
      // For now, check against current cart item maxStock
      const cartItem = state.items.find(item => item.productId === productId)
      if (cartItem) {
        return quantity <= cartItem.maxStock
      }
      return true
    } catch (error) {
      console.error('Error validating stock:', error)
      return false
    }
  }

  const refreshItemStock = async (productId: string): Promise<void> => {
    try {
      // TODO: Implement API call to refresh stock information
      // This would update the maxStock for the item in cart
  
    } catch (error) {
      console.error('Error refreshing stock:', error)
    }
  }

  const contextValue: CartContextType = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    formatPrice,
    validateStock,
    refreshItemStock
  }

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}