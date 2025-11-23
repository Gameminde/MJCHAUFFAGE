import { useEffect, useCallback } from 'react';
import { useCartStore, AddItemInput } from '@/store/cartStore';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';

export const useCart = () => {
  const { user, loading: authLoading } = useAuth();
  const { locale, currencyConfig } = useLanguage();

  // Use selectors to avoid unnecessary re-renders
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const isOpen = useCartStore((state) => state.isOpen);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const isLoading = useCartStore((state) => state.isLoading);
  const error = useCartStore((state) => state.error);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const getShippingCost = useCartStore((state) => state.getShippingCost);
  const getTotal = useCartStore((state) => state.getTotal);
  const setUserId = useCartStore((state) => state.setUserId);
  const syncWithServer = useCartStore((state) => state.syncWithServer);

  // Sync user ID with store
  useEffect(() => {
    if (!authLoading) {
      setUserId(user?.id || null);
    }
  }, [user, authLoading, setUserId]);

  // Sync with server when user changes
  useEffect(() => {
    if (user?.id) {
      syncWithServer();
    }
  }, [user?.id, syncWithServer]);

  const formatPrice = useCallback(
    (price: number) =>
      new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
        style: 'currency',
        currency: currencyConfig.code,
        minimumFractionDigits: currencyConfig.decimalPlaces,
      }).format(price),
    [currencyConfig, locale],
  );

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total: getSubtotal(),
    itemCount: getTotalItems(),
    isOpen,
    toggleCart,
    isLoading: isLoading || authLoading,
    error,
    formatPrice,
    getShippingCost,
    finalTotal: getTotal,
  };
};

export type { AddItemInput };
