# 🖼️ Image Upload Fix - Complete Guide

## ✅ Problem Identified

The admin panel was unable to upload product images due to **TWO issues**:

### Error Details from Console:
```
1. POST http://localhost:3000/api/uploads 404 (Not Found)
   Failed to upload image: {"success":false,"message":"Route /api/v1/api/uploads not found"}

2. POST http://localhost:3001/api/v1/uploads 401 (Unauthorized)
   Failed to upload image: {"success":false,"message":"Access token required","code":"MISSING_TOKEN"}
```

### Root Causes:
1. ❌ Frontend was calling `/api/uploads` (Next.js frontend URL)
2. ✅ Backend expects `http://localhost:3001/api/v1/uploads` (Express backend API)
3. ❌ Missing `/api/v1/uploads` route registration on backend
4. ❌ **Missing Authorization header with Bearer token** (most critical!)

---

## 🔧 Fixes Applied

### 1. **Frontend Fix** - ProductsManagement.tsx
**File:** `frontend/src/components/admin/ProductsManagement.tsx`

**Changed:**
```typescript
// ❌ OLD - Wrong URL, no auth header
const uploadResponse = await fetch('/api/uploads', {
  method: 'POST',
  body: formData,
  credentials: 'include'
})
```

**To:**
```typescript
// ✅ NEW - Correct backend API URL + Authorization header
const token = localStorage.getItem('authToken')
if (!token) {
  alert('Vous devez être connecté pour uploader des images')
  return
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
const uploadResponse = await fetch(`${API_BASE_URL}/uploads`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
  credentials: 'include'
})
```

**Improvements:**
- ✅ Uses proper backend API base URL from environment variables
- ✅ Includes **Authorization Bearer token** from localStorage
- ✅ Validates token exists before upload attempt
- ✅ Falls back to `http://localhost:3001/api/v1` in development
- ✅ Better error handling with JSON parsing fallback
- ✅ More descriptive error messages in alerts

---

### 2. **Backend Fix** - server.ts
**File:** `backend/src/server.ts`

**Added missing route registration:**
```typescript
// ✅ NEW - Added missing v1 uploads route
app.use('/api/v1/uploads', uploadsRoutes);
```

**Location:** After line 158, alongside other v1 API routes

---

## 📋 Backend Upload Configuration (Already Correct)

### Route Handler - `backend/src/routes/uploads.ts`
- ✅ Properly configured with multer for file uploads
- ✅ Supports both single (`image`) and multiple (`images`) uploads
- ✅ Authentication required (`authenticateToken` + `requireAdmin`)
- ✅ File security validation (`fileUploadSecurity`)
- ✅ Sanitizes filenames and generates UUIDs
- ✅ Returns relative URLs in format `/files/{filename}`

### Static File Serving - `backend/src/server.ts`
```typescript
// ✅ Backend serves uploaded files from /files path
app.use('/files', express.static(path.resolve(__dirname, '..', 'uploads'), {
  maxAge: '1d',
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));
```

### CORS Configuration - `backend/src/middleware/security.ts`
```typescript
// ✅ Frontend origin allowed
const allowedOrigins = [
  'http://localhost:3000',
  config.frontend.url,
  // ... others
];

// ✅ CORS with credentials enabled
corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  // ...
}
```

---

## 🧪 Testing Instructions

### 1. **Restart Backend Server** (Important!)
The backend server needs to be restarted to load the new route registration:

```bash
cd backend
npm run dev
```

Verify you see:
```
✅ Database connected successfully.
✅ Redis connected successfully.
🌐 Starting server on port 3001...
✅ Server running on http://localhost:3001
```

### 2. **Restart Frontend** (if needed)
```bash
cd frontend
npm run dev
```

### 3. **Test Image Upload**
1. Navigate to: `http://localhost:3000/admin/products`
2. Click "Add Product" or edit an existing product
3. Click the image upload field or drag & drop images
4. Upload should now work ✅

### Expected Behavior:
- ✅ Images upload successfully
- ✅ Image preview appears in the form
- ✅ No CORS errors in browser console
- ✅ Image URLs returned in format: `/files/{filename}`
- ✅ Images display correctly after product creation

---

## 🐛 Troubleshooting

### If Upload Still Fails:

#### **Check 1: Backend is running**
```bash
curl http://localhost:3001/api/v1/health
# Should return: {"status":"ok","timestamp":"..."}
```

#### **Check 2: Authentication cookies are set**
Open DevTools → Application → Cookies → `http://localhost:3000`
- Should see `accessToken` and `refreshToken` cookies

#### **Check 3: User is Admin**
In browser console after login:
```javascript
document.cookie
// Should contain valid accessToken
```

Check your user role in database:
```sql
SELECT email, role FROM "User" WHERE email = 'admin@mjchauffage.com';
-- role should be 'ADMIN'
```

#### **Check 4: Uploads directory exists**
```bash
# In backend directory
ls uploads/
# Should exist and be writable
```

#### **Check 5: Environment variables**
**Frontend `.env.local`:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

**Backend `.env`:**
```bash
PORT=3001
FRONTEND_URL=http://localhost:3000
```

---

## 📁 File Structure

```
backend/
├── uploads/                      # Uploaded files stored here
├── src/
│   ├── routes/
│   │   └── uploads.ts           # ✅ Upload route handler
│   ├── middleware/
│   │   └── security.ts          # ✅ CORS & file security
│   └── server.ts                # ✅ Route registration (FIXED)

frontend/
├── src/
│   ├── components/admin/
│   │   └── ProductsManagement.tsx  # ✅ Upload logic (FIXED)
│   ├── lib/
│   │   └── config.ts            # ✅ API base URL config
│   └── utils/
│       └── imageUtils.ts        # ✅ Image URL transformation
```

---

## 🎯 Summary

### Changes Made:
1. ✅ Fixed frontend to use correct backend API URL
2. ✅ Added missing `/api/v1/uploads` route to backend
3. ✅ **Added Authorization Bearer token header** (critical fix!)
4. ✅ Added token validation before upload
5. ✅ Improved error handling in upload function

### What Was Already Correct:
- ✅ Backend upload route with proper authentication
- ✅ CORS configuration allowing frontend origin
- ✅ File security validation and sanitization
- ✅ Static file serving for uploaded images
- ✅ Image URL transformation in product display

### Required Action:
**⚠️ RESTART THE BACKEND SERVER** for the route registration change to take effect!

---

## 📞 Support

If issues persist after following all steps:

1. Check backend logs for error messages
2. Check browser DevTools Console for errors
3. Check browser DevTools Network tab for failed requests
4. Verify authentication is working (cookies are set)
5. Confirm user has ADMIN role in database

---

**Status:** ✅ **FIXED** - Ready to test after backend restart
