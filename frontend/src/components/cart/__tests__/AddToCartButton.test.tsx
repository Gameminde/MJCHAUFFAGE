import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AddToCartButton } from '../AddToCartButton';
import { useCartStore } from '@/store/cartStore';

jest.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({
    locale: 'fr',
    isRTL: false,
    language: 'fr',
    dir: 'ltr',
    currencyConfig: { code: 'DZD', symbol: 'DA', decimalPlaces: 2 },
    t: (key: string) => key,
  }),
}));

jest.mock('../../analytics/AnalyticsProvider', () => ({
  useAnalyticsContext: () => ({
    trackProductView: jest.fn(),
    trackAddToCart: jest.fn(),
    trackRemoveFromCart: jest.fn(),
    trackBeginCheckout: jest.fn(),
    trackPurchase: jest.fn(),
    trackCategoryView: jest.fn(),
    trackSearch: jest.fn(),
    setUserId: jest.fn(),
  }),
}));

const mockProduct = {
  id: 'product-123',
  name: 'Chaudière Condensation',
  price: 95000,
  sku: 'SKU-CHAUD-123',
  stockQuantity: 5,
  images: [{ url: '/test.jpg' }],
};

describe('AddToCartButton', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    useCartStore.getState().clearCart();
    useCartStore.getState().clearError();
    useCartStore.getState().toggleCart(false);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { product: { stockQuantity: mockProduct.stockQuantity } },
      }),
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('adds product to cart when clicked', async () => {
    render(<AddToCartButton product={mockProduct} />);

    fireEvent.click(screen.getByText('cart.addToCart'));

    await waitFor(() => {
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].productId).toBe(mockProduct.id);
      expect(state.items[0].quantity).toBe(1);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/products/${mockProduct.id}`,
    );
  });

  it('prevents adding beyond available stock', async () => {
    render(<AddToCartButton product={mockProduct} />);

    fireEvent.click(screen.getByText('cart.addToCart'));
    await waitFor(() => expect(useCartStore.getState().items[0].quantity).toBe(1));

    // Simulate stock of 2 and attempt to add 5 more
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { product: { stockQuantity: 2 } },
      }),
    });

    // attendre la fin de l'état "adding" puis recliquer
    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /cart\.addToCart/i }),
      ).toBeEnabled(),
    );

    fireEvent.click(screen.getByRole('button', { name: /cart\.addToCart/i }));

    await waitFor(() => {
      const state = useCartStore.getState();
      expect(state.items[0].quantity).toBeLessThanOrEqual(2);
    });
  });
});
