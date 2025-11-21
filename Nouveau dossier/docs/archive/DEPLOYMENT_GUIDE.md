# 🚀 MJ CHAUFFAGE Deployment Guide

## Free Hosting Setup (Railway + Vercel)

### Prerequisites
1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **GitHub Account**: For connecting repositories

---

## 1. Backend Deployment (Railway)

### Step 1: Create Railway Project
```bash
# Install Railway CLI (optional, but recommended)
npm install -g @railway/cli
railway login

# Or use Railway web interface
```

### Step 2: Connect Repository
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub repository
4. Railway will automatically detect the `railway.json` and `backend/Dockerfile`

### Step 3: Configure Environment Variables
In Railway dashboard, go to your project → Variables tab and add:

```env
# Environment
NODE_ENV=production

# API Configuration
API_PORT=3001
FRONTEND_URL=https://mj-chauffage.vercel.app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Session Configuration
SESSION_SECRET=your-session-secret-change-this-in-production

# Email Configuration (Optional for now)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=MJ CHAUFFAGE <noreply@mjchauffage.com>

# Upload Configuration
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/webp,application/pdf

# Security
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# External APIs (Optional)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
WEATHER_API_KEY=your-weather-api-key
GEMINI_API_KEY=your-gemini-api-key

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Algeria Configuration
DEFAULT_CURRENCY=DZD
DEFAULT_LOCALE=ar
SUPPORTED_LOCALES=ar,fr
TIMEZONE=Africa/Algiers

# Payment Configuration (Optional)
PAYMENT_PROCESSING_ENABLED=false
PAYMENT_TEST_MODE=true
DAHABIA_API_URL=https://api.poste.dz
DAHABIA_MERCHANT_ID=your-merchant-id
DAHABIA_SECRET_KEY=your-secret-key
```

### Step 4: Database Setup
Railway automatically provides PostgreSQL. The `DATABASE_URL` environment variable will be set automatically.

### Step 5: Deploy
1. Railway will automatically build and deploy when you push to your main branch
2. Or you can manually trigger deployment in the dashboard
3. Once deployed, note down your backend URL (e.g., `https://mj-chauffage-backend-production.up.railway.app`)

---

## 2. Frontend Deployment (Vercel)

### Step 1: Create Vercel Project
```bash
# Install Vercel CLI
npm install -g vercel
vercel login

# Or use Vercel web interface
```

### Step 2: Deploy Frontend
```bash
cd frontend
vercel --prod
```

### Step 3: Configure Environment Variables
In Vercel dashboard, go to your project → Settings → Environment Variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://mj-chauffage-backend-production.up.railway.app/api/v1

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://mj-chauffage.vercel.app

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Other environment variables as needed...
```

### Step 4: Custom Domain (Optional)
1. Go to Vercel project settings
2. Add custom domain if you have one
3. Configure DNS settings

---

## 3. Database Migration

### Step 1: Run Migrations
After backend is deployed, run database migrations:

```bash
# Connect to Railway CLI
railway connect

# Run migrations
cd backend
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### Step 2: Verify Database
Check that tables are created and seeded properly.

---

## 4. Testing the Deployment

### Step 1: Health Check
Visit your backend URL + `/health` to verify it's running:
```
https://mj-chauffage-backend-production.up.railway.app/health
```

### Step 2: Frontend Testing
1. Visit your Vercel frontend URL
2. Try registering a new user
3. Try logging in
4. Test adding items to cart
5. Test navigation between pages

### Step 3: End-to-End Testing
- Register → Login → Browse products → Add to cart → Checkout flow
- Test both Arabic and French locales
- Test on mobile devices

---

## 5. Monitoring & Troubleshooting

### Railway Logs
```bash
railway logs
# Or check logs in Railway dashboard
```

### Vercel Logs
```bash
vercel logs
# Or check logs in Vercel dashboard
```

### Common Issues

#### 1. Build Failures
- Check that all dependencies are in `package.json`
- Ensure TypeScript compilation passes
- Verify environment variables are set correctly

#### 2. Database Connection Issues
- Verify `DATABASE_URL` is set in Railway
- Check database migrations ran successfully
- Ensure Prisma client is generated

#### 3. API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` points to correct Railway URL
- Check CORS settings in backend
- Ensure API routes are working

#### 4. Environment Variables
- Make sure all required environment variables are set
- Check variable names match exactly (case-sensitive)
- Restart deployments after changing variables

---

## 6. Free Tier Limitations

### Railway Free Tier
- 512 MB RAM
- 1 GB storage (PostgreSQL)
- 100 hours/month
- Automatic sleep after inactivity

### Vercel Free Tier
- 100 GB bandwidth/month
- 100 deployments/month
- No custom domains (can use Vercel domains)
- No serverless function duration limits

---

## 7. Production Checklist

- [ ] Backend deployed and healthy
- [ ] Frontend deployed and accessible
- [ ] Database migrated and seeded
- [ ] Environment variables configured
- [ ] Registration/login working
- [ ] Product browsing working
- [ ] Cart functionality working
- [ ] Mobile responsive
- [ ] Both languages working
- [ ] SSL certificates working (automatic on both platforms)

---

## Cost Estimation (Free Tier)

| Service | Cost | Notes |
|---------|------|-------|
| Railway | Free | 100 hours/month, auto-sleep |
| Vercel | Free | 100GB bandwidth/month |
| PostgreSQL | Free | 1GB included with Railway |
| Redis | Free | Included with Railway |
| **Total** | **$0/month** | Perfect for testing! |

---

## Quick Commands

```bash
# Deploy backend
railway up

# Deploy frontend
cd frontend && vercel --prod

# Check Railway logs
railway logs

# Check Vercel logs
vercel logs

# Connect to Railway database
railway connect
```

Happy deploying! 🎉
