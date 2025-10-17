# Console Errors - Comprehensive Fixes

## Issue 1: "process is not defined" Error

### Problem
Client-side code is trying to access `process.env` which is only available on the server side in Next.js.

### Root Cause
Multiple files are using `process.env` without the `NEXT_PUBLIC_` prefix, which means they're not exposed to the client.

### Fix 1.1: Update Environment Variables

**File: `frontend/.env.local`**
```bash
# Add missing NEXT_PUBLIC_ prefixed variables
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development-secret-key-change-in-production
SECRET_COOKIE_PASSWORD=development-cookie-password-32chars

# Google OAuth (server-side only)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Site verification (optional)
GOOGLE_SITE_VERIFICATION=
YANDEX_VERIFICATION=
YAHOO_VERIFICATION=
```

### Fix 1.2: Update next.config.js to Expose Environment Variables

**File: `frontend/next.config.js`**

Add this section after the existing configuration:

```javascript
// Environment variables
env: {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
},
```

### Fix 1.3: Fix Client-Side Code Using process.env

**File: `frontend/src/app/layout.tsx`**

Replace line 58-60:
```typescript
// BEFORE (BROKEN)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {

// AFTER (FIXED)
if ('serviceWorker' in navigator && typeof window !== 'undefined') {
  const isProduction = window.location.hostname !== 'localhost';
  if (isProduction) {
```

**File: `frontend/src/app/[locale]/services/page.tsx`**

Replace line 22:
```typescript
// BEFORE (BROKEN)
const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// AFTER (FIXED)
const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```

---

## Issue 2: Admin Login Failing with 500 Errors

### Problem
Admin login is failing because:
1. Missing Redis connection (using mock Redis)
2. Database connection issues
3. Missing admin user in database

### Fix 2.1: Ensure Backend Environment Variables are Set

**File: `backend/.env`**

Verify these are set correctly:
```bash
DATABASE_URL="postgresql://neondb_owner:npg_uniejzYR90qw@ep-round-salad-abds33a9-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
JWT_SECRET="aaff730625562e43ea8720952fd5b08bc27926d45633410b0a998c9b907a143327a0f46144818fd7c25ca9e57c0c11e0a63a409ebd8be60454339f54d27c54a0"
JWT_REFRESH_SECRET="f78e742fc66861473c300a470ad9e1b095513946c92ac473e324a42ce2b87dd929397f63269e886f23b4642ff1b8e8b8b"
SESSION_SECRET="generate_a_strong_session_secret_here"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

### Fix 2.2: Create Admin User Seed Script

**File: `backend/prisma/seed-admin.ts`**

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding admin user...');

  // Check if admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists');
    return;
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin@123', 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@mjchauffage.com',
      firstName: 'Admin',
      lastName: 'MJ CHAUFFAGE',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);
  console.log('📧 Email: admin@mjchauffage.com');
  console.log('🔑 Password: Admin@123');
  console.log('⚠️  Please change this password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Fix 2.3: Run Admin Seed Script

```bash
cd backend
npx ts-node prisma/seed-admin.ts
```

### Fix 2.4: Fix AuthController Error Handling

**File: `backend/src/controllers/authController.ts`**

Update the login method to provide better error messages (around line 100):

```typescript
} catch (error) {
  console.error('Login error:', error);
  
  // Log detailed error for debugging
  if (error instanceof Error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error during login',
    ...(process.env.NODE_ENV === 'development' && { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  });
}
```

---

## Issue 3: Analytics API Returning 500 Errors

### Problem
Analytics endpoints are failing because:
1. Missing analytics tables in database
2. Analytics tracking service not properly initialized

### Fix 3.1: Run Database Migrations

```bash
cd backend
npx prisma migrate dev --name add_analytics_tables
npx prisma generate
```

### Fix 3.2: Fix Analytics Tracking Controller

**File: `backend/src/controllers/analyticsTrackingController.ts`**

Add error handling and validation:

```typescript
static async trackEvent(req: Request, res: Response): Promise<void> {
  try {
    const { eventType, eventData, timestamp, clientIP, userAgent } = req.body;

    // Validation
    if (!eventType || !eventData) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: eventType and eventData'
      });
      return;
    }

    // Log for debugging
    console.log('Tracking event:', { eventType, timestamp });

    // Track the event
    await AnalyticsTrackingService.trackEvent({
      eventType,
      eventData,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      clientIP: clientIP || req.ip || 'unknown',
      userAgent: userAgent || req.get('user-agent') || 'unknown'
    });

    res.json({
      success: true,
      message: 'Event tracked successfully'
    });

  } catch (error) {
    console.error('Track event error:', error);
    
    // Detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to track event',
      ...(process.env.NODE_ENV === 'development' && { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    });
  }
}
```

### Fix 3.3: Update Analytics Service with Better Error Handling

**File: `backend/src/services/analyticsTrackingService.ts`**

Add try-catch blocks and fallback logic:

```typescript
static async trackEvent(data: AnalyticsEventData): Promise<void> {
  try {
    // Validate data
    if (!data.eventType) {
      throw new Error('Event type is required');
    }

    // Try to save to database
    try {
      await prisma.ecommerceEvent.create({
        data: {
          sessionId: data.sessionId || `session_${Date.now()}`,
          eventType: data.eventType,
          metadata: data.eventData,
          createdAt: data.timestamp || new Date(),
        },
      });
    } catch (dbError) {
      // If database fails, log to file as fallback
      console.error('Database tracking failed, logging to file:', dbError);
      logger.info('Analytics event (fallback):', data);
    }

  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Don't throw - analytics should never break the main flow
  }
}
```

---

## Issue 4: CORS Errors with ipapi.co

### Problem
External API calls to ipapi.co are being blocked by CORS policy.

### Fix 4.1: Move IP Geolocation to Server-Side

**File: `frontend/src/app/api/geolocation/route.ts`** (NEW FILE)

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Call ipapi.co from server-side (no CORS issues)
    const response = await fetch(`https://ipapi.co/${clientIP}/json/`, {
      headers: {
        'User-Agent': 'MJ-CHAUFFAGE-Website/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`IP API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: {
        country: data.country_name,
        city: data.city,
        region: data.region,
        timezone: data.timezone,
        currency: data.currency
      }
    });

  } catch (error) {
    console.error('Geolocation API error:', error);
    
    // Return default data for Algeria
    return NextResponse.json({
      success: true,
      data: {
        country: 'Algeria',
        city: 'Algiers',
        region: 'Algiers',
        timezone: 'Africa/Algiers',
        currency: 'DZD'
      }
    });
  }
}
```

### Fix 4.2: Update Client Code to Use Server-Side API

**File: `frontend/src/services/analyticsService.ts`**

Replace direct ipapi.co calls with:

```typescript
async getGeolocation(): Promise<GeolocationData> {
  try {
    const response = await fetch('/api/geolocation');
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    
    throw new Error('Geolocation failed');
  } catch (error) {
    console.error('Geolocation error:', error);
    
    // Return default for Algeria
    return {
      country: 'Algeria',
      city: 'Algiers',
      region: 'Algiers',
      timezone: 'Africa/Algiers',
      currency: 'DZD'
    };
  }
}
```

---

## Issue 5: Auth Profile Endpoint Failures

### Problem
JWT middleware is failing to validate tokens properly.

### Fix 5.1: Update Auth Middleware with Better Error Handling

**File: `backend/src/middleware/auth.ts`**

Update the authenticateToken function (around line 30):

```typescript
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to get token from cookie first, then Authorization header
    let token = req.cookies.accessToken;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'MISSING_TOKEN'
      });
      return;
    }

    // Verify token
    let decoded;
    try {
      decoded = AuthService.verifyToken(token);
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError);
      res.status(403).json({
        success: false,
        message: 'Invalid or expired token',
        code: 'TOKEN_INVALID'
      });
      return;
    }

    // Check if token is blacklisted
    const isBlacklisted = await AuthService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      res.status(401).json({
        success: false,
        message: 'Token has been revoked',
        code: 'TOKEN_REVOKED'
      });
      return;
    }
    
    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isVerified: true,
        lastLoginAt: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User not found or inactive',
        code: 'USER_INACTIVE'
      });
      return;
    }

    req.user = user as any;
    next();
    
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_ERROR',
      ...(process.env.NODE_ENV === 'development' && { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    });
  }
};
```

---

## Issue 6: Remove Mock Data

### Fix 6.1: Verify No Mock Data Files Exist

Run this command to find mock data files:

```bash
# In project root
find . -name "*mock*" -o -name "*fixture*" -o -name "*dummy*" | grep -v node_modules
```

### Fix 6.2: Remove Test/Mock Data Files

Delete these files if they exist:
- `backend/src/data/mockProducts.ts`
- `backend/src/data/mockOrders.ts`
- `frontend/src/data/mockData.ts`
- Any files in `frontend/src/test/fixtures/`

### Fix 6.3: Ensure All Services Use Database

Verify these services query the database:

**Check: `backend/src/services/productService.ts`**
```typescript
// Should use prisma.product.findMany() NOT mock data
static async getProducts(filters: ProductFilters, pagination: Pagination, sort: Sort) {
  return prisma.product.findMany({
    where: { /* filters */ },
    // ... rest of query
  });
}
```

---

## Issue 7: Environment Variables Configuration

### Fix 7.1: Create Missing Environment Files

**File: `frontend/.env.production`** (NEW FILE)

```bash
NEXT_PUBLIC_API_URL=https://api.mjchauffage.com
NEXT_PUBLIC_BASE_URL=https://mjchauffage.com
NEXTAUTH_URL=https://mjchauffage.com
NEXTAUTH_SECRET=your_production_secret_here_change_this
SECRET_COOKIE_PASSWORD=your_32_character_cookie_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**File: `backend/.env.production`** (NEW FILE)

```bash
DATABASE_URL="your_production_database_url"
JWT_SECRET="your_production_jwt_secret_256_bit"
JWT_REFRESH_SECRET="your_production_refresh_secret_256_bit"
SESSION_SECRET="your_production_session_secret"
PORT=3001
NODE_ENV=production
FRONTEND_URL="https://mjchauffage.com"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your_email@mjchauffage.com"
EMAIL_PASSWORD="your_email_password"
EMAIL_FROM="noreply@mjchauffage.com"
```

### Fix 7.2: Add Environment Validation Script

**File: `backend/scripts/validate-env.ts`** (NEW FILE)

```typescript
import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'SESSION_SECRET',
  'FRONTEND_URL',
];

const missingVars: string[] = [];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  process.exit(1);
}

console.log('✅ All required environment variables are set');
```

---

## Issue 8: Check for Test Pages Causing Conflicts

### Fix 8.1: Remove or Disable Test Pages

**File: `frontend/src/app/[locale]/seo-test/page.tsx`**

Either delete this file or add this at the top:

```typescript
// Disable in production
if (process.env.NODE_ENV === 'production') {
  return notFound();
}
```

### Fix 8.2: Check for Duplicate Routes

Run this to find duplicate route files:

```bash
cd frontend/src/app
find . -name "page.tsx" -o -name "page.ts" | sort
```

Look for duplicates like:
- `page.tsx` and `page_new.tsx`
- `page.tsx` and `page_fixed.tsx`

Delete the old versions.

---

## Quick Fix Commands

Run these commands in order:

```bash
# 1. Backend setup
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx ts-node prisma/seed-admin.ts
npm run dev

# 2. Frontend setup (in new terminal)
cd frontend
npm install
npm run dev

# 3. Test the fixes
# Open http://localhost:3000
# Try logging in with admin@mjchauffage.com / Admin@123
```

---

## Verification Checklist

After applying fixes, verify:

- [ ] No "process is not defined" errors in browser console
- [ ] Admin login works (admin@mjchauffage.com / Admin@123)
- [ ] Analytics events are tracked without errors
- [ ] No CORS errors in console
- [ ] Auth profile endpoint returns user data
- [ ] No mock data is being used
- [ ] All environment variables are set
- [ ] No test pages are accessible in production

---

## Additional Debugging

If issues persist, check:

1. **Backend logs**: `backend/logs/app.log`
2. **Database connection**: Run `npx prisma studio` to verify data
3. **Network tab**: Check actual API responses in browser DevTools
4. **Redis**: Verify mock Redis is working (check console logs)

---

## Production Deployment Notes

Before deploying to production:

1. Generate strong secrets:
```bash
# JWT Secret (256-bit)
openssl rand -hex 64

# Session Secret
openssl rand -hex 64

# NextAuth Secret
openssl rand -base64 32
```

2. Update all `.env.production` files with real values
3. Run database migrations on production database
4. Create admin user on production
5. Test all endpoints thoroughly
6. Enable HTTPS and update CORS settings
7. Set up proper logging and monitoring

---

## Support

If you encounter any issues after applying these fixes, check:
- Backend console output for detailed error messages
- Browser console for client-side errors
- Network tab for failed API requests
- Database logs for query errors
