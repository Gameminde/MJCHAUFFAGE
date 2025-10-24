# Ecommerce Code Review Report - MJCHAUFFAGE

Severity threshold: high
Target branch: feature/almost-done-complete-platform (dirty state, analysis proceeded with your approval)

## Executive Summary
- Overall Ecommerce Health Score: 78%
- Top 3 critical issues:
  1) Security headers allow Stripe domains while card payments are disabled (CSP inconsistency). File: nginx/nginx.conf lines: CSP includes js.stripe.com, api.stripe.com; backend security middleware references Stripe. Risk: widens attack surface unnecessarily. Fix: remove Stripe domains from CSP and backend security policies when not used.
  2) Payments route exposes process/verify endpoints while business policy is Cash on Delivery only. Files: backend/src/routes/payments.ts (~lines 1-200), backend/src/services/paymentService.ts (335 LOC), dahabiaPaymentService.ts (252 LOC). Risk: accidental enablement or misuse; increases maintenance and threat surface. Fix: gate these endpoints by config flag (PAYMENTS_ENABLED=false), hard-disable card flows, keep only COD/shipping-cost.
  3) Admin dashboard access control duplication and potential drift. Files: frontend/src/app/admin/* and frontend/src/middleware/adminAuth.ts; backend routes /api/v1/admin enforced via middleware. Risk: frontend guard only is insufficient; ensure RBAC strictly backend-first and reduce redundant frontend-only guards. Fix: verify backend auth middleware ordered before business handlers on all admin routes; add tests.

- Top 3 quick wins:
  - Remove unused payment client code from frontend (frontend/src/services/paymentService.ts currently unused per reports/frontend-analysis and reports/frontend-unused). Reduces bundle and complexity.
  - Normalize API base URL usage via env in all services (NEXT_PUBLIC_API_URL observed, ensure no hardcoded fallbacks in production builds). Check: paymentService.ts line 47, cartService.ts line 1.
  - Add rate limiting on auth and product search endpoints in backend middleware/security.ts.

## Ecommerce Health Scores (/10)
- Product Management: 7.5
- Cart & Checkout: 8.5 (COD only, good UX)
- Order Management: 7
- Payment Safety: 9 (no card storage; remove legacy gateways to reach 10)
- Admin Controls: 7 (needs backend-first RBAC verification + tests)

---

## Phase 1: Reconnaissance Summary
Stack:
- Backend: Node/Express + Prisma (backend/src, prisma). Routes under /api and /api/v1. Security middleware present (security.ts, securityEnhanced.ts). Tests under backend/tests.
- Frontend: Next.js App Router with i18n, Zustand for cart. API calls via services/* and app/api routes for SSR.
- Admin v2: Separate Next frontend and Nest backend folders present (admin-v2/*) but seems WIP.
- Nginx reverse proxy with CSP configured (nginx/nginx.conf).

Key paths and notes:
- Payments-related: backend/src/routes/payments.ts; backend/src/services/paymentService.ts; backend/src/services/dahabiaPaymentService.ts; frontend/src/services/paymentService.ts; docs explicitly say COD only.
- Checkout components: frontend/src/components/checkout/CheckoutForm.tsx and ModernCheckoutForm.tsx.
- API base URL: NEXT_PUBLIC_API_URL used widely.

Context snapshot saved to _review_context.json.

## 2.1 Security (Highest Priority)
Findings:
- Card storage: No evidence of storing card PAN/CVV. Frontend and docs state COD only. Some Stripe references remain in CSP (nginx/nginx.conf) and reports duplication fragment shows backend CSP allows Stripe.
- Auth/session: Admin and public auth implemented. Need to verify secure cookies/headers on backend (security.ts). Recommend ensuring session cookies have httpOnly, secure, sameSite=strict when used; or JWTs with short TTL + refresh rotation.
- RBAC: Admin routes under backend/src/routes/admin.ts; ensure middleware auth.ts and roles enforced before controllers. Evidence of adminAuthController and middleware/validation.
- Secrets: .env.example contains STRIPE_* placeholders in docs; ensure not committed secrets. No secrets found in code from scan output.
- CORS/headers/rate limiting: security.ts likely sets headers; add express-rate-limit for auth/login and product search endpoints.

Security score: 8.5/10
Issues and fixes:
- Remove Stripe CSP domains (nginx/nginx.conf) and any backend helmet CSP allowing Stripe if unused. Measure: CSP no longer lists js.stripe.com/api.stripe.com.
- Add request rate limiting and IP-based throttling for /api/v1/auth/* and /api/v1/products/search.
- Ensure admin JWT rotation and logout invalidation if tokens used.

## 2.2 API & Backend Routes
Route map highlights (from docs and structure):
- /api/v1/products, /api/v1/cart, /api/v1/orders, /api/v1/payments, /api/v1/admin
Checks:
- Validation: middleware/validation.ts exists; ensure applied on create/update product and order endpoints.
- Error handling: middleware/errorHandler.ts present; verify usage after routes in server.ts.
- Auth before business logic: confirm order routes require user session; admin routes require admin role.
- DB safety: Prisma services present; ensure transactions for order+inventory in orderService.ts.
- Image upload: uploads route exists; verify file type and size validation.

API score: 7.5/10
Recommendations:
- In backend/src/server.ts ensure middleware order: security -> rate limit -> body parser -> auth -> routes -> notFound -> errorHandler.
- In orderService.ts use Prisma.transaction() to atomically create order and update stock; include idempotency key on checkout to avoid double-create.
- In products route, validate images and store in uploads with MIME/type checks.

## 2.3 Frontend-Backend Connection
Findings:
- API client pattern: services/* with fetch using NEXT_PUBLIC_API_URL. Some components still using app/api/* proxies. Ensure consistent usage.
- Error/loading/retry/timeout: services should set fetch timeout and abort; ensure retry only for idempotent GET.
- Cart persistence: Zustand store present (frontend/src/store/cartStore.ts) and hooks useCart.ts. Ensure debounce save to localStorage and server sync at login.
- Checkout form: validation present; ensure server-side validation mirrors it.
- Images: OptimizedImage component present; lazy loading likely implemented.

Score: 8/10
Actions:
- Centralize API base URL and fetch wrapper with timeout and JSON error mapping in frontend/src/services/apiClient.ts; ensure all services use it (cartService, paymentService, productService, ordersService).
- Remove dead paymentService if not used, or guard calls by config flag.

## 2.4 Admin Dashboard (Add Product Deep Dive)
Paths:
- Frontend page: admin-v2/admin-frontend/src/app/dashboard/products/new/page.tsx
- Backend endpoint: backend/src/routes/products.ts (admin-protected create), controller: backend/src/controllers/productController.ts, validation: middleware/validation.ts, service: backend/src/services/productService.ts
Current issues:
- The admin-v2 new product page was deleted in working changes list; ensure current add-product workflow exists and protected.
- Access control: Verify backend admin routes require JWT with admin role; do not rely solely on frontend guards.
- Image upload: Validate file size/type and store path; return URL in response.
- Transactions: Wrap product create + image association in transaction.

Actionable fixes (files/lines approximated):
- backend/src/routes/products.ts: ensure router.post('/', [authMiddleware, adminRole, validateProduct], controller.create)
- backend/src/controllers/productController.ts: validate request; catch errors and pass to errorHandler
- frontend admin page: handle loading/submit states; limit image size < 2MB; show error messages; set 10s timeout on API call

Admin score: 7/10

## 2.5 Performance
Frontend:
- Bundle size unknown here; remove unused paymentService to reduce. Ensure dynamic imports and lazy routes (app router helps).
- Image formats: ensure webp/avif where possible.
Backend:
- Target product responses <500ms with indexes. Ensure DB indexes on products(name, categoryId, price) per docs/DATABASE_SCHEMA.md.

Score: 7.5/10
Quick wins:
- Add gzip/br and cache headers in nginx for static assets. Confirm already set.
- Add SELECT indexes for search/category filters.

## Phase 3: Cross-Cutting & Quality
- Logging: backend/src/utils/logger.ts exists; ensure structured logs (level, context, correlationId). Remove console.log in prod via scripts/replace-console-logs.ps1.
- Error handling: Central errorHandler exists; ensure errors use consistent shape {error, code, message, details}.
- Testing: Unit and integration tests exist both sides. Missing coverage target; set 80% threshold in jest configs.

## Phase 4: Weighted Score
Weights applied:
- backend_architecture: 0.15 → 7.5
- api_contracts: 0.12 → 7.5
- frontend_architecture: 0.12 → 8.0
- admin_dashboard: 0.12 → 7.0
- auth_security: 0.20 → 8.5
- error_logging: 0.06 → 7.5
- security_scan: 0.15 → 8.5
- testing: 0.06 → 7.0
- performance: 0.12 → 7.5
Overall percentage: 78%

## Customer Impact (High/Critical)
- CSP allowing Stripe while unused: increases XSS/frame injection surface; business risk moderate-high. Fix measurable by removing domains and verifying CSP headers.
- Payment endpoints present while policy is COD: risk of accidental activation and confusion; fix by config-gating and documenting; verify by 403 on process/verify when DISABLED.
- RBAC drift: potential unauthorized admin access if frontend-only guard bypassed; verify by integration tests hitting backend admin endpoints without token should return 401/403.

## Concrete Fix Checklist
Security
- [ ] Remove Stripe domains from CSP (nginx/nginx.conf)
- [ ] Ensure helmet contentSecurityPolicy does not include Stripe
- [ ] Add rate limiting (auth/login, products/search)
- [ ] Ensure cookies/JWT secure flags configured

API & Backend
- [ ] Gate /api/v1/payments/process|verify behind config PAYMENTS_METHODS=['COD']
- [ ] Use transactions for order+inventory updates
- [ ] Validate image uploads: MIME, size, path sanitation
- [ ] Ensure errorHandler last in middleware chain

Frontend-Backend
- [ ] Migrate all services to apiClient with timeout and consistent errors
- [ ] Remove unused paymentService or mark experimental guarded by env
- [ ] Ensure NEXT_PUBLIC_API_URL only in development fallback; in prod must be set

Admin Dashboard
- [ ] Restore/verify Add Product page; form validation; image limits; loading states
- [ ] Backend: enforce RBAC, validation; transaction; return product DTO
- [ ] E2E test: Add product happy path and failures

Performance
- [ ] Add DB indexes for product search/category/price
- [ ] Enable brotli/gzip and long-term caching for static assets
- [ ] Lazy load heavy components and images

---

End of report.
