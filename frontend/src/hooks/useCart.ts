import { useCallback, useMemo, useEffect } from 'react';
import {
  useCartStore,
  type AddItemInput,
  type CartItem,
} from '@/store/cartStore';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export type { AddItemInput } from '@/store/cartStore';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface UseCartResult {
  items: CartItem[];
  total: number;
  itemCount: number;
  currencyCode: string;
  isLoading: boolean;
  error: string | null;

  addItem: (item: AddItemInput) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (value?: boolean) => void;
  clearError: () => void;

  formatPrice: (price: number) => string;
  validateStock: (productId: string, quantity: number) => Promise<boolean>;
  refreshItemStock: (productId: string) => Promise<void>;
}

export function useCart(): UseCartResult {
  const items = useCartStore((state) => state.items);
  const addItemStore = useCartStore((state) => state.addItem);
  const removeItemStore = useCartStore((state) => state.removeItem);
  const updateQuantityStore = useCartStore((state) => state.updateQuantity);
  const clearCartStore = useCartStore((state) => state.clearCart);
  const toggleCartStore = useCartStore((state) => state.toggleCart);
  const setItems = useCartStore((state) => state.setItems);
  const setError = useCartStore((state) => state.setError);
  const clearError = useCartStore((state) => state.clearError);
  const isLoading = useCartStore((state) => state.isLoading);
  const error = useCartStore((state) => state.error);

  const { currencyConfig, locale } = useLanguage();

  // Use consolidated AuthContext
  const { user, loading: authLoading } = useAuth();

  const isAuthenticated = !!user && !authLoading;
  const userId = user?.id;

  // Sync cart with backend when user logs in/out
  useEffect(() => {
    if (isAuthenticated && user) {
      // Load cart from backend when user logs in
      syncCartFromBackend();
    } else if (!isAuthenticated) {
      // Keep local cart when user logs out
      // The cart store already persists to localStorage
    }
  }, [isAuthenticated, user]);

  // Sync cart changes to backend for authenticated users with debouncing
  useEffect(() => {
    if (isAuthenticated && items.length > 0) {
      // Debounce cart sync to avoid too many requests
      const timeoutId = setTimeout(() => {
        syncCartToBackend();
      }, 1500); // Wait 1.5 seconds after last change

      return () => clearTimeout(timeoutId);
    }
  }, [items, isAuthenticated]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const formatPrice = useCallback(
    (price: number) =>
      new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
        style: 'currency',
        currency: currencyConfig.code,
        minimumFractionDigits: currencyConfig.decimalPlaces,
      }).format(price),
    [currencyConfig, locale],
  );

  const addItem = useCallback(
    (item: AddItemInput) => {
      clearError();
      addItemStore(item);
    },
    [addItemStore, clearError],
  );

  const removeItem = useCallback(
    (itemId: string) => {
      clearError();
      removeItemStore(itemId);
    },
    [removeItemStore, clearError],
  );

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      clearError();
      updateQuantityStore(itemId, quantity);
    },
    [updateQuantityStore, clearError],
  );

  const clearCart = useCallback(() => {
    clearError();
    clearCartStore();
  }, [clearCartStore, clearError]);

  const toggleCart = useCallback(
    (value?: boolean) => {
      toggleCartStore(value);
    },
    [toggleCartStore],
  );

  const validateStock = useCallback(
    async (productId: string, quantity: number): Promise<boolean> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data?.product) {
            return quantity <= result.data.product.stockQuantity;
          }
        }
      } catch (err) {
        console.error('Error validating stock:', err);
      }

      const cartItem = useCartStore
        .getState()
        .items.find((item) => item.productId === productId);

      if (cartItem?.maxStock !== undefined) {
        return quantity <= cartItem.maxStock;
      }

      return true;
    },
    [],
  );

  const refreshItemStock = useCallback(
    async (productId: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}`);
        if (!response.ok) {
          return;
        }

        const result = await response.json();
        if (!result.success || !result.data?.product) {
          return;
        }

        const currentStock = result.data.product.stockQuantity;
        const updatedItems = useCartStore.getState().items.map((item) =>
          item.productId === productId
            ? { ...item, maxStock: currentStock, quantity: Math.min(item.quantity, currentStock) }
            : item,
        );

        setItems(updatedItems);
      } catch (err) {
        console.error('Error refreshing stock:', err);
        setError('Erreur lors de la mise à jour du stock');
      }
    },
    [setItems, setError],
  );

  const syncCartToBackend = useCallback(
    async () => {
      if (!isAuthenticated) return;

      try {
        const cartItems = items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        }));

        await api.post('/cart/sync', { items: cartItems });
      } catch (error) {
        console.error('Error syncing cart to backend:', error);
        // Don't show error to user for background sync
      }
    },
    [items, isAuthenticated],
  );

  const syncCartFromBackend = useCallback(
    async () => {
      if (!isAuthenticated) return;

      try {
        const result = await api.get('/cart') as { success: boolean; data?: { items?: any[] } };
        if (result.success && result.data?.items) {
          // Merge backend cart with local cart
          const backendItems = result.data.items;
          const localItems = useCartStore.getState().items;

          // Simple merge: prefer backend items, add any local items not in backend
          const mergedItems = [...backendItems];

          localItems.forEach(localItem => {
            const existsInBackend = mergedItems.some(item => item.productId === localItem.productId);
            if (!existsInBackend) {
              mergedItems.push(localItem);
            }
          });

          setItems(mergedItems);
        }
      } catch (error) {
        console.error('Error syncing cart from backend:', error);
        // Don't show error to user for background sync
      }
    },
    [isAuthenticated, setItems],
  );

  return {
    items,
    total,
    itemCount,
    currencyCode: currencyConfig.code,
    isLoading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    clearError,
    formatPrice,
    validateStock,
    refreshItemStock,
  };
}
