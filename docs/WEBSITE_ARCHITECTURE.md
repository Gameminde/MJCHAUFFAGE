# Website Architecture (MJ Chauffage)

This document describes the complete website and admin architecture: apps, routes, data flow, environment, and production routing.

## Overview
- Apps
  - Public Frontend: `frontend` (Next.js 14, App Router)
  - Admin Dashboard: `admin-v2/admin-frontend` (Next.js 15, App Router)
  - Backend API: `backend` (Express.js)
- Ports (dev)
  - Public Frontend: `http://localhost:3000`
  - Backend API: `http://localhost:3001`
  - Admin Frontend: `http://localhost:3005`
  - Admin API (legacy/NestJS): `http://localhost:3003` (optional, prefer `backend`)
- Reverse proxy (prod)
  - `https://mjchauffage.com` → Public Frontend
  - `https://admin.mjchauffage.com` → Admin Frontend
  - `https://api.mjchauffage.com` → Backend API

## Public Site — Routes (App Router)
- `/` Home
- `/products` list and filters
- `/products/[id]` product detail
- `/categories/[slug]` category listing
- `/manufacturers/[slug]` brand listing
- `/cart` shopping cart
- `/checkout` checkout flow
- `/orders` customer orders list (protected)
- `/orders/[id]` order detail (protected)
- `/services` services overview
- `/services/request` create service request
- `/services/[id]` request detail/status
- `/account` account area (protected)
- `/login` and `/register` authentication
## Public Site — Server Routes (Next.js)
- `/api/analytics/track` proxies to backend analytics
- `/api/geolocation` proxies to `ipapi.co` via server fetch
- `/api/health` returns health status

## Admin Dashboard — Routes (App Router)
- `/login` authentication
- `/dashboard` home and health widgets
- `/dashboard/orders` list with filters and counters
- `/dashboard/orders/[id]` order detail and status updates
- `/dashboard/clients` customer management
- `/dashboard/products` product catalog and CRUD
- `/dashboard/products/new` create product
- `/dashboard/service-requests` list and manage requests
- `/dashboard/technicians` technician management
- `/dashboard/analytics` KPIs and trends
- `/dashboard/settings` system settings

## Admin Dashboard — Core Folders
- `src/app/**` route segments (server components where applicable)
- `src/components/ui/**` shared UI primitives (buttons, inputs, tables, badges, modals, toasts)
- `src/lib/api.ts` single source of truth for API client and DTOs
- `src/context/AuthContext.tsx` role-based guards and auth state
- `src/messages/fr.json` i18n messages (French)
- `src/hooks/**` React Query hooks for lists and mutations
## Data Flow & APIs
- Canonical API: `backend` serves both public and admin endpoints
- Base URL (frontend): `NEXT_PUBLIC_API_URL` (e.g., `http://localhost:3001/api`)
- Orders (Admin): `GET /admin/orders` with pagination/filter/sort
- Order status update: `PUT /admin/orders/:orderId/status`
- Products: `/products`, `/products/featured`, `/products/categories`, `/products/manufacturers`
- Services: public request creation and admin/technician updates
- Health: `/health` or `/api/health` surfaces connectivity

## Environment & Configuration
- Public Frontend
  - `NEXT_PUBLIC_API_URL` → backend base URL
  - `FRONTEND_URL` → site origin (dev: `http://localhost:3000`)
- Admin Frontend
  - `NEXT_PUBLIC_API_URL` → backend base URL
  - `NEXTAUTH_URL` → `http://localhost:3005` (dev)
  - `NEXTAUTH_SECRET` → random string
- Backend API
  - `PORT=3001`
  - `CORS_ORIGIN="http://localhost:3000,http://localhost:3005"`
  - `DATABASE_URL`, `REDIS_URL`, mailer keys, Stripe keys (optional)

## Authentication & Authorization
- Tokens stored in cookies; 401 clears tokens and redirects to `/login`
- Role-based guards wrap admin routes; technicians/admins have distinct access

## Error Handling & Observability
- React Query retries for transient failures; toasts on success/error
- Error boundaries and empty states for degraded UX
- Structured logging for API errors, response times, and key user actions
## Production Routing (Nginx)
- `mjchauffage.com` → Public Frontend (static + SSR)
- `admin.mjchauffage.com` → Admin Frontend
- `api.mjchauffage.com` → Backend API
- TLS via `443`; HTTP `80` redirects to `443`
- CORS configured to allow public/admin origins to access API

## Deployment Notes
- Frontends: built and served via Node or edge runtimes depending on host
- Backend: single canonical service; avoid duplicating admin backend
- Environment files aligned across apps; avoid multiple lockfiles confusing Turbopack root
- Health checks enabled; CI/CD runs lint/test/build before deploy

## Sitemaps & SEO (Public)
- `/sitemap.xml` and `/robots.txt` served from Public Frontend
- Metadata per page: title/description/OG tags
- Canonical URLs reflect production domains; avoid localhost leaks

## Testing & Validation
- Public flows: browse products, cart, checkout, orders list
- Admin flows: orders list, counters/filters, status updates, CRUD products
- Services: request creation, technician assignment, status updates
- Auth: login/logout, protected route guards, 401 redirect behavior
- Health: UI widget shows API connectivity

## Ownership
- `admin-frontend/src/lib/api.ts` is the source of truth for admin contracts
- `frontend/src/services/**` mirrors public API types and DTOs
