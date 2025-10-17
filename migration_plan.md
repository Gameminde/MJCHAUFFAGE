Plan de migration vers un client API centralisé (Frontend public)

Objectifs
- Réduire les 60 appels fetch() dispersés
- Supprimer les 41 URLs hardcodées et harmoniser la baseURL
- Normaliser l’usage de NEXT_PUBLIC_API_URL (22 occurrences)
- Unifier la gestion d’authentification, erreurs, timeout et uploads

Portée
- Frontend public (Next.js) sous `frontend/src`
- Services, pages Admin, utilitaires et routes `app/api/*/route.ts`

Architecture cible
- Client centralisé `frontend/src/lib/api.ts` basé sur fetch()
- BaseURL unique: `process.env.NEXT_PUBLIC_API_URL + '/api'`
- Intercepteurs: ajout automatique du token (next-auth), parsing JSON, ApiError
- Méthodes: `api.get/post/put/patch/delete/upload`, Hook `useApiRequest`

Critères d’acceptation
- Zéro `fetch()` direct dans les services ciblés
- Zéro URL HTTP hardcodée dans les fichiers migrés
- Utilisation exclusive de `api.*` pour les requêtes
- Gestion d’erreurs cohérente via `ApiError`

Stratégie de migration
Phase 0 – Préparation
- Créer le client centralisé (`frontend/src/lib/api.ts`) ✅
- Vérifier alias `@/lib` et dépendances (`next-auth`) ✅

Phase 1 – Services & API routes
- Refactoriser `productService.ts` vers `api.*` ✅
- Migrer `cartService.ts`, `paymentService.ts`
- Réviser `app/api/*/route.ts` pour cohérence des réponses

Phase 2 – Pages Admin & utilitaires
- Migrer `CustomersManagement.tsx`, `OrdersManagement.tsx`, `PerformanceOptimizer.tsx`
- Migrer `seo.ts` et utilitaires liés aux requêtes externes

Phase 3 – Nettoyage transversal
- Remplacer tous `httpUrl` hardcodés par chemins relatifs (`/resource`)
- Harmoniser l’usage de `NEXT_PUBLIC_API_URL` via `API_CONFIG.baseURL`
- Ajouter lint rule pour interdire `fetch()` direct (optionnel)

Plan par fichier (priorité)
1) `services/productService.ts` (9 appels)
   - Remplacer `fetch()` par `api.get/post/put/delete`
   - Garder les types et `convertApiProduct` pour compatibilité
   - Supprimer gestion manuelle du token/localStorage

2) `pages/admin/CustomersManagement.tsx` (9)
   - Extraire appels vers un `customersService`
   - Utiliser `api.get/patch` pour listing et update
   - Centraliser gestion d’erreurs et loaders via `useApiRequest`

3) `pages/admin/PerformanceOptimizer.tsx` (9)
   - Remplacer URLs hardcodées par endpoints relatifs
   - Normaliser les requêtes (`api.post`) pour tâches d’optimisation

4) `pages/admin/OrdersManagement.tsx` (9)
   - Déporter la logique réseau dans `ordersService`
   - Utiliser `api.get/patch/delete` pour états de commande

5) `services/cartService.ts` (8)
   - Passer à `api.post/get` pour ajout/lecture
   - Gérer `FormData` via `api.upload` si nécessaire

6) `lib/seo.ts` (8)
   - Supprimer `httpUrl` direct
   - Utiliser `api.get` pour données meta dynamiques

7) `services/paymentService.ts` (5)
   - Uniformiser callbacks et erreurs (ApiError)
   - Utiliser `api.post` pour initier paiements

Compatibilité & risques
- Formats de réponse: s’assurer que l’API renvoie `{ success, data }`
- Auth: présence de `next-auth` validée, fallback SSR sans cookies custom
- Types: conserver les interfaces actuelles pour éviter les breaking changes

Tests et validation
- Tests unitaires ciblés pour services migrés
- Vérifier comportements 401/403 et timeouts
- Vérifier uploads via `api.upload` (FormData)

Livrables
- `frontend/src/lib/api.ts` (client centralisé) ✅
- `frontend/src/services/productService.ts` refactoré ✅
- `CustomersManagement.tsx`, `OrdersManagement.tsx`, `PerformanceOptimizer.tsx`, `cartService.ts`, `seo.ts`, `paymentService.ts` (phases 2–3)
