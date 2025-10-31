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

export const mockUseCart = () => ({
  items: [],
  total: 0,
  itemCount: 0,
  currencyCode: 'DZD',
  isLoading: false,
  error: null,
  addItem: vi.fn(),
  removeItem: vi.fn(),
  updateQuantity: vi.fn(),
  clearCart: vi.fn(),
  toggleCart: vi.fn(),
  clearError: vi.fn(),
  formatPrice: (price: number) => `${price} د.ج`,
  validateStock: vi.fn().mockResolvedValue(true),
  refreshItemStock: vi.fn(),
});

export const mockUseAuth = () => mockAuthContext;

export const mockUseWishlist = () => mockWishlistContext;

// Mock next/navigation
export const mockUseRouter = () => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
});
