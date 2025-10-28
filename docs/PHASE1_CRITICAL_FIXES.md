# 🚨 PHASE 1: CRITICAL FIXES (BEFORE REDESIGN)

## ✅ STRATEGY VALIDATED
Following `redesign-strategy-hybrid.md` - **Option A: Corrections → Redesign**

---

## 📋 P0 ISSUES (CRITICAL - SITE BROKEN)

### P0-1: Auth Admin Cookie ⏳ NEXT
**Problem**: Admin authentication using cookies but upload needs Bearer token
**Impact**: Image upload fails (401 Unauthorized)
**Time**: 4h
**Status**: ✅ ALREADY FIXED in ProductsManagement.tsx

**What was done:**
```typescript
// ProductsManagement.tsx - Line 196-210
const token = localStorage.getItem('authToken');
if (!token) {
  alert('Vous devez être connecté pour uploader des images');
  return;
}

const uploadResponse = await fetch(`${API_BASE_URL}/uploads`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});
```

**To verify:**
- [ ] Test admin login
- [ ] Test image upload
- [ ] Confirm token in localStorage

---

### P0-2: Cart PUT Method
**Problem**: Frontend uses PUT, backend expects POST
**Impact**: Cannot update cart quantities
**Time**: 1h

**Files to check:**
- `backend/src/routes/cart.ts`
- `frontend/src/hooks/useCart.ts`

**Action needed:**
```typescript
// Check if PUT route exists:
router.put('/:id', authenticateToken, async (req, res) => {
  // Update cart item quantity
});

// OR update frontend to use POST
```

---

### P0-3: Payment Verify Endpoint
**Problem**: Payment verification endpoint missing/broken
**Impact**: Cannot complete orders
**Time**: 2h
**Note**: **Payment on delivery** (cash on delivery) - Algeria context

**Files to check:**
- `backend/src/routes/payments.ts`
- `backend/src/controllers/paymentController.ts`

**Action needed:**
```typescript
// Add payment on delivery option
router.post('/verify', authenticateToken, async (req, res) => {
  const { orderId, method } = req.body;
  
  if (method === 'CASH_ON_DELIVERY') {
    // Mark order as pending payment
    // Set payment status to PENDING
    return res.json({ success: true, requiresDelivery: true });
  }
  
  // Handle other payment methods...
});
```

---

### P0-4: Env Variables Unified
**Problem**: Inconsistent API URLs across codebase
**Impact**: Some requests go to wrong endpoints
**Time**: 3h

**Current state:**
- `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1` ✅
- Static files at `http://localhost:3001/files/` ✅

**Action needed:**
```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Use in code:
const API_URL = process.env.NEXT_PUBLIC_API_URL;          # /api/v1/products
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;  # /files/image.jpg
```

---

### P0-5: Guest Cart Flow
**Problem**: Guest checkout broken
**Impact**: Users must login to buy
**Time**: 5h

**Files to check:**
- `frontend/src/hooks/useCart.ts`
- `backend/src/routes/cart.ts`
- `backend/src/routes/orders.ts`

**Action needed:**
```typescript
// 1. Allow cart without auth
// 2. Store cart in localStorage for guests
// 3. Merge cart on login
// 4. Allow guest checkout with email/phone only
```

---

## 📋 P1 ISSUES (HIGH PRIORITY)

### P1-1: i18n Default Locale
**Time**: 2h
**Status**: Low priority (works but needs cleanup)

### P1-2: Admin Customers Endpoints
**Time**: 3h
**Status**: Admin can see orders, low priority

### P1-3: Geolocation Proxy
**Time**: 1h
**Status**: Nice to have

### P1-4: Phone Validation
**Time**: 2h
**Status**: Can add later

### P1-5: Swagger Cleanup
**Time**: 2h
**Status**: Documentation, not blocking

---

## 🎯 EXECUTION ORDER

### Day 1: Verify & Fix Cart (Today)
```
09:00-10:00 ✅ Read strategy doc
10:00-11:00 ⏳ Test current cart functionality
11:00-13:00 🔧 Fix P0-2: Cart PUT Method
14:00-16:00 🔧 Fix P0-5: Guest Cart Flow (Part 1)
16:00-17:00 ✅ Test cart end-to-end
```

### Day 2: Guest Checkout & Payment
```
09:00-12:00 🔧 Fix P0-5: Guest Cart Flow (Part 2)
13:00-15:00 🔧 Fix P0-3: Payment on Delivery
15:00-17:00 ✅ Test complete checkout flow
```

### Day 3: Environment & Image Fixes
```
09:00-12:00 🔧 Fix P0-4: Env Variables Unified
13:00-15:00 🔧 Fix image display issues
15:00-17:00 ✅ Verify P0-1: Admin upload works
17:00-18:00 ✅ Full E2E testing
```

### Day 4-5: P1 Issues (if time)
```
Only if all P0 issues are 100% working
```

---

## ✅ VALIDATION CHECKLIST

### Before Starting Redesign:
- [ ] Admin can login
- [ ] Admin can upload product images
- [ ] Guest can add products to cart
- [ ] Guest can update cart quantities
- [ ] Guest can remove from cart
- [ ] Guest can checkout without login
- [ ] Payment on delivery works
- [ ] Order confirmation email sent
- [ ] All images display correctly
- [ ] No 404 or 401 errors in console
- [ ] E2E tests pass

---

## 🚀 AFTER PHASE 1: START REDESIGN

Once all P0 issues are fixed and validated, we can start:

### Phase 2: Design System Implementation (5-7 days)
1. Tailwind config with validated colors
2. UI components (Button, Card, Badge, Input)
3. ProductCard redesign (B2B/B2C style)
4. Homepage modern layout
5. Product listing with advanced filters
6. Product detail with gallery
7. Cart & checkout modern UI
8. Admin panel modernization

---

## 📝 NOTES

### Payment Context (Algeria)
- Primary method: **Cash on Delivery**
- No online payment initially
- Order created → Status: PENDING
- Payment collected on delivery
- Invoice generated after delivery

### Design System (VALIDATED - Save for Phase 2)
- ✅ Colors: Primary Blue #0047AB, Secondary Orange #FF6B35
- ✅ Typography: Poppins (headings), Inter (body)
- ✅ Components: Modern, professional B2B/B2C style
- ✅ Reference: Würth, Manomano style

---

**Status**: ⏳ **STARTING P0 FIXES NOW**
**Next**: Test current cart functionality
