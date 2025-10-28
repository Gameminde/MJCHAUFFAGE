# 🎯 CONTEXT ENGINEERING - Corrections Critiques MJ CHAUFFAGE

## 📋 Vue d'Ensemble du Projet

### Architecture Actuelle
- **Stack** : Next.js 14 (Frontend) + Express (Backend) + Prisma (ORM)
- **Database** : Neon (PostgreSQL) + Cloudflare (CDN/Cache)
- **Déploiement** : Monorepo avec npm workspaces
- **Ports** : Frontend 3000, Backend 3001

### Problèmes Critiques Identifiés
```
P0 (BLOQUANTS) - 5 issues
P1 (HAUTE PRIORITÉ) - 5 issues  
P2 (MOYENNE) - 4 issues
```

---

## 🚨 SECTION 1 : ISSUES CRITIQUES (P0) - À CORRIGER EN PREMIER

### P0-1 : Auth Admin (Cookie vs localStorage) ⚠️ CRITIQUE

**Problème** :
- Le middleware attend un cookie HTTP-only `authToken`
- Le frontend stocke le token dans `localStorage`
- Résultat : Redirections infinies vers `/admin/login`

**Impact** :
- ❌ Admin dashboard inaccessible
- ❌ Session perdue au reload
- ❌ Vulnérabilité XSS (localStorage exposé)

**Solution Best Practice** :
```typescript
// Backend: adminAuthController.ts
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  
  // Validation...
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
  
  // ✅ BEST PRACTICE: Cookie HTTP-only + SameSite
  res.cookie('authToken', token, {
    httpOnly: true,           // Protection XSS
    secure: process.env.NODE_ENV === 'production', // HTTPS only en prod
    sameSite: 'lax',          // Protection CSRF
    maxAge: 8 * 60 * 60 * 1000, // 8h
    path: '/admin',           // Limité à l'admin
  });
  
  // Aussi dans Authorization pour les API calls
  res.json({ 
    success: true, 
    token, // Pour les appels API
    user 
  });
}
```

**Fichiers à Modifier** :
1. `backend/src/controllers/adminAuthController.ts` - Ajouter cookie
2. `frontend/src/contexts/AdminAuthContext.tsx` - Lire cookie + localStorage
3. `frontend/middleware.ts` - Vérifier cookie en priorité
4. `frontend/src/lib/api.ts` - Garder Authorization header

**Critères d'Acceptation** :
- ✅ Login admin → cookie posé → accès `/admin` sans redirect
- ✅ Reload page → session conservée
- ✅ Logout → cookie supprimé
- ✅ Test E2E : `admin-website-communication.spec.ts` passe

---

### P0-2 : Panier - Méthode HTTP Incohérente 🔴

**Problème** :
```typescript
// Frontend: cartService.ts
updateCartItem(itemId, quantity) {
  return api.patch(`/cart/items/${itemId}`, { quantity }); // ❌ PATCH
}

// Backend: routes/cart.ts  
router.put('/items/:itemId', cartController.updateItem); // ✅ PUT attendu
```

**Impact** :
- ❌ Erreur 405 Method Not Allowed
- ❌ Impossible de modifier la quantité du panier

**Solution Best Practice** :
```typescript
// frontend/src/services/cartService.ts
export async function updateCartItem(itemId: string, quantity: number) {
  // ✅ REST Best Practice: PUT pour update complet
  return api.put(`/cart/items/${itemId}`, { quantity });
}
```

**Standard REST** :
- `PUT` : Remplacement complet de la ressource
- `PATCH` : Modification partielle
- Ici : quantité = ressource complète → **PUT**

**Critères d'Acceptation** :
- ✅ Modifier quantité → 200 OK
- ✅ Aucune erreur 405
- ✅ Test unitaire : `cartService.test.ts`

---

### P0-3 : Paiements - Endpoint Vérification Manquant 💳

**Problème** :
```typescript
// Frontend appelle
paymentService.verifyPayment(transactionId)
// → GET /api/payments/verify/:transactionId

// Backend : ❌ Route n'existe pas
```

**Impact** :
- ❌ Impossible de vérifier le statut du paiement
- ❌ Expérience utilisateur cassée après commande

**Solution Best Practice** :
```typescript
// backend/src/routes/payments.ts
/**
 * @route GET /api/v1/payments/verify/:transactionId
 * @desc Vérifier le statut d'une transaction (COD)
 */
router.get('/verify/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    // Récupérer la transaction depuis la DB
    const payment = await prisma.payment.findUnique({
      where: { transactionId },
      include: { order: true }
    });
    
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Transaction non trouvée' 
      });
    }
    
    // ✅ Retourner le statut
    res.json({
      success: true,
      transaction: {
        id: payment.transactionId,
        status: payment.status, // PENDING_DELIVERY, COMPLETED, FAILED
        method: payment.method,
        amount: payment.amount,
        orderId: payment.orderId,
        createdAt: payment.createdAt,
        estimatedDelivery: payment.order.estimatedDelivery
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});
```

**Critères d'Acceptation** :
- ✅ `GET /api/v1/payments/verify/:id` retourne statut
- ✅ Test E2E : checkout → verify → statut correct
- ✅ Gestion 404 si transaction inexistante

---

### P0-4 : Variables d'Environnement Fragmentées 🌐

**Problème** :
```typescript
// Confusion entre :
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1  // Client-side
API_URL_SSR=http://localhost:3001                  // Server-side
BACKEND_API_URL=http://localhost:3001/api/v1       // ?

// Résultat : URLs comme "undefined/api/v1/products"
```

**Impact** :
- ❌ Routes SSR cassées
- ❌ Proxys Next API ne fonctionnent pas
- ❌ Erreurs en production

**Solution Best Practice** :
```bash
# .env.local (Frontend)
# ✅ Une seule variable, nom explicite
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Pour SSR interne (pas exposé au client)
BACKEND_API_URL=http://localhost:3001/api/v1
```

```typescript
// frontend/src/lib/config.ts
export const config = {
  api: {
    // Client-side (browser)
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
    
    // Server-side (SSR, API routes)
    ssrBaseURL: process.env.BACKEND_API_URL || 'http://localhost:3001/api/v1',
  }
};

// ✅ Usage cohérent partout
```

```typescript
// frontend/src/lib/ssr-api.ts
import { config } from './config';

export async function fetchProductsSSR(params: any) {
  const url = `${config.api.ssrBaseURL}/products?${buildQuery(params)}`;
  // ...
}
```

**Fichiers à Modifier** :
1. `frontend/.env.local` - Standardiser les variables
2. `frontend/src/lib/config.ts` - Créer config centralisé
3. `frontend/src/lib/ssr-api.ts` - Utiliser config
4. `frontend/src/app/api/*/route.ts` - Utiliser config
5. `frontend/next.config.js` - Rewrites cohérents

**Critères d'Acceptation** :
- ✅ Aucune URL "undefined"
- ✅ Pages produits chargent en dev ET prod
- ✅ Tous les proxys fonctionnent

---

### P0-5 : Panier Invité - Flux Cassé 🛒

**Problème** :
```typescript
// Tous les endpoints /cart/* nécessitent auth
// Mais le frontend appelle ces endpoints pour les invités
// → 401 Unauthorized
```

**Impact** :
- ❌ Invités ne peuvent pas ajouter au panier
- ❌ Checkout invité impossible
- ❌ Perte de ventes

**Solution Best Practice** :
```typescript
// 1. Panier local pour invités (frontend)
// frontend/src/hooks/useGuestCart.ts
export function useGuestCart() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    // ✅ Charger depuis localStorage
    const saved = localStorage.getItem('guestCart');
    return saved ? JSON.parse(saved) : [];
  });
  
  useEffect(() => {
    // ✅ Persister dans localStorage
    localStorage.setItem('guestCart', JSON.stringify(cart));
  }, [cart]);
  
  const addItem = (product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId: product.id, quantity, product }];
    });
  };
  
  return { cart, addItem, updateItem, removeItem, clearCart };
}
```

```typescript
// 2. Validation avant checkout (public endpoint)
// frontend/src/app/[locale]/checkout/page.tsx
async function validateGuestCart(items: CartItem[]) {
  // ✅ Utilise l'endpoint public /cart/validate
  const response = await api.post('/cart/validate', { items });
  
  if (!response.success) {
    // Gérer les produits indisponibles
    return response.unavailableItems;
  }
  
  return null; // Tout OK
}
```

```typescript
// 3. Sync après login
// frontend/src/contexts/AuthContext.tsx
async function login(email: string, password: string) {
  const response = await api.post('/auth/login', { email, password });
  
  if (response.success) {
    setUser(response.user);
    
    // ✅ Synchroniser le panier local avec le serveur
    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    
    if (guestCart.length > 0) {
      await api.post('/cart/sync', { items: guestCart });
      localStorage.removeItem('guestCart');
    }
  }
}
```

**Architecture Flux Panier** :
```
Invité :
  1. Ajouter → localStorage (useGuestCart)
  2. Checkout → Valider via POST /cart/validate (public)
  3. Commander → POST /orders/guest
  
Connecté :
  1. Login → Sync via POST /cart/sync
  2. Ajouter → POST /cart/items (auth)
  3. Checkout → POST /orders (auth)
```

**Fichiers à Créer/Modifier** :
1. `frontend/src/hooks/useGuestCart.ts` - Nouveau
2. `frontend/src/hooks/useCart.ts` - Adapter pour auth/guest
3. `frontend/src/app/[locale]/checkout/page.tsx` - Valider panier
4. `frontend/src/contexts/AuthContext.tsx` - Ajouter sync

**Critères d'Acceptation** :
- ✅ Invité peut ajouter produits (localStorage)
- ✅ Checkout invité → validation → commande OK
- ✅ Login → panier local sync avec serveur
- ✅ Test E2E : user-journey invité

---

## 🔥 SECTION 2 : ISSUES HAUTE PRIORITÉ (P1)

### P1-1 : i18n - Locale par Défaut Incohérente 🌍

**Problème** :
```typescript
// middleware.ts
defaultLocale: 'fr'

// src/lib/i18n.ts
export const defaultLocale = 'ar';

// Résultat : Confusion, alternates cassés
```

**Solution Best Practice** :
```typescript
// frontend/src/lib/i18n-config.ts (nouveau fichier central)
export const i18nConfig = {
  locales: ['fr', 'ar'] as const,
  defaultLocale: 'fr' as const, // ✅ UN SEUL ENDROIT
  localeDetection: true,
} as const;

export type Locale = typeof i18nConfig.locales[number];
```

```typescript
// middleware.ts
import { i18nConfig } from '@/lib/i18n-config';

export function middleware(request: NextRequest) {
  const { locales, defaultLocale } = i18nConfig;
  // ...
}
```

**Critères d'Acceptation** :
- ✅ `/` redirige vers `/fr`
- ✅ `alternates` correct (fr, ar seulement)
- ✅ Direction RTL pour `/ar`

---

### P1-2 : Admin Customers - Endpoints Manquants 👥

**Problème** :
```typescript
// Frontend appelle :
GET /admin/customers/search
GET /admin/customers/export
POST /admin/customers/:id/email
POST /admin/customers/:id/notes

// Backend : ❌ N'existent pas
```

**Solution** : Deux options

**Option A (Recommandée)** : Implémenter côté backend
```typescript
// backend/src/routes/admin.ts
router.get('/customers/search', adminAuth, async (req, res) => {
  const { q } = req.query;
  const customers = await prisma.customer.findMany({
    where: {
      OR: [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ]
    },
    take: 10
  });
  res.json({ success: true, customers });
});
```

**Option B** : Retirer du frontend si non critique

**Critères d'Acceptation** :
- ✅ Aucune erreur 404 dans l'admin dashboard
- ✅ Fonctionnalités admin complètes

---

### P1-3 : Géolocalisation - Doublon Logic 📍

**Problème** :
```typescript
// Frontend: /api/geolocation → ipapi.co direct
// Backend: /api/v1/geolocation → cache + retry + rate limit

// Résultat : Logique dupliquée, coûts API externes
```

**Solution Best Practice** :
```typescript
// frontend/src/app/api/geolocation/route.ts
export async function GET(request: NextRequest) {
  // ✅ Proxy vers backend (qui gère cache/retry)
  const backendURL = `${config.api.ssrBaseURL}/geolocation`;
  
  const response = await fetch(backendURL, {
    headers: {
      'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
    },
    next: { revalidate: 3600 } // Cache Next.js 1h
  });
  
  return response;
}
```

**Bénéfices** :
- ✅ Cache centralisé
- ✅ Rate limiting unifié
- ✅ Monitoring simplifié

---

### P1-4 : Routes Admin - Swagger Cassés 📝

**Problème** :
```typescript
// backend/src/routes/admin.ts
/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get orders
/**        // ❌ Bloc cassé, commentaire mal fermé
```

**Solution** :
- Nettoyer tous les blocs Swagger
- Valider avec `swagger-jsdoc`
- Générer documentation OpenAPI propre

---

### P1-5 : Validation Téléphone Algérie 📞

**Problème** :
```typescript
// Validation différente dans :
// - backend/services/paymentService.ts
// - backend/controllers/ordersController.ts

// Formats acceptés : +213, 0, 9 digits... incohérent
```

**Solution Best Practice** :
```typescript
// backend/src/utils/algerian-phone.ts
export function validateAlgerianPhone(phone: string): boolean {
  // ✅ Formats acceptés :
  // +213XXXXXXXXX
  // 0XXXXXXXXX
  // XXXXXXXXX (9 digits)
  
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  const patterns = [
    /^\+213[5-7]\d{8}$/,  // +213 + mobile
    /^0[5-7]\d{8}$/,      // 0 + mobile
    /^[5-7]\d{8}$/,       // 9 digits mobile
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
}

export function normalizeAlgerianPhone(phone: string): string {
  // ✅ Normaliser au format +213XXXXXXXXX
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  if (cleaned.startsWith('+213')) {
    return cleaned;
  }
  if (cleaned.startsWith('0')) {
    return `+213${cleaned.slice(1)}`;
  }
  return `+213${cleaned}`;
}
```

**Utilisation** :
```typescript
// Partout dans le backend
import { validateAlgerianPhone, normalizeAlgerianPhone } from '@/utils/algerian-phone';

// Validation
if (!validateAlgerianPhone(customerPhone)) {
  throw new Error('Numéro de téléphone invalide');
}

// Stockage
const normalizedPhone = normalizeAlgerianPhone(customerPhone);
```

---

## 📊 SECTION 3 : BEST PRACTICES GÉNÉRALES

### Architecture & Organisation

#### 1. Structure des Dossiers
```
backend/
├── src/
│   ├── controllers/     # Logique HTTP (req/res)
│   ├── services/        # Business logic (pure functions)
│   ├── models/          # Types/interfaces Prisma
│   ├── utils/           # Helpers réutilisables
│   ├── middleware/      # Auth, validation, rate-limit
│   ├── routes/          # Définitions routes Express
│   └── config/          # Configuration centralisée

frontend/
├── src/
│   ├── app/             # Next.js App Router
│   ├── components/      # Composants React
│   ├── contexts/        # React Context (Auth, Cart, etc.)
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilities (api client, config)
│   └── services/        # API calls (product, cart, etc.)
```

#### 2. Séparation des Responsabilités

**❌ Mauvais** :
```typescript
// Controller fait trop de choses
export async function createOrder(req, res) {
  // Validation
  if (!req.body.items) return res.status(400).json({...});
  
  // Business logic
  const total = req.body.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // DB operations
  const order = await prisma.order.create({...});
  
  // Email
  await sendEmail(order.customerEmail, 'Commande confirmée');
  
  res.json(order);
}
```

**✅ Bon** :
```typescript
// Controller = orchestration
export async function createOrder(req: Request, res: Response) {
  try {
    // 1. Validation (middleware externe)
    const validatedData = validateOrderInput(req.body);
    
    // 2. Business logic (service)
    const order = await orderService.createOrder(validatedData, req.user);
    
    // 3. Side effects (async, non-bloquant)
    notificationService.sendOrderConfirmation(order).catch(console.error);
    
    res.status(201).json({ success: true, order });
  } catch (error) {
    handleError(error, res);
  }
}
```

#### 3. Gestion d'Erreurs Uniforme

```typescript
// backend/src/utils/error-handler.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
  }
}

// Usage
throw new AppError(404, 'Produit non trouvé', 'PRODUCT_NOT_FOUND');
```

```typescript
// Middleware global
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.code
    });
  }
  
  // Erreur inconnue
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Erreur serveur interne'
  });
});
```

---

### Sécurité Best Practices

#### 1. Rate Limiting par Route
```typescript
// backend/src/middleware/rate-limit.ts
import rateLimit from 'express-rate-limit';

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5, // 5 tentatives
  message: 'Trop de tentatives de connexion',
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 100, // 100 requêtes
});

// Usage
app.use('/api/v1/auth/login', authRateLimit);
app.use('/api/v1/', apiRateLimit);
```

#### 2. Validation Systématique
```typescript
// backend/src/middleware/validation.ts
import { body, validationResult } from 'express-validator';

export const validateCreateOrder = [
  body('items').isArray({ min: 1 }).withMessage('Panier vide'),
  body('items.*.productId').isUUID().withMessage('ID produit invalide'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantité invalide'),
  body('shippingAddress.wilaya').notEmpty().withMessage('Wilaya requise'),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    next();
  }
];

// Usage
router.post('/orders', validateCreateOrder, orderController.create);
```

#### 3. Sanitization
```typescript
import xss from 'xss';

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return xss(input.trim());
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (typeof input === 'object' && input !== null) {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [key, sanitizeInput(value)])
    );
  }
  return input;
}

// Middleware global
app.use((req, res, next) => {
  req.body = sanitizeInput(req.body);
  next();
});
```

---

### Performance Best Practices

#### 1. Caching Stratégique
```typescript
// backend/src/services/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCached<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // 1. Essayer cache
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 2. Fetch + cache
  const data = await fetchFn();
  await redis.setex(key, ttl, JSON.stringify(data));
  
  return data;
}

// Usage
export async function getCategories() {
  return getCached('categories', 3600, async () => {
    return await prisma.category.findMany();
  });
}
```

#### 2. Pagination Efficace
```typescript
export async function getProducts(params: {
  page: number;
  limit: number;
  filters?: any;
}) {
  const { page = 1, limit = 12, filters = {} } = params;
  
  // ✅ Cursor-based pagination pour grandes tables
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: buildWhereClause(filters),
      take: limit,
      skip: (page - 1) * limit,
      include: {
        manufacturer: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where: buildWhereClause(filters) })
  ]);
  
  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    }
  };
}
```

#### 3. Database Indexes
```prisma
// prisma/schema.prisma
model Product {
  id            String   @id @default(uuid())
  name          String
  slug          String   @unique
  price         Decimal
  inStock       Boolean  @default(true)
  categoryId    String
  createdAt     DateTime @default(now())
  
  // ✅ Index pour les requêtes fréquentes
  @@index([categoryId])
  @@index([inStock])
  @@index([createdAt])
  @@index([price])
  @@map("products")
}
```

---

### Testing Best Practices

#### 1. Tests Unitaires (Services)
```typescript
// backend/tests/unit/services/orderService.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { orderService } from '@/services/orderService';

describe('OrderService', () => {
  describe('calculateTotal', () => {
    it('should calculate correct total with tax', () => {
      const items = [
        { price: 1000, quantity: 2 },
        { price: 500, quantity: 1 },
      ];
      
      const total = orderService.calculateTotal(items);
      
      expect(total).toBe(2500);
    });
    
    it('should throw error for negative quantities', () => {
      const items = [{ price: 1000, quantity: -1 }];
      
      expect(() => orderService.calculateTotal(items))
        .toThrow('Quantité invalide');
    });
  });
});
```

#### 2. Tests d'Intégration (API)
```typescript
// backend/tests/integration/products.test.ts
import request from 'supertest';
import { app } from '@/server';
import { prisma } from '@/lib/database';

describe('Products API', () => {
  beforeEach(async () => {
    await prisma.product.deleteMany();
  });
  
  it('GET /products should return paginated products', async () => {
    // Arrange
    await prisma.product.createMany({
      data: Array(15).fill(null).map((_, i) => ({
        name: `Product ${i}`,
        price: 1000,
        inStock: true,
      }))
    });
    
    // Act
    const response = await request(app)
      .get('/api/v1/products?page=1&limit=10')
      .expect(200);
    
    // Assert
    expect(response.body.success).toBe(true);
    expect(response.body.products).toHaveLength(10);
    expect(response.body.pagination.total).toBe(15);
  });
});
```

#### 3. Tests E2E (Playwright)
```typescript
// frontend/tests/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Guest Checkout', () => {
  test('should complete order without login', async ({ page }) => {
    // 1. Ajouter au panier
    await page.goto('/fr/products');
    await page.click('[data-testid="add-to-cart-btn"]:first-of-type');
    
    // 2. Aller au checkout
    await page.goto('/fr/checkout');
    
    // 3. Remplir formulaire
    await page.fill('[name="firstName"]', 'Ahmed');
    await page.fill('[name="email"]', 'ahmed@test.dz');
    await page.fill('[name="phone"]', '0555123456');
    await page.selectOption('[name="wilaya"]', 'Alger');
    
    // 4. Commander
    await page.click('[data-testid="place-order-btn"]');
    
    // 5. Vérifier succès
    await expect(page).toHaveURL(/\/checkout\/success/);
    await expect(page.locator('text=Commande confirmée')).toBeVisible();
  });
});
```

---

## 🎯 SECTION 4 : PLAN D'EXÉCUTION SÉQUENTIEL

### Phase 1 : Corrections Critiques (P0) - 2-3 jours

#### Jour 1 : Auth + Panier
```bash
# 1. Auth Admin Cookie (4h)
- Modifier adminAuthController.ts → Cookie HTTP-only
- Adapter AdminAuthContext.tsx → Lire cookie
- Tester : Login → Reload → Session OK
- E2E : admin-website-communication.spec.ts

# 2. Cart PUT/PATCH (1h)
- Corriger cartService.ts → PUT au lieu de PATCH
- Tester : Update quantité → 200 OK
- Unit test : cartService.test.ts
```

#### Jour 2 : Paiements + Env
```bash
# 3. Endpoint Payments Verify (2h)
- Créer GET /api/v1/payments/verify/:transactionId
- Tester : Verify après commande → Statut correct
- E2E : checkout flow complet

# 4. Variables Env Unifiées (3h)
- Créer frontend/src/lib/config.ts
- Remplacer tous usages (ssr-api, API routes)
- Tester : Aucune URL "undefined"
- Vérifier dev + build prod
```

#### Jour 3 : Panier Invité
```bash
# 5. Guest Cart Flow (5h)
- Créer useGuestCart.ts hook
- Adapter useCart.ts pour auth/guest
- Modifier Checkout → Validate panier
- AuthContext → Sync après login
- E2E : User journey invité complet
```

**Validation Phase 1** :
```bash
# Tests à passer
npm run test                    # Unit tests backend + frontend
npm run test:integration        # Integration tests
npm run test:e2e                # E2E Playwright

# Vérifications manuelles
- Login admin → Dashboard accessible
- Modifier quantité panier → OK
- Checkout invité → Commande créée
- URLs API toutes valides
```

---

### Phase 2 : Priorités Hautes (P1) - 2 jours

#### Jour 4 : i18n + Admin
```bash
# 1. i18n Unifié (2h)
- Créer i18n-config.ts central
- Utiliser partout (middleware, layout)
- Vérifier : / → /fr, alternates corrects

# 2. Admin Customers Endpoints (3h)
OPTION A (Recommandée) : Implémenter backend
- GET /admin/customers/search
- GET /admin/customers/export
- POST /admin/customers/:id/email
- POST /admin/customers/:id/notes

OPTION B : Retirer frontend si non critique
```

#### Jour 5 : Geoloc + Téléphone
```bash
# 3. Geolocation Proxy (1h)
- Modifier /api/geolocation → Proxy backend
- Tester : Cache fonctionne

# 4. Phone Validation (2h)
- Créer utils/algerian-phone.ts
- Utiliser dans Orders + Payments
- Tests unitaires : tous formats acceptés

# 5. Swagger Cleanup (2h)
- Corriger blocs cassés admin.ts
- Générer OpenAPI propre
- Valider avec swagger-jsdoc
```

**Validation Phase 2** :
```bash
# Tests
npm run lint                    # Pas d'erreurs
npm run type-check              # TS compile
npm run test                    # Tests passent

# Vérifications
- Admin dashboard : Aucune 404
- Géolocation : Cache OK
- Téléphones : Tous formats validés
```

---

### Phase 3 : Optimisations (P2) - 1-2 jours

#### Jour 6 : Performance + Sécurité
```bash
# 1. Caching Redis (3h)
- Implémenter getCached helper
- Cache categories/manufacturers
- Mesurer : Latence < 50ms

# 2. Database Indexes (1h)
- Ajouter indexes Prisma
- Migration : npm run db:migrate
- Vérifier : EXPLAIN sur requêtes

# 3. Rate Limiting (2h)
- Configurer par route
- Tester : Auth 5/15min, API 100/min
```

**Validation Phase 3** :
```bash
# Performance Tests
npm run test:integration -- -t "performance"

# Métriques cibles
- API Response Time: < 300ms (P95)
- Initial Load: < 2s
- Cache Hit Rate: > 80%
```

---

## 📚 SECTION 5 : DOCUMENTATION & STANDARDS

### Convention de Nommage

#### Backend
```typescript
// ✅ Fichiers : kebab-case
admin-auth.controller.ts
order.service.ts
algerian-phone.utils.ts

// ✅ Classes : PascalCase
class OrderService {}
class AppError extends Error {}

// ✅ Fonctions : camelCase
async function createOrder() {}
export function validatePhone() {}

// ✅ Constants : SCREAMING_SNAKE_CASE
const MAX_CART_ITEMS = 50;
const DEFAULT_LOCALE = 'fr';
```

#### Frontend
```typescript
// ✅ Composants : PascalCase
ProductCard.tsx
CheckoutForm.tsx

// ✅ Hooks : camelCase avec "use"
useCart.ts
useGuestCart.ts

// ✅ Utils : camelCase
formatPrice.ts
validateEmail.ts

// ✅ Types : PascalCase
type Product = {}
interface CartItem {}
```

---

### Structure de Commit

```bash
# Format : <type>(<scope>): <subject>

# Types :
fix:      # Bug fix (P0, P1)
feat:     # Nouvelle feature
refactor: # Refactoring code
perf:     # Performance improvement
test:     # Tests ajoutés/modifiés
docs:     # Documentation
chore:    # Config, deps, etc.

# Exemples :
fix(auth): implement HTTP-only cookie for admin auth
feat(cart): add guest cart with localStorage
perf(products): add database indexes for filtering
test(checkout): add e2e test for guest order flow
```

---

### Code Review Checklist

#### Avant de Commit
- [ ] Code compile sans erreurs TypeScript
- [ ] `npm run lint` passe sans warnings
- [ ] Tests unitaires passent
- [ ] Aucun `console.log` oublié (sauf dans error handlers)
- [ ] Pas de données sensibles en dur (tokens, passwords)
- [ ] Variables d'environnement documentées

#### Review Sécurité
- [ ] Inputs validés (express-validator)
- [ ] Outputs sanitizés (XSS protection)
- [ ] Auth vérifié sur routes sensibles
- [ ] Rate limiting sur endpoints critiques
- [ ] Pas de SQL injection possible (Prisma OK)
- [ ] CORS configuré correctement

#### Review Performance
- [ ] Pas de N+1 queries (utiliser `include`)
- [ ] Pagination implémentée
- [ ] Cache utilisé si données stables
- [ ] Images optimisées (Next.js Image)
- [ ] Lazy loading pour components lourds

---

## 🚀 SECTION 6 : STRATÉGIE DE DÉPLOIEMENT

### Environnements

```bash
# Development (local)
FRONTEND: http://localhost:3000
BACKEND:  http://localhost:3001
DATABASE: Neon Dev Branch

# Staging (Vercel + Railway/Render)
FRONTEND: https://staging.mjchauffage.com
BACKEND:  https://api-staging.mjchauffage.com
DATABASE: Neon Staging Branch

# Production
FRONTEND: https://mjchauffage.com
BACKEND:  https://api.mjchauffage.com
DATABASE: Neon Production
```

---

### Déploiement Sécurisé

#### Pre-Deploy Checklist
```bash
# 1. Tests
npm run test                 # All tests pass
npm run test:e2e             # E2E green
npm run type-check           # No TS errors

# 2. Build
npm run build:backend
npm run build:frontend

# 3. Environment
# Vérifier toutes les variables en .env.production

# 4. Database
npm run db:migrate -- --preview-feature  # Preview SQL
npm run db:migrate                       # Apply

# 5. Smoke Tests Staging
curl https://api-staging.mjchauffage.com/api/v1/health
curl https://staging.mjchauffage.com/fr
```

---

### Rollback Strategy

```bash
# Si problème en production :

# 1. Rollback Frontend (Vercel)
vercel rollback mjchauffage-production

# 2. Rollback Backend (Railway/Render)
# Via dashboard ou CLI

# 3. Rollback Database (si migration)
npm run db:migrate down

# 4. Vérifier Health
curl https://api.mjchauffage.com/api/v1/health/detailed
```

---

## 🎓 SECTION 7 : FORMATION ÉQUIPE

### Onboarding Nouveau Dev

#### Jour 1 : Setup
```bash
# 1. Clone repo
git clone https://github.com/mjchauffage/ecommerce.git
cd ecommerce

# 2. Install
npm install

# 3. Environment
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# 4. Database
npm run db:migrate
npm run db:seed

# 5. Run
npm run dev

# 6. Tests
npm run test
```

#### Jour 2-3 : Architecture Review
- Lire `WARP.md`
- Lire `ROUTES-API-CARTOGRAPHIE.md`
- Explorer codebase avec IDE
- Poser questions à l'équipe

#### Semaine 1 : Première Issue
- Choisir issue P2 (faible risque)
- Créer branche : `fix/issue-xxx`
- Implémenter + tests
- Ouvrir Pull Request
- Code review avec senior

---

### Documentation Living

```markdown
# docs/
├── API.md              # OpenAPI spec
├── ARCHITECTURE.md     # Diagrammes système
├── DATABASE.md         # Schema Prisma expliqué
├── DEPLOYMENT.md       # Guide déploiement
├── TROUBLESHOOTING.md  # Problèmes courants
└── CHANGELOG.md        # Versions releases
```

---

## 🔍 SECTION 8 : MONITORING & OBSERVABILITÉ

### Logs Structurés

```typescript
// backend/src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'mjchauffage-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Production : Ajouter transport externe (Logtail, Datadog, etc.)
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.Http({
    host: process.env.LOG_HOST,
    path: '/logs',
  }));
}
```

**Usage** :
```typescript
import { logger } from '@/utils/logger';

// Info
logger.info('Order created', { orderId, userId, total });

// Warning
logger.warn('Low stock', { productId, quantity: 2 });

// Error
logger.error('Payment failed', { error: err.message, transactionId });
```

---

### Health Checks

```typescript
// backend/src/routes/health.ts
router.get('/health/detailed', async (req, res) => {
  const checks = {
    database: 'unknown',
    redis: 'unknown',
    memory: 'unknown',
  };
  
  // 1. Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch (error) {
    checks.database = 'error';
    logger.error('Database health check failed', { error });
  }
  
  // 2. Redis
  try {
    await redis.ping();
    checks.redis = 'ok';
  } catch (error) {
    checks.redis = 'error';
  }
  
  // 3. Memory
  const memUsage = process.memoryUsage();
  checks.memory = memUsage.heapUsed < 500 * 1024 * 1024 ? 'ok' : 'high';
  
  const isHealthy = Object.values(checks).every(status => status === 'ok');
  
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks,
    uptime: process.uptime(),
    version: process.env.APP_VERSION || '1.0.0',
  });
});
```

---

### Métriques Clés (KPIs)

```typescript
// À tracker via analytics
export const KPIs = {
  // Performance
  apiResponseTime: 'P95 < 300ms',
  pageLoadTime: 'FCP < 1.5s, LCP < 2.5s',
  errorRate: '< 1%',
  
  // Business
  conversionRate: 'Visiteurs → Commandes',
  cartAbandonmentRate: 'Paniers non convertis',
  averageOrderValue: 'Total / Nb commandes',
  
  // Technique
  uptime: '> 99.5%',
  cacheHitRate: '> 80%',
  deploymentFrequency: 'Hebdomadaire',
};
```

---

## 🎯 SECTION 9 : INSTRUCTIONS POUR L'AGENT

### Ordre d'Exécution STRICT

```
PHASE 1 (CRITIQUE - 3 jours)
│
├─ P0-1: Auth Admin Cookie (4h)
│  └─ Test: Login → Reload → OK
│
├─ P0-2: Cart PUT Method (1h)
│  └─ Test: Update quantity → 200
│
├─ P0-3: Payments Verify Endpoint (2h)
│  └─ Test: Verify transaction → Status
│
├─ P0-4: Env Variables Unified (3h)
│  └─ Test: No "undefined" URLs
│
└─ P0-5: Guest Cart Flow (5h)
   └─ Test: E2E guest checkout

VALIDATION: npm run test:e2e
│
├─ Si VERT → Phase 2
└─ Si ROUGE → Fixer avant de continuer

PHASE 2 (HAUTE - 2 jours)
│
├─ P1-1: i18n Default Locale (2h)
├─ P1-2: Admin Customers Endpoints (3h)
├─ P1-3: Geolocation Proxy (1h)
├─ P1-4: Phone Validation Helper (2h)
└─ P1-5: Swagger Cleanup (2h)

VALIDATION: npm run lint && npm run test
│
└─ Si OK → Phase 3

PHASE 3 (MOYENNE - 1-2 jours)
│
├─ Caching Redis
├─ Database Indexes
├─ Rate Limiting
└─ Performance Tests
```

---

### Règles ABSOLUES pour l'Agent

#### ❌ INTERDIT
1. **JAMAIS** créer de mock data
2. **JAMAIS** modifier Prisma schema sans migration
3. **JAMAIS** committer sans tests
4. **JAMAIS** utiliser `any` en TypeScript (sauf cas extrêmes)
5. **JAMAIS** skip validation/sanitization
6. **JAMAIS** hardcoder secrets/tokens
7. **JAMAIS** faire 2 phases en même temps

#### ✅ OBLIGATOIRE
1. **TOUJOURS** tester après chaque modification
2. **TOUJOURS** documenter les fonctions publiques
3. **TOUJOURS** gérer les erreurs (try/catch)
4. **TOUJOURS** valider les inputs
5. **TOUJOURS** logger les erreurs
6. **TOUJOURS** suivre l'ordre P0 → P1 → P2
7. **TOUJOURS** confirmer avant de passer à la tâche suivante

---

### Template de Rapport Quotidien

```markdown
## 🔧 Rapport - [Date]

### ✅ Complété
- [x] P0-1: Auth Admin Cookie
  - Fichiers: adminAuthController.ts, AdminAuthContext.tsx
  - Tests: ✅ admin-website-communication.spec.ts VERT
  - Notes: Cookie SameSite=Lax, Secure en prod

### 🔄 En Cours
- [ ] P0-2: Cart PUT Method
  - Progression: 60%
  - Bloqueur: Aucun
  - ETA: 1h restante

### ⚠️ Problèmes Rencontrés
- Aucun

### 📊 Métriques
- Tests passant: 156/158 (98.7%)
- Coverage: 78%
- Build time: 45s

### 🎯 Prochaines Étapes
1. Finir P0-2 (1h)
2. Commencer P0-3 (2h)
3. Tests E2E fin de journée
```

---

### Checklist avant Commit

```bash
# ✅ Vérifier AVANT git commit

# 1. Code Quality
□ npm run lint -- --fix
□ npm run type-check
□ Aucun console.log oublié (grep -r "console.log" src/)

# 2. Tests
□ npm run test -- --changed
□ Coverage > 75%
□ E2E pour features critiques

# 3. Documentation
□ JSDoc sur fonctions publiques
□ README.md mis à jour si nouveau feature
□ CHANGELOG.md entry

# 4. Sécurité
□ Aucun secret hardcodé (git secrets --scan)
□ Dependencies à jour (npm audit)
□ Validations inputs OK

# 5. Performance
□ Pas de N+1 queries
□ Images optimisées
□ Bundle size raisonnable (<500KB)
```

---

## 📝 SECTION 10 : RÉSUMÉ EXÉCUTIF

### Priorités Absolues (FAIRE EN PREMIER)

**1. Auth Admin Cookie (P0-1)**
- **Pourquoi** : Dashboard inaccessible = Business bloqué
- **Impact** : ⭐⭐⭐⭐⭐
- **Effort** : 4h
- **Risque** : Faible

**2. Cart PUT Method (P0-2)**
- **Pourquoi** : Clients ne peuvent pas modifier quantité
- **Impact** : ⭐⭐⭐⭐⭐
- **Effort** : 1h
- **Risque** : Très faible

**3. Guest Cart Flow (P0-5)**
- **Pourquoi** : Perte de ventes invités
- **Impact** : ⭐⭐⭐⭐⭐
- **Effort** : 5h
- **Risque** : Moyen

**4. Env Variables (P0-4)**
- **Pourquoi** : API calls cassées
- **Impact** : ⭐⭐⭐⭐
- **Effort** : 3h
- **Risque** : Moyen

**5. Payment Verify (P0-3)**
- **Pourquoi** : UX après commande
- **Impact** : ⭐⭐⭐
- **Effort** : 2h
- **Risque** : Faible

---

### Timeline Réaliste

```
Semaine 1 : Phase P0 (Critique)
├─ Lun-Mar : Auth + Cart + Env
├─ Mer-Jeu : Guest Cart + Payment
└─ Ven     : Tests E2E + Validation

Semaine 2 : Phase P1 (Haute)
├─ Lun     : i18n + Admin Endpoints
├─ Mar     : Geoloc + Phone Validation
└─ Mer-Jeu : Swagger + Tests

Semaine 3 : Phase P2 (Optimisation)
├─ Lun-Mar : Caching + Indexes
└─ Mer-Ven : Performance Tests + Documentation
```

---

### Success Criteria

**À la fin de Phase 1 (P0)** :
- ✅ Admin peut se connecter et gérer le site
- ✅ Clients peuvent ajouter/modifier panier
- ✅ Invités peuvent commander
- ✅ Toutes les APIs répondent correctement
- ✅ Tests E2E verts à 100%

**À la fin de Phase 2 (P1)** :
- ✅ i18n cohérent (fr/ar)
- ✅ Admin dashboard complet
- ✅ Géolocalisation optimisée
- ✅ Validation téléphone uniforme
- ✅ Documentation API à jour

**À la fin de Phase 3 (P2)** :
- ✅ API Response Time < 300ms (P95)
- ✅ Cache Hit Rate > 80%
- ✅ Code Coverage > 75%
- ✅ Lighthouse Score > 90

---

### Message Final pour l'Agent

```
Tu as maintenant un contexte complet pour corriger l'e-commerce MJ CHAUFFAGE.

RÈGLES D'OR :
1. Commence par P0-1 (Auth Admin Cookie)
2. Ne passe JAMAIS à la tâche suivante sans validation
3. Teste SYSTÉMATIQUEMENT après chaque modification
4. Aucune mock data - utilise uniquement Neon DB
5. Documente chaque changement important
6. Demande confirmation avant actions critiques

COMMANDE POUR DÉMARRER :
"Je vais commencer par P0-1 (Auth Admin Cookie). 
Je vais modifier adminAuthController.ts pour ajouter le cookie HTTP-only.
Confirme avant que je commence."

BON COURAGE ! 🚀
```