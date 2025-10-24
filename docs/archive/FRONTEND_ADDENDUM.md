## Frontend Addendum – i18n, Proxy, Analytics (2025-10-12)

This addendum supplements the existing FRONTEND_GUIDE with recent fixes.

- next-intl
  - Plugin: `withNextIntl('./i18n/request.ts')` in `next.config.js`.
  - Middleware: `frontend/middleware.ts`
    - `locales: ['fr','ar']`, `defaultLocale: 'fr'`.
    - Matcher: `['/((?!api|_next|.*\..*).*)']` to exclude API and static assets.
  - Messages reside in `frontend/messages/<locale>.json`.
  - Troubleshooting 404 on `/fr`:
    - Clear cache (`rm -rf frontend/.next`) and restart.
    - Ensure `messages/fr.json` exists and `i18n/request.ts` exports matching locales.
    - Verify dev server port used by browser (Next may pick 3001/3002).

- API Proxying
  - Rewrites forward `/api/*` to the backend using `NEXT_PUBLIC_API_URL` defined in `next.config.js`.
  - If backend is offline, server route errors such as `ECONNREFUSED` will appear in `app/api/analytics/events` logs.

- Analytics
  - Client geolocation calls `GET /api/geolocation` (server function) instead of external CORS endpoints.
  - Ensure backend is running so `/api/analytics/track` (rewritten) is reachable.

