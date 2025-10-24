# Unified Remediation Plan (Website + Admin)

## Phase 1 — Critical Alignment (Now)
- Orders: align admin `OrdersPage` with backend enums (`PENDING`, `PROCESSING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`) and status update route `PUT /admin/orders/:orderId/status`.
- Auth: unify token handling via `lib/api.ts` interceptors; fix 401 redirect and logout.
- Navigation: fix broken/placeholder routes; ensure `/dashboard/clients` exists with placeholder.
- Error & loading: add consistent loaders and error surfaces across admin pages.

## Phase 2 — Contracts & DTOs
- Centralize API models in `admin-frontend/src/lib/api.ts` and website `frontend/src/services`; add `Order`, `OrderItem`, `Customer`, `Product`, `ServiceRequest` types.
- Normalize backend responses in `adminService` and controllers; document enum and shape changes.
- Introduce health check surfaces (dashboard widget) and a shared status map for UI badges.

## Phase 3 — UX & Data Operations
- Lists: add pagination, sorting, and server filters; reflect counters from backend where available.
- Details: add order detail view with items, shipping, payment, timeline.
- Feedback: add confirm dialogs for destructive actions; success/error toasts.
- i18n: consolidate messages and ensure consistent usage of `fr.json`.

## Phase 4 — Architecture & Performance
- Data: adopt React Query for caching, retries, and background refresh; consider server components where beneficial.
- Access control: enforce role-based routing using `AuthContext` and guards.
- Observability: add structured logging for API errors and user actions.
- Consolidation: choose canonical apps (backend, admin-frontend, frontend) and remove duplicates.

## Validation Checklist
- Admin orders: list loads, filters and counters correct, status updates succeed.
- Auth: unauthenticated users redirected to `/login`; logout clears tokens.
- Services: request list, status update, and technician assignment operational.
- Products: public catalog loads; admin CRUD works.
- No critical console errors; health check passes.

## Ownership & Maintenance
- `lib/api.ts` is the source of truth for admin contracts; website uses `src/services` with mirrored types.
- Document backend enum changes; update frontend mappings immediately.
- Keep a changelog in `docs/admin-dashboard.md` and track plan progress in `docs/task.md`.
