import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  name: string
  nameAr?: string
  nameFr?: string
  price: number
  quantity: number
  image?: string
  category?: string
  inStock: boolean
  maxQuantity?: number
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
  
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  
  getTotalItems: () => number
  getSubtotal: () => number
  getShippingCost: (wilaya?: string) => number
  getTotal: (wilaya?: string) => number
}

const SHIPPING_RATES: Record<string, number> = {
  'Alger': 500,
  'Blida': 600,
  'Oran': 850,
  'Constantine': 800,
  // Add more wilayas...
}

const FREE_SHIPPING_THRESHOLD = 50000

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        const items = get().items
        const existingIndex = items.findIndex(item => item.productId === newItem.productId)

        if (existingIndex >= 0) {
          const updatedItems = [...items]
          updatedItems[existingIndex].quantity += (newItem.quantity || 1)
          set({ items: updatedItems })
        } else {
          const cartItem: CartItem = { ...newItem, quantity: newItem.quantity || 1 }
          set({ items: [...items, cartItem] })
        }
      },

      removeItem: (itemId) => {
        set(state => ({ items: state.items.filter(item => item.id !== itemId) }))
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        set(state => ({
          items: state.items.map(item => 
            item.id === itemId ? { ...item, quantity } : item
          )
        }))
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),

      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      getSubtotal: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
      
      getShippingCost: (wilaya) => {
        if (!wilaya) return 0
        const subtotal = get().getSubtotal()
        if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0
        return SHIPPING_RATES[wilaya] || 1000
      },

      getTotal: (wilaya) => get().getSubtotal() + get().getShippingCost(wilaya)
    }),
    { name: 'mj-chauffage-cart' }
  )
)