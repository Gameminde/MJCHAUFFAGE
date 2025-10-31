import React from 'react';
import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { mockUseLanguage, mockUseCart, mockUseAuth, mockUseWishlist, mockUseRouter } from './test-utils';

// Global test setup for Vitest

beforeAll(async () => {
  // Global setup before all tests
  console.log('Setting up test environment...');

  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
  process.env.FRONTEND_URL = 'http://localhost:3000';

  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    writable: true,
  });

  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    writable: true,
  });
});

afterAll(async () => {
  // Global cleanup after all tests
  console.log('Cleaning up test environment...');
});

beforeEach(async () => {
  // Setup before each test
  vi.clearAllMocks();

  // Mock all the hooks globally
  vi.mock('@/hooks/useLanguage', () => ({
    useLanguage: mockUseLanguage,
  }));

  vi.mock('@/hooks/useCart', () => ({
    useCart: mockUseCart,
  }));

  vi.mock('@/contexts/AuthContext', () => ({
    useAuth: mockUseAuth,
  }));

  vi.mock('@/contexts/WishlistContext', () => ({
    useWishlist: mockUseWishlist,
  }));

  vi.mock('next/navigation', () => ({
    useRouter: mockUseRouter,
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
  }));

  // Mock Next.js Image component
  vi.mock('next/image', () => ({
    default: ({ src, alt, ...props }: any) => React.createElement('img', { src, alt, ...props }),
  }));
});

afterEach(async () => {
  // Cleanup after each test
});