# 🏗️ ARCHITECTURE VISUELLE - MJ CHAUFFAGE

**Diagrammes et schémas pour comprendre rapidement**

---

## 📐 ARCHITECTURE GLOBALE

```
┌─────────────────────────────────────────────────────────────┐
│                      UTILISATEURS                            │
├─────────────────────────────────────────────────────────────┤
│  👤 Clients                     👨‍💼 Admin                    │
│  (FR/AR/EN)                      (FR only)                   │
└────────┬────────────────────────────────┬────────────────────┘
         │                                 │
         ▼                                 ▼
┌─────────────────────┐          ┌─────────────────────┐
│   FRONTEND PUBLIC   │          │  ADMIN DASHBOARD    │
│   (Next.js 14)      │          │  (Next.js 14)       │
│   Port: 3000        │          │  Route: /admin      │
│                     │          │                     │
│  ✅ Homepage        │          │  ⚠️ Login (broken) │
│  ✅ Catalogue       │          │  ⚠️ Dashboard       │
│  ✅ Panier          │          │  ❌ CRUD Produits   │
│  ✅ Checkout        │          │  ⚠️ Commandes       │
│  ✅ i18n FR/AR/EN   │          │  ⚠️ Clients         │
└──────────┬──────────┘          └──────────┬──────────┘
           │                                 │
           │    HTTP Requests (fetch)        │
           └─────────────┬───────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   BACKEND API        │
              │   (Express.js)       │
              │   Port: 3001         │
              │                      │
              │  ✅ /api/v1/products │
              │  ✅ /api/v1/auth     │
              │  ✅ /api/v1/orders   │
              │  ✅ /api/v1/cart     │
              │  ❌ /manufacturers   │
              │  ❌ /analytics/events│
              └──────────┬───────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌────────┐    ┌──────────┐    ┌─────────┐
    │Database│    │  Redis   │    │  Email  │
    │Prisma  │    │  Cache   │    │Nodemailer│
    │Postgre │    │  Mock    │    │  SMTP   │
    │SQL     │    │          │    │         │
    └────────┘    └──────────┘    └─────────┘
```

---

## 🗂️ STRUCTURE FRONTEND

```
frontend/
│
├── 📁 src/app/                      # Next.js App Router
│   │
│   ├── 📁 [locale]/                 # Routes Publiques (i18n)
│   │   ├── page.tsx                 # ✅ Homepage moderne
│   │   ├── 📁 products/             # ✅ Catalogue
│   │   │   ├── page.tsx             # Liste produits
│   │   │   └── 📁 [id]/             # Détail produit
│   │   │       └── page.tsx         # ⚠️ À moderniser
│   │   ├── 📁 cart/                 # ✅ Panier
│   │   ├── 📁 checkout/             # ✅ Checkout moderne
│   │   └── 📁 auth/                 # ✅ Login/Register
│   │
│   ├── 📁 admin/                    # Routes Admin
│   │   ├── layout.tsx               # ⚠️ Layout ancien
│   │   ├── 📁 login/                # ❌ Ne marche pas
│   │   ├── 📁 dashboard/            # ⚠️ Erreurs console
│   │   ├── 📁 products/             # ❌ CRUD cassé
│   │   ├── 📁 orders/               # ⚠️ Erreurs API
│   │   └── 📁 customers/            # ⚠️ Erreurs API
│   │
│   └── 📁 api/                      # API Routes (Next.js)
│       ├── contact/                 # ✅ Form contact
│       └── products/                # ✅ Proxy produits
│
├── 📁 src/components/               # Composants React
│   ├── 📁 ui/                       # ✅ Composants UI modernes
│   │   ├── Button.tsx               # 7 variants
│   │   ├── Card.tsx                 # Glass effect
│   │   ├── Input.tsx                # Validation
│   │   ├── Badge.tsx                # 11 variants
│   │   └── Modal.tsx                # Animations
│   │
│   ├── 📁 common/                   # ✅ Composants partagés
│   │   ├── Header.tsx               # Navigation
│   │   ├── Footer.tsx               # Footer
│   │   └── MegaMenu.tsx             # Menu moderne
│   │
│   ├── 📁 products/                 # ✅ Composants produits
│   │   ├── ModernProductCard.tsx
│   │   └── ModernProductFilters.tsx
│   │
│   ├── 📁 cart/                     # ✅ Composants panier
│   ├── 📁 checkout/                 # ✅ Composants checkout
│   │
│   └── 📁 admin/                    # ⚠️ Composants admin
│       ├── AdminAuthGuard.tsx       # ❌ Ne marche pas
│       ├── ProductsManagement.tsx   # ❌ CRUD cassé
│       └── OrdersManagement.tsx     # ⚠️ Erreurs
│
├── 📁 src/contexts/                 # React Context
│   ├── ComparisonContext.tsx        # ✅ Comparaison
│   ├── WishlistContext.tsx          # ✅ Wishlist
│   └── PublicAuthContext.tsx        # ✅ Auth clients
│
├── 📁 src/services/                 # Services API
│   ├── apiClient.ts                 # ✅ Client HTTP
│   ├── authService.ts               # ✅ Auth
│   ├── productService.ts            # ✅ Produits
│   └── analyticsService.ts          # ⚠️ Erreurs
│
└── 📁 src/styles/                   # Styles
    ├── globals.css                  # ✅ Styles globaux
    ├── modern-theme.css             # ✅ Thème 2025
    └── design-tokens.ts             # ✅ Tokens design

✅ = Fonctionne
⚠️ = Erreurs mineures
❌ = Ne fonctionne pas
```

---

## 🗃️ STRUCTURE BACKEND

```
backend/
│
├── 📁 src/
│   │
│   ├── 📁 config/                   # Configuration
│   │   ├── database.ts              # ✅ Prisma
│   │   ├── redis.ts                 # ✅ Mock Redis
│   │   ├── email.ts                 # ✅ Nodemailer
│   │   └── security.ts              # ✅ Helmet, CORS
│   │
│   ├── 📁 middleware/               # Middlewares
│   │   ├── auth.ts                  # ✅ JWT validation
│   │   ├── security.ts              # ✅ Rate limiting
│   │   ├── validation.ts            # ✅ Input validation
│   │   ├── errorHandler.ts          # ✅ Error handling
│   │   └── apiVersioning.ts         # ✅ API v1
│   │
│   ├── 📁 routes/                   # 13 routes
│   │   ├── auth.ts                  # ✅ Login/Register
│   │   ├── products.ts              # ⚠️ Manufacturers missing
│   │   ├── orders.ts                # ✅ CRUD orders
│   │   ├── cart.ts                  # ✅ Cart endpoints
│   │   ├── admin.ts                 # ⚠️ Login admin à fixer
│   │   ├── analytics.ts             # ❌ Events missing
│   │   ├── customers.ts             # ✅ Customers
│   │   ├── services.ts              # ✅ Services
│   │   ├── payments.ts              # ✅ Payments
│   │   ├── uploads.ts               # ✅ Images upload
│   │   ├── contact.ts               # ✅ Contact form
│   │   ├── realtime.ts              # ✅ WebSocket
│   │   └── health.ts                # ✅ Health check
│   │
│   ├── 📁 controllers/              # Contrôleurs
│   │   ├── authController.ts        # ✅ Auth logic
│   │   ├── productController.ts     # ✅ Products CRUD
│   │   ├── orderController.ts       # ✅ Orders logic
│   │   └── ... (13 contrôleurs)
│   │
│   ├── 📁 services/                 # Services métier
│   │   ├── authService.ts           # ✅ JWT, bcrypt
│   │   ├── productService.ts        # ✅ Products
│   │   ├── orderService.ts          # ✅ Orders
│   │   ├── emailService.ts          # ✅ Email templates
│   │   ├── productValidationService.ts  # ✅ Validation
│   │   └── ... (20+ services)
│   │
│   ├── 📁 utils/                    # Utilitaires
│   │   ├── logger.ts                # ✅ Winston
│   │   ├── validation.ts            # ✅ Joi schemas
│   │   └── queryOptimizer.ts        # ✅ DB optimization
│   │
│   └── 📁 lib/                      # Helpers
│       └── database.ts              # ✅ Prisma client
│
├── 📁 prisma/
│   ├── schema.prisma                # ✅ PostgreSQL
│   ├── schema-sqlite.prisma         # ✅ SQLite (dev)
│   ├── seed.ts                      # ✅ Seed data
│   └── migrations/                  # Migrations
│
└── 📄 .env                          # ✅ Config env

✅ = Fonctionne
⚠️ = Erreurs mineures
❌ = Ne fonctionne pas
```

---

## 🔐 FLOW AUTHENTIFICATION

### Client (Public)
```
┌──────────────┐
│   Client     │
│  /auth/login │
└──────┬───────┘
       │ email + password
       ▼
┌─────────────────────────┐
│  POST /api/v1/auth/login│
│  authController.ts      │
└──────┬──────────────────┘
       │ validate + generate JWT
       ▼
┌──────────────────┐
│  Return token    │
│  + user data     │
└──────┬───────────┘
       │ store in localStorage
       ▼
┌──────────────────┐
│  Redirect to     │
│  /fr/products    │
└──────────────────┘

✅ FONCTIONNE
```

### Admin (Dashboard)
```
┌──────────────┐
│    Admin     │
│ /admin/login │
└──────┬───────┘
       │ email + password
       ▼
┌──────────────────────────┐
│ POST /api/v1/admin/login │  ❌ Route existe mais next-auth interfère
│ adminController.ts       │
└──────┬───────────────────┘
       │
       ▼
❌ ERREUR: next-auth routes 404
   - /api/auth/session not found
   - /api/auth/_log not found

SOLUTION:
1. Supprimer next-auth
2. Créer AdminAuthContext custom
3. Utiliser JWT + localStorage ou httpOnly cookies
```

---

## 🔄 FLOW CRÉATION PRODUIT (ADMIN)

### État Actuel (Cassé ❌)
```
┌─────────────────┐
│  Admin logged   │
│  /admin/products│
└────────┬────────┘
         │ Click "Créer produit"
         ▼
┌──────────────────────┐
│  Form create product │
│  Fill data + image   │
└────────┬─────────────┘
         │ Submit form
         ▼
┌────────────────────────────┐
│ POST /api/v1/products      │
│ Headers: Authorization     │  ❌ Token invalide ou expiré
└────────┬───────────────────┘
         │
         ▼
┌────────────────────┐
│  403 FORBIDDEN     │
│  "Invalid token"   │
└────────────────────┘

PROBLÈME:
- Token admin pas envoyé correctement
- Backend ne valide pas le token admin
- Middleware auth mal configuré
```

### État Attendu (À Fixer ✅)
```
┌─────────────────┐
│  Admin logged   │
│  Token in store │
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│  Form create product │
└────────┬─────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ POST /api/v1/products           │
│ Headers: {                      │
│   Authorization: Bearer <token> │
│ }                               │
└────────┬────────────────────────┘
         │ Validate token (middleware auth.ts)
         ▼
┌──────────────────────┐
│ Decode JWT           │
│ Check role: ADMIN    │
└────────┬─────────────┘
         │ ✅ Admin authorized
         ▼
┌──────────────────────┐
│ productService.ts    │
│ Create in database   │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ 201 CREATED          │
│ Return new product   │
└────────────────────┘
```

---

## 📊 FLOW DONNÉES (DATA FLOW)

```
┌─────────────────────────────────────────────────────────┐
│                       CLIENT                             │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Frontend (Next.js)  │
              │  State Management:   │
              │  - Zustand (Cart)    │
              │  - Context (Auth)    │
              │  - Server State      │
              └──────────┬───────────┘
                         │
                         │ HTTP Requests
                         ▼
              ┌──────────────────────┐
              │   apiClient.ts       │
              │   - Add auth headers │
              │   - Error handling   │
              │   - Retry logic      │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   Backend Routes     │
              │   /api/v1/*          │
              └──────────┬───────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌────────┐    ┌──────────┐    ┌─────────┐
    │Middleware│   │Controller│   │ Service │
    │- Auth    │ → │- Logic   │ → │- Business│
    │- Validate│   │- Format  │   │- DB ops │
    └────────┘    └──────────┘    └─────┬───┘
                                         │
                                         ▼
                                  ┌──────────┐
                                  │  Prisma  │
                                  │  Client  │
                                  └─────┬────┘
                                        │
                                        ▼
                                  ┌──────────┐
                                  │PostgreSQL│
                                  │ Database │
                                  └──────────┘
```

---

## 🎨 DESIGN SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                   DESIGN TOKENS                          │
│  (design-tokens.ts)                                      │
│                                                          │
│  Colors | Typography | Spacing | Shadows | Animations   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  THEME CSS VARIABLES                     │
│  (modern-theme.css + globals.css)                       │
│                                                          │
│  --color-primary | --font-size-* | --spacing-* | etc.   │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌────────┐    ┌──────────┐    ┌─────────┐
    │  Base  │    │Composite │    │  Page   │
    │Component│   │Component │    │Component│
    │        │    │          │    │         │
    │ Button │    │ProductCard│   │Homepage │
    │ Input  │    │DataTable │    │Checkout │
    │ Card   │    │StatsCard │    │Dashboard│
    │ Badge  │    │Form      │    │Catalogue│
    │ Modal  │    │Sidebar   │    │         │
    └────────┘    └──────────┘    └─────────┘
```

---

## 🔍 PROBLÈMES VISUELS

### Problème #1: Admin Auth Flow Cassé
```
ACTUEL (❌):
Admin Login → next-auth routes → 404 Error
                ↓
          No token stored
                ↓
          Admin locked out

SOLUTION (✅):
Admin Login → Custom JWT auth → Token in localStorage
                ↓
           Token validated
                ↓
           Admin access granted
```

### Problème #2: CRUD Produits Cassé
```
ACTUEL (❌):
Create Product → POST /api/v1/products
                      ↓
                 403 Forbidden
                      ↓
                "Invalid token"

SOLUTION (✅):
Create Product → POST /api/v1/products
                 Headers: Authorization Bearer <token>
                      ↓
                 Middleware validates admin token
                      ↓
                 201 Created
```

### Problème #3: Routes API Manquantes
```
ACTUEL (❌):
GET /api/v1/manufacturers → 404 Not Found
POST /api/v1/analytics/events → 404 Not Found

SOLUTION (✅):
Créer dans:
- backend/src/routes/products.ts (manufacturers)
- backend/src/routes/analytics.ts (events)
```

---

## 📈 ROADMAP VISUELLE

```
SEMAINE 1
│
├─ JOUR 1 (3h)
│  ├─ ✅ Fix Admin Auth
│  └─ ✅ Routes API manquantes
│
├─ JOUR 2 (3h)
│  ├─ ✅ Moderniser Dashboard
│  └─ ✅ Moderniser CRUD Produits
│
└─ JOUR 3 (2h)
   └─ ✅ Tests Admin Complets

SEMAINE 2
│
├─ JOUR 4 (3h)
│  └─ ✅ Page Détail Produit Moderne
│
├─ JOUR 5 (2h)
│  ├─ ✅ Nettoyage Code
│  └─ ✅ Optimisations
│
└─ JOUR 6 (3h)
   ├─ ✅ Tests Complets
   └─ 🚀 DÉPLOIEMENT

TOTAL: 16h sur 2 semaines
```

---

**Ces diagrammes donnent une vision claire de l'architecture actuelle et des problèmes à résoudre** 🎯
