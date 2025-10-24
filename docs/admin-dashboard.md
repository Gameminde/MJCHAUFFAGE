# Admin Dashboard Audit and Fix Guide

This document explains the current admin dashboard implementation (admin-v2/admin-frontend), known issues, and actionable fixes.

## Overview
- Tech: Next.js App Router, React (client components), TailwindCSS, lucide-react icons.
- Auth: Cookie-based tokens via `AuthContext`, Axios client with interceptors.
- Pages: `/dashboard` with subpages for products, orders, clients, settings.
- UI: `Header`, `Sidebar`, custom `Button`, `Card`, `Input`, `Label`, `Separator` components.

## Current Issues
1. Orders page API import mismatch
   - Symptom: Runtime error importing `orderService` which doesn’t exist.
   - Root cause: API client exports `ordersApi` not `orderService`.
   - Fix: Import `ordersApi` and update calls (`getAll`, `updateStatus`).

2. Order status enum mismatch
   - Symptom: Filters and labels use lowercase while backend uses uppercase statuses.
   - Root cause: `Order.status` type in API uses `PENDING | CONFIRMED | SHIPPED | DELIVERED | CANCELLED`.
   - Fix: Normalize UI to uppercase enums, update filters and select options.

3. Sidebar route mismatch for Clients
   - Symptom: Link to `/dashboard/customers` 404s.
   - Root cause: Existing route folder is `/dashboard/clients`.
   - Fix: Update Sidebar link to `/dashboard/clients`.

4. Localization messages missing (French footer errors in console)
   - Symptom: Console shows missing FR locale messages for footer elements.
   - Root cause: Admin app currently hardcodes strings in French and does not load message catalogs.
   - Fix options:
     - Short-term: Ensure static French strings exist; remove i18n lookups in footer component if any.
     - Long-term: Introduce message catalogs and a provider (e.g., `next-intl` or custom context), add `fr.json`, and wire components to messages.

## Architecture Notes
- AuthContext persists tokens and fetches current user on load; redirects to login on 401.
- Axios client reads tokens from cookies and injects Authorization headers.
- Dashboard pages currently fetch server data client-side; consider server components + edge caching for scalability.

## Implemented Fixes
- Orders page: switched to `ordersApi` and normalized statuses to uppercase, added `CANCELLED` support.
- Sidebar: corrected Clients link to `/dashboard/clients`.

## Recommended Next Steps
- Add empty `/dashboard/clients/page.tsx` implementation (table of customers once backend endpoint is ready).
- Add error boundaries and skeleton loaders to pages.
- Introduce i18n provider and message catalogs for consistency.
- Migrate dashboard fetches to server components or use React Query for client caching.
- Add unit tests for `AuthContext` and API client interceptors.

## Testing
- Start dev server, login, navigate to Orders; verify list loads and filters work.
- Change order status via select; confirm update and label color mapping.
- Navigate to Clients via Sidebar; ensure route exists and no 404.

## Maintenance
- Keep `lib/api.ts` as the single source for data contracts and services.
- When backend enums change, update UI enums and filters in one place.
