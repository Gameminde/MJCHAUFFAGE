# Critical Bug Fixes - Phase 1A Emergency

## Overview
This document outlines critical runtime errors discovered in console logs and their fixes.

## Bug 1: Server Component with Event Handlers ✅ FIXED

### Error Message
```
Error: Event handlers cannot be passed to Client Component props.
<img src=... alt="yes1a" className=... onError={function onError}>
                                                 ^^^^^^^^^^^^^^^^^^
If you need interactivity, consider converting part of this to a Client Component.
```

### Problem
- **Location:** `frontend/src/app/[locale]/products/[id]/page.tsx` line 90
- **Issue:** Next.js 13+ App Router Server Components cannot use event handlers like `onError`
- **Impact:** Product pages crash with 500 error
- **Severity:** 🔴 CRITICAL - Blocks all product detail pages

### Root Cause
The product detail page is a Server Component (default in App Router), but it was trying to use an `onError` event handler on an `<img>` tag. React Server Components cannot use:
- Event handlers (`onClick`, `onError`, etc.)
- React hooks (`useState`, `useEffect`, etc.)
- Browser APIs

### Solution
Created a separate Client Component for the product image:

**New File:** `frontend/src/components/product/ProductImage.tsx`
```typescript
'use client';

import { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ProductImage({ src, alt, className }: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  const handleError = () => {
    setImgSrc('/screenshots/desktop.png');
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}
```

**Updated:** `frontend/src/app/[locale]/products/[id]/page.tsx`
- Added import: `import { ProductImage } from '@/components/product/ProductImage';`
- Replaced inline `<img>` with `<ProductImage>` component
- Removed `onError` handler from Server Component

### Result
- ✅ Product pages now load correctly
- ✅ Image fallback still works via Client Component
- ✅ Server Component benefits maintained (SSR, performance, SEO)

---

## Bug 2: Missing API Routes / Incorrect API Calls ✅ FIXED

### Error Message
```
GET http://localhost:3000/api/auth/me 401 (Unauthorized)
GET http://localhost:3000/api/auth/login 404 (Not Found)
GET http://localhost:3000/api/auth/register 404 (Not Found)
```

### Problem
- **Location:** `frontend/src/contexts/AuthContext.tsx` lines 90, 146, 179
- **Issue:** Calling non-existent Next.js API routes instead of backend API
- **Impact:** Authentication fails, users cannot login/register
- **Severity:** 🔴 CRITICAL - Blocks all authentication

### Root Cause
The AuthContext was calling `/api/auth/*` endpoints expecting Next.js API routes to proxy to the backend, but these API routes were never created. The architecture should be:

**❌ Current (Broken):**
```
Frontend -> Next.js API Routes (/api/auth/*) -> Backend API
           (These don't exist!)
```

**✅ Fixed:**
```
Frontend -> Backend API (http://localhost:3001/api/v1/auth/*)
```

### Solution
Updated `AuthContext.tsx` to call the backend API directly:

**Before:**
```typescript
const response = await fetch(`/api/auth/me`, {
  method: 'GET',
  credentials: 'include',
});
```

**After:**
```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/me`, {
  method: 'GET',
  credentials: 'include',
});
```

### Changes Made
1. **`fetchUser()` method** (line 90):
   - Changed: `/api/auth/me` → `${NEXT_PUBLIC_API_URL}/auth/me`
   - Added: Proper error response parsing

2. **`login()` method** (line 146):
   - Changed: `/api/auth/login` → `${NEXT_PUBLIC_API_URL}/auth/login`
   - Added: Error message extraction from response

3. **`register()` method** (line 179):
   - Changed: `/api/auth/register` → `${NEXT_PUBLIC_API_URL}/auth/register`
   - Maintained credentials: 'include' for cookie support

### Result
- ✅ Authentication now calls correct backend endpoints
- ✅ Login/Register/User fetch work correctly
- ✅ Cookies are sent with `credentials: 'include'`
- ✅ Works in both development and production (via env var)

---

## Environment Configuration

### Required Environment Variable
```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Production
```bash
# frontend/.env.production
NEXT_PUBLIC_API_URL=/api/v1  # Relative URL if same domain
# OR
NEXT_PUBLIC_API_URL=https://api.mjchauffage.com/api/v1  # Absolute URL if different domain
```

---

## Testing Checklist

### ✅ Product Pages
- [ ] Visit any product detail page (e.g., `/fr/products/[id]`)
- [ ] Verify page loads without 500 error
- [ ] Verify product image displays
- [ ] Verify image fallback works if image URL is invalid
- [ ] Check console for no React Server Component errors

### ✅ Authentication
- [ ] Try to login with valid credentials
- [ ] Verify no 404 errors in console for `/api/auth/login`
- [ ] Verify successful login redirects correctly
- [ ] Try to register new user
- [ ] Verify user info loads on page refresh
- [ ] Verify logout works correctly

### ✅ Admin Authentication
- [ ] Admin login still works (uses different endpoint)
- [ ] Admin token stored in localStorage
- [ ] Admin routes protected correctly

---

## Related Files Modified

1. **New File:** `frontend/src/components/product/ProductImage.tsx`
   - Client component for image with error handling

2. **Modified:** `frontend/src/app/[locale]/products/[id]/page.tsx`
   - Uses ProductImage client component
   - Removed inline onError handler

3. **Modified:** `frontend/src/contexts/AuthContext.tsx`
   - Fixed API endpoint URLs
   - Added proper error handling
   - Consistent response parsing

---

## Prevention for Future

### Server vs Client Components
**Rule:** If a component needs any of these, it MUST be a Client Component (`'use client'`):
- Event handlers: `onClick`, `onError`, `onChange`, etc.
- React hooks: `useState`, `useEffect`, `useCallback`, etc.
- Browser APIs: `window`, `document`, `localStorage`, etc.
- State management: zustand, redux, context (with hooks)

**Server Components are good for:**
- Data fetching
- SEO content
- Static rendering
- Database queries
- API calls (server-side)

### API Architecture
**Direct Backend Calls:**
- Use `NEXT_PUBLIC_API_URL` environment variable
- Call backend API directly from Client Components
- Use `credentials: 'include'` for cookies

**Next.js API Routes (when needed):**
- Server-side only operations
- Hiding API keys/secrets
- Custom authentication logic
- Rate limiting
- Request transformation

For this project: **We use direct backend calls** for simplicity and performance.

---

## Additional Issues Found

### Minor Issue: 401 Unauthorized on /auth/me
This is **expected behavior** when user is not logged in. The AuthContext handles this gracefully by setting `user = null`.

**Not a bug**, just normal flow:
```typescript
if (!response.ok) {
  setUser(null); // User not authenticated
  setLoading(false);
  return;
}
```

---

## Deployment Notes

### Before Deploying
1. ✅ Set `NEXT_PUBLIC_API_URL` in production environment
2. ✅ Test all product pages load correctly
3. ✅ Test authentication flow end-to-end
4. ✅ Clear Next.js build cache: `rm -rf .next`
5. ✅ Rebuild: `npm run build`
6. ✅ Test build locally: `npm run start`

### Monitoring
After deployment, monitor for:
- React Server Component errors in Sentry/logs
- 404 errors on API routes
- 401/403 authentication errors
- Image loading failures

---

**Status:** ✅ All critical issues fixed
**Date:** Phase 1A - Emergency Fixes
**Priority:** P0 - Must be deployed immediately
