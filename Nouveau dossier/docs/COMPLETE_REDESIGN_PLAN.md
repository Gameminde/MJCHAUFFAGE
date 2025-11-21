# 🎨 COMPLETE MJCHAUFFAGE WEBSITE REDESIGN

## 📊 Current System Analysis

### ✅ Database Schema (Excellent!)
- **Products**: Full e-commerce schema with images, pricing, stock, compatibility
- **Orders**: Complete order management with payments
- **Users**: Customer accounts, addresses, authentication
- **Services**: Technician booking system
- **Analytics**: Comprehensive tracking
- **Cart**: Shopping cart functionality

### ❌ Current Issues
1. Image upload broken (authentication)
2. Images not displaying (URL path issues)
3. UI/UX needs modernization
4. Flow between components broken

---

## 🎯 REDESIGN APPROACH

### Phase 1: Figma Design System ⏳ IN PROGRESS
**Objective**: Create modern, professional e-commerce design

#### Required from You:
**Please provide ONE of the following:**

1. **Option A**: Existing Figma Design URL
   ```
   https://www.figma.com/file/XXXXX/MJ-Chauffage
   ```

2. **Option B**: Let me create a modern design
   - I'll design: Homepage, Product Catalog, Product Detail, Cart, Checkout
   - Style: Modern, clean, professional for heating/plumbing e-commerce
   - Colors: Trust-building (blues, whites, accent colors)
   - Mobile-first, accessible

#### Design Components Needed:
- [ ] Navigation (header, menu, search)
- [ ] Product Card (thumbnail, title, price, stock, add to cart)
- [ ] Product Detail (gallery, specs, compatibility, add to cart)
- [ ] Shopping Cart (items list, totals, checkout button)
- [ ] Checkout Flow (address, payment, confirmation)
- [ ] Admin Panel (dashboard, product management, orders)

---

### Phase 2: Backend Verification
**Verify all APIs work correctly:**

#### Products API:
- `GET /api/v1/products` - List products
- `GET /api/v1/products/:id` - Product details
- `POST /api/v1/products` - Create (admin)
- `PUT /api/v1/products/:id` - Update (admin)
- `DELETE /api/v1/products/:id` - Delete (admin)

#### Images API:
- `POST /api/v1/uploads` - Upload images (admin)
- `GET /files/:filename` - Serve static files

#### Cart API:
- `GET /api/v1/cart` - Get user cart
- `POST /api/v1/cart` - Add to cart
- `PUT /api/v1/cart/:id` - Update quantity
- `DELETE /api/v1/cart/:id` - Remove item

#### Orders API:
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - List orders
- `GET /api/v1/orders/:id` - Order details

---

### Phase 3: Frontend Rebuild from Figma
**New Next.js 14 components matching Figma design:**

```
frontend/src/
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── SearchBar.tsx
│   │   └── Breadcrumbs.tsx
│   ├── products/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductFilters.tsx
│   │   ├── ProductDetail.tsx
│   │   └── ProductGallery.tsx
│   ├── cart/
│   │   ├── CartDrawer.tsx
│   │   ├── CartItem.tsx
│   │   └── CartSummary.tsx
│   └── checkout/
│       ├── CheckoutForm.tsx
│       ├── AddressForm.tsx
│       └── PaymentForm.tsx
└── app/
    ├── [locale]/
    │   ├── page.tsx              # Homepage
    │   ├── products/
    │   │   ├── page.tsx          # Product List
    │   │   └── [id]/page.tsx     # Product Detail
    │   ├── cart/page.tsx         # Shopping Cart
    │   └── checkout/page.tsx     # Checkout
    └── admin/
        ├── products/page.tsx     # Product Management
        └── orders/page.tsx       # Order Management
```

---

### Phase 4: Image System Fix
**Permanent solution for image handling:**

#### Backend:
```typescript
// uploads.ts - Returns /files/filename.jpg
function toPublicUrl(filename: string): string {
  return `/files/${filename}`;
}
```

#### Frontend:
```typescript
// imageUtils.ts - Converts to full URL
function getProductImageUrl(url: string): string {
  if (url.startsWith('http')) return url;
  return `http://localhost:3001${url}`; // /files/image.jpg
}
```

#### Next.js Image Component:
```tsx
<Image
  src={getProductImageUrl(product.images[0]?.url)}
  alt={product.name}
  width={400}
  height={400}
  fallback="/placeholder.png"
/>
```

---

### Phase 5: Complete User Flows

#### Customer Flow:
1. Browse products (filtered by category, manufacturer, compatibility)
2. View product detail (images, specs, price, stock)
3. Add to cart (with quantity)
4. View cart (update quantities, remove items)
5. Checkout (address, payment)
6. Order confirmation (email, tracking)

#### Admin Flow:
1. Login to admin panel
2. Manage products (CRUD)
3. Upload product images (with preview)
4. Manage orders (view, update status)
5. View analytics

---

### Phase 6: Testing & Deployment

#### Testing Checklist:
- [ ] All images load correctly
- [ ] Product search/filter works
- [ ] Cart functionality complete
- [ ] Checkout process smooth
- [ ] Admin upload works
- [ ] Mobile responsive
- [ ] Performance optimized

---

## 🛠️ Technology Stack

### Frontend:
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Images**: Next/Image with proper error handling
- **State**: React Context + SWR for data fetching
- **Forms**: React Hook Form + Zod validation

### Backend:
- **Framework**: Express.js
- **Database**: SQLite (Prisma ORM)
- **Auth**: JWT (Bearer tokens in localStorage)
- **Files**: Multer + static serving
- **Validation**: Zod

### Infrastructure:
- **Static Files**: Express static at `/files/`
- **API**: Express at `/api/v1/`
- **CORS**: Configured for localhost:3000
- **Uploads**: Stored in `backend/uploads/`

---

## 📦 Current Database Entities

### Products:
- ✅ ID, SKU, name, description
- ✅ Price (TTC & HT for B2B)
- ✅ Stock management
- ✅ Category & Manufacturer relations
- ✅ Multiple images per product
- ✅ Technical specifications
- ✅ Compatibility data (models, brands)

### Orders:
- ✅ Order number, customer
- ✅ Items with quantities
- ✅ Shipping address
- ✅ Payment tracking
- ✅ Status management

### Users:
- ✅ Customer accounts
- ✅ Admin roles
- ✅ Authentication
- ✅ Addresses

---

## 🚀 NEXT STEPS

### Immediate Action Required:
**Please provide your Figma design URL OR let me know to create one**

Once I have the Figma design, I will:
1. Extract all components and assets
2. Verify backend APIs (test with Postman/curl)
3. Build new frontend components matching Figma
4. Fix image upload/display permanently
5. Test complete user flows
6. Deploy and document

---

## 📝 Notes

### What's Working:
- ✅ Database schema is excellent
- ✅ Backend routes are registered
- ✅ Authentication system exists
- ✅ Basic product CRUD works

### What Needs Fixing:
- ❌ Image upload (Bearer token missing)
- ❌ Image display (URL path confusion)
- ❌ UI/UX modernization
- ❌ Complete flow testing

### What's New:
- 🎨 Professional Figma design
- 🔄 Proper image URL handling
- ✨ Modern UI components
- 📱 Mobile-first approach
- 🧪 Complete flow testing

---

**Status**: ⏳ **AWAITING FIGMA DESIGN URL**

Once provided, we'll proceed systematically through each phase, verifying every connection and fixing all issues permanently.
