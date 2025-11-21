# Plan de corrections priorisé — MJ CHAUFFAGE (exécutable)

But: organiser les correctifs pour rendre le site pleinement fonctionnel et cohérent (routes, API, i18n), avec critères d’acceptation et tests.

## Légende
- Priorité: P0 (bloquant), P1 (haut), P2 (moyen)
- Effort: S (≤0.5j), M (0.5–1.5j), L (≥2j)

---

## P0 — Bloquants

1) Unifier Auth Admin (cookie HTTP-only vs localStorage)
- Problème: middleware attend cookie `authToken`; front stocke token en localStorage → redirections intempestives.
- Action: au login admin backend, poser cookie HTTP-only `authToken` (SameSite=Lax, Secure en prod); conserver Authorization pour appels API.
- Impacts: `backend/src/controllers/adminAuthController.ts`, `frontend/src/contexts/AdminAuthContext.tsx`, `frontend/src/lib/api.ts`, `frontend/middleware.ts`
- Acceptation: accès `/admin` après login sans redirection; reload conserve session; 401 → redir. login.
- Tests: front e2e `admin-website-communication.spec.ts`, backend unit authService.
- Effort: M

2) Panier — Méthode HTTP incohérente
- Problème: front PATCH `/cart/items/:itemId` vs back PUT.
- Action: changer `cartService.updateCartItem` en PUT; vérifier UI.
- Impacts: `frontend/src/services/cartService.ts`
- Acceptation: update quantité fonctionne (200), aucun 404/405.
- Tests: unit cartService + e2e panier.
- Effort: S

3) Paiements — Endpoint vérification manquant
- Problème: front appelle `GET /api/payments/verify/:id` non implémenté.
- Options:
  a) Implémenter côté back `GET /api/v1/payments/verify/:transactionId` (retour statut COD)
  b) Ou supprimer l’usage front (si non requis)
- Choix recommandé: a)
- Impacts: `backend/src/routes/payments.ts` + service
- Acceptation: `verifyPayment` renvoie statut cohérent; tests e2e paiement passent.
- Effort: S

4) Variables d’environnement & proxys unifiés
- Problème: `NEXT_PUBLIC_API_URL`, `API_URL_SSR`, `BACKEND_API_URL` mixtes → URLs cassées.
- Action: standardiser `BACKEND_API_URL` (incluant `/api/v1`) et l’utiliser partout (Next API routes, ssr-api, services); assurer rewrite Next cohérent.
- Impacts: `frontend/next.config.js`, `frontend/src/lib/ssr-api.ts`, `frontend/src/app/api/*/route.ts`, `frontend/src/lib/api.ts`
- Acceptation: aucune requête vers `undefined/...`; pages produits marchent en dev/prod.
- Tests: e2e produits; snapshot config.
- Effort: M

5) Panier invité — Flux correct
- Problème: endpoints `/cart/*` exigent auth; UI doit gérer local + `POST /cart/validate` + `POST /cart/sync` après login.
- Action: s’assurer que les écrans invités n’appellent pas endpoints protégés; ajouter validation avant checkout; sync après login.
- Impacts: `frontend/src/hooks/useCart.ts`, composants Cart/Checkout.
- Acceptation: invité peut aller jusqu’à `/orders/guest` sans 401; après login, sync OK.
- Tests: e2e user-journey, checkout invité.
- Effort: M

---

## P1 — Haut

6) i18n — Default locale et alternates
- Action: choisir `fr` comme default; aligner `frontend/middleware.ts`, `src/lib/i18n.ts`, metadata alternates (retirer `en` si non servie).
- Acceptation: `/`→`/fr`, alternates corrects, RTL pour `ar`.
- Effort: S

7) Clients Admin — Endpoints manquants côté back ou retirer appels front
- Action: soit implémenter `/admin/customers/search|export|:id/email|:id/notes`, soit retirer du front si non utilisés.
- Acceptation: aucune 404 sur actions visibles UI.
- Effort: M

8) Géolocalisation — Unifier via backend
- Action: supprimer/rewriter Next route `/api/geolocation` pour proxy → `/api/v1/geolocation`.
- Acceptation: réponse cacheable, pas d’appels directs ipapi depuis front.
- Effort: S

9) Nettoyage `backend/src/routes/admin.ts`
- Action: corriger commentaires Swagger cassés/dupliqués; formatage.
- Acceptation: génération OpenAPI lisible; CI lint passe.
- Effort: S

10) Validation téléphone Algérie — helper partagé
- Action: extraire helper (format/validate) et utiliser dans Orders/Paiements.
- Acceptation: formats `+213`/`0`/`9 digits` gérés uniformément.
- Effort: S

---

## P2 — Moyen

11) Méthodes de paiement — exposition UI selon `/payments/methods`
- Action: front lit liste back; masque Dahabia si disabled.
- Effort: S

12) Next SEO/PWA — éviter doublons et SW unique
- Action: privilégier metadata Next, retirer `SEOHead` si non utilisé; SW registration via composant dédié, supprimer inline script.
- Effort: M

13) Sécurité: retirer `frontend/src/lib/prisma.ts`
- Action: supprimer import client Prisma côté front.
- Effort: S

14) Tailwind config — déduplication spacing/fontSize
- Action: fusionner définitions pour éviter overwrite involontaire.
- Effort: S

---

## Plan d’exécution (ordre)
1. (P0) Auth admin cookie
2. (P0) Cart PUT/PATCH
3. (P0) Payments verify + env unification
4. (P0) Guest cart flow
5. (P1) i18n unifié
6. (P1) Customers admin endpoints/cleanup
7. (P1) Geolocation proxy
8. (P1) Phone helper partagé
9. (P2) Payments methods UI, SEO/SW, Prisma front, Tailwind

---

## Stratégie de tests
- Unit: helpers (phone, image URL), services (api client), routes payments verify.
- Integration: produits, panier auth/invité, commandes invité/auth, proxys Next API.
- e2e: parcours admin (login + dashboard), user-journey, paiement COD, sync panier.

---

## Déploiement/rollback
- Activer feature flags (payments, card) via env.
- Vérifier `next build` + `start` en staging, smoke tests e2e, puis prod.
