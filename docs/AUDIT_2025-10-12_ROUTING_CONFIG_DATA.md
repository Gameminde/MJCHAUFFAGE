# MJ CHAUFFAGE – Routing, Config, and Data Audit (2025-10-12)

This audit consolidates current issues and provides actionable fixes across routing, configuration, and data sources (real vs. mock). It reflects the codebase as of 2025‑10‑12.

---

## Summary

- Frontend uses Next.js App Router with `next-intl` for i18n under `app/[locale]`.
- Middleware localizes requests; API is reverse‑proxied to the backend (`/api/* -> backend:3001`).
- Analytics client and server routes exist; server route posts to backend; failures occur when backend is offline.
- Some subsystems still use mock implementations (Redis, analytics fallbacks, seeds), configurable via env.
- Asset + metadata gaps fixed (favicons/icons, Apple/PWA, deprecated tags).

---

## Frontend Routing Audit (Next.js)

- Structure
  - `frontend/src/app/page.tsx` redirects `/` -> `/fr`.
  - `frontend/src/app/[locale]/page.tsx` is the localized home route. Layout is `frontend/src/app/[locale]/layout.tsx`.
  - Translation messages are loaded via `next-intl` plugin config at `frontend/i18n/request.ts`, importing from `frontend/messages/<locale>.json`.

- Middleware
  - `frontend/middleware.ts` uses `createMiddleware` with locales `['fr','ar']`. Set `localePrefix` as needed and exclude API from matching.
  - Recommended matcher: `/((?!api|_next|.*\..*).*)`.

- Parallel Routes
  - Default files were added for potential slots under `app/[locale]/@header`, `@sidebar`, `@modal`, `@footer` to avoid NotFound boundary warnings. They return `null` and are inert unless used.

- 404 on `/fr`
  - Causes: usually misconfigured i18n or middleware. In this project, the page is compiled (`.next/server/app/[locale]/page.js`). A 404 indicates NotFound boundary triggered during render.
  - Checklist:
    - Restart dev server after config changes.
    - Ensure `frontend/i18n/request.ts` `locales` contains `fr` and `ar` (it does).
    - Ensure messages exist in `frontend/messages/fr.json` (exists).
    - Ensure middleware excludes `/api` and does not rewrite analytics requests.
    - Clear Next cache (`rm -rf frontend/.next`) and restart.
  - Note: If a 404 persists, inspect server console for logs from `[locale]/layout.tsx` and verify `getRequestConfig` resolves messages.

---

## API Proxying and Ports

- Next dev ran on `3002` (ports 3000/3001 busy). All client calls to `/api/*` are rewritten to the backend port from `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`).
- If the backend isn’t running, frontend server route `app/api/analytics/events` will log `ECONNREFUSED`. This is not a frontend bug; start the backend (`backend: npm run dev`).

---

## Analytics

- Client: `frontend/src/services/analyticsService.ts`
  - Now fetches geolocation from `GET /api/geolocation` (server‑side proxy) to avoid CORS.

- Server route: `frontend/src/app/api/geolocation/route.ts`
  - Proxies to `https://ipapi.co/json/` with a safe DZ fallback.

- Backend route: `backend/src/routes/analytics.ts`
  - Tracking endpoints: `POST /api/analytics/track` and alias `POST /api/analytics/events`.
  - SQL‑injection middleware updated to whitelist `/api/analytics/track` and narrow high‑risk patterns.

- Redis
  - `backend/src/config/redis.ts` connects to real Redis when `REDIS_URL` is set; otherwise falls back to a mock. Use `REDIS_URL` in production.

---

## Real Data vs Mock Data

- Database
  - `backend/.env` defaults to SQLite (`file:./dev.db`). For Neon (Postgres), set `DATABASE_URL` accordingly. Prisma client adds pool params automatically.
  - Seeder (`backend/prisma/seed.ts`) inserts demo entities (admin user, categories, products). Remove or adapt for production.

- Redis
  - Mock until `REDIS_URL` is provided. Production should set a managed Redis and verify connectivity.

- Analytics fallbacks
  - Previously the controller returned mock metrics when DB was unavailable. Now it returns `503` so dashboards reflect real availability.

---

## Security & Headers

- `backend/src/middleware/security.ts`
  - CORS allows local dev origins and known domains.
  - CSP configured with Stripe/Maps; adjust `connectSrc` as you add services.
  - SQL injection detection narrowed and analytics whitelisted to avoid false positives.

---

## Assets and PWA

- Added icons: `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` in `frontend/public`.
- `manifest.json` updated and shortcuts icons pointed to existing assets.
- Removed deprecated meta and external font preload; used `next/font` only.

---

## Known Issues & Resolutions

1) 404 on `/fr`
   - Ensure backend isn’t blocking render (analytics failures are handled, but backend is unrelated to page render).
   - Clear `.next`, restart frontend; verify `middleware.ts` matcher excludes `/api`.
   - If it persists, capture server logs and inspect `frontend/i18n/request.ts` execution and `messages` loading.

2) Analytics event fetch failures (`ECONNREFUSED`)
   - Start backend on `3001` or set `NEXT_PUBLIC_API_URL`/`API_URL_SSR` to the actual backend port. Confirm `backend/src/server.ts` is running.

3) Redis mock inadvertently used in prod
   - Set `REDIS_URL` (e.g., `redis://:password@host:port`) and confirm connection logs.

4) False positives in security middleware
   - Addressed by refining regex and whitelisting analytics endpoint.

---

## Action Items Checklist

- Frontend
  - [ ] Ensure `middleware.ts` excludes `/api` and locales are correct.
  - [ ] Confirm `/fr` loads after clearing `.next` and restarting.
  - [ ] Verify `/api/geolocation` returns 200.

- Backend
  - [ ] Set `DATABASE_URL` to Neon (prod) or Postgres (staging);
  - [ ] Set `REDIS_URL` in env and confirm connection.
  - [ ] Run migrations and seeds as appropriate.
  - [ ] Verify `/api/analytics/track` returns 200 and no SQLi warnings.

---

## Appendix – Env Quick Reference

- Frontend (`frontend/.env.local`)
  - `NEXT_PUBLIC_API_URL=http://localhost:3001`
  - `API_URL_SSR=http://localhost:3001` (optional override)
  - `NEXT_PUBLIC_SITE_URL=http://localhost:3000` (or deployed URL)

- Backend (`backend/.env`)
  - `DATABASE_URL=postgresql://...` (Neon)
  - `PORT=3001`, `API_BASE_URL=http://localhost:3001`, `FRONTEND_URL=http://localhost:3000`
  - `REDIS_URL=redis://...`
  - JWT, session, email, Stripe, Dahabia as needed.

