# Tâches d’exécution (Checklist AI)

## Aujourd’hui — Alignement critique
- [ ] Admin: vérifier `ordersApi.getAll()` et `PUT /admin/orders/:orderId/status`.
- [ ] Admin: compteurs et filtres utilisent les enums en MAJ (`PENDING`, `PROCESSING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`).
- [ ] Auth: 401 → nettoyage cookies + redirection `/login`; valider `logout`.
- [ ] Dev: corriger l’avertissement Turbopack root (supprimer lockfiles en trop ou définir `turbopack.root`).

## Suppression des mock data (global)
- [ ] Auditer les projets pour données factices: rechercher `mock|fixtures|dummy|sample|placeholder|fake|seed`.
- [ ] Parcourir `frontend/src`, `admin-v2/admin-frontend/src`, `backend/src` et supprimer les mocks.
- [ ] Remplacer les mocks par des appels API réels via `lib/api.ts` (admin) et `frontend/src/services` (site).
- [ ] Supprimer les composants de démo et données codées en dur (listes, cartes, tableaux).
- [ ] Ajouter des seeds de dev réalistes dans `backend/prisma/seed.ts` pour jeux de données.
- [ ] Couvrir par tests e2e/intégration pour prévenir régressions.

## Refonte du design (Admin Dashboard)
- [ ] Design system: définir tokens (couleurs, typo, spacing, ombres) et usage.
- [ ] Unifier `tailwind.config.js`; nettoyer classes utilitaires incohérentes.
- [ ] Normaliser composants UI (`components/ui`): boutons, inputs, tables, badges, modales, toasts.
- [ ] Navigation & IA: sidebar, header, breadcrumbs; structure claire des pages.
- [ ] Templates de pages: Commandes, Clients, Produits, Services, Techniciens, Analytics.
- [ ] États: loading/erreur/vide cohérents; messages via i18n.
- [ ] Accessibilité: focus visible, ARIA, contraste.

## Synchronisation Dashboard ↔ Website
- [ ] Contrats d’API: types/DTO partagés; statuts unifiés; endpoints alignés.
- [ ] Auth unifiée: cookies, redirections, guard de routes; rôles.
- [ ] i18n commun: centraliser `messages/fr.json`; éviter doublons.
- [ ] Design tokens communs: partager palette et spacing; composants réutilisables.
- [ ] Données Produits: catégories, fabricants, inventaire; aligner formes côté site/admin.
- [ ] Services: demandes, feedback, attribution technicien; mêmes statuts et flux.
- [ ] Observabilité: logs erreurs API, temps de réponse, actions utilisateur.

## Data & Contracts
- [ ] Centraliser types dans `admin-frontend/src/lib/api.ts` et `frontend/src/services`.
- [ ] Normaliser `adminService.getOrders` et le contrôleur; documenter enums/DTOs.
- [ ] Ajouter un widget health check dans le dashboard.

## Architecture & Consolidation
- [ ] Introduire React Query (admin + site) pour cache/retries/background refresh.
- [ ] Guards et RBAC: appliquer rôles via `AuthContext`.
- [ ] Supprimer duplicats et code mort; choisir apps canoniques (backend, admin-frontend, frontend).

## Validation
- [ ] Flux Commandes: liste, compteurs/filtre corrects, mise à jour statut OK.
- [ ] Flux Auth: redirection des non-authentifiés; `logout` nettoie tokens.
- [ ] Flux Services: liste, mise à jour statut, assignation technicien.
- [ ] Flux Produits: catalogue public OK; CRUD admin OK.
- [ ] Health check: le dashboard reporte la connectivité API.

## Notes
- `docs/requirements.md` = source de vérité du périmètre.
- Suivre l’avancement ici et noter les changements majeurs dans `docs/admin-dashboard.md`.
