# 🚀 Neon Database Setup Guide - MJ CHAUFFAGE

## ✅ What I Just Fixed

1. **JWT_SECRET** - Updated to 128 characters (secure)
2. **JWT_REFRESH_SECRET** - Updated to 128 characters (secure)  
3. **SESSION_SECRET** - Updated to 128 characters (secure)
4. **DATABASE_URL** - Changed format from SQLite to PostgreSQL (Neon)

---

## 📋 Required Actions

### Step 1: Get Your Neon Database Connection String

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project or create a new one
3. Go to **Dashboard** → **Connection Details**
4. Copy the connection string (it looks like this):
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/database_name?sslmode=require
   ```

### Step 2: Update Your `.env` File

Open `backend/.env` and replace this line:

```bash
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/mjchauffage?sslmode=require"
```

With your **actual Neon connection string**.

### Step 3: Push Database Schema to Neon

```bash
cd backend
npx prisma db push
```

### Step 4: Seed the Admin User

```bash
cd backend
npx tsx prisma/seed-admin.ts
```

This will create an admin user with:
- **Email**: `admin@mjchauffage.com`
- **Password**: `Admin@123`

### Step 5: Restart Your Backend Server

```bash
cd backend
npm run dev
```

---

## 🔐 Admin Login Credentials

After seeding, you can login with:

```
Email: admin@mjchauffage.com
Password: Admin@123
```

**⚠️ IMPORTANT**: Change this password after your first login!

---

## 🧪 Test the Login

### Option 1: Using curl
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mjchauffage.com",
    "password": "Admin@123"
  }'
```

### Option 2: Using your frontend
Navigate to the admin login page and use the credentials above.

---

## 📝 Summary of Changes

### File: `backend/.env`
- ✅ JWT_SECRET: Updated to 128 hex chars (256-bit security)
- ✅ JWT_REFRESH_SECRET: Updated to 128 hex chars (256-bit security)
- ✅ SESSION_SECRET: Updated to 128 hex chars (256-bit security)
- ✅ DATABASE_URL: Format changed to PostgreSQL (Neon)

### What Was the Problem?

1. **JWT Secret Too Short**: Your JWT_SECRET was less than 64 characters, but the `authService.ts` requires at least 64 characters (256-bit encryption)
2. **Database Mismatch**: You had SQLite URL but PostgreSQL schema

### What's Fixed?

✅ All secrets are now cryptographically secure (128 hex chars)  
✅ Database URL format is ready for Neon PostgreSQL  
✅ No code logic was changed - only configuration updates  

---

## 🆘 Troubleshooting

### Issue: "JWT secret must be at least 256 bits"
- ✅ **Fixed!** Your secrets are now 128 hex characters (512 bits)

### Issue: "User not found" when logging in
- Run the seed script: `npx tsx prisma/seed-admin.ts`

### Issue: Database connection error
- Check your Neon connection string is correct
- Verify the format includes `?sslmode=require`
- Test connection: `npx prisma db push`

---

## 🎯 Next Steps

1. Update `DATABASE_URL` with your real Neon connection string
2. Run `npx prisma db push`
3. Run `npx tsx prisma/seed-admin.ts`
4. Restart your backend server
5. Test the admin login ✨

---

**Need help?** Check:
- Neon Docs: https://neon.tech/docs/get-started-with-neon/connect-neon
- Your backend console logs for any errors
