# Audit de Sécurité et Qualité - Projet MJCHAUFFAGE1

## 🎯 SCORE PRODUCTION-READY: [En cours d'évaluation]

---

## 📊 VUE D'ENSEMBLE
- **Type de projet:** Application Web Full-Stack (Next.js + Node.js/Express)
- **Technologies:** TypeScript, React, Next.js, Node.js, Express, Prisma, PostgreSQL, Docker.
- **Structure:** Monorepo avec un backend (`/backend`) et un frontend (`/frontend`).

---

## 🔒 SÉCURITÉ

### ⚠️ CRITIQUE (BLOQUANTS)

**1. Mot de passe de la base de données en clair dans `docker-compose.yml`**
   - **Localisation:** `docker-compose.yml:32` et `docker-compose.yml:56`
   - **Problème:** Le mot de passe de la base de données (`password`) est hardcodé. Si ce fichier est versionné (ce qui est probable pour un `docker-compose.yml`), le secret est exposé à toute personne ayant accès au dépôt de code. C'est une violation fondamentale des pratiques de sécurité.
   - **Risque:** Accès complet et non autorisé à la base de données de production et de développement.
   - **Solution Immédiate:**
     1. Supprimer immédiatement ces lignes du fichier `docker-compose.yml`.
     2. Remplacer les valeurs par des références à des variables d'environnement qui seront chargées à partir d'un fichier `.env` local **non versionné**.
     3. **Changer immédiatement le mot de passe de la base de données.**

   **Exemple de correction dans `docker-compose.yml`:**
   ```

### 🐛 ÉLÉMENTS DE DEBUG

**2. `TODO` et `FIXME` indiquant des fonctionnalités non terminées**
   - **Localisations multiples:** Très nombreux dans `backend/src/services/analyticsService.ts`, `backend/src/controllers/analyticsController.ts`, `frontend/src/contexts/CartContext.tsx`, `frontend/src/components/**/*.tsx`.
   - **Problème:** Le code est truffé de commentaires `TODO` qui ne sont pas des suggestions mineures, mais qui indiquent l'absence de fonctionnalités critiques pour le fonctionnement de l'application (logique de panier, passage de commande, analytiques, etc.).
   - **Risque:** Critique. L'application est fondamentalement incomplète et non fonctionnelle pour un utilisateur final. Déployer ce code en production conduirait à une application cassée.
   - **Solution:**
     - Mettre en place un plan de développement pour implémenter toutes les fonctionnalités marquées par des `TODO`.
     - Ne considérer le projet comme "prêt pour la production" qu'une fois que tous les `TODO` critiques sont résolus et que les fonctionnalités associées sont testées.


   - **Localisations multiples:**
     - `frontend/src/components/checkout/Checkout.tsx`
     - `frontend/src/components/admin/ProductsManagement.tsx`
     - `frontend/src/app/[locale]/products/ClientProductsPage.tsx`
     - `frontend/src/components/services/ServiceBooking.tsx`
     - `frontend/src/contexts/CartContext.tsx`
     - `typefix/security_improvements.ts`
   - **Problème:** L'utilisation de `console.log` en production expose des informations sur le fonctionnement interne de l'application, peut ralentir les performances et pollue la console du navigateur, rendant le débogage pour de vrais problèmes plus difficile.
   - **Risque:** Faible. Principalement un problème de qualité de code et de professionnalisme.
   - **Solution:**
     - Supprimer systématiquement tous les appels à `console.log`, `console.warn`, `console.error` du code source de l'application avant tout déploiement en production.
     - Pour le suivi d'événements en production (ex: sécurité, erreurs), utiliser un service de logging dédié (ex: Sentry, LogRocket, Datadog).



**1. Données de test (Mock Data) et logique de démonstration dans le code source**
   - **Localisations multiples:**
     - `frontend/src/components/products/ProductCard.tsx:203` (note statique)
     - `frontend/src/app/[locale]/products/ClientProductsPage.tsx:68-69` (note et avis statiques)
     - `frontend/src/components/auth/RegisterForm.tsx:88` (logique de démonstration)
     - Plusieurs fichiers de test (`test-*.js`) créent des entités avec des données de test.
   - **Problème:** La présence de données hardcodées et de logique de mock dans le code de production peut entraîner des comportements inattendus, afficher des informations incorrectes aux utilisateurs et compliquer la maintenance.
   - **Risque:** Faible à Moyen. Peut dégrader l'expérience utilisateur et introduire des bugs difficiles à tracer.
   - **Solution:**
     - Supprimer toutes les données statiques et les remplacer par des appels à l'API.
     - Isoler complètement la logique de test et de démonstration de la base de code de production. Utiliser des variables d'environnement pour activer/désactiver les modes de démonstration si nécessaire.

**2. Identifiants de test potentiellement exposés**
   - **Localisation:** `PROBLEMES_CORRIGES.md`, `test-admin-to-site.js`
   - **Problème:** Les identifiants `admin@mjchauffage.com` / `Admin123!` sont mentionnés.
   - **Risque:** Élevé. Si ce compte existe sur l'environnement de production avec ces identifiants, il offre un accès administrateur direct.
   - **Solution:**
     - **Vérifier immédiatement si ce compte existe en production et le supprimer ou changer son mot de passe.**
     - Ne jamais stocker d'identifiants, même de test, dans la documentation ou le code versionné. Utiliser un gestionnaire de secrets pour les comptes de test nécessaires aux pipelines CI/CD.

**3. Pages de test accessibles**
   - **Localisation:** `frontend/src/app/[locale]/admin/page.tsx`
   - **Problème:** Une page de test est présente dans le code source de l'application.
   - **Risque:** Faible. Peut paraître non professionnel et, dans certains cas, exposer des informations sur la structure interne de l'application.
   - **Solution:** Supprimer toutes les pages et routes de test du build de production.
yaml
   # ...
   services:
     backend:
       # ...
       environment:
         - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/mjchauffage
         # ...
     postgres:
       # ...
       environment:
         - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
   # ...
   ```
   Créez ensuite un fichier `.env` à la racine du projet (et ajoutez-le au `.gitignore`) avec le contenu suivant :
   ```
   POSTGRES_PASSWORD=un_mot_de_passe_fort_et_aleatoire
   ```
