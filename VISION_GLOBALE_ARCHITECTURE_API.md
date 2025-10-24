# 🏗️ VISION GLOBALE ARCHITECTURE API - MJ CHAUFFAGE

**Date:** 19 Octobre 2025  
**Analyse complète:** Backend ↔ Frontend API Communication

---

## 📊 STRUCTURE GLOBALE

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Port 3000)                       │
│                        Next.js 14                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Public Pages:                    Admin Dashboard:             │
│  - Homepage                        - /admin/login               │
│  - Products                        - /admin/dashboard           │
│  - Cart                            - /admin/products            │
│  - Checkout                        - /admin/orders              │
│  - Auth (client)                   - /admin/customers           │
│                                    - /admin/analytics           │
└────────────┬────────────────────────────────┬──────────────────┘
             │                                │
             │ HTTP Requests                  │ HTTP Requests
             │ (fetch/axios)                  │ (fetch/axios)
             │                                │
┌────────────▼────────────────────────────────▼──────────────────┐
│                    API CLIENT (apiClient.ts)                    │
│                                                                 │
│  Base URL: http://localhost:3001                               │
│  Auth: Bearer Token (localStorage: authToken/admin_token)      │
│                                                                 │
│  Structure:                                                     │
│  - apiClient.main      → /api/v1/*                            │
│  - apiClient.public    → /api/v1/products, /api/v1/categories │
│  - apiClient.admin     → /api/v1/admin/*                      │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              │ HTTP Requests
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                    BACKEND (Port 3001)                          │
│                     Express.js + TypeScript                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  API Versioning:                                                │
│  ✅ /api/v1/*         (Current - Recommended)                  │
│  ⚠️  /api/*           (Legacy - Deprecated)                    │
│                                                                 │
│  13 Route Files:                                                │
│  1. admin.ts          - Admin dashboard operations              │
│  2. analytics.ts      - Analytics & KPIs                        │
│  3. auth.ts           - Authentication (login/register)         │
│  4. cart.ts           - Shopping cart                           │
│  5. contact.ts        - Contact form                            │
│  6. customers.ts      - Customer management                     │
│  7. health.ts         - Health checks                           │
│  8. orders.ts         - Order management                        │
│  9. payments.ts       - Payment processing                      │
│  10. products.ts      - Product CRUD                            │
│  11. realtime.ts      - WebSocket/realtime                      │
│  12. services.ts      - Service requests                        │
│  13. uploads.ts       - File uploads                            │
│                                                                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              │ Database Queries (Prisma ORM)
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                    DATABASE (PostgreSQL/SQLite)                 │
│                                                                 │
│  Tables:                                                        │
│  - User, Customer, Admin                                        │
│  - Product, Category, Manufacturer                              │
│  - Order, OrderItem, Cart                                       │
│  - Service, ServiceRequest                                      │
│  - Address, Payment                                             │
│  - Analytics (Events, Sessions, etc.)                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 TOUTES LES ROUTES API (Backend)

### 🔐 ADMIN ROUTES (`/api/v1/admin/`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/login` | ❌ No | **Admin login** |
| GET | `/me` | ✅ Admin | Get current admin user |
| GET | `/dashboard` | ✅ Admin | Dashboard stats |
| GET | `/activities` | ✅ Admin | Recent activities |
| GET | `/orders` | ✅ Admin | List all orders |
| PUT | `/orders/:orderId/status` | ✅ Admin | Update order status |
| GET | `/customers` | ✅ Admin | List all customers |
| GET | `/customers/:customerId` | ✅ Admin | Customer details |
| GET | `/services` | ✅ Admin | Service requests |
| PUT | `/services/:serviceId/assign` | ✅ Admin | Assign technician |
| GET | `/technicians` | ✅ Admin | List technicians |
| POST | `/technicians` | ✅ Admin | Create technician |
| PUT | `/technicians/:technicianId` | ✅ Admin | Update technician |
| GET | `/analytics/sales` | ✅ Admin | Sales analytics |
| GET | `/inventory/alerts` | ✅ Admin | Low stock alerts |
| GET | `/export` | ✅ Admin | Export data |
| GET | `/settings` | ✅ Super Admin | System settings |
| PUT | `/settings` | ✅ Super Admin | Update settings |

---

### 🔓 AUTH ROUTES (`/api/v1/auth/`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/register` | ❌ No | Customer registration |
| POST | `/login` | ❌ No | Customer login |
| POST | `/refresh` | ❌ No | Refresh JWT token |
| POST | `/logout` | ✅ User | Logout |
| GET | `/me` | ✅ User | Get profile |
| GET | `/profile` | ✅ User | Get profile (alias) |
| PUT | `/profile` | ✅ User | Update profile |
| POST | `/forgot-password` | ❌ No | Request password reset |
| POST | `/reset-password` | ❌ No | Reset password |
| POST | `/verify-email` | ❌ No | Verify email |

---

### 📦 PRODUCTS ROUTES (`/api/v1/products/`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/` | ❌ No | List products (pagination) |
| GET | `/featured` | ❌ No | Featured products |
| GET | `/categories` | ❌ No | List categories |
| GET | `/manufacturers` | ❌ No | **List manufacturers** ✅ |
| POST | `/batch` | ✅ Admin | Batch create products |
| POST | `/` | ✅ Admin | **Create product** |
| GET | `/:id` | ❌ No | Get product details |
| PUT | `/:id` | ✅ Admin | **Update product** |
| DELETE | `/:id` | ✅ Admin | **Delete product** |
| POST | `/:id/inventory` | ✅ Admin | Update inventory |
| GET | `/:id/reviews` | ❌ No | Product reviews |
| POST | `/:id/reviews` | ✅ User | Add review |

---

### 🛒 CART ROUTES (`/api/v1/cart/`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/validate` | ❌ No | Validate cart |
| GET | `/` | ✅ User | Get user cart |
| POST | `/sync` | ✅ User | Sync cart |
| DELETE | `/` | ✅ User | Clear cart |
| POST | `/items` | ✅ User | Add item |
| PUT | `/items/:itemId` | ✅ User | Update item |
| DELETE | `/items/:itemId` | ✅ User | Remove item |

---

### 📋 ORDERS ROUTES (`/api/v1/orders/`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/guest` | ❌ No | Guest order |
| POST | `/` | ✅ User | Create order |
| GET | `/` | ✅ User | User orders |
| GET | `/statistics` | ✅ User | Order statistics |
| GET | `/:id` | ✅ User | Order details |
| PATCH | `/:id/cancel` | ✅ User | Cancel order |

---

### 👥 CUSTOMERS ROUTES (`/api/v1/customers/`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/` | ✅ Admin | List customers |
| GET | `/statistics` | ✅ Admin | Customer stats |
| POST | `/` | ✅ Admin | Create customer |
| GET | `/:id` | ✅ Admin | Customer details |
| PUT | `/:id` | ✅ Admin | Update customer |
| PATCH | `/:id/deactivate` | ✅ Admin | Deactivate |
| PATCH | `/:id/activate` | ✅ Admin | Activate |
| GET | `/profile/me` | ✅ User | My profile |
| PUT | `/profile/me` | ✅ User | Update my profile |
| GET | `/orders/history` | ✅ User | Order history |
| POST | `/addresses` | ✅ User | Add address |
| PUT | `/addresses/:addressId` | ✅ User | Update address |
| DELETE | `/addresses/:addressId` | ✅ User | Delete address |

---

### 💳 PAYMENTS ROUTES (`/api/v1/payments/`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/methods` | ❌ No | Payment methods |
| POST | `/shipping-cost` | ❌ No | Calculate shipping |
| POST | `/process` | ❌ No | Process payment |
| GET | `/verify/:transactionId` | ❌ No | Verify payment |

---

### 🔧 SERVICES ROUTES (`/api/v1/services/`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/` | ❌ No | List services |
| GET | `/types` | ❌ No | Service types |
| GET | `/types/:id` | ❌ No | Service type details |
| GET | `/:id` | ❌ No | Service details |
| POST | `/requests` | ✅ User | Create service request |
| GET | `/requests` | ✅ User | My requests |
| GET | `/requests/statistics` | ✅ User | Request stats |
| GET | `/requests/:id` | ✅ User | Request details |
| POST | `/requests/:id/feedback` | ✅ User | Add feedback |
| PUT | `/requests/:id/status` | ✅ Technician | Update status |
| GET | `/technicians/available` | ✅ Admin | Available technicians |

---

### 📊 ANALYTICS ROUTES (`/api/v1/analytics/`)

**⚠️ ATTENTION: Ce fichier existe mais les routes ne sont pas montées dans server.ts !**

Routes à implémenter:
- GET `/dashboard` - Dashboard KPIs
- GET `/customers` - Customer analytics
- GET `/products` - Product analytics
- GET `/sales` - Sales analytics
- GET `/services` - Service analytics
- GET `/revenue/wilaya` - Revenue by wilaya
- GET `/payments/methods` - Payment methods analytics
- GET `/market/algeria` - Algeria market insights
- POST `/events` - **Track analytics event** ⚠️ MANQUANT

---

### 🌐 REALTIME ROUTES (`/api/v1/realtime/`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/stats/connections` | ✅ Admin | Connection stats |
| GET | `/rooms/:roomName` | ✅ Admin | Room info |
| POST | `/notifications/system` | ✅ Admin | System notification |
| POST | `/broadcast` | ✅ Admin | Broadcast message |
| POST | `/force-refresh` | ✅ Admin | Force refresh |
| GET | `/cache/stats` | ✅ Admin | Cache stats |
| POST | `/cache/invalidate` | ✅ Admin | Invalidate cache |
| POST | `/cache/clear` | ✅ Admin | Clear cache |
| POST | `/cache/clean-expired` | ✅ Admin | Clean expired |
| POST | `/test` | ✅ Admin | Test connection |

---

### 📤 UPLOADS ROUTES (`/api/v1/uploads/`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/` | ✅ Admin | Upload file |

---

### ❤️ HEALTH ROUTES (`/api/v1/health/` ou `/api/health/`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/` | ❌ No | Basic health check |
| GET | `/detailed` | ❌ No | Detailed health |
| GET | `/ready` | ❌ No | Readiness check |
| GET | `/live` | ❌ No | Liveness check |

---

### 📧 CONTACT ROUTE (`/api/v1/contact/`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/` | ❌ No | Send contact message |

---

## 🔴 PROBLÈMES IDENTIFIÉS

### 1. Routes Analytics Non Montées ⚠️ CRITIQUE
```typescript
// backend/src/server.ts ligne 108
v1Router.use('/analytics', analyticsRoutes);
```
**Problème:** Le fichier `analytics.ts` existe mais est vide ou incomplet.
**Impact:** Erreurs 404 sur `/api/v1/analytics/events`

### 2. Route Manufacturers Existe Mais Frontend Cherche Ailleurs
```typescript
// Backend: GET /api/v1/products/manufacturers ✅ Existe
// Frontend: GET /api/manufacturers ❌ (sans /v1/)
```
**Solution:** Utiliser `/api/v1/products/manufacturers`

### 3. Admin Token Storage Inconsistant
```typescript
// AdminAuthContext: localStorage.setItem('admin_token', ...)
// apiClient: localStorage.getItem('authToken') ❌ Nom différent!
```
**Solution:** Unifier les noms de clés

### 4. Routes API Dupliquées (Legacy + v1)
```typescript
// server.ts
app.use('/api/v1', v1Router);        // ✅ Recommandé
app.use('/api', legacyRouter);        // ⚠️ Deprecated
```
**Solution:** Migrer tout vers v1, déprécier legacy

---

## 📈 FRONTEND → BACKEND MAPPING

### Services Frontend

| Frontend Service | Backend Route(s) | Status |
|-----------------|------------------|---------|
| `authService.ts` | `/api/v1/auth/*` | ✅ OK |
| `productService.ts` | `/api/v1/products/*` | ✅ OK |
| `cartService.ts` | `/api/v1/cart/*` | ✅ OK |
| `ordersService.ts` | `/api/v1/orders/*` | ✅ OK |
| `customersService.ts` | `/api/v1/customers/*` | ✅ OK |
| `paymentService.ts` | `/api/v1/payments/*` | ✅ OK |
| `analyticsService.ts` | `/api/v1/analytics/*` | ❌ MANQUANT |
| `realtimeService.ts` | `/api/v1/realtime/*` | ✅ OK |

---

## 🔧 ACTIONS À FAIRE

### 🔴 URGENT (Bloquant)

1. **Fixer Analytics Routes**
   - Compléter `backend/src/routes/analytics.ts`
   - Ajouter route `POST /api/v1/analytics/events`

2. **Unifier Token Storage**
   - AdminAuthContext → utiliser même clé que apiClient
   - Ou modifier apiClient pour supporter 2 tokens

3. **Corriger Frontend API Calls**
   - Manufacturers: `/api/v1/products/manufacturers`
   - Analytics: `/api/v1/analytics/events`

### 🟡 IMPORTANT (Amélioration)

4. **Nettoyer Routes Legacy**
   - Ajouter headers deprecation
   - Rediriger vers v1

5. **Documenter toutes les APIs**
   - Swagger/OpenAPI complet
   - Types TypeScript partagés

6. **Tests API**
   - Tests automatisés pour chaque route
   - Postman collection

---

## 📝 PROCHAINES ÉTAPES

1. ✅ Compléter analytics.ts
2. ✅ Fixer admin token storage
3. ✅ Tester login admin
4. ✅ Tester CRUD produits
5. ✅ Vérifier toutes les routes
6. ✅ Créer tests automatisés

---

**DOCUMENT COMPLET - PRÊT POUR L'ACTION** 🚀
