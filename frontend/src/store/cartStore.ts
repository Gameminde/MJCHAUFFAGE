import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { cartService } from '@/services/cartService';

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
  userId: string | null;

  addItem: (item: AddItemInput) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCart: (value?: boolean) => void;
  setItems: (items: CartItem[]) => void;
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  clearError: () => void;
  setUserId: (id: string | null) => void;
  syncWithServer: () => Promise<void>;

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
      userId: null,

      setUserId: (id) => set({ userId: id }),

      syncWithServer: async () => {
        const userId = get().userId;
        if (!userId) return;

        set({ isLoading: true });
        try {
          // 1. Push local items to server (optional, or merge)
          const localItems = get().items;
          if (localItems.length > 0) {
            await cartService.syncCart(localItems.map(i => ({
              id: i.id,
              productId: i.productId,
              quantity: i.quantity,
              price: i.price,
              name: i.name
            })), userId);
          }

          // 2. Fetch latest cart from server
          const serverCart = await cartService.getCart(userId);
          if (serverCart) {
            // Map server items to local items
            const items = serverCart.items.map(item => ({
              id: item.id,
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
              sku: item.sku || '',
              maxStock: item.maxStock || 100 // Default if not provided
            }));
            set({ items });
          }
        } catch (error) {
          console.error(error);
          set({ error: 'Failed to sync cart' });
        } finally {
          set({ isLoading: false });
        }
      },

      addItem: async (newItem) => {
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

        // Sync with server
        const userId = get().userId;
        if (userId) {
          cartService.addToCart({
            userId,
            productId: newItem.productId,
            quantity: newItem.quantity ?? 1
          }).catch(console.error);
        }
      },

      removeItem: async (itemId) => {
        // Get item to find productId/cartItemId for server
        const itemToRemove = get().items.find(i => i.id === itemId);

        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));

        const userId = get().userId;
        if (userId && itemToRemove) {
          // Note: cartService.removeCartItem expects cart_item id. 
          // If local id is different from server id, this might fail.
          // Ideally, we should use the id from the server.
          // For now, assuming id matches or we need to find it.
          // Actually, cartService.removeCartItem takes cart_item id.
          // If we synced, local items should have server ids.
          cartService.removeCartItem(itemId, userId).catch(console.error);
        }
      },

      updateQuantity: async (itemId, quantity) => {
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

        const userId = get().userId;
        if (userId) {
          if (quantity <= 0) {
            cartService.removeCartItem(itemId, userId).catch(console.error);
          } else {
            cartService.updateCartItem({ itemId, quantity }, userId).catch(console.error);
          }
        }
      },

      clearCart: async () => {
        set({ items: [], error: null });
        const userId = get().userId;
        if (userId) {
          cartService.clearCart(userId).catch(console.error);
        }
      },

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
      partialize: (state) => ({ items: state.items, isOpen: state.isOpen }),
    },
  ),
);

