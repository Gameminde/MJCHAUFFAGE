## Data Sources vs. Mock Implementations

This document enumerates where real services are used vs. mocks/fallbacks.

### Database

- Real: Prisma with SQLite (dev) or Postgres/Neon (prod) via `DATABASE_URL`.
- Seed data: `backend/prisma/seed.ts` creates admin, categories, sample products, and images.

### Redis

- Mock by default: `backend/src/config/redis.ts` uses an in‑memory client if `REDIS_URL` is not provided.
- Real: Set `REDIS_URL` to a managed instance; the client auto‑connects.

### Analytics

- Frontend -> Backend:
  - Frontend server route posts to rewritten `/api/analytics/track`.
  - If backend is unreachable, frontend logs `ECONNREFUSED`; events are dropped.
- Real‑time metrics:
  - Now returns `503` when unavailable instead of mock payloads.

### Geolocation

- Server‑side proxy at `frontend/src/app/api/geolocation/route.ts` fetches from `ipapi.co`.
- Client must call `/api/geolocation` (not the external URL) to avoid CORS.

### Test Utilities & Mocks

- Unit tests under `backend/tests/unit/*` use Jest mocks.
- Frontend tests under `frontend/src/test/*` include mocked `localStorage` and network calls.

