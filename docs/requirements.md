# Project Requirements and Scope

## Overview
- Unify and complete the Ecommerce Website and Admin Dashboard so customers can browse, purchase, and request services; admins manage orders, products, customers, service requests, and analytics.
- Consolidate duplicated codebases and standardize API contracts to eliminate confusion and dead code.

## Roles & Permissions
- Customer: browse products, manage cart, checkout, view orders, submit service requests, leave feedback.
- Admin: manage orders, products, customers, service requests, technicians, inventory, analytics, system settings.
- Technician: receive assignments, update service request status, provide notes/feedback.

## Functional Requirements — Website (Customer)
- Product catalog: categories, manufacturers, featured listings, search/filter.
- Product page: images, specs, price, stock, reviews.
- Cart & checkout: address, shipping, payment (mocked or integrated), order summary.
- Orders: list, details, statuses (`PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`).
- Services: request creation, status tracking, feedback submission.
- Account: profile, addresses, order history.

## Functional Requirements — Admin Dashboard
- Orders: list with pagination/filter/sort; status updates; details; counters.
- Products: CRUD, categories, manufacturers, inventory updates, featured toggles.
- Customers: list, details, search.
- Service Requests: list, details, assign technician, update status, feedback review.
- Technicians: list/create/update; availability and assignment.
- Analytics: sales metrics, trends; inventory alerts.
- Settings: system settings update.

## API & Data Contracts
- Base URL: `NEXT_PUBLIC_API_URL` (frontend), default `http://localhost:3001/api`.
- Auth: access/refresh tokens stored in cookies; 401 → clear tokens and redirect to `/login`.
- Orders (Admin): `GET /admin/orders` with `page`, `limit`, `status`, `customerId`, `dateFrom`, `dateTo`, `sortBy`, `sortOrder`.
- Order status update: `PUT /admin/orders/:orderId/status` with `status`, optional `trackingNumber`, `notes`.
- Products: public read endpoints (`/products`, `/products/featured`, `/products/categories`, `/products/manufacturers`), admin CRUD under protected routes.
- Services: public types and requests endpoints; admin/technician status updates and technician availability.
- Standardize enums and DTOs across frontend/backends (e.g., `OrderStatus`, `ServiceRequestStatus`).

## Non‑Functional Requirements
- Performance: lazy-loading, caching, pagination; avoid N+1 and over-fetching.
- Security: role-based access control, token management, input validation, rate limiting on admin endpoints.
- Reliability: error boundaries, toast notifications, health checks.
- Observability: structured logging of API errors, response times, user actions.
- Internationalization: at least French (`fr.json`) with consistent usage.
- Accessibility: keyboard navigation, semantic HTML, color contrast.

## Environment & Configuration
- `.env` alignment across apps; avoid multiple lockfiles confusing Turbopack root.
- Ensure consistent `NEXT_PUBLIC_API_URL` and backend port.
- Use one canonical backend project (see Consolidation).

## Consolidation & Codebase Hygiene
- Duplicates: `backend` vs `admin-v2/admin-backend`; `frontend` vs `admin-v2/admin-frontend`.
- Canonical choice: use `backend` as the main API, `admin-v2/admin-frontend` for admin dashboard, and `frontend` for the customer site.
- Remove dead code paths, outdated services, and inconsistent API clients.
- Centralize API client (`lib/api.ts`) as the single source of truth for contracts.

## Validation Requirements
- End-to-end: orders list loads, status updates propagate, counters and filters correct.
- Auth flows: login/logout, protected routes redirect unauthenticated users.
- Services: creation and status updates function across roles.
- Products: CRUD works for admins; public catalog loads.

## Risks & Constraints
- Legacy endpoints may have mismatched shapes; require DTO normalization.
- Mixed Next.js versions/lockfiles can misconfigure dev server root.
- Partial data and placeholder pages should degrade gracefully.