import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CartProvider, useCart } from '../CartContext';
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

// Test component that uses the cart context
function TestCartComponent() {
  const {
    items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    containsProduct,
    getCartSummary,
  } = useCart();

  return (
    <div>
      <div data-testid="total-items">{totalItems}</div>
      <div data-testid="total-price">{totalPrice}</div>
      <div data-testid="items-count">{items.length}</div>
      <button
        data-testid="add-item"
        onClick={() =>
          addItem({
            productId: '1',
            name: 'Test Product',
            price: 1000,
            image: '/test.jpg',
            maxStock: 10,
            sku: 'TEST-001',
          })
        }
      >
        Add Item
      </button>
      <button data-testid="remove-item" onClick={() => removeItem('1')}>
        Remove Item
      </button>
      <button
        data-testid="update-quantity"
        onClick={() => updateQuantity('1', 3)}
      >
        Update Quantity
      </button>
      <button data-testid="clear-cart" onClick={() => clearCart()}>
        Clear Cart
      </button>
      <button data-testid="contains-product">
        Contains: {containsProduct('1').toString()}
      </button>
      <div data-testid="cart-summary">
        {JSON.stringify(getCartSummary())}
      </div>
    </div>
  );
}

describe('CartContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('provides cart context to child components', () => {
    render(
      <CartProvider>
        <TestCartComponent />
      </CartProvider>
    );

    expect(screen.getByTestId('total-items')).toHaveTextContent('0');
    expect(screen.getByTestId('total-price')).toHaveTextContent('0');
    expect(screen.getByTestId('items-count')).toHaveTextContent('0');
  });

  it('throws error when useCart is used outside CartProvider', () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestCartComponent />)).toThrow(
      'useCart must be used within a CartProvider'
    );

    consoleSpy.mockRestore();
  });

  it('loads cart from localStorage on mount', () => {
    const savedCart = [
      {
        productId: '1',
        name: 'Saved Product',
        price: 1500,
        image: '/saved.jpg',
        maxStock: 5,
        sku: 'SAVED-001',
        quantity: 2,
      },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedCart));

    render(
      <CartProvider>
        <TestCartComponent />
      </CartProvider>
    );

    expect(screen.getByTestId('total-items')).toHaveTextContent('2');
    expect(screen.getByTestId('total-price')).toHaveTextContent('3000');
    expect(screen.getByTestId('items-count')).toHaveTextContent('1');
  });

  it('handles invalid localStorage data gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid json');

    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <CartProvider>
        <TestCartComponent />
      </CartProvider>
    );

    expect(screen.getByTestId('total-items')).toHaveTextContent('0');
    expect(screen.getByTestId('total-price')).toHaveTextContent('0');

    consoleSpy.mockRestore();
  });

  it('adds item to cart when button is clicked', async () => {
    render(
      <CartProvider>
        <TestCartComponent />
      </CartProvider>
    );

    const addButton = screen.getByTestId('add-item');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('total-items')).toHaveTextContent('1');
      expect(screen.getByTestId('total-price')).toHaveTextContent('1000');
      expect(screen.getByTestId('items-count')).toHaveTextContent('1');
    });

    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('removes item from cart when button is clicked', async () => {
    render(
      <CartProvider>
        <TestCartComponent />
      </CartProvider>
    );

    // First add an item
    const addButton = screen.getByTestId('add-item');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('total-items')).toHaveTextContent('1');
    });

    // Then remove it
    const removeButton = screen.getByTestId('remove-item');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.getByTestId('total-items')).toHaveTextContent('0');
      expect(screen.getByTestId('total-price')).toHaveTextContent('0');
    });
  });

  it('updates item quantity when button is clicked', async () => {
    render(
      <CartProvider>
        <TestCartComponent />
      </CartProvider>
    );

    // First add an item
    const addButton = screen.getByTestId('add-item');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('total-items')).toHaveTextContent('1');
    });

    // Then update quantity
    const updateButton = screen.getByTestId('update-quantity');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByTestId('total-items')).toHaveTextContent('3');
      expect(screen.getByTestId('total-price')).toHaveTextContent('3000');
    });
  });

  it('clears cart when button is clicked', async () => {
    render(
      <CartProvider>
        <TestCartComponent />
      </CartProvider>
    );

    // First add an item
    const addButton = screen.getByTestId('add-item');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('total-items')).toHaveTextContent('1');
    });

    // Then clear cart
    const clearButton = screen.getByTestId('clear-cart');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.getByTestId('total-items')).toHaveTextContent('0');
      expect(screen.getByTestId('total-price')).toHaveTextContent('0');
    });
  });

  it('shows correct contains product status', async () => {
    render(
      <CartProvider>
        <TestCartComponent />
      </CartProvider>
    );

    // Initially should not contain product
    expect(screen.getByTestId('contains-product')).toHaveTextContent('Contains: false');

    // Add item
    const addButton = screen.getByTestId('add-item');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('contains-product')).toHaveTextContent('Contains: true');
    });
  });

  it('provides correct cart summary', async () => {
    render(
      <CartProvider>
        <TestCartComponent />
      </CartProvider>
    );

    // Add item
    const addButton = screen.getByTestId('add-item');
    fireEvent.click(addButton);

    await waitFor(() => {
      const summaryElement = screen.getByTestId('cart-summary');
      const summary = JSON.parse(summaryElement.textContent || '{}');

      expect(summary.totalItems).toBe(1);
      expect(summary.totalPrice).toBe(1000);
      expect(summary.itemsCount).toBe(1);
    });
  });

  it('handles localStorage errors gracefully', () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage is full');
    });

    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <CartProvider>
        <TestCartComponent />
      </CartProvider>
    );

    // Should not crash when localStorage fails
    expect(screen.getByTestId('total-items')).toBeInTheDocument();

    // Try to add item - should not throw
    const addButton = screen.getByTestId('add-item');
    expect(() => fireEvent.click(addButton)).not.toThrow();

    consoleSpy.mockRestore();
  });

  it('persists cart state across re-renders', async () => {
    const { rerender } = render(
      <CartProvider>
        <TestCartComponent />
      </CartProvider>
    );

    // Add item
    const addButton = screen.getByTestId('add-item');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('total-items')).toHaveTextContent('1');
    });

    // Re-render component
    rerender(
      <CartProvider>
        <TestCartComponent />
      </CartProvider>
    );

    // State should persist
    expect(screen.getByTestId('total-items')).toHaveTextContent('1');
    expect(screen.getByTestId('total-price')).toHaveTextContent('1000');
  });

  it('handles multiple rapid cart operations', async () => {
    render(
      <CartProvider>
        <TestCartComponent />
      </CartProvider>
    );

    const addButton = screen.getByTestId('add-item');

    // Rapidly add multiple items
    fireEvent.click(addButton);
    fireEvent.click(addButton);
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('total-items')).toHaveTextContent('3');
      expect(screen.getByTestId('total-price')).toHaveTextContent('3000');
    });
  });
});
