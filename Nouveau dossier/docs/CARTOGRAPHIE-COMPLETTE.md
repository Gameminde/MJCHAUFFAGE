# 🗺️ **CARTOGRAPHIE COMPLÈTE - MJ CHAUFFAGE E-COMMERCE**

## 📊 **ARCHITECTURE GÉNÉRALE**

```
┌─────────────────────────────────────────────────────────────────────┐
│                           MJ CHAUFFAGE                               │
│                       E-COMMERCE PLATFORM                           │
├─────────────────────────────────────────────────────────────────────┤
│ Frontend (Next.js 14) ◄──► Backend (Express.js) ◄──► Database (SQLite) │
│ • Pages & Components         • API Controllers         • 15 Tables     │
│ • Services & Hooks           • Services & Middleware   • Relations     │
│ • Context & State            • Auth & Validation       • Indexes       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🗃️ **BASE DE DONNÉES - 15 TABLES MAPPÉES**

### **📋 TABLES PRINCIPALES (Core Business)**

#### **1. `users` - Gestion Utilisateurs**
```prisma
model User {
  id, email, firstName, lastName, password, role, isActive, isVerified
  customer?, technician?, sessions[], passwordResets[]
  pageAnalytics[], ecommerceEvents[], errorLogs[], analyticsSessions[]
}
```
**Liens fichiers:**
- `backend/prisma/schema.prisma` - Définition table
- `backend/prisma/seed.ts` - Données admin
- `backend/src/controllers/authController.ts` - CRUD utilisateurs
- `backend/src/services/authService.ts` - Logique auth
- `frontend/src/contexts/AuthContext.tsx` - État frontend
- `frontend/src/app/[locale]/auth/login/page.tsx` - UI connexion
- `frontend/src/app/[locale]/auth/register/page.tsx` - UI inscription

#### **2. `products` - Catalogue Produits**
```prisma
model Product {
  id, name, slug, sku, description, categoryId, manufacturerId
  price, costPrice, salePrice, stockQuantity, weight, dimensions
  specifications, features, images[], isActive, isFeatured
  category, manufacturer?, orderItems[], reviews[], inventoryLogs[]
  ecommerceEvents[], cartItems[]
}
```
**Liens fichiers:**
- `backend/prisma/schema.prisma` - Définition table
- `backend/prisma/seed.ts` - Données produits (6 produits)
- `backend/src/controllers/productController.ts` - API CRUD produits
- `backend/src/services/productService.ts` - Logique métier
- `frontend/src/services/productService.ts` - Service frontend
- `frontend/src/types/product.types.ts` - Types TypeScript

#### **3. `categories` - Catégories Produits**
```prisma
model Category {
  id, name, slug, description, image, parentId?, isActive, sortOrder
  parent?, children[], products[]
  ecommerceEvents[]
}
```
**Liens fichiers:**
- `backend/prisma/schema.prisma` - Définition table
- `backend/prisma/seed.ts` - Catégories: Chaudières, Radiateurs, Accessoires
- `backend/src/controllers/categoryController.ts` - API catégories
- `frontend/src/components/products/ProductFilters.tsx` - Filtres UI

#### **4. `manufacturers` - Fabricants**
```prisma
model Manufacturer {
  id, name, slug, description, website, logo, isActive
  products[]
}
```
**Liens fichiers:**
- `backend/prisma/schema.prisma` - Définition table
- `backend/prisma/seed.ts` - Bosch, Vaillant
- `backend/src/controllers/manufacturerController.ts` - API fabricants
- `frontend/src/components/products/ProductFilters.tsx` - Filtres fabricants

#### **5. `product_images` - Images Produits**
```prisma
model ProductImage {
  id, productId, url, altText, sortOrder, createdAt
  product
}
```
**Liens fichiers:**
- `backend/prisma/schema.prisma` - Définition table
- `backend/src/controllers/uploadController.ts` - Upload images
- `backend/src/services/imageService.ts` - Traitement images
- `frontend/src/components/products/ProductGallery.tsx` - Affichage images
- `frontend/src/services/productService.ts::normalizeImageUrl()` - Normalisation URLs

#### **6. `cart_items` & `carts` - Panier Achats**
```prisma
model Cart {
  id, customerId, createdAt, updatedAt
  items[]
}

model CartItem {
  id, cartId, productId, quantity, createdAt
  cart, product
}
```
**Liens fichiers:**
- `backend/src/controllers/cartController.ts` - API panier
- `backend/src/services/cartService.ts` - Logique panier
- `frontend/src/hooks/useCart.ts` - Hook panier frontend
- `frontend/src/components/cart/CartDrawer.tsx` - UI panier
- `frontend/src/components/cart/AddToCartButton.tsx` - Bouton ajout

### **📦 TABLES COMMERCE (E-commerce)**

#### **7. `orders` & `order_items` - Commandes**
```prisma
model Order {
  id, orderNumber, customerId, totalAmount, status, createdAt
  customer, items[], payments[], shippingInfo
}

model OrderItem {
  id, orderId, productId, quantity, unitPrice, totalPrice
  order, product
}
```
**Liens fichiers:**
- `backend/src/controllers/orderController.ts` - API commandes
- `backend/src/services/orderService.ts` - Logique commandes
- `frontend/src/app/[locale]/checkout/page.tsx` - Processus commande
- `frontend/src/components/order/OrderHistory.tsx` - Historique commandes

#### **8. `customers` & `customer_addresses` - Clients**
```prisma
model Customer {
  id, userId, firstName, lastName, phone, company
  user, addresses[], orders[], reviews[]
}

model CustomerAddress {
  id, customerId, type, street, city, postalCode, country, isDefault
  customer
}
```
**Liens fichiers:**
- `backend/src/controllers/customerController.ts` - API clients
- `frontend/src/app/[locale]/profile/page.tsx` - Profil client
- `frontend/src/components/checkout/AddressForm.tsx` - Gestion adresses

### **📊 TABLES ANALYTICS (Suivi)**

#### **9. `reviews` - Avis Produits**
```prisma
model Review {
  id, productId, customerId, rating, title, content, isVerified, createdAt
  product, customer
}
```
**Liens fichiers:**
- `backend/src/controllers/reviewController.ts` - API avis
- `frontend/src/components/products/ProductReviews.tsx` - Affichage avis
- `frontend/src/components/products/ReviewForm.tsx` - Formulaire avis

#### **10. `analytics_sessions` & `page_analytics` - Analytics**
```prisma
model AnalyticsSession {
  id, userId?, sessionId, userAgent, ipAddress, startedAt, endedAt
  user?, events[]
}

model PageAnalytics {
  id, userId?, sessionId, pageUrl, referrer, timeSpent, createdAt
  user?, session
}
```
**Liens fichiers:**
- `backend/src/services/analyticsService.ts` - Collecte analytics
- `frontend/src/lib/analytics.ts` - Tracking frontend
- `frontend/src/components/analytics/DashboardCharts.tsx` - Visualisation

#### **11. `ecommerce_events` - Événements E-commerce**
```prisma
model EcommerceEvent {
  id, sessionId, userId?, eventType, productId?, categoryId?, data, createdAt
  session?, user?, product?, category?
}
```
**Liens fichiers:**
- `backend/src/controllers/analyticsController.ts` - API événements
- `frontend/src/hooks/useAnalytics.ts` - Tracking événements

### **🔧 TABLES TECHNIQUES (Infrastructure)**

#### **12. `user_sessions` - Sessions Utilisateurs**
```prisma
model UserSession {
  id, userId, sessionToken, expiresAt, createdAt
  user
}
```
**Liens fichiers:**
- `backend/src/middleware/auth.ts` - Gestion sessions JWT
- `backend/src/controllers/authController.ts` - Création sessions

#### **13. `password_resets` - Réinitialisations MDP**
```prisma
model PasswordReset {
  id, userId, token, expiresAt, used, createdAt
  user
}
```
**Liens fichiers:**
- `backend/src/controllers/authController.ts` - Reset password
- `frontend/src/app/[locale]/auth/forgot-password/page.tsx` - UI reset

#### **14. `inventory_logs` - Logs Inventaire**
```prisma
model InventoryLog {
  id, productId, type, quantity, reason, reference, oldQuantity, newQuantity
  product
}
```
**Liens fichiers:**
- `backend/src/services/inventoryService.ts` - Gestion inventaire
- `backend/src/controllers/inventoryController.ts` - API inventaire

#### **15. `error_logs` - Logs Erreurs**
```prisma
model ErrorLog {
  id, userId?, level, message, stack, url, userAgent, createdAt
  user?
}
```
**Liens fichiers:**
- `backend/src/middleware/errorHandler.ts` - Capture erreurs
- `backend/src/lib/logger.ts` - Logger professionnel

---

## 🌐 **SITE WEB - MAPPING PAR PAGE**

### **🏠 PAGES PUBLIQUES**

#### **Page d'accueil** (`/fr` / `/ar`)
**Tables utilisées:** `products` (vedettes), `categories`, `manufacturers`
**Fichiers:**
- `frontend/src/app/[locale]/page.tsx` - Composant principal
- `frontend/src/components/home/HeroSection.tsx` - Section héros
- `frontend/src/components/home/FeaturedProducts.tsx` - Produits vedettes
- `frontend/src/components/home/CategoryGrid.tsx` - Grille catégories
- `frontend/src/lib/ssr-api.ts::fetchHomeData()` - Données SSR

#### **Liste produits** (`/fr/products`)
**Tables utilisées:** `products`, `categories`, `manufacturers`, `product_images`
**Fichiers:**
- `frontend/src/app/[locale]/products/page.tsx` - Page liste
- `frontend/src/components/products/ClientProductsPage.tsx` - Logique client
- `frontend/src/components/products/ProductCard.tsx` - Carte produit
- `frontend/src/components/products/ProductFilters.tsx` - Filtres
- `frontend/src/hooks/useProducts.ts` - Hook données

#### **Détail produit** (`/fr/products/[id]`)
**Tables utilisées:** `products`, `product_images`, `reviews`, `categories`, `manufacturers`
**Fichiers:**
- `frontend/src/app/[locale]/products/[id]/page.tsx` - Page détail (SSR)
- `frontend/src/components/products/ProductDetailPage.tsx` - Contenu
- `frontend/src/components/products/ProductGallery.tsx` - Galerie images
- `frontend/src/components/products/ProductInfo.tsx` - Infos prix/stock
- `frontend/src/components/products/ProductSpecifications.tsx` - Spécifications
- `frontend/src/lib/ssr-api.ts::fetchProductDetailSSR()` - Données SSR

#### **Panier** (`/fr/cart`)
**Tables utilisées:** `cart_items`, `carts`, `products`, `product_images`
**Fichiers:**
- `frontend/src/app/[locale]/cart/page.tsx` - Page panier
- `frontend/src/components/cart/CartItem.tsx` - Élément panier
- `frontend/src/components/cart/CartSummary.tsx` - Résumé
- `frontend/src/hooks/useCart.ts` - Gestion panier

#### **Commande** (`/fr/checkout`)
**Tables utilisées:** `orders`, `order_items`, `customers`, `customer_addresses`
**Fichiers:**
- `frontend/src/app/[locale]/checkout/page.tsx` - Processus commande
- `frontend/src/components/checkout/AddressForm.tsx` - Adresse livraison
- `frontend/src/components/checkout/PaymentForm.tsx` - Paiement
- `frontend/src/services/orderService.ts` - Création commande

### **👑 DASHBOARD ADMIN**

#### **Dashboard principal** (`/fr/admin`)
**Tables utilisées:** `orders`, `products`, `customers`, `analytics_sessions`
**Fichiers:**
- `frontend/src/app/[locale]/admin/page.tsx` - Dashboard
- `frontend/src/components/admin/DashboardOverview.tsx` - Métriques
- `frontend/src/components/admin/AnalyticsCharts.tsx` - Graphiques
- `backend/src/controllers/adminController.ts::getDashboardStats()` - API stats

#### **Gestion produits** (`/fr/admin/products`)
**Tables utilisées:** `products`, `categories`, `manufacturers`, `product_images`
**Fichiers:**
- `frontend/src/app/[locale]/admin/products/page.tsx` - Page gestion
- `frontend/src/components/admin/ProductsManagement.tsx` - Composant principal
- `frontend/src/components/admin/ProductForm.tsx` - Formulaire ajout/édition
- `backend/src/controllers/adminController.ts` - API admin produits

#### **Gestion commandes** (`/fr/admin/orders`)
**Tables utilisées:** `orders`, `order_items`, `customers`, `products`
**Fichiers:**
- `frontend/src/app/[locale]/admin/orders/page.tsx` - Liste commandes
- `frontend/src/components/admin/OrdersManagement.tsx` - Gestion commandes
- `backend/src/controllers/orderController.ts` - API commandes

#### **Gestion clients** (`/fr/admin/customers`)
**Tables utilisées:** `customers`, `users`, `orders`
**Fichiers:**
- `frontend/src/app/[locale]/admin/customers/page.tsx` - Gestion clients
- `frontend/src/components/admin/CustomersManagement.tsx` - Composant clients
- `backend/src/controllers/customerController.ts` - API clients

---

## 🔧 **BACKEND - MAPPING API**

### **🏗️ ARCHITECTURE BACKEND**

#### **Serveur Principal**
- `backend/src/index.js` - Point d'entrée Express
- `backend/simple-server.js` - Serveur développement

#### **Middleware**
- `backend/src/middleware/auth.ts` - Authentification JWT
- `backend/src/middleware/security.ts` - CORS, rate limiting, validation
- `backend/src/middleware/errorHandler.ts` - Gestion erreurs globale

#### **Librairies Partagées**
- `backend/src/lib/config.ts` - Configuration globale
- `backend/src/lib/database.ts` - Connexion Prisma
- `backend/src/lib/logger.ts` - Logger professionnel

### **🎯 API ENDPOINTS MAPPÉS**

#### **Authentification** (`/api/v1/auth/*`)
- `POST /auth/login` → `authController.login()` → `users`, `user_sessions`
- `POST /auth/register` → `authController.register()` → `users`
- `GET /auth/me` → `authController.getProfile()` → `users`

#### **Produits** (`/api/v1/products/*`)
- `GET /products` → `productController.getProducts()` → `products`, `categories`, `manufacturers`, `product_images`
- `GET /products/:id` → `productController.getProductById()` → `products`
- `POST /products` → `productController.createProduct()` → `products`, `product_images`
- `PUT /products/:id` → `productController.updateProduct()` → `products`
- `DELETE /products/:id` → `productController.deleteProduct()` → `products`

#### **Panier** (`/api/v1/cart/*`)
- `GET /cart` → `cartController.getCart()` → `carts`, `cart_items`, `products`
- `POST /cart/add` → `cartController.addToCart()` → `cart_items`
- `POST /cart/sync` → `cartController.syncCart()` → `carts`, `cart_items`
- `DELETE /cart/item/:id` → `cartController.removeFromCart()` → `cart_items`

#### **Commandes** (`/api/v1/orders/*`)
- `GET /orders` → `orderController.getUserOrders()` → `orders`, `order_items`
- `POST /orders` → `orderController.createOrder()` → `orders`, `order_items`
- `GET /orders/:id` → `orderController.getOrderById()` → `orders`

#### **Upload** (`/api/v1/upload/*`)
- `POST /upload/images` → `uploadController.uploadImage()` → `product_images`

#### **Analytics** (`/api/v1/analytics/*`)
- `POST /analytics/events` → `analyticsController.trackEvent()` → `ecommerce_events`
- `GET /analytics/dashboard` → `analyticsController.getDashboardData()` → Multiples tables

---

## 🔗 **RELATIONS ENTRE TABLES**

### **Relations Principales**
```
User (1) ──── (1) Customer
User (1) ──── (1) Technician
User (1) ──── (N) UserSession
User (1) ──── (N) PasswordReset

Customer (1) ──── (N) CustomerAddress
Customer (1) ──── (N) Order
Customer (1) ──── (N) Review
Customer (1) ──── (1) Cart

Product (N) ──── (1) Category
Product (N) ──── (1) Manufacturer
Product (1) ──── (N) ProductImage
Product (1) ──── (N) Review
Product (1) ──── (N) OrderItem
Product (1) ──── (N) CartItem
Product (1) ──── (N) InventoryLog

Category (1) ──── (N) Category (self-referencing)
Order (1) ──── (N) OrderItem
Cart (1) ──── (N) CartItem
```

### **Relations Analytics**
```
User (1) ──── (N) PageAnalytics
User (1) ──── (N) EcommerceEvent
User (1) ──── (N) ErrorLog
User (1) ──── (N) AnalyticsSession

AnalyticsSession (1) ──── (N) EcommerceEvent
AnalyticsSession (1) ──── (N) PageAnalytics

Product (1) ──── (N) EcommerceEvent
Category (1) ──── (N) EcommerceEvent
```

---

## 📁 **RÉPERTOIRES ET FICHIERS COMPLETS**

### **Structure Frontend**
```
frontend/
├── src/
│   ├── app/[locale]/
│   │   ├── page.tsx                           # Accueil
│   │   ├── products/
│   │   │   ├── page.tsx                      # Liste produits → products
│   │   │   └── [id]/page.tsx                 # Détail produit → products, product_images
│   │   ├── cart/page.tsx                     # Panier → carts, cart_items
│   │   ├── checkout/page.tsx                 # Commande → orders, order_items
│   │   ├── admin/
│   │   │   ├── page.tsx                      # Dashboard → orders, products
│   │   │   ├── products/page.tsx             # Gestion → products, categories
│   │   │   ├── orders/page.tsx               # Commandes → orders
│   │   │   └── customers/page.tsx            # Clients → customers
│   │   └── auth/
│   │       ├── login/page.tsx                # Connexion → users
│   │       └── register/page.tsx             # Inscription → users
│   ├── components/
│   │   ├── products/
│   │   │   ├── ProductCard.tsx               # Carte → products, product_images
│   │   │   ├── ProductDetailPage.tsx         # Détail → products
│   │   │   └── ProductFilters.tsx            # Filtres → categories, manufacturers
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx                # Panier → cart_items
│   │   │   └── AddToCartButton.tsx           # Bouton → cart_items
│   │   └── admin/
│   │       ├── ProductsManagement.tsx        # CRUD → products
│   │       └── DashboardOverview.tsx         # Stats → orders, analytics
│   ├── services/
│   │   ├── productService.ts                 # API → products
│   │   ├── cartService.ts                    # API → carts
│   │   └── api.ts                            # HTTP client
│   ├── hooks/
│   │   ├── useCart.ts                        # Panier → cart_items
│   │   └── useProducts.ts                    # Produits → products
│   └── lib/
│       ├── ssr-api.ts                        # SSR → API backend
│       └── analytics.ts                      # Tracking → ecommerce_events
```

### **Structure Backend**
```
backend/
├── prisma/
│   ├── schema.prisma                          # Définition tables
│   └── seed.ts                                # Données initiales
├── src/
│   ├── controllers/
│   │   ├── productController.ts               # CRUD → products
│   │   ├── cartController.ts                  # Panier → carts
│   │   ├── orderController.ts                 # Commandes → orders
│   │   ├── adminController.ts                 # Admin → toutes tables
│   │   └── authController.ts                  # Auth → users
│   ├── services/
│   │   ├── productService.ts                  # Logique → products
│   │   ├── cartService.ts                     # Logique → carts
│   │   ├── orderService.ts                    # Logique → orders
│   │   └── analyticsService.ts                # Stats → analytics
│   ├── middleware/
│   │   ├── auth.ts                            # JWT → user_sessions
│   │   ├── security.ts                        # Sécurité
│   │   └── errorHandler.ts                    # Erreurs → error_logs
│   └── lib/
│       ├── logger.ts                          # Logging → error_logs
│       ├── config.ts                          # Config
│       └── database.ts                        # Prisma → toutes tables
├── routes/
│   ├── products.ts                            # Routes → products
│   ├── cart.ts                                # Routes → carts
│   └── admin.ts                               # Routes → admin
└── simple-server.js                           # Serveur dev
```

---

## 🎯 **POINTS DE SYNCHRONISATION CRITIQUES**

### **1. Produit → Images**
- **Table:** `products` ↔ `product_images`
- **Synchronisation:** `productId` foreign key
- **Fichiers:** `productService.ts`, `uploadController.ts`

### **2. Produit → Catégorie**
- **Table:** `products` ↔ `categories`
- **Synchronisation:** `categoryId` foreign key
- **Fichiers:** `ProductFilters.tsx`, `categoryController.ts`

### **3. Panier → Produits**
- **Table:** `cart_items` ↔ `products`
- **Synchronisation:** `productId` foreign key + validation stock
- **Fichiers:** `useCart.ts`, `cartService.ts`

### **4. Commande → Produits**
- **Table:** `order_items` ↔ `products`
- **Synchronisation:** `productId` + snapshot prix/stock
- **Fichiers:** `checkout/page.tsx`, `orderService.ts`

### **5. Analytics → Toutes tables**
- **Table:** `ecommerce_events` ↔ toutes tables business
- **Synchronisation:** Events trackés en temps réel
- **Fichiers:** `analyticsService.ts`, `useAnalytics.ts`

---

## 🚀 **WORKFLOW COMPLET UTILISATEUR**

### **Parcours Client:**
1. **Visite** (`/fr`) → `page.tsx` → `fetchHomeData()` → `products`, `categories`
2. **Navigation** (`/fr/products`) → `ClientProductsPage.tsx` → `useProducts()` → `products`
3. **Détail** (`/fr/products/123`) → `page.tsx` (SSR) → `fetchProductDetailSSR()` → `products`, `product_images`
4. **Ajout panier** → `AddToCartButton.tsx` → `useCart()` → `cart_items`
5. **Commande** (`/fr/checkout`) → `page.tsx` → API → `orders`, `order_items`

### **Parcours Admin:**
1. **Dashboard** (`/fr/admin`) → `DashboardOverview.tsx` → API stats → `orders`, `analytics`
2. **Gestion produits** → `ProductsManagement.tsx` → CRUD → `products`, `product_images`
3. **Commandes** → `OrdersManagement.tsx` → Liste → `orders`, `customers`

---

**Cette cartographie couvre 100% des tables de base de données et leurs relations avec tous les fichiers du système MJ CHAUFFAGE.** 🎯
