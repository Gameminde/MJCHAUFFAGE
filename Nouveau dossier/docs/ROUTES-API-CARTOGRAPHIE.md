# Cartographie complète des routes et API — MJ CHAUFFAGE (2025-10-27)

Objectif: vue d’ensemble des routes Frontend/Backend, flux fonctionnels, et liste des problèmes + recommandations avant corrections.

---

## 1) Frontend (Next.js 14) — Routes utilisateur (localisées)
Base: `/:locale` avec locales supportées: `fr`, `ar` (middleware force la locale; `/` redirige vers `/fr`).

Pages principales:
- `/:locale` → Home (ModernHomePage)
- `/:locale/about` → À propos
- `/:locale/contact` → Contact
- `/:locale/products` → Listing produits (filtres/pagination)
- `/:locale/products/:id` → Fiche produit (id/slug)
- `/:locale/cart` → Panier
- `/:locale/checkout` → Checkout
- `/:locale/checkout/success` → Confirmation commande
- `/:locale/services` → Catalogue/services + prise de RDV
- `/:locale/comparison` → Comparateur
- `/:locale/wishlist` → Favoris
- `/:locale/auth/login` / `/:locale/auth/register` → Auth publique
- `/:locale/seo-test` → Page de test SEO (probablement à limiter en prod)

Notes i18n/middleware:
- `frontend/middleware.ts`: Admin hors i18n, API et assets passent, le reste reçoit i18n.
- Incohérence constatée: `defaultLocale` varie (`fr` dans middleware/layout vs `ar` dans `src/lib/i18n.ts`). Voir section Problèmes.

---

## 2) Frontend — Routes Admin (Next App Router)
- `/admin/login` → Auth admin
- `/admin` → Tableau de bord (Dashboard)
- `/admin/analytics`
- `/admin/customers`
- `/admin/orders`
- `/admin/products`
- `/admin/settings`

Middleware admin:
- Redirige `/(fr|ar)/admin` vers `/admin` (ok)
- Contrôle d’accès via cookie `authToken` (HTTP-only attendu). Voir section Problèmes (localStorage vs cookie).

---

## 3) Frontend — API routes (Next.js, préfixe `/api`) et proxys
- `GET/POST /api/products` → Proxy vers Backend `${API_URL_SSR}/api/v1/products` (attention: fallback absent si `API_URL_SSR` non défini)
- `POST /api/analytics/events` → Proxy vers Backend `/api/v1/analytics/events`
- `POST /api/contact` → Proxy vers Backend `/api/v1/contact`
- `GET /api/geolocation` → Appelle `https://ipapi.co/json/` côté edge/server (doublon avec backend `geolocation`)

Rewrites: `next.config.js` route les chemins `/api/*` vers le backend en afterFiles, donc les routes locales Next ont priorité (ok).

---

## 4) Backend (Express, préfixe `/api/v1`) — Cartographie des endpoints

4.1 Auth (`/api/v1/auth`)
- POST `/register` — inscription
- POST `/login` — connexion
- POST `/refresh` — refresh token
- POST `/logout` — nécessite Bearer
- GET `/me` + GET `/profile` — profil courant
- PUT `/profile` — mise à jour profil
- POST `/change-password` — nécessite Bearer + rate limit strict
- POST `/request-password-reset`
- POST `/reset-password`

4.2 Produits (`/api/v1/products`)
- GET `/` — listing (pagination/filtres: search, category, manufacturers, prix, tri, stock, featured)
- GET `/featured` — produits mis en avant
- GET `/categories` — catégories
- GET `/manufacturers` — fabricants
- POST `/batch` — récupérer plusieurs produits par IDs
- GET `/:id` — détail (id/slug)
- Admin (Bearer + rôle):
  - POST `/` — créer produit
  - PUT `/:id` — maj produit
  - DELETE `/:id` — supprimer
  - POST `/:id/inventory` — mouvement de stock
  - GET `/:id/reviews` — reviews
  - POST `/:id/reviews` — ajouter review (auth requise)

4.3 Panier (`/api/v1/cart`)
- POST `/validate` — vérifier items/stock (publique)
- GET `/` — récupérer panier (auth requise)
- POST `/sync` — synchroniser panier (auth)
- DELETE `/` — vider panier (auth)
- POST `/items` — ajouter item (auth)
- PUT `/items/:itemId` — mettre à jour quantité (auth)
- DELETE `/items/:itemId` — supprimer item (auth)

4.4 Commandes (`/api/v1/orders`)
- POST `/guest` — commande invité
- Auth requis:
  - POST `/` — créer commande
  - GET `/` — commandes utilisateur
  - GET `/statistics` — stats utilisateur
  - GET `/:id` — détail commande
  - PATCH `/:id/cancel` — annuler

4.5 Clients (`/api/v1/customers`)
- Admin requis:
  - GET `/` — liste
  - GET `/statistics`
  - POST `/` — créer client
  - GET `/:id` — détail
  - PUT `/:id` — maj client
  - PATCH `/:id/deactivate` / `/:id/activate`
- Self-service (auth):
  - GET `/profile/me`, PUT `/profile/me`
  - GET `/orders/history`
  - Adresses: POST `/addresses`, PUT `/addresses/:addressId`, DELETE `/addresses/:addressId`

4.6 Admin (`/api/v1/admin`) — via `admin.ts`
- POST `/login` (public)
- Auth admin requis pour le reste:
  - GET `/me`
  - GET `/dashboard`, `/activities`, `/orders`, `/orders/:orderId`, `/orders/stats`
  - PUT `/orders/:orderId/status`, POST `/orders`, PATCH `/orders/:orderId`, POST `/orders/:orderId/cancel`, POST `/orders/:orderId/ship`, POST `/orders/:orderId/deliver`
  - Clients: GET `/customers`, GET `/customers/:customerId`, POST `/customers`, PATCH `/customers/:customerId`, DELETE `/customers/:customerId`, PATCH `/customers/:customerId/status`, GET `/customers/:customerId/orders`, GET `/customers/stats`
  - Services: GET `/services`, PUT `/services/:serviceId/assign`, Techniciens: GET `/technicians`, POST `/technicians`, PUT `/technicians/:technicianId`
  - Analytics admin: GET `/analytics/sales`
  - Inventaire: GET `/inventory/alerts`
  - Export: GET `/export`
  - Paramètres (super admin): GET/PUT `/settings`

Observations: quelques commentaires Swagger cassés/dupliqués dans `admin.ts`, mais les routes sont bien déclarées (voir Problèmes).

4.7 Services & Demandes d’intervention (`/api/v1/services`)
- Public: GET `/types`, GET `/types/:id`, (legacy: GET `/`, `/:id`)
- Auth requis:
  - POST `/requests`, GET `/requests`, GET `/requests/statistics`, GET `/requests/:id`, POST `/requests/:id/feedback`
- Technician/Admin: PUT `/requests/:id/status`
- Admin: GET `/technicians/available`

4.8 Paiements (`/api/v1/payments`)
- GET `/methods` — méthodes activées (actuellement: Cash on delivery)
- POST `/shipping-cost` — calcul basique par wilaya
- POST `/process` — traitement paiement (COD simulé; test mode supporté)
- Manquant: `GET /verify/:transactionId` (utilisé par le Frontend — voir Problèmes)

4.9 Analytics & Tracking (`/api/v1/analytics`)
- DEV: endpoints KPI/sales/customers/products/services… sans auth; PROD: protégés (ADMIN/SUPER_ADMIN)
- Tracking (pas d’auth): POST `/track`, POST `/events`
- Temps réel/session: DEV sans auth, PROD protégé (ADMIN/SUPER_ADMIN)

4.10 Geolocation (`/api/v1/geolocation`)
- GET `/` → IP → pays/ville (cache + retries)

4.11 Uploads (`/api/v1/uploads`)
- POST `/` — upload admin-only (multer, sécurité MIME, URL publique `/files/:filename`)

4.12 Health (`/api/v1/health`)
- GET `/` (simple), GET `/detailed`, GET `/ready`, GET `/live`

4.13 Realtime (`/api/v1/realtime`)
- Admin-only: stats connexions/salles, notifications système, broadcast, gestion cache, tests

---

## 5) Alignement Front ↔ Back — Mappings critiques
- Produits: OK (list, featured, categories, manufacturers, détail, batch)
- Panier: Front utilise `PATCH /cart/items/:itemId` (voir Problèmes) alors que Back attend `PUT`
- Commandes: invité (`/orders/guest`) existe côté Back; vérifier l’usage côté Front Checkout
- Paiements: Front appelle vérif `/api/payments/verify/:transactionId` non implémenté côté Back
- Clients Admin: Front référence des routes non présentes (search, export CSV, email, notes) — voir Problèmes
- Géolocalisation: doublon Front `/api/geolocation` vs Back `/api/v1/geolocation`

---

## 6) Problèmes identifiés (Routes/API)
1) Auth admin — cookie vs localStorage
- Middleware admin lit un cookie `authToken` HTTP-only.
- Client `@/lib/api` place le token dans `localStorage` et l’envoie en `Authorization: Bearer`.
- Conséquence: pages `/admin/*` redirigent vers login si le cookie n’est pas posé côté navigateur.

2) Cart — méthode HTTP incohérente
- Back: update item → `PUT /api/v1/cart/items/:itemId`
- Front `cartService.updateCartItem` utilise PATCH → 404/405 probable.

3) Paiements — endpoint de vérification manquant
- Front `paymentService.verifyPayment(transactionId)` appelle `GET /api/payments/verify/:transactionId` (n’existe pas en Back).

4) Admin Clients — endpoints non implémentés
- Front appelle (exemples): `/admin/customers/search`, `/admin/customers/export`, `/admin/customers/:id/email`, `/admin/customers/:id/notes` — absents du Back.

5) Next API produits — variable d’environnement fragile
- `frontend/src/app/api/products/route.ts` construit l’URL avec `API_URL_SSR` sans fallback robuste; risque d’URL `undefined/api/v1/products`.

6) Géolocalisation — doublon de logique
- Front `/api/geolocation` (ipapi direct) et Back `/api/v1/geolocation` (avec cache/rate-limit/retry). Risque d’incohérence et de coûts externes.

7) i18n — défauts de cohérence
- `defaultLocale` variable (fr vs ar) selon fichiers.
- `alternates` déclare `en` alors que la locale n’est pas servie.

8) Admin routes — qualité du fichier `admin.ts`
- Plusieurs blocs Swagger corrompus ou dupliqués, lignes intercalées mal formatées. Lisibilité/maintenance réduites (risque d’erreurs futures).

9) Checkout invité — validation de numéro algérien
- Back Payments valide le numéro, Order guest valide `customerInfo.phone` (longueur). Harmoniser règle unique (ex: helper partagé `+213`).

10) Rewrites/ENV — redondance/confusion
- `NEXT_PUBLIC_API_URL`, `API_URL_SSR`, `BACKEND_API_URL` coexistent; certains proxys utilisent des variables différentes.

11) Panier invité — UX/API
- Add/remove item côté Back nécessite auth. Le Front doit gérer un panier local pour invités et appeler `/cart/sync` à la connexion. Vérifier que le checkout invité n’essaie pas de muter `/cart/*`.

12) Payment methods — surface API
- Back expose uniquement COD; Front expose aussi `DAHABIA_CARD` derrière flag. S’assurer que le Front masque proprement selon `/api/v1/payments/methods`.

---

## 7) Recommandations (ordre d’exécution proposé)
A) Auth/admin unifiée
- Au login admin, écrire le JWT en cookie HTTP-only `authToken` (SameSite=Lax, Secure en prod) en plus (ou à la place) du localStorage.
- Middleware: garder la vérification cookie; côté API client, conserver Authorization pour les appels fetch.

B) Corriger méthodes et endpoints Front
- `cartService.updateCartItem` → utiliser `PUT` au lieu de `PATCH`.
- `paymentService.verifyPayment` → supprimer ou implémenter `GET /api/v1/payments/verify/:transactionId` côté Back.
- `customersService` → retirer ou implémenter: search, export, email, notes (préférer implémentation côté Back si requis par UI admin).

C) Variables d’environnement & proxys
- Standardiser: exposer `BACKEND_API_URL` unique (`https://api.mjchauffage.com/api/v1`), l’utiliser partout (Next API, services SSR/CSR).
- Dans `api/products` (route Next), remplacer `API_URL_SSR` par `BACKEND_API_URL` (ou fallback robuste) pour éviter `undefined`.

D) Géolocalisation
- Supprimer la route Front `/api/geolocation` ou la faire proxy vers Back `/api/v1/geolocation` pour profiter du cache/TTL.

E) i18n & SEO
- Définir un `defaultLocale` unique (recommandé: `fr`) et supprimer `en` des alternates si non servie.
- Vérifier `robots/sitemap` multi-locales (déjà OK via `sitemap.ts` si présent) et masquer `/seo-test` en prod.

F) Nettoyage `backend/src/routes/admin.ts`
- Corriger les blocs Swagger cassés, dé-doublonner, formater. Ajouter tests e2e admin pour garantir la stabilité des routes.

G) Paiements
- Si la vérification est requise: ajouter `GET /payments/verify/:transactionId` (retourne statut, mapping transaction COD) et documenter.
- Centraliser la validation de téléphone algérien (helper partagé pour Orders/Payments).

H) Panier invité
- Documenter clairement: panier invité local; côté Back seules opérations auth; le Front ne doit appeler `/cart/*` qu’après login, sinon utiliser `/cart/validate` public pour check stock.

I) Documentation/Contrats
- Générer un OpenAPI/Swagger propre pour `/api/v1`; ajouter endpoints manquants ou retirer des appels Front niet implémentés.

---

## 8) Tests de régression à prévoir
- e2e: flux admin (login via cookie), CRUD produits, clients, commandes.
- e2e: checkout invité → `/orders/guest` + paiement COD → success.
- e2e: panier invité (local) → login → `/cart/sync`.
- e2e: proxys Next API (products/contact/analytics) avec env consolidées.
- unit: helpers téléphone + normalisation images.

---

## 9) Check-list de conformité avant corrections
- [ ] Token admin en cookie HTTP-only fonctionnel (middleware passe)
- [ ] Méthode `PUT` utilisée pour update item panier
- [ ] Endpoint paiement `verify` implémenté OU code Front nettoyé
- [ ] Clients Admin: endpoints Front alignés sur Back
- [ ] `BACKEND_API_URL` unique référencé par toutes routes/proxys
- [ ] Route Front géolocalisation: supprimée ou proxy vers Back
- [ ] `defaultLocale` unifié et `alternates` cohérents
- [ ] Fichier `admin.ts` nettoyé + Swagger valide
- [ ] Scénarios e2e verts

---

## 10) Cartographie des flux fonctionnels (détaillée)

10.1 Navigation, i18n et SEO
- Entrée: `/` → redirect vers `/fr` (Home). Middleware applique i18n sur public routes, exclut `/admin`, `/api`, assets.
- Locale effective: déterminée par URL (`/fr` ou `/ar`). Incohérence actuelle de `defaultLocale` (voir Problèmes). Conséquence: risques de balises alternates incohérentes et UX RTL/LTR.
- SEO: métadonnées via Next metadata dans `app/[locale]/layout.tsx`. PWA manifest start_url `/fr`.

10.2 Parcours Produits (liste → détail)
- Utilisateur charge `/:locale/products`:
  - SSR/CSR: données via backend `/api/v1/products` (filtres: search, category(s), prix, tri, stock). En Front, `productService.getProducts` construit une query et appelle `GET /products` via client `api`.
  - Pagination: paramètres `page`, `limit` supportés côté Back; Front passe ceux fournis.
  - Catégories: `GET /api/v1/products/categories` (Front: `productService.getCategories`). Revalidation côté SSR prévue pour 2h (dans `ssr-api.ts`).
- Détail: `/:locale/products/:id` → `GET /api/v1/products/:id` (id ou slug). Normalisation URL d’images (base API si chemin relatif). Fallback image si manquante.

10.3 Panier (invité)
- Ajout produit: côté Front, le service `cartService` cible des routes protégées (auth requise). Pour invité, la stratégie attendue est stockage local + validation côté serveur via `POST /api/v1/cart/validate` au moment voulu (disponible et public).
- Validation: `POST /cart/validate` vérifie `items[].productId, quantity` vs stock.
- Risque actuel: appels `/cart/items` sans auth si non gardés côté UI. Reco: utiliser un store local pour invités, n’appeler `/cart/*` qu’après login.

10.4 Panier (utilisateur connecté)
- Récupération: `GET /api/v1/cart` (auth).
- Ajout: `POST /api/v1/cart/items` (auth).
- Mise à jour: `PUT /api/v1/cart/items/:itemId` (auth). NOTE: corriger Front qui utilise `PATCH`.
- Suppression: `DELETE /api/v1/cart/items/:itemId` (auth).
- Vider: `DELETE /api/v1/cart` (auth).
- Synchronisation après login: `POST /api/v1/cart/sync` avec items locaux → consolidé côté serveur.

10.5 Checkout invité (sans compte)
- Étapes:
  1) Collecte infos client (`customerInfo`), adresse livraison, panier (front/local validé).
  2) Création commande: `POST /api/v1/orders/guest` (valide items, coordonnées, région, total).
  3) Paiement: `POST /api/v1/payments/process` avec `method='CASH_ON_DELIVERY'`. En test mode, succès simulé; en prod, renvoie `transactionId`, `status=PENDING_DELIVERY`, ETA.
  4) Redirection: `/[:locale]/checkout/success`.
- Validation téléphone: regex algérienne stricte côté paiements (retour 400 si invalide). Harmoniser avec validation côté order guest si nécessaire.

10.6 Checkout utilisateur connecté
- Étapes:
  1) Panier serveur (auth) prêt.
  2) Création commande: `POST /api/v1/orders` (auth + validations adresse, montants).
  3) Paiement: `POST /api/v1/payments/process` (COD). Les cartes sont désactivées par défaut.
  4) Suivi commande: `GET /api/v1/orders/:id`, `GET /api/v1/orders/statistics`.
- Gestion 401: client `api.ts` efface le token localStorage et redirige vers `/admin/login` ou `/:locale/auth/login` selon chemin.

10.7 Authentification (publique)
- Inscription: `POST /api/v1/auth/register`.
- Connexion: `POST /api/v1/auth/login` → retourne token(s).
- Rafraîchissement: `POST /api/v1/auth/refresh`.
- Profil: `GET/PUT /api/v1/auth/profile`.
- Déconnexion: `POST /api/v1/auth/logout` (Bearer requis).
- Flux token: Front stocke dans localStorage (actuel). Middleware admin attend un cookie `authToken`. Reco: déposer cookie HTTP-only au login admin.

10.8 Espace Admin
- Accès: `/admin/login` (public) → après succès, accès aux routes app admin. Middleware empêche `/(fr|ar)/admin/*` (redirige vers `/admin`).
- API admin (toutes protégées) pour tableaux de bord, commandes (CRUD + transitions), clients (CRUD + stats), techniciens/services, analytics admin, export, settings (super admin), inventaire alertes.
- Flux commandes admin: lecture liste → détail → transitions: `PUT /orders/:orderId/status`, `POST /orders/:orderId/{ship,deliver,cancel}`.

10.9 Services (demandes d’intervention)
- Parcours client auth: consulter `GET /services/types`, créer demande `POST /services/requests`, consulter `GET /services/requests`, ajouter feedback `POST /services/requests/:id/feedback`.
- Parcours technicien/admin: mise à jour statut `PUT /services/requests/:id/status`, liste techniciens dispo `GET /services/technicians/available`.

10.10 Analytics & Tracking
- Événements Front → `POST /api/analytics/events` (route Next proxy vers Back `/api/v1/analytics/events`).
- DEV: endpoints dashboard produits/ventes/clients sans auth; PROD: protégés.
- Temps réel & sessions (PROD): `GET /analytics/realtime` et `/session/:sessionId` protégés (ADMIN/SUPER_ADMIN).
- Offline analytics: service worker maintient une queue `analytics-queue` et synchronise sur `sync` (si activé).

10.11 Géolocalisation
- Actuel: Front `GET /api/geolocation` interroge ipapi directement; Back offre `GET /api/v1/geolocation` avec cache TTL 1h.
- Reco: uniformiser via Back pour caching/observabilité.

10.12 Uploads médias (admin)
- Flux: `POST /api/v1/uploads` (auth admin) avec champs `image` ou `images[]`. Retourne URLs publiques `/files/:filename`. Validation MIME et taille via config.

10.13 Temps réel (admin)
- Notifications système: `POST /realtime/notifications/system`.
- Broadcast: `POST /realtime/broadcast`.
- Gestion cache: stats/invalidate/clear/clean-expired.

10.14 Gestion des erreurs et états limites
- 401: redirection auto (client).
- 403: rôles insuffisants (admin/super admin requis sur certaines routes).
- 400/422: validations (express-validator) sur produits, commandes, services, uploads.
- 415: upload type interdit.
- 500: handlers avec messages détaillés en dev (analytics, uploads, proxys Next).
- Timeouts: `ssr-api` applique abort controller (DEFAULT_TIMEOUT=5000ms), géoloc backend 1500ms + retries.

10.15 Caching & performance
- SSR fetch: produits `no-store`, catégories/manufacturers revalidate (2h) côté SSR helper.
- Service Worker: strat. cache-first (statics), network-first (API), stale-while-revalidate (images); nettoyage périodique, offline.html.
- Images: `next/image` config autorise backend (`localhost:3001`) et CDN `cdn.mjchauffage.com`.

10.16 Observabilité & logs
- Logs backend via `utils/logger`. Health route journalise latences DB/cache/mémoire.
- Reco: tracer IDs de corrélation (req-id) et enrichir logs proxys Next API pour diagnostiquer erreurs de backend.

---

Fin du document.
