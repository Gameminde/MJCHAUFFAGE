import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  nameAr?: string;
  nameFr?: string;
  price: number;
  quantity: number;
  image?: string;
  sku: string;
  maxStock: number;
}

export type AddItemInput = {
  id?: string;
  productId: string;
  name: string;
  nameAr?: string;
  nameFr?: string;
  price: number;
  quantity?: number;
  image?: string;
  sku: string;
  maxStock?: number;
};

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;

  addItem: (item: AddItemInput) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (value?: boolean) => void;
  setItems: (items: CartItem[]) => void;
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  clearError: () => void;

  getTotalItems: () => number;
  getSubtotal: () => number;
  getShippingCost: (wilaya?: string) => number;
  getTotal: (wilaya?: string) => number;
}

const SHIPPING_RATES: Record<string, number> = {
  Alger: 500,
  Blida: 600,
  Oran: 850,
  Constantine: 800,
};

const FREE_SHIPPING_THRESHOLD = 50000;

const STORAGE_NAME = 'mj-chauffage-cart';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,
      error: null,

      addItem: (newItem) => {
        set((state) => {
          const items = state.items;
          const existingIndex = items.findIndex(
            (item) => item.productId === newItem.productId,
          );
          const quantityToAdd = newItem.quantity ?? 1;
          const maxStock = newItem.maxStock ?? Number.MAX_SAFE_INTEGER;
          let error: string | null = null;

          if (existingIndex >= 0) {
            const updatedItems = [...items];
            const existing = updatedItems[existingIndex];
            const newQuantity = Math.min(
              existing.quantity + quantityToAdd,
              maxStock,
            );

            if (existing.quantity + quantityToAdd > maxStock) {
              error = 'Stock insuffisant pour ce produit';
            }

            updatedItems[existingIndex] = {
              ...existing,
              quantity: newQuantity,
              maxStock,
            };

            return {
              items: updatedItems,
              error,
            };
          }

          const cartItem: CartItem = {
            id: newItem.id ?? `cart_${Date.now()}`,
            productId: newItem.productId,
            name: newItem.name,
            nameAr: newItem.nameAr,
            nameFr: newItem.nameFr,
            price: newItem.price,
            quantity: Math.min(quantityToAdd, maxStock),
            image: newItem.image,
            sku: newItem.sku,
            maxStock,
          };

          if (quantityToAdd > maxStock) {
            error = 'Stock insuffisant pour ce produit';
          }

          return {
            items: [...items, cartItem],
            error,
          };
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.id !== itemId),
            };
          }

          let error: string | null = null;

          const items = state.items.map((item) => {
            if (item.id !== itemId) {
              return item;
            }

          const nextQuantity = Math.min(quantity, item.maxStock);
            if (quantity > item.maxStock) {
              error = 'Stock insuffisant pour ce produit';
            }

            return {
              ...item,
              quantity: nextQuantity,
            };
          });

          return { items, error };
        });
      },

      clearCart: () => set({ items: [], error: null }),

      toggleCart: (value) =>
        set((state) => ({
          isOpen: typeof value === 'boolean' ? value : !state.isOpen,
        })),

      setItems: (items) => set({ items }),
      setLoading: (value) => set({ isLoading: value }),
      setError: (message) => set({ error: message }),
      clearError: () => set({ error: null }),

      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        ),

      getShippingCost: (wilaya) => {
        if (!wilaya) return 0;
        const subtotal = get().getSubtotal();
        if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
        return SHIPPING_RATES[wilaya] || 1000;
      },

      getTotal: (wilaya) =>
        get().getSubtotal() + get().getShippingCost(wilaya),
    }),
    {
      name: STORAGE_NAME,
      storage:
        typeof window !== 'undefined'
          ? createJSONStorage(() => window.localStorage)
          : undefined,
    },
  ),
);
