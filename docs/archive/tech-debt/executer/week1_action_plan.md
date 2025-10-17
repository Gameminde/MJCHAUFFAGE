# 🚀 SEMAINE 1 - STABILISATION & CONTRACT ALIGNMENT

## 📅 Vue d'ensemble

**Objectif:** Résoudre tous les bugs TypeScript et aligner les contrats de données entre Admin et Frontend.

**Résultat attendu:** 
- ✅ 0 erreurs TypeScript
- ✅ Build production fonctionnel
- ✅ Admin dashboard synchronisé avec l'API
- ✅ Tests critiques en place

---

## 🗓️ JOUR 1 : Diagnostic & Backend Core Fixes

### Matin (4h) - Diagnostic Complet

#### 1. Exécuter le script de diagnostic
```bash
cd MJCHAUFFAGE
chmod +x 01-typescript-diagnostic.sh
./01-typescript-diagnostic.sh
```

**Résultat attendu:**
```
📊 RÉSUMÉ DES ERREURS
================================
Backend:         64 erreurs
Admin Backend:   12 erreurs
Frontend:        8 erreurs
Admin Frontend:  5 erreurs
================================
TOTAL:           89 erreurs
```

#### 2. Analyser le rapport
```bash
# Lire le rapport JSON
cat typescript-report.json

# Identifier les fichiers prioritaires
cat typescript-errors-backend.log | grep "error TS" | cut -d'(' -f1 | sort | uniq -c | sort -rn
```

### Après-midi (4h) - Fixes Backend Core

#### 3. Remplacer adminService.ts
```bash
cd backend/src/services
cp adminService.ts adminService.ts.backup
# Copier le contenu de 02-adminService-fixes.ts
```

**Vérification:**
```bash
cd backend
npm run type-check 2>&1 | grep adminService
# Devrait afficher 0 erreurs
```

#### 4. Remplacer orderController.ts
```bash
cd backend/src/controllers
cp orderController.ts orderController.ts.backup
# Copier le contenu de 03-orderController-fixes.ts
```

**Vérification:**
```bash
npm run type-check 2>&1 | grep orderController
# Devrait afficher 0 erreurs
```

#### 5. Remplacer authController.ts
```bash
cd backend/src/controllers
cp authController.ts authController.ts.backup
# Copier le contenu de 04-authController-fixes.ts
```

**Vérification:**
```bash
npm run type-check 2>&1 | grep authController
# Devrait afficher 0 erreurs
```

### ✅ Checklist Jour 1
- [ ] Script de diagnostic exécuté
- [ ] Rapport d'erreurs analysé
- [ ] adminService.ts corrigé (21 erreurs)
- [ ] orderController.ts corrigé (15 erreurs)
- [ ] authController.ts corrigé (8 erreurs)
- [ ] Sauvegarde des fichiers originaux
- [ ] Vérification des corrections

**Erreurs restantes:** ~45

---

## 🗓️ JOUR 2 : DTO Layer & Remaining Fixes

### Matin (4h) - DTO Transformers

#### 1. Créer le système de DTOs
```bash
cd backend/src
mkdir -p utils
# Copier 05-dto-transformers.ts dans utils/dtoTransformers.ts
```

#### 2. Mettre à jour productService.ts
```typescript
// backend/src/services/productService.ts
import { transformProductToDTO, transformProductList } from '@/utils/dtoTransformers';

export class ProductService {
  static async getProducts(filters: any) {
    const products = await prisma.product.findMany({...});
    return transformProductList(products); // ✅ Retourne des DTOs
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({...});
    if (!product) return null;
    return transformProductToDTO(product); // ✅ Retourne un DTO
  }
}
```

#### 3. Mettre à jour orderService.ts
```typescript
// backend/src/services/orderService.ts
import { transformOrderToDTO, transformOrderList } from '@/utils/dtoTransformers';

export class OrderService {
  static async getOrders(filters: any) {
    const orders = await prisma.order.findMany({...});
    return transformOrderList(orders);
  }
}
```

### Après-midi (4h) - Fixes Restants

#### 4. Corriger les controllers restants

**productController.ts:**
```typescript
// Utiliser les DTOs partout
import { transformProductToDTO } from '@/utils/dtoTransformers';

res.json({
  success: true,
  data: transformProductToDTO(product) // ✅ DTO
});
```

**customerController.ts:**
```typescript
import { transformCustomerToDTO } from '@/utils/dtoTransformers';

res.json({
  success: true,
  data: transformCustomerToDTO(customer)
});
```

#### 5. Vérification TypeScript complète
```bash
cd backend
npm run type-check

# Si des erreurs persistent, les corriger une par une
npm run type-check 2>&1 | grep "error TS" | head -10
```

### ✅ Checklist Jour 2
- [ ] DTOs créés et testés
- [ ] productService.ts mis à jour
- [ ] orderService.ts mis à jour
- [ ] customerService.ts mis à jour
- [ ] Tous les controllers utilisent les DTOs
- [ ] Backend compile sans erreurs
- [ ] Tests manuels des endpoints

**Erreurs restantes:** 0 (backend) ✅

---

## 🗓️ JOUR 3 : Admin Backend Alignment

### Matin (4h) - Admin Backend Fixes

#### 1. Mettre à jour admin-backend pour utiliser les DTOs
```bash
cd admin-v2/admin-backend
```

#### 2. Créer un client HTTP partagé
```typescript
// admin-v2/admin-backend/src/common/http-client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.BACKEND_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour gérer les Decimals
apiClient.interceptors.response.use(
  response => {
    // Les DTOs sont déjà normalisés par le backend
    return response;
  },
  error => Promise.reject(error)
);
```

#### 3. Mettre à jour les services admin
```typescript
// admin-v2/admin-backend/src/products/products.service.ts
import { apiClient } from '@/common/http-client';

@Injectable()
export class ProductsService {
  async findAll(filters: any) {
    const response = await apiClient.get('/products', { params: filters });
    return response.data.data; // Déjà des DTOs
  }

  async findOne(id: string) {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.data; // Déjà un DTO
  }

  async create(createProductDto: any) {
    const response = await apiClient.post('/products', createProductDto);
    return response.data.data; // DTO retourné
  }
}
```

### Après-midi (4h) - Admin Frontend Alignment

#### 4. Mettre à jour admin-frontend API client
```typescript
// admin-v2/admin-frontend/src/lib/api.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'
});

// Types alignés avec les DTOs backend
export interface Product {
  id: string;
  name: string;
  price: number; // ✅ number, pas Decimal
  stockQuantity: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: Array<{
    id: string;
    url: string;
    altText: string | null;
  }>;
  // ... autres champs
}

export async function getProducts(filters?: any): Promise<Product[]> {
  const response = await apiClient.get('/products', { params: filters });
  return response.data.data; // Déjà normalisé
}
```

#### 5. Mettre à jour les composants admin
```typescript
// admin-v2/admin-frontend/src/components/ProductForm.tsx
import { Product } from '@/lib/api';

interface ProductFormProps {
  product?: Product; // ✅ Type correct
  onSubmit: (data: Partial<Product>) => Promise<void>;
}

export function ProductForm({ product, onSubmit }: ProductFormProps) {
  // Plus de problèmes de types !
  const [formData, setFormData] = useState<Partial<Product>>(
    product || { name: '', price: 0, stockQuantity: 0 }
  );

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(formData);
    }}>
      <Input
        type="number"
        value={formData.price} // ✅ number
        onChange={(e) => setFormData({
          ...formData,
          price: parseFloat(e.target.value)
        })}
      />
    </form>
  );
}
```

### ✅ Checklist Jour 3
- [ ] HTTP client partagé créé
- [ ] Admin backend services mis à jour
- [ ] Admin frontend API client mis à jour
- [ ] Types TypeScript alignés
- [ ] Composants admin mis à jour
- [ ] Build admin sans erreurs

---

## 🗓️ JOUR 4 : State Consolidation

### Matin (4h) - Migration vers Zustand

#### 1. Analyser les stores existants
```bash
cd frontend/src
grep -r "createContext" contexts/
grep -r "useReducer" contexts/
```

#### 2. Créer un store Zustand unifié pour le panier
```typescript
// frontend/src/store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (product: any, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  
  // Computed
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find(i => i.productId === product.id);

        if (existingItem) {
          set({
            items: items.map(i =>
              i.productId === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            )
          });
        } else {
          set({
            items: [...items, {
              id: `${product.id}-${Date.now()}`,
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity,
              image: product.images?.[0]?.url
            }]
          });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(i => i.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map(i =>
            i.productId === productId ? { ...i, quantity } : i
          )
        });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set({ isOpen: !get().isOpen }),

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const shipping = 500; // DZD
        return subtotal + shipping;
      }
    }),
    {
      name: 'cart-storage',
      version: 1
    }
  )
);
```

#### 3. Supprimer l'ancien CartContext
```bash
cd frontend/src
# Sauvegarder
cp contexts/CartContext.tsx contexts/CartContext.tsx.backup
# Supprimer
rm contexts/CartContext.tsx
```

#### 4. Mettre à jour les composants utilisant le panier
```typescript
// frontend/src/components/cart/AddToCartButton.tsx
import { useCartStore } from '@/store/cartStore';

export function AddToCartButton({ product }: { product: any }) {
  const addItem = useCartStore(state => state.addItem);
  
  return (
    <button onClick={() => addItem(product)}>
      Ajouter au panier
    </button>
  );
}

// frontend/src/components/cart/CartDrawer.tsx
import { useCartStore } from '@/store/cartStore';

export function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, getTotal } = useCartStore();
  
  return (
    <div className={isOpen ? 'open' : 'closed'}>
      {items.map(item => (
        <div key={item.id}>
          <span>{item.name}</span>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
          />
          <button onClick={() => removeItem(item.productId)}>Supprimer</button>
        </div>
      ))}
      <div>Total: {getTotal()} DZD</div>
    </div>
  );
}
```

### Après-midi (4h) - Loading & Error States

#### 5. Créer un store UI global
```typescript
// frontend/src/store/uiStore.ts
import { create } from 'zustand';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface Modal {
  id: string;
  component: React.ComponentType<any>;
  props?: any;
}

interface UIState {
  toasts: Toast[];
  modals: Modal[];
  isLoading: boolean;
  loadingMessage?: string;

  // Toast actions
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;

  // Modal actions
  openModal: (modal: Omit<Modal, 'id'>) => void;
  closeModal: (id: string) => void;

  // Loading actions
  setLoading: (loading: boolean, message?: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],
  modals: [],
  isLoading: false,

  showToast: (toast) => {
    const id = `toast-${Date.now()}`;
    set({ toasts: [...get().toasts, { ...toast, id }] });

    // Auto-hide after duration
    setTimeout(() => {
      get().hideToast(id);
    }, toast.duration || 5000);
  },

  hideToast: (id) => {
    set({ toasts: get().toasts.filter(t => t.id !== id) });
  },

  openModal: (modal) => {
    const id = `modal-${Date.now()}`;
    set({ modals: [...get().modals, { ...modal, id }] });
  },

  closeModal: (id) => {
    set({ modals: get().modals.filter(m => m.id !== id) });
  },

  setLoading: (loading, message) => {
    set({ isLoading: loading, loadingMessage: message });
  }
}));
```

#### 6. Créer les composants UI globaux
```typescript
// frontend/src/components/common/ToastContainer.tsx
import { useUIStore } from '@/store/uiStore';

export function ToastContainer() {
  const toasts = useUIStore(state => state.toasts);
  const hideToast = useUIStore(state => state.hideToast);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' :
            toast.type === 'error' ? 'bg-red-500' :
            toast.type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
          } text-white`}
        >
          <div className="flex items-center justify-between">
            <span>{toast.message}</span>
            <button onClick={() => hideToast(toast.id)}>×</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// frontend/src/components/common/LoadingOverlay.tsx
import { useUIStore } from '@/store/uiStore';

export function LoadingOverlay() {
  const { isLoading, loadingMessage } = useUIStore();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        {loadingMessage && (
          <p className="mt-4 text-gray-700">{loadingMessage}</p>
        )}
      </div>
    </div>
  );
}
```

#### 7. Intégrer dans le layout
```typescript
// frontend/src/app/layout.tsx
import { ToastContainer } from '@/components/common/ToastContainer';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <ToastContainer />
        <LoadingOverlay />
      </body>
    </html>
  );
}
```

### ✅ Checklist Jour 4
- [ ] Cart store Zustand créé
- [ ] Ancien CartContext supprimé
- [ ] Tous les composants migrés
- [ ] UI store créé
- [ ] Toast system implémenté
- [ ] Loading overlay implémenté
- [ ] Tests manuels complets

---

## 🗓️ JOUR 5 : Tests Critiques (Backend)

### Matin (4h) - Tests d'Authentification

#### 1. Setup Jest backend
```bash
cd backend
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

```json
// backend/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

#### 2. Tests d'authentification
```typescript
// backend/tests/auth.test.ts
import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Authentication', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test1234!',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test1234!',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Test1234!',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test1234!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let accessToken: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test1234!'
        });
      accessToken = response.body.data.accessToken;
    });

    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should reject without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });
  });
});
```

### Après-midi (4h) - Tests Product & Order

#### 3. Tests produits
```typescript
// backend/tests/products.test.ts
import request from 'supertest';
import app from '../src/app';

describe('Products API', () => {
  describe('GET /api/products', () => {
    it('should return product list', async () => {
      const response = await request(app)
        .get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.products)).toBe(true);
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ category: 'chauffage' });

      expect(response.status).toBe(200);
      expect(response.body.data.products.every((p: any) => 
        p.category.slug === 'chauffage'
      )).toBe(true);
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.data.products.length).toBeLessThanOrEqual(10);
      expect(response.body.data.pagination).toBeDefined();
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return product details', async () => {
      // Get a product ID first
      const listResponse = await request(app).get('/api/products');
      const productId = listResponse.body.data.products[0].id;

      const response = await request(app)
        .get(`/api/products/${productId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(productId);
      expect(response.body.data.price).toBeTypeOf('number');
    });

    it('should return 404 for invalid ID', async () => {
      const response = await request(app)
        .get('/api/products/invalid-id');

      expect(response.status).toBe(404);
    });
  });
});
```

#### 4. Tests commandes
```typescript
// backend/tests/orders.test.ts
import request from 'supertest';
import app from '../src/app';

describe('Orders API', () => {
  let accessToken: string;
  let productId: string;

  beforeAll(async () => {
    // Login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test1234!'
      });
    accessToken = loginResponse.body.data.accessToken;

    // Get a product
    const productsResponse = await request(app).get('/api/products');
    productId = productsResponse.body.data.products[0].id;
  });

  describe('POST /api/orders', () => {
    it('should create a new order', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          items: [
            {
              productId,
              quantity: 2
            }
          ],
          shippingAddress: {
            street: '123 Rue Test',
            city: 'Alger',
            postalCode: '16000',
            country: 'Algérie'
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.orderNumber).toBeDefined();
      expect(response.body.data.totalAmount).toBeTypeOf('number');
    });

    it('should reject order without auth', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          items: [{ productId, quantity: 1 }]
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/orders', () => {
    it('should return user orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.orders)).toBe(true);
    });
  });
});
```

### ✅ Checklist Jour 5
- [ ] Jest configuré
- [ ] Tests auth (register, login, me)
- [ ] Tests products (list, filter, detail)
- [ ] Tests orders (create, list)
- [ ] Tous les tests passent
- [ ] Coverage > 70%

---

## 🗓️ JOUR 6 : Tests Critiques (Frontend)

### Matin (4h) - Tests Composants

#### 1. Setup Vitest frontend
```bash
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

```typescript
// frontend/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

```typescript
// frontend/tests/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

#### 2. Tests composants panier
```typescript
// frontend/tests/cart/AddToCartButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { useCartStore } from '@/store/cartStore';

describe('AddToCartButton', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 1000,
    images: [{ url: '/test.jpg' }]
  };

  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('should render button', () => {
    render(<AddToCartButton product={mockProduct} />);
    expect(screen.getByText(/ajouter au panier/i)).toBeInTheDocument();
  });

  it