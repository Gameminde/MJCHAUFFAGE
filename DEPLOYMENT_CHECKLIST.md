# Deployment Checklist

Your project code has been successfully pushed to GitHub. This should trigger automatic deployments if your CI/CD is set up.

## 1. Backend (Railway)
Your backend is now configured for PostgreSQL (`backend/prisma/schema.prisma`) and has a `Procfile` for starting the production server.

**Critical Actions Required in Railway Dashboard:**
1.  **Environment Variables**: Go to your project settings and add:
    *   `DATABASE_URL`: Connection string for your PostgreSQL database (e.g., `postgresql://postgres:password@host:port/railway`).
    *   `JWT_SECRET`: A long random string.
    *   `REFRESH_TOKEN_SECRET`: Another long random string.
    *   `CORS_ORIGIN`: The URL of your frontend (e.g., `https://mj-chauffage.netlify.app` - *no trailing slash*).
    *   `NODE_ENV`: `production`
2.  **Database Migration**: Since this is a fresh Postgres database, you need to apply migrations.
    *   In Railway, you can typically add a "Build Command" or "Deploy Command" like: `npm install && npm run build && npx prisma migrate deploy`.
    *   *Or* open the Railway CLI/Terminal and run: `npx prisma migrate deploy` manually.
    *   To seed initial data (Service Types, Admin User), run: `npm run db:seed`.

## 2. Frontend (Netlify)
Your frontend is configured for Next.js (`frontend/netlify.toml`).

**Critical Actions Required in Netlify Dashboard:**
1.  **Environment Variables**: Go to Site Settings > Environment variables and add:
    *   `NEXT_PUBLIC_API_URL`: The URL of your deployed Railway backend (e.g., `https://your-app-name.up.railway.app/api/v1`).
        *   **IMPORTANT**: Make sure to include `/api/v1` at the end.
        *   **IMPORTANT**: Do NOT have a trailing slash after `/api/v1`.
    *   `NEXTAUTH_URL`: Your Netlify site URL (e.g., `https://mj-chauffage.netlify.app`).
    *   `NEXTAUTH_SECRET`: A random string (can be generated with `openssl rand -base64 32`).

## 3. Verification
Once both are deployed:
1.  Open your Netlify URL.
2.  Open the Browser Console (F12).
3.  Look for any network errors (red text).
4.  Try logging in as Admin (you'll need to have run the seed script or created a user manually in the DB).

