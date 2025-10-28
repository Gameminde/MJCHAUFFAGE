# Admin Authentication Debug Plan

## Problem
Admin dashboard stuck at "Vérification des permissions administrateur..." (loading spinner)

## Root Cause Analysis

The `AdminAuthGuard` shows loading spinner when `loading = true` from AuthContext.
AuthContext `loading` never becomes `false` = something is blocking.

## Step-by-Step Professional Debugging

### 1. Check if fetchUser() is even being called
- Add console.log at start of fetchUser()
- Check browser console

### 2. Check if /admin/me endpoint exists in backend
- Backend route: `/api/v1/admin/me`
- Controller: `adminMe` from adminAuthController.ts
- Does it require auth middleware?

### 3. Check the complete request flow
```
Browser → AuthContext.fetchUser() 
  → fetch(http://localhost:3001/api/v1/admin/me)
  → Backend router /admin
  → Middleware: authenticateToken?
  → Controller: adminMe
  → Response
```

### 4. The REAL Problem

Looking at the code:
1. AuthContext calls `/admin/me` directly (bypassing Next.js API routes)
2. Backend `/admin` routes likely require `authenticateToken` middleware
3. `authenticateToken` expects `Authorization: Bearer <token>` header
4. Our token is in localStorage BUT...
5. The authToken cookie was set with `path: '/admin'` in backend
6. Cookies with path restriction don't send to different domains!

## The CORRECT Professional Architecture

### Option A: Separate Admin Auth (Recommended)
Create a completely separate admin authentication system:

```typescript
// frontend/src/contexts/AdminAuthContext.tsx
// Separate from regular AuthContext
// Only used in /admin routes
// Stores token in localStorage
// Calls /admin/auth/* endpoints
```

### Option B: Unified Auth with Role Check
Use single AuthContext but handle admin differently:

```typescript
// Check user role after fetch
if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
  // Grant access
}
```

## Professional Solution

I will implement Option A (Separate Admin Context) because:
1. Clear separation of concerns
2. Admin uses localStorage token (survives refresh)
3. Regular users use httpOnly cookies (more secure)
4. No mixing of authentication flows
5. Easier to debug and maintain

## Implementation Plan

1. Create `AdminAuthContext.tsx` - separate context for admin
2. Create `AdminAuthProvider` - wraps only /admin routes
3. Update `AdminAuthGuard` - uses AdminAuthContext instead of AuthContext
4. Update `admin/login/page.tsx` - uses AdminAuthContext
5. Backend already correct - has /admin/auth/login, /admin/auth/logout, /admin/me

## Files to Create/Modify

- [ ] Create: `frontend/src/contexts/AdminAuthContext.tsx`
- [ ] Update: `frontend/src/app/admin/layout.tsx` - wrap with AdminAuthProvider
- [ ] Update: `frontend/src/components/admin/AdminAuthGuard.tsx` - use AdminAuthContext
- [ ] Update: `frontend/src/app/admin/login/page.tsx` - use AdminAuthContext
