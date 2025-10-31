import React, { createContext, useContext, ReactNode } from 'react';

interface CartItem {
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

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  addItem: (item: any) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (value?: boolean) => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getShippingCost: (wilaya?: string) => number;
  getTotal: (wilaya?: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Basic implementation to prevent build errors
  const contextValue: CartContextType = {
    items: [],
    isOpen: false,
    isLoading: false,
    error: null,
    addItem: () => {},
    removeItem: () => {},
    updateQuantity: () => {},
    clearCart: () => {},
    toggleCart: () => {},
    getTotalItems: () => 0,
    getSubtotal: () => 0,
    getShippingCost: () => 500,
    getTotal: () => 0,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
