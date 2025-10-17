# Quick Fix Guide - Console Errors

## 🚀 Quick Start (5 Minutes)

### Step 1: Update Environment Variables

**Frontend** - Update `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development-secret-key-change-in-production
SECRET_COOKIE_PASSWORD=development-cookie-password-32chars
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

**Backend** - Verify `backend/.env` has:
```bash
DATABASE_URL="postgresql://neondb_owner:npg_uniejzYR90qw@ep-round-salad-abds33a9-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
JWT_SECRET="aaff730625562e43ea8720952fd5b08bc27926d45633410b0a998c9b907a143327a0f46144818fd7c25ca9e57c0c11e0a63a409ebd8be60454339f54d27c54a0"
JWT_REFRESH_SECRET="f78e742fc66861473c300a470ad9e1b095513946c92ac473e324a42ce2b87dd929397f63269e886f23b4642ff1b8e8b8b"
SESSION_SECRET="generate_a_strong_session_secret_here"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

### Step 2: Setup Backend

```bash
cd backend

# Install dependencies (if needed)
npm install

# Validate environment
npx ts-node scripts/validate-env.ts

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Create admin user
npx ts-node prisma/seed-admin.ts

# Start backend
npm run dev
```

### Step 3: Setup Frontend (New Terminal)

```bash
cd frontend

# Install dependencies (if needed)
npm install

# Start frontend
npm run dev
```

### Step 4: Test

1. Open http://localhost:3000
2. Go to admin login: http://localhost:3005/login
3. Login with:
   - Email: `admin@mjchauffage.com`
   - Password: `Admin@123`

## ✅ Expected Results

After these fixes, you should see:

- ✅ No "process is not defined" errors
- ✅ Admin login works successfully
- ✅ Analytics tracking works without 500 errors
- ✅ No CORS errors with external APIs
- ✅ Auth profile endpoint returns user data
- ✅ All data comes from database (no mock data)

## 🔧 Troubleshooting

### Issue: "process is not defined"

**Solution**: Make sure all client-side code uses `NEXT_PUBLIC_` prefix for env vars.

Check `frontend/.env.local` has:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Issue: Admin login fails

**Solution**: 
1. Check backend is running on port 3001
2. Verify database connection: `npx prisma studio`
3. Re-run admin seed: `npx ts-node prisma/seed-admin.ts`

### Issue: Analytics 500 errors

**Solution**:
1. Run migrations: `npx prisma migrate dev`
2. Check backend logs for detailed errors
3. Verify analytics tables exist in database

### Issue: CORS errors

**Solution**:
1. Use the new `/api/geolocation` endpoint instead of direct ipapi.co calls
2. Verify `FRONTEND_URL` in backend `.env` matches your frontend URL

### Issue: Database connection fails

**Solution**:
1. Verify `DATABASE_URL` in `backend/.env`
2. Test connection: `npx prisma db pull`
3. Check Neon dashboard for database status

## 📝 Files Created/Modified

### New Files Created:
- ✅ `backend/prisma/seed-admin.ts` - Admin user seeder
- ✅ `backend/scripts/validate-env.ts` - Environment validator
- ✅ `frontend/src/app/api/geolocation/route.ts` - Server-side geolocation
- ✅ `CONSOLE_ERRORS_FIXES.md` - Detailed fix documentation
- ✅ `QUICK_FIX_GUIDE.md` - This file

### Files to Update Manually:
- `frontend/.env.local` - Add NEXT_PUBLIC_ prefixed variables
- `frontend/src/app/layout.tsx` - Fix process.env usage (line 58)
- `frontend/src/app/[locale]/services/page.tsx` - Fix process.env usage (line 22)
- `backend/src/controllers/authController.ts` - Better error handling
- `backend/src/middleware/auth.ts` - Improved token validation

## 🎯 Priority Order

1. **CRITICAL** - Fix environment variables (both frontend and backend)
2. **CRITICAL** - Create admin user
3. **HIGH** - Fix process.env in client code
4. **HIGH** - Update analytics error handling
5. **MEDIUM** - Fix CORS with geolocation API
6. **LOW** - Remove test pages and mock data

## 📞 Need Help?

If you're still experiencing issues:

1. Check backend console output
2. Check browser console (F12)
3. Check Network tab for failed requests
4. Run: `npx prisma studio` to verify database
5. Review `CONSOLE_ERRORS_FIXES.md` for detailed solutions

## 🔐 Security Notes

**IMPORTANT**: The default admin password is `Admin@123`

⚠️ **Change this immediately after first login!**

To change password:
1. Login as admin
2. Go to Profile Settings
3. Change password to something secure

## 🚀 Next Steps

After fixing console errors:

1. ✅ Test all admin functions
2. ✅ Test product management
3. ✅ Test order creation
4. ✅ Test analytics tracking
5. ✅ Verify no mock data is used
6. ✅ Test on different browsers
7. ✅ Prepare for production deployment

## 📊 Verification Commands

```bash
# Check backend is running
curl http://localhost:3001/api/health

# Check frontend is running
curl http://localhost:3000

# Check database connection
cd backend && npx prisma studio

# Check admin user exists
cd backend && npx prisma db seed

# Validate environment
cd backend && npx ts-node scripts/validate-env.ts
```

## ✨ Success Indicators

You'll know everything is working when:

- ✅ Backend starts without errors
- ✅ Frontend builds without warnings
- ✅ Admin login succeeds
- ✅ Dashboard loads with real data
- ✅ Products display from database
- ✅ Analytics events are tracked
- ✅ No console errors in browser
- ✅ All API calls return 200 status

---

**Last Updated**: October 4, 2025
**Status**: Ready for implementation
