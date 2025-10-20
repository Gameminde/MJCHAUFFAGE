# ✅ Admin Dashboard Login Fixed!

## 🐛 The Bug

### Problem
When logging into the admin dashboard, you were redirected back to the login page instead of staying logged in.

### Root Cause
In `backend/src/controllers/adminAuthController.ts` line 167:

**BEFORE (WRONG):**
```typescript
const userId = (req as any).userId; // ❌ WRONG - This property doesn't exist!
```

**The Issue:**
- The auth middleware sets `req.user` (line 127 in `backend/src/middleware/auth.ts`)
- But the controller was looking for `req.userId` (which doesn't exist)
- This caused `userId` to be `undefined`, triggering a 401 Unauthorized response
- The frontend received 401 and redirected to login page

---

## ✅ The Fix

**AFTER (CORRECT):**
```typescript
const userId = req.user?.id; // ✅ CORRECT - Get from req.user.id
```

### What Changed:
- `(req as any).userId` → `req.user?.id`
- Now correctly reads the user ID from where the middleware actually sets it
- Uses optional chaining (`?.`) for safety

---

## 📋 Full Fixed Function

```typescript
/**
 * Get current admin user info
 */
export const adminMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // ✅ FIXED: Get user from req.user (set by authenticateToken middleware)
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Verify user is admin
    if (user.role !== UserRole.ADMIN && user.role !== 'SUPER_ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Admin me error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
```

---

## 🔍 How the Auth Flow Works

### 1. Login Request
```
POST /api/admin/auth/login
Body: { email, password }
```

### 2. Login Response
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": { ... }
}
```

### 3. Subsequent Requests (with token)
```
GET /api/admin/auth/me
Headers: Authorization: Bearer eyJhbGc...
```

### 4. Auth Middleware (`authenticateToken`)
```typescript
// backend/src/middleware/auth.ts line 127
req.user = user as any; // ✅ Sets req.user
```

### 5. Controller (`adminMe`)
```typescript
// backend/src/controllers/adminAuthController.ts line 168
const userId = req.user?.id; // ✅ Reads from req.user.id
```

---

## 🧪 Testing the Fix

### After Restarting Backend:

1. **Login to admin:**
```bash
curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mjchauffage.com",
    "password": "Admin@123"
  }'
```

2. **Copy the token from response**

3. **Test /me endpoint:**
```bash
curl http://localhost:3001/api/admin/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "admin@mjchauffage.com",
      "firstName": "Admin",
      "lastName": "MJ CHAUFFAGE",
      "role": "ADMIN",
      "isActive": true,
      "isVerified": true
    }
  }
}
```

---

## 📝 Files Modified

1. ✅ `backend/src/controllers/adminAuthController.ts` - Line 168 fixed

---

## ✅ Summary

| Before | After |
|--------|-------|
| `(req as any).userId` | `req.user?.id` |
| ❌ Returns undefined | ✅ Returns user ID |
| ❌ Triggers 401 error | ✅ Works correctly |
| ❌ Redirects to login | ✅ Stays logged in |

---

## 🚀 Next Steps

1. **Restart your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test admin login on frontend:**
   - Go to admin login page
   - Login with: `admin@mjchauffage.com` / `Admin@123`
   - Should now stay logged in! ✅

3. **Verify dashboard loads:**
   - After login, you should see the admin dashboard
   - No more redirect to login page!

---

**Status**: ✅ **FIXED AND READY TO TEST!**

The admin dashboard authentication should work perfectly now! 🎉
