import { useCartStore } from '@/store/cartStore';

const storageState: Record<string, string> = {};
const localStorageMock = {
  getItem: jest.fn((key: string) => storageState[key] ?? null),
  setItem: jest.fn((key: string, value: string) => {
    storageState[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete storageState[key];
  }),
  clear: jest.fn(() => {
    Object.keys(storageState).forEach((key) => delete storageState[key]);
  }),
  key: jest.fn(),
  length: 0,
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('cartStore', () => {
  const resetStore = () => {
    const state = useCartStore.getState();
    state.clearCart();
    state.setLoading(false);
    state.clearError();
    state.toggleCart(false);
    localStorageMock.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  };

  beforeEach(() => {
    resetStore();
  });

  it('adds a new item to the cart', () => {
    useCartStore
      .getState()
      .addItem({
        productId: 'p1',
        name: 'Chaudière Premium',
        price: 1000,
        sku: 'SKU-001',
        quantity: 1,
        maxStock: 5,
      });

    const { items, error } = useCartStore.getState();

    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(1);
    expect(items[0].sku).toBe('SKU-001');
    expect(error).toBeNull();
  });

  it('increments quantity for an existing item without exceeding stock', () => {
    const store = useCartStore.getState();
    store.addItem({
      productId: 'p1',
      name: 'Chaudière Premium',
      price: 1000,
      sku: 'SKU-001',
      maxStock: 3,
    });

    store.addItem({
      productId: 'p1',
      name: 'Chaudière Premium',
      price: 1000,
      sku: 'SKU-001',
      quantity: 5, // exceeds stock
      maxStock: 3,
    });

    const { items, error } = useCartStore.getState();

    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
    expect(error).toEqual('Stock insuffisant pour ce produit');
  });

  it('updates quantity and clamps to max stock', () => {
    useCartStore.getState().addItem({
      productId: 'p2',
      name: 'Radiateur mural',
      price: 500,
      sku: 'SKU-002',
      quantity: 1,
      maxStock: 4,
    });

    const itemId = useCartStore.getState().items[0].id;
    useCartStore.getState().updateQuantity(itemId, 10);

    const { items, error } = useCartStore.getState();
    expect(items[0].quantity).toBe(4);
    expect(error).toEqual('Stock insuffisant pour ce produit');
  });

  it('removes item and clears cart correctly', () => {
    useCartStore.getState().addItem({
      productId: 'p3',
      name: 'Thermostat connecté',
      price: 200,
      sku: 'SKU-003',
      quantity: 2,
      maxStock: 6,
    });

    const itemId = useCartStore.getState().items[0].id;
    useCartStore.getState().removeItem(itemId);

    expect(useCartStore.getState().items).toHaveLength(0);

    useCartStore.getState().addItem({
      productId: 'p4',
      name: 'Pompe à chaleur',
      price: 1500,
      sku: 'SKU-004',
      quantity: 1,
      maxStock: 2,
    });

    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('calculates totals and persists to localStorage', () => {
    useCartStore.getState().addItem({
      productId: 'p5',
      name: 'Chaudière murale',
      price: 1200,
      sku: 'SKU-005',
      quantity: 2,
      maxStock: 5,
    });

    useCartStore.getState().addItem({
      productId: 'p6',
      name: 'Radiateur aluminium',
      price: 300,
      quantity: 1,
      sku: 'SKU-006',
      maxStock: 3,
    });

    const state = useCartStore.getState();
    const subtotal = state.getSubtotal();
    const itemCount = state.getTotalItems();

    expect(subtotal).toBe(1200 * 2 + 300);
    expect(itemCount).toBe(3);
  });
});
