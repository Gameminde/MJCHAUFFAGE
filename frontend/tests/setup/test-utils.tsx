import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

// Mock next-intl
const messages = {
  common: {
    loading: 'Loading...',
    error: 'Error occurred',
  },
};

const MockIntlProvider = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="fr" messages={messages}>
    {children}
  </NextIntlClientProvider>
);

// Mock Auth Context
const mockAuthContext = {
  user: null,
  loading: false,
  error: null,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="auth-provider">{children}</div>
);

// Mock Wishlist Context
const mockWishlistContext = {
  wishlist: [],
  addToWishlist: vi.fn(),
  removeFromWishlist: vi.fn(),
  isInWishlist: vi.fn(() => false),
  clearWishlist: vi.fn(),
  loading: false,
  error: null,
};

const MockWishlistProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="wishlist-provider">{children}</div>
);

// Mock Cart Context (zustand store)
const mockCartStore = {
  items: [],
  addItem: vi.fn(),
  removeItem: vi.fn(),
  updateQuantity: vi.fn(),
  clearCart: vi.fn(),
  setItems: vi.fn(),
  setError: vi.fn(),
  clearError: vi.fn(),
  isLoading: false,
  error: null,
};

// Combine all providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MockIntlProvider>
      <MockAuthProvider>
        <MockWishlistProvider>
          {children}
        </MockWishlistProvider>
      </MockAuthProvider>
    </MockIntlProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock hooks
export const mockUseLanguage = () => ({
  locale: 'fr',
  isRTL: false,
  language: 'fr',
  dir: 'ltr',
  currencyConfig: {
    code: 'DZD',
    symbol: 'د.ج',
    decimalPlaces: 2,
  },
  t: (key: string) => key,
});

// Stable spies for Router
const mockRouterPush = vi.fn();
const mockRouterReplace = vi.fn();
const mockRouterBack = vi.fn();
const mockRouterForward = vi.fn();
const mockRouterRefresh = vi.fn();
const mockRouterPrefetch = vi.fn();

export const mockUseRouter = () => ({
  push: mockRouterPush,
  replace: mockRouterReplace,
  back: mockRouterBack,
  forward: mockRouterForward,
  refresh: mockRouterRefresh,
  prefetch: mockRouterPrefetch,
});

// Stable spies for Cart
const mockCartAddItem = vi.fn();
const mockCartRemoveItem = vi.fn();
const mockCartUpdateQuantity = vi.fn();
const mockCartClearCart = vi.fn();
const mockCartToggleCart = vi.fn();
const mockCartClearError = vi.fn();
const mockCartValidateStock = vi.fn().mockResolvedValue(true);
const mockCartRefreshItemStock = vi.fn();

export const mockUseCart = () => ({
  items: [],
  total: 0,
  itemCount: 0,
  currencyCode: 'DZD',
  isLoading: false,
  error: null,
  addItem: mockCartAddItem,
  removeItem: mockCartRemoveItem,
  updateQuantity: mockCartUpdateQuantity,
  clearCart: mockCartClearCart,
  toggleCart: mockCartToggleCart,
  clearError: mockCartClearError,
  formatPrice: (price: number) => `${price} د.ج`,
  validateStock: mockCartValidateStock,
  refreshItemStock: mockCartRefreshItemStock,
});

// Stable spies for Wishlist
const mockWishlistAddTo = vi.fn();
const mockWishlistRemoveFrom = vi.fn();
const mockWishlistIsIn = vi.fn(() => false);
const mockWishlistClear = vi.fn();

export const mockUseWishlist = () => ({
  wishlist: [],
  addToWishlist: mockWishlistAddTo,
  removeFromWishlist: mockWishlistRemoveFrom,
  isInWishlist: mockWishlistIsIn,
  clearWishlist: mockWishlistClear,
  loading: false,
  error: null,
});

// Stable spies for Auth
const mockAuthLogin = vi.fn();
const mockAuthRegister = vi.fn();
const mockAuthLogout = vi.fn();

export const mockUseAuth = () => ({
  user: null,
  loading: false,
  error: null,
  login: mockAuthLogin,
  register: mockAuthRegister,
  logout: mockAuthLogout,
});
