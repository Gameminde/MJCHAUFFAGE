# ✅ P0 ISSUES - TESTING CHECKLIST

## Current Status Assessment

### P0-1: Admin Auth & Image Upload
**Status**: ✅ FIXED (Bearer token added)
**Location**: `frontend/src/components/admin/ProductsManagement.tsx` Line 196-210

**Test Steps:**
1. [ ] Navigate to `/admin/login`
2. [ ] Login with admin credentials
3. [ ] Check localStorage for `authToken`
4. [ ] Navigate to `/admin/products`
5. [ ] Try to add a new product
6. [ ] Upload an image
7. [ ] Verify image uploads successfully (201 response)
8. [ ] Verify image URL is returned `/files/filename.jpg`
9. [ ] Verify no 401 Unauthorized errors

---

### P0-2: Cart PUT Method
**Status**: ✅ EXISTS (Backend has PUT route)
**Location**: 
- Backend: `backend/src/routes/cart.ts` Line 35
- Controller: `backend/src/controllers/cartController.ts` Line 191

**Frontend Cart Logic:**
- Uses Zustand store with localStorage persistence
- Syncs to backend only when authenticated
- Works offline for guests

**Test Steps:**
1. [ ] Add product to cart
2. [ ] Update quantity (increase/decrease)
3. [ ] Verify quantity updates in UI
4. [ ] Check localStorage cart persists
5. [ ] Login as user
6. [ ] Verify cart syncs to backend
7. [ ] Update quantity while logged in
8. [ ] Check backend cart via API: `GET /api/v1/cart`

---

### P0-3: Payment on Delivery
**Status**: ⏳ TO VERIFY
**Note**: Algeria context - Cash on Delivery primary payment method

**Required:**
- Order can be created without payment
- Payment status: PENDING
- Payment method: CASH_ON_DELIVERY
- Order status: PENDING until delivered

**Files to check:**
- [ ] `backend/src/routes/payments.ts`
- [ ] `backend/src/routes/orders.ts`
- [ ] `backend/src/controllers/orderController.ts`

**Test Steps:**
1. [ ] Add products to cart
2. [ ] Go to checkout
3. [ ] Fill shipping address
4. [ ] Select "Payment on Delivery"
5. [ ] Submit order
6. [ ] Verify order created (status: PENDING)
7. [ ] Verify payment record (status: PENDING, method: CASH_ON_DELIVERY)
8. [ ] Verify order confirmation email/notification

---

### P0-4: Environment Variables
**Status**: ✅ MOSTLY CORRECT
**Current:**
- `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1` ✅
- Static files: `http://localhost:3001/files/` ✅

**Issues:**
- Some components use hardcoded URLs
- Image utils has inconsistent logic

**Files to fix:**
- [ ] `frontend/src/utils/imageUtils.ts` - Consolidate logic
- [ ] `frontend/src/components/admin/ProductsManagement.tsx` - Use env var
- [ ] All fetch calls should use `process.env.NEXT_PUBLIC_API_URL`

**Test Steps:**
1. [ ] Search codebase for `localhost:3001`
2. [ ] Replace all with env variable
3. [ ] Add `NEXT_PUBLIC_BACKEND_URL=http://localhost:3001`
4. [ ] Update imageUtils to use `NEXT_PUBLIC_BACKEND_URL`
5. [ ] Test all images load correctly
6. [ ] Test API calls work

---

### P0-5: Guest Cart & Checkout
**Status**: ⏳ TO IMPLEMENT
**Current Behavior**: Cart requires authentication
**Required Behavior**: Guest can shop without login

**Implementation Plan:**

#### Part 1: Guest Cart (Frontend)
```typescript
// cartStore.ts
- Store cart in localStorage (✅ Already done)
- Allow add/update/remove without auth (✅ Already done)
- Sync to backend only when authenticated (✅ Already done)
```

#### Part 2: Guest Checkout (Backend)
```typescript
// Backend changes needed:
1. Allow guest orders without userId
2. Store guest email/phone in order
3. Create temporary guest customer record
4. Merge cart on login (if applicable)
```

**Files to modify:**
- [ ] `backend/src/routes/orders.ts` - Remove auth requirement for POST
- [ ] `backend/src/controllers/orderController.ts` - Handle guest orders
- [ ] `backend/prisma/schema.prisma` - Verify Customer.isGuest field exists ✅

**Test Steps:**
1. [ ] Open site in incognito (no login)
2. [ ] Add products to cart
3. [ ] Update quantities
4. [ ] Go to checkout
5. [ ] Fill email + phone (no account needed)
6. [ ] Fill shipping address
7. [ ] Select payment on delivery
8. [ ] Submit order
9. [ ] Verify order created with guest flag
10. [ ] Verify order confirmation sent to email
11. [ ] Login later and verify order shows in account

---

## Quick Test Commands

### Test Backend Health
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/v1/health"
```

### Test Products API
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/v1/products?limit=3"
```

### Test Cart API (requires auth)
```powershell
# Get token from localStorage first
$token = "YOUR_TOKEN_HERE"
$headers = @{ Authorization = "Bearer $token" }
Invoke-WebRequest -Uri "http://localhost:3001/api/v1/cart" -Headers $headers
```

### Test Image Serving
```powershell
# Check if image exists and is accessible
Invoke-WebRequest -Uri "http://localhost:3001/files/img_6758-xxx.jpg"
```

---

## Priority Order

### Today (Day 1):
1. ✅ Test P0-1: Admin login + image upload
2. ✅ Test P0-2: Cart functionality  
3. ⏳ Implement P0-5: Guest checkout (Part 1)

### Tomorrow (Day 2):
4. ⏳ Implement P0-5: Guest checkout (Part 2)
5. ⏳ Implement P0-3: Payment on delivery
6. ✅ Test complete checkout flow

### Day 3:
7. ⏳ Fix P0-4: Consolidate env variables
8. ⏳ Fix image display issues permanently
9. ✅ Full E2E testing
10. ✅ Validate all P0 issues resolved

---

## Success Criteria

### Before proceeding to redesign, ALL must pass:
- [ ] ✅ Admin can upload images (no 401 errors)
- [ ] ✅ Images display correctly (no 404 errors)
- [ ] ✅ Guest can add to cart without login
- [ ] ✅ Guest can update cart quantities
- [ ] ✅ Guest can complete checkout
- [ ] ✅ Payment on delivery works
- [ ] ✅ Order confirmation sent
- [ ] ✅ No console errors
- [ ] ✅ Mobile responsive works
- [ ] ✅ All API endpoints return correct data

---

**Next Action**: Start testing P0-1 and P0-2
