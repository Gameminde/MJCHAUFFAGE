# 🔄 Restart Servers After Image Upload Fix

## Quick Commands

### PowerShell (Windows)

#### 1. Kill all Node processes (clean slate)
```powershell
Get-Process | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force
```

#### 2. Start Backend
```powershell
cd C:\Users\youcefcheriet\MJCHAUFFAGE\backend
npm run dev
```

Wait for:
```
✅ Database connected successfully.
✅ Redis connected successfully.
✅ Server running on http://localhost:3001
```

#### 3. Start Frontend (in a NEW terminal)
```powershell
cd C:\Users\youcefcheriet\MJCHAUFFAGE\frontend
npm run dev
```

Wait for:
```
✓ Ready in ...ms
○ Local: http://localhost:3000
```

---

## Verify Fix

### 1. Check backend health
```powershell
curl http://localhost:3001/api/v1/health
```

### 2. Test upload endpoint (requires admin auth cookie)
Open browser: `http://localhost:3000/admin/products`

### 3. Check browser console
- No more `/api/uploads 404` errors ✅
- Upload should call `http://localhost:3001/api/v1/uploads` ✅

---

## If Problems Persist

### Check environment variables loaded:
**Backend:**
```powershell
cd backend
node -e "require('dotenv').config(); console.log('PORT:', process.env.PORT); console.log('FRONTEND_URL:', process.env.FRONTEND_URL);"
```

**Frontend:**
```powershell
cd frontend  
node -e "console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)"
```

### Check route is registered:
Look for this line in backend startup logs:
```
[INFO] GET /api/v1/uploads -> uploadsRoutes
```

---

**Status:** Ready to test! 🚀
