# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Monorepo with npm workspaces: frontend (Next.js 14 + TS + Tailwind) and backend (Express + Prisma + Redis). Root scripts orchestrate both.
- Default local ports: frontend 3000, backend 3001. API base: http://localhost:3001.
- E2E tests use Playwright; frontend unit/integration use Jest/Vitest; backend tests use Jest.

Prerequisites
- Node >= 18 and npm >= 8.
- Environment files: copy and adjust examples before running (frontend/.env.example → frontend/.env.local; backend/.env.example → backend/.env). Backend requires at least DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, SESSION_SECRET.

Install
- Install all workspaces: npm install
- Or explicitly:
  - npm run install:frontend
  - npm run install:backend

Run (development)
- Full stack: npm run dev
- Alternative (simple backend boot path used in some docs): npm run dev:simple
- Individually:
  - Frontend only: npm run dev:frontend
  - Backend only: npm run dev:backend

Build and run (production-like)
- Root build (note: references a shared workspace that may not exist; see Caveats): npm run build
- Individually:
  - Frontend: npm run build:frontend then (inside frontend) npm start
  - Backend: npm run build:backend then (inside backend) npm run start:compiled

Lint and typecheck
- Lint both: npm run lint
- Frontend: npm --prefix frontend run lint
- Backend: npm --prefix backend run lint
- Typecheck:
  - Frontend: npm --prefix frontend run type-check
  - Backend: npm --prefix backend run typecheck

Tests
- All unit tests (frontend + backend): npm test
- Frontend
  - Jest unit tests: npm --prefix frontend run test
    - Single file: npm --prefix frontend run test -- src/components/products/ProductCard.test.tsx
    - By name: npm --prefix frontend run test -- -t "renders product details"
  - Vitest integration: npm --prefix frontend run test:integration
    - Single/spec + name: npm --prefix frontend run test:integration tests/integration/products.test.ts -t "filters by brand"
  - Playwright E2E: npm --prefix frontend run test:e2e
    - Single spec: npx --prefix frontend playwright test tests/e2e/checkout.spec.ts
    - Single test title: npx --prefix frontend playwright test -g "applies coupon"
- Backend (Jest)
  - Run: npm --prefix backend run test
  - Watch: npm --prefix backend run test:watch
  - Coverage: npm --prefix backend run test:coverage
  - Single file: npm --prefix backend run test -- tests/integration/payment.test.ts
  - By name: npm --prefix backend run test -- -t "Login successful"

Database (Prisma)
- Dev migrate: npm --prefix backend run db:migrate
- Reset (destructive): npm --prefix backend run db:reset
- Seed: npm --prefix backend run db:seed
- Studio: npm --prefix backend run db:studio
Notes
- The checked-in Prisma schema targets SQLite by default (backend/prisma/schema.prisma). Docker compose points to PostgreSQL; ensure DATABASE_URL matches your chosen mode.

Docker
- Build and start: npm run docker:build && npm run docker:up
- Stop: npm run docker:down
- Compose files: docker-compose.yml (dev stack with Nginx, Postgres, Redis), docker-compose.production.yml (production-oriented, with healthchecks and monitoring stubs).

High-level architecture
Backend (backend/)
- Entry: src/server.ts
  - Express app with core middleware (compression, morgan, cookie/session), security stack, input sanitization, rate limiting, API version headers, and deprecation warnings.
  - Socket.IO server bound to the HTTP server; RealtimeService.initialize(io) sets up real-time events.
  - Static uploads served under /files and /images with CORS and cache headers.
  - Health endpoints exposed at /health, /api/health, and /api/v1/health.
- Security middleware (src/middleware/security.ts)
  - Helmet CSP; CORS allowlist from config.frontend.url and localhost.
  - Multi-tier rate limits: authRateLimit, apiRateLimit, strictRateLimit, adminRateLimit plus progressive slowDown.
  - Enhanced input validation and SQL injection pattern checks; file upload constraints; brute-force logging; honeypot trap; security audit logging.
- Routing and layers
  - Routes under src/routes/* map to controllers and services (e.g., auth, products, orders, services, payments, analytics, admin, cart, uploads, geolocation, realtime).
  - Controllers (src/controllers/*) orchestrate validation, tokens/cookies, and persist via Prisma.
  - Services (src/services/*) encapsulate business logic (auth token issuance/blacklisting via Redis, product/order operations, analytics, etc.).
- Auth model (src/services/authService.ts)
  - JWT access/refresh with httpOnly cookies; refresh tokens stored in Redis; token blacklist and user-wide revocation supported.
  - Session records persisted (user_sessions); password reset tokens supported.
- Config (src/config/*)
  - environment.ts validates required env vars (stricter in production) and centralizes ports, URLs, secrets, upload limits, rate limits, logging, and locale defaults.
  - payments.ts hard-codes cash-on-delivery only; card/Stripe disabled.
  - redis.ts and lib/database (Prisma) provide connections used across services.
- Persistence (backend/prisma/schema.prisma)
  - Rich e-commerce domain: users, customers, addresses, categories, products, manufacturers, orders, inventory logs, reviews, carts, analytics tables, etc. Uses string enums modeled as strings for portability.

Frontend (frontend/)
- Next.js App Router with i18n segment (src/app/[locale]) and an admin app (src/app/admin).
  - Layout composes providers: NextIntlClientProvider, global Providers, accessibility, header/footer, comparison bar; sets dir=rtl for ar.
  - API routes exist under src/app/api for light server actions.
- State and services
  - Contexts (src/contexts/*): AuthContext manages login/register/logout against backend and reads the user via /api/auth/me with credentials: 'include'.
  - API client (src/lib/api.ts): wrapper around fetch with baseURL NEXT_PUBLIC_API_URL + /api/v1; supports bearer token from localStorage and unified error handling/redirects.
  - Hooks for cart, realtime (Socket.IO), analytics, performance.
- UI and features
  - Components organized by domain (admin, products, cart/checkout, analytics, accessibility, common UI).
  - SEO utilities and structured data components wired in locale layout.
- Testing/tooling
  - Jest for unit tests (jsdom), Vitest for integration (tests/integration), Playwright for E2E (tests/e2e) with webServer booting both frontend and backend automatically.

Conventions and integration notes
- Path aliases: backend and frontend use @/*; backend relies on tsconfig-paths and tsc-alias during build. Prefer imports like '@/services/authService'.
- CORS and cookies: When calling auth endpoints from the browser, ensure credentials: 'include' and that FRONTEND_URL matches the site origin in backend config; otherwise cookies may not persist.
- Rate limiting: Automated scripts hitting /api/auth/* or /api/payments/* may be throttled; use NODE_ENV=test or space calls appropriately during tests.
- Static assets: Uploaded media served from /files and /images on the backend; the frontend references these directly.
- Payments: Only cash-on-delivery flows are active; avoid adding card/Stripe flows without enabling backend flags.

CI/Reviews
- CodeRabbit is configured (.coderabbit.yaml) to auto-review PRs with focus on security, performance, accessibility, and maintainability across TS/JS/JSON/YAML/Markdown.

Caveats
- Root build references a "shared" workspace (workspaces["shared"]) and path aliases (@shared/*). If the shared package is absent, npm run build may fail on build:shared and TS path resolutions. Work around by:
  - Building packages individually (npm run build:backend && npm run build:frontend), and
  - Avoiding references to @shared/* or creating the shared package before attempting full-root builds.
