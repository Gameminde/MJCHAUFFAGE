// frontend/src/hooks/useGuestCart.ts
// 🛒 Guest cart management with localStorage

import { useState, useEffect } from 'react';

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
}

const GUEST_CART_KEY = 'guestCart';

/**
 * Hook for managing guest cart with localStorage persistence
 */
export function useGuestCart() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    // ✅ Load from localStorage on mount
    if (typeof window === 'undefined') return [];
    
    try {
      const saved = localStorage.getItem(GUEST_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading guest cart:', error);
      return [];
    }
  });

  // ✅ Persist to localStorage whenever cart changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving guest cart:', error);
    }
  }, [cart]);

  /**
   * Add item to cart or update quantity if exists
   */
  const addItem = (product: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.productId);
      
      if (existing) {
        // Update existing item quantity
        return prev.map(item =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      // Add new item
      return [...prev, { ...product, quantity }];
    });
  };

  /**
   * Update item quantity
   */
  const updateItem = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setCart(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  /**
   * Remove item from cart
   */
  const removeItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  /**
   * Clear entire cart
   */
  const clearCart = () => {
    setCart([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(GUEST_CART_KEY);
    }
  };

  /**
   * Get cart total
   */
  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  /**
   * Get cart item count
   */
  const getItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return {
    cart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    getTotal,
    getItemCount,
  };
}

/**
 * Get guest cart from localStorage (for server-side or external use)
 */
export function getGuestCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem(GUEST_CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error reading guest cart:', error);
    return [];
  }
}

/**
 * Clear guest cart from localStorage
 */
export function clearGuestCartFromStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_CART_KEY);
}

export default useGuestCart;
