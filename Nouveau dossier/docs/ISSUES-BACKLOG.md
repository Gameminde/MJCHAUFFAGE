# Backlog d’issues — Routes & API

Format: [ID] Titre — Priorité (Effort)

## P0 — Bloquants
- [ISS-001] Auth admin: émettre cookie HTTP-only au login (M)
  - Fichiers: backend/controllers/adminAuthController.ts, frontend/contexts/AdminAuthContext.tsx, frontend/lib/api.ts, frontend/middleware.ts
  - AC: Accès admin stable après login; 401 → redirection; test e2e admin vert
- [ISS-002] Panier: corriger PATCH→PUT update item (S)
  - Fichier: frontend/services/cartService.ts
  - AC: Update quantité OK; plus de 405
- [ISS-003] Paiements: ajouter GET /api/v1/payments/verify/:transactionId (S)
  - Fichiers: backend/routes/payments.ts (+ service si besoin), frontend/services/paymentService.ts
  - AC: verify renvoie statut; e2e paiement passe
- [ISS-004] Env/proxy: unifier BACKEND_API_URL et usages (M)
  - Fichiers: frontend/next.config.js, frontend/lib/ssr-api.ts, frontend/app/api/*/route.ts, frontend/lib/api.ts
  - AC: aucune URL undefined; listes produits OK
- [ISS-005] Panier invité: local + validate + sync (M)
  - Fichiers: frontend/hooks/useCart.ts, composants Cart/Checkout
  - AC: Checkout invité OK; sync après login OK

## P1 — Haut
- [ISS-006] i18n: defaultLocale=fr et alternates cohérents (S)
  - Fichiers: frontend/middleware.ts, frontend/src/lib/i18n.ts, app/[locale]/layout.tsx
  - AC: `/`→`/fr`; alternates corrects; RTL ok
- [ISS-007] Admin clients: implémenter ou retirer endpoints non supportés (M)
  - Fichiers: backend/routes/admin.ts (+ contrôleurs) ou frontend/services/customersService.ts
  - AC: plus de 404 dans l’UI
- [ISS-008] Geolocation: proxy Next→backend (S)
  - Fichiers: frontend/app/api/geolocation/route.ts
  - AC: passe par /api/v1/geolocation; cache TTL
- [ISS-009] Admin routes: nettoyer Swagger/comments (S)
  - Fichier: backend/src/routes/admin.ts
  - AC: génération OpenAPI propre
- [ISS-010] Helper téléphone Algérie partagé (S)
  - Fichiers: backend/services/* (orders/payments), utils commun; maj validations
  - AC: règles uniformes

## P2 — Moyen
- [ISS-011] UI paiements selon /payments/methods (S)
  - Fichiers: frontend/services/paymentService.ts + composants Checkout
- [ISS-012] SEO/PWA: metadata Next + SW central (M)
  - Fichiers: frontend/src/app/layout.tsx, components/common/ServiceWorkerRegistration.tsx
- [ISS-013] Retirer prisma côté frontend (S)
  - Fichier: frontend/src/lib/prisma.ts
- [ISS-014] Tailwind config: déduplication (S)
  - Fichier: frontend/tailwind.config.js

Notes: Lancer tests existants (Jest/Vitest/Playwright) après chaque groupe P0/P1.
