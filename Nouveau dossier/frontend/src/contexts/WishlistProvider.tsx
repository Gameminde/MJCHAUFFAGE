import React, { createContext, useContext, ReactNode } from 'react';

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Basic implementation to prevent build errors
  const contextValue: WishlistContextType = {
    items: [],
    isLoading: false,
    error: null,
    addItem: () => {},
    removeItem: () => {},
    isInWishlist: () => false,
    clearWishlist: () => {},
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};
