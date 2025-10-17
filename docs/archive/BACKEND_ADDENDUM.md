## Backend Addendum – Security, Analytics, Redis (2025-10-12)

- Security Middleware (`backend/src/middleware/security.ts`)
  - Whitelists `/api/analytics/track` in SQLi guard to stop false positives.
  - Narrows high‑risk SQLi patterns to avoid matching nested JSON payloads.

- Analytics
  - `POST /api/analytics/track` and alias `/api/analytics/events` receive frontend analytics.
  - `AnalyticsTrackingController.getRealTimeMetrics` now returns `503` when unavailable instead of mock data, ensuring dashboards reflect real system state.

- Redis
  - `backend/src/config/redis.ts` connects to real Redis when `REDIS_URL` is present; otherwise, a mock client is used.
  - Provide `REDIS_URL` in production and verify connection on startup.

- Database
  - Default dev DB is SQLite (`file:./dev.db`). For Neon/Postgres, set `DATABASE_URL` accordingly and run Prisma migrations.

