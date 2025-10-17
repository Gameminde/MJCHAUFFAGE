import { useCallback, useMemo } from 'react';
import {
  useCartStore,
  type AddItemInput,
  type CartItem,
} from '@/store/cartStore';
import { useLanguage } from '@/hooks/useLanguage';

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

  const { currencyConfig } = useLanguage();

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
      new Intl.NumberFormat('ar-DZ', {
        style: 'currency',
        currency: currencyConfig.code,
        minimumFractionDigits: currencyConfig.decimalPlaces,
      }).format(price),
    [currencyConfig],
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
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
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
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
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
