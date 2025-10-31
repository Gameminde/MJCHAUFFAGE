import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useCart } from '../useCart';
import { CartProvider } from '@/contexts/CartProvider';
import { vi } from 'vitest';

// Mock jest with vi
global.jest = vi;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  React.createElement(CartProvider, null, children)
);

describe('useCart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('initializes with empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('loads cart from localStorage on mount', () => {
    const savedCart = [
      {
        productId: '1',
        name: 'Test Product',
        price: 1000,
        image: '/test.jpg',
        maxStock: 10,
        sku: 'TEST-001',
        quantity: 2,
      },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedCart));

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toEqual(savedCart);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalPrice).toBe(2000);
  });

  it('handles invalid localStorage data gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid json');

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('adds item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const newItem = {
      productId: '1',
      name: 'Test Product',
      price: 1000,
      image: '/test.jpg',
      maxStock: 10,
      sku: 'TEST-001',
    };

    act(() => {
      result.current.addItem(newItem);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual({ ...newItem, quantity: 1 });
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalPrice).toBe(1000);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('increases quantity when adding existing item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const item = {
      productId: '1',
      name: 'Test Product',
      price: 1000,
      image: '/test.jpg',
      maxStock: 10,
      sku: 'TEST-001',
    };

    act(() => {
      result.current.addItem(item);
      result.current.addItem(item);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalPrice).toBe(2000);
  });

  it('prevents adding more items than max stock', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const item = {
      productId: '1',
      name: 'Test Product',
      price: 1000,
      image: '/test.jpg',
      maxStock: 2,
      sku: 'TEST-001',
    };

    act(() => {
      result.current.addItem(item);
      result.current.addItem(item);
      result.current.addItem(item); // This should be prevented
    });

    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.totalItems).toBe(2);
  });

  it('removes item from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const item = {
      productId: '1',
      name: 'Test Product',
      price: 1000,
      image: '/test.jpg',
      maxStock: 10,
      sku: 'TEST-001',
    };

    act(() => {
      result.current.addItem(item);
      result.current.removeItem('1');
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('updates item quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const item = {
      productId: '1',
      name: 'Test Product',
      price: 1000,
      image: '/test.jpg',
      maxStock: 10,
      sku: 'TEST-001',
    };

    act(() => {
      result.current.addItem(item);
      result.current.updateQuantity('1', 5);
    });

    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.totalItems).toBe(5);
    expect(result.current.totalPrice).toBe(5000);
  });

  it('prevents updating quantity above max stock', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const item = {
      productId: '1',
      name: 'Test Product',
      price: 1000,
      image: '/test.jpg',
      maxStock: 3,
      sku: 'TEST-001',
    };

    act(() => {
      result.current.addItem(item);
      result.current.updateQuantity('1', 10); // Should be limited to maxStock
    });

    expect(result.current.items[0].quantity).toBe(3);
  });

  it('prevents updating quantity below 1', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const item = {
      productId: '1',
      name: 'Test Product',
      price: 1000,
      image: '/test.jpg',
      maxStock: 10,
      sku: 'TEST-001',
    };

    act(() => {
      result.current.addItem(item);
      result.current.updateQuantity('1', 0); // Should remove item instead
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('clears entire cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const item1 = {
      productId: '1',
      name: 'Product 1',
      price: 1000,
      image: '/test1.jpg',
      maxStock: 10,
      sku: 'TEST-001',
    };

    const item2 = {
      productId: '2',
      name: 'Product 2',
      price: 2000,
      image: '/test2.jpg',
      maxStock: 5,
      sku: 'TEST-002',
    };

    act(() => {
      result.current.addItem(item1);
      result.current.addItem(item2);
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('checks if cart contains specific product', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const item = {
      productId: '1',
      name: 'Test Product',
      price: 1000,
      image: '/test.jpg',
      maxStock: 10,
      sku: 'TEST-001',
    };

    expect(result.current.containsProduct('1')).toBe(false);

    act(() => {
      result.current.addItem(item);
    });

    expect(result.current.containsProduct('1')).toBe(true);
    expect(result.current.containsProduct('2')).toBe(false);
  });

  it('returns correct cart summary', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const item1 = {
      productId: '1',
      name: 'Product 1',
      price: 1000,
      image: '/test1.jpg',
      maxStock: 10,
      sku: 'TEST-001',
    };

    const item2 = {
      productId: '2',
      name: 'Product 2',
      price: 2000,
      image: '/test2.jpg',
      maxStock: 5,
      sku: 'TEST-002',
    };

    act(() => {
      result.current.addItem(item1);
      result.current.addItem(item2);
      result.current.addItem(item2); // Add another of item2
    });

    const summary = result.current.getCartSummary();
    expect(summary.totalItems).toBe(3);
    expect(summary.totalPrice).toBe(5000); // (1*1000) + (2*2000)
    expect(summary.itemsCount).toBe(2); // 2 different products
  });

  it('persists cart changes to localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const item = {
      productId: '1',
      name: 'Test Product',
      price: 1000,
      image: '/test.jpg',
      maxStock: 10,
      sku: 'TEST-001',
    };

    act(() => {
      result.current.addItem(item);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'cart',
      JSON.stringify([{ ...item, quantity: 1 }])
    );
  });

  it('handles localStorage errors gracefully', () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage is full');
    });

    const { result } = renderHook(() => useCart(), { wrapper });

    const item = {
      productId: '1',
      name: 'Test Product',
      price: 1000,
      image: '/test.jpg',
      maxStock: 10,
      sku: 'TEST-001',
    };

    // Should not throw error when localStorage fails
    expect(() => {
      act(() => {
        result.current.addItem(item);
      });
    }).not.toThrow();

    // Cart should still work in memory
    expect(result.current.items).toHaveLength(1);
  });
});
