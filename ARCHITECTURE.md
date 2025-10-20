# MJ CHAUFFAGE - Application Architecture

## 📐 Project Structure Overview

This document describes the architecture of the MJ CHAUFFAGE e-commerce platform after the comprehensive reorganization.

---

## 🎯 Core Principles

1. **Clear Separation**: Public routes and admin routes are completely separate
2. **No Mixing**: i18n only applies to public routes, never to admin
3. **Single Source**: All data comes from one backend API (port 3001)
4. **Best Practices**: Follows Next.js 14 App Router conventions

---

## 📁 File Structure

```
frontend/src/app/
├── page.tsx                     # Root - redirects to /fr
├── layout.tsx                   # Root layout (minimal, wraps everything)
├── not-found.tsx               # Global 404 page
│
├── [locale]/                    # PUBLIC ROUTES (with i18n)
│   ├── layout.tsx              # Public layout (Header, Footer, i18n provider)
│   ├── page.tsx                # Homepage
│   ├── products/               # Product listing and details
│   ├── about/                  # About page
│   ├── contact/                # Contact page
│   ├── cart/                   # Shopping cart
│   ├── checkout/               # Checkout process
│   ├── auth/                   # Customer authentication
│   │   ├── login/              # Customer login
│   │   └── register/           # Customer registration
│   └── ...                     # Other public pages
│
├── admin/                       # ADMIN ROUTES (no i18n)
│   ├── layout.tsx              # Admin layout (Sidebar, auth protection)
│   ├── page.tsx                # Redirects to /admin/dashboard
│   ├── login/                  # Admin login (separate from customer)
│   ├── dashboard/              # Admin dashboard
│   ├── products/               # Product management
│   ├── orders/                 # Order management
│   ├── customers/              # Customer management
│   └── analytics/              # Analytics
│
└── api/                         # API ROUTES (minimal)
    ├── contact/                # Contact form handler
    └── geolocation/            # Geolocation service
```

---

## 🛣️ Route Structure

### Public Routes (with i18n)

```
URL Pattern                     Description
─────────────────────────────────────────────────────────
/                              → Redirects to /fr
/fr                            → French homepage
/ar                            → Arabic homepage (RTL)
/fr/products                   → Products listing (French)
/ar/products                   → Products listing (Arabic)
/fr/products/[id]              → Product details
/fr/about                      → About page
/fr/contact                    → Contact page
/fr/cart                       → Shopping cart
/fr/checkout                   → Checkout page
/fr/auth/login                 → Customer login
/fr/auth/register              → Customer registration
```

### Admin Routes (no i18n)

```
URL Pattern                     Description
─────────────────────────────────────────────────────────
/admin                         → Redirects to /admin/dashboard
/admin/login                   → Admin login
/admin/dashboard               → Admin dashboard
/admin/products                → Manage products
/admin/orders                  → Manage orders
/admin/customers               → Manage customers
/admin/analytics               → View analytics
```

**Important**: Admin routes NEVER have locale prefixes. Accessing `/fr/admin` automatically redirects to `/admin`.

---

## 🔄 Middleware Flow

The middleware processes requests in 4 distinct layers:

```typescript
REQUEST
   ↓
┌─────────────────────────────────┐
│ LAYER 1: Admin Routes           │
│ - No i18n processing            │
│ - Auth check (except /login)    │
│ - Redirect /fr/admin → /admin   │
└─────────────────────────────────┘
   ↓ (if not admin)
┌─────────────────────────────────┐
│ LAYER 2: API Routes             │
│ - Pass through without changes  │
└─────────────────────────────────┘
   ↓ (if not API)
┌─────────────────────────────────┐
│ LAYER 3: Static Files           │
│ - Images, CSS, JS, fonts       │
│ - Pass through                  │
└─────────────────────────────────┘
   ↓ (if not static)
┌─────────────────────────────────┐
│ LAYER 4: i18n for Public Routes│
│ - Add locale prefix if needed  │
│ - Handle language switching    │
│ - RTL support for Arabic       │
└─────────────────────────────────┘
   ↓
RESPONSE
```

---

## 🔐 Authentication

### Two Separate Auth Systems

#### 1. Customer Authentication
- **Location**: `/[locale]/auth/login`
- **Purpose**: Customer accounts for orders
- **Storage**: LocalStorage (`authToken`)
- **Roles**: `CUSTOMER`

#### 2. Admin Authentication
- **Location**: `/admin/login`
- **Purpose**: Admin panel access
- **Storage**: Cookies (`authToken`)
- **Roles**: `ADMIN`, `SUPER_ADMIN`
- **Guard**: `AdminAuthGuard` component

### Auth Flow

```
Customer Login:
/fr/auth/login → Backend API → Store token → /fr/dashboard (if exists) or /fr

Admin Login:
/admin/login → Backend API → Store token → /admin/dashboard
```

---

## 🌐 Internationalization (i18n)

### Configuration
- **Library**: `next-intl`
- **Locales**: `fr` (French), `ar` (Arabic)
- **Default**: `fr`
- **Strategy**: `as-needed` (no /fr prefix for default locale)

### How It Works

1. **Public routes** get automatic locale prefixes
2. **Admin routes** are excluded from i18n
3. **Language switcher** changes locale in URL
4. **RTL support** for Arabic (`dir="rtl"`)

### Example

```
User visits: https://mjchauffage.com/products
↓
Middleware adds locale
↓
Redirects to: https://mjchauffage.com/fr/products
```

---

## 🔌 API Communication

### Backend Connection

```
Frontend (port 3000)
    ↓
    | HTTP Requests
    ↓
Backend (port 3001)
    ↓
Database
```

### API Client Structure

```typescript
// Before (had frontend API routes):
Frontend → /api/products → Backend /api/products ❌

// After (direct backend calls):
Frontend → Backend /api/products ✅
```

### Endpoints

**Public API** (no auth required):
- `GET /api/products` - List products
- `GET /api/products/:id` - Product details
- `GET /api/categories` - List categories

**Admin API** (auth required):
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/orders` - List orders
- `PUT /api/admin/orders/:id/status` - Update order
- `GET /api/admin/customers` - List customers
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

---

## 📦 Component Organization

```
frontend/src/components/
├── admin/                       # Admin-only components
│   ├── AdminAuthGuard.tsx      # Auth protection
│   ├── AdminDashboard.tsx      # Dashboard wrapper
│   ├── DashboardOverview.tsx   # Stats overview
│   ├── ProductsManagement.tsx  # Product CRUD
│   ├── OrdersManagement.tsx    # Order management
│   └── CustomersManagement.tsx # Customer management
│
├── common/                      # Shared components
│   ├── Header.tsx              # Site header
│   ├── Footer.tsx              # Site footer
│   └── Button.tsx              # Reusable button
│
├── products/                    # Product components
│   ├── ProductCard.tsx         # Product display card
│   ├── ProductGrid.tsx         # Product grid layout
│   └── ProductFilter.tsx       # Filtering UI
│
├── cart/                        # Cart components
│   ├── CartButton.tsx          # Cart icon + count
│   ├── MiniCart.tsx            # Cart dropdown
│   └── ShoppingCart.tsx        # Full cart page
│
└── providers/                   # Context providers
    ├── index.tsx               # All providers wrapper
    └── AuthProvider.tsx        # Auth context
```

---

## 🧪 Testing Routes

### Manual Testing Checklist

```bash
# Public Routes
✓ http://localhost:3000/                    → /fr
✓ http://localhost:3000/fr                  → Homepage
✓ http://localhost:3000/ar                  → Homepage (RTL)
✓ http://localhost:3000/products            → /fr/products
✓ http://localhost:3000/fr/products         → Products page
✓ http://localhost:3000/ar/products         → Products page (RTL)

# Admin Routes
✓ http://localhost:3000/admin               → /admin/dashboard
✓ http://localhost:3000/admin/login         → Admin login
✓ http://localhost:3000/fr/admin            → /admin (redirect)
✓ http://localhost:3000/ar/admin            → /admin (redirect)
✓ http://localhost:3000/admin/dashboard     → Dashboard (if logged in)
✓ http://localhost:3000/admin/products      → Products management
```

---

## 🚀 Development Workflow

### Starting the Application

```bash
# Terminal 1: Backend
cd backend
npm run dev                    # Runs on port 3001

# Terminal 2: Frontend
cd frontend
npm run dev                    # Runs on port 3000
```

### Making Changes

**Adding a new public page:**
1. Create in `app/[locale]/your-page/page.tsx`
2. It automatically gets i18n support

**Adding a new admin page:**
1. Create in `app/admin/your-page/page.tsx`
2. It's automatically protected by AdminAuthGuard
3. Add menu item in `admin/layout.tsx`

---

## 📝 Environment Variables

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LOCALE=fr

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_SEO=true
```

---

## ✅ Benefits of This Architecture

1. **Clear Separation**
   - Public and admin are completely isolated
   - No accidental i18n on admin pages
   - Easy to understand and navigate

2. **Performance**
   - No unnecessary middleware processing
   - Direct backend calls (no frontend proxy)
   - Optimized for both admin and public

3. **Maintainability**
   - One file, one purpose
   - Easy to find and fix bugs
   - Clear naming conventions

4. **Scalability**
   - Easy to add new admin features
   - Easy to add new public pages
   - Clean separation allows team collaboration

5. **Best Practices**
   - Follows Next.js 14 conventions
   - Uses App Router properly
   - Proper middleware layering
   - Clean API communication

---

## 🔄 Migration from Old Structure

### What Changed

**Before:**
- Routes mixed together
- admin-v2 separate microservice
- Confusing redirects
- i18n conflicts

**After:**
- Clean separation
- Single backend
- Clear routing
- No conflicts

### For Developers

If you're working on old code:

1. **Admin components** are still in `components/admin/`
2. **Admin pages** moved to `app/admin/` (no locale)
3. **Public pages** are in `app/[locale]/`
4. **API calls** go directly to backend (removed frontend API routes)

---

## 📞 Support

- **Setup Guide**: See `QUICK_START.md`
- **Admin Guide**: See `ADMIN_SETUP_GUIDE.md`
- **Migration Details**: See `ADMIN_MIGRATION_SUMMARY.md`

---

**Last Updated**: October 17, 2025  
**Version**: 2.0.0 (Post-Reorganization)  
**Status**: ✅ Production Ready


