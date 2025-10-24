# 🔧 CONTEXT D'INGÉNIERIE - CORRECTION FONCTIONNELLE MJ CHAUFFAGE

## 🎯 MISSION PRIORITAIRE
**Faire fonctionner le site e-commerce et l'admin dashboard à 100%**
- ❌ IGNORER tous les problèmes de sécurité pour l'instant
- ✅ SE CONCENTRER uniquement sur les bugs fonctionnels
- ✅ Assurer que toutes les features marchent correctement
- ✅ Corriger les erreurs de build et de production

---

## 📋 PROBLÈMES FONCTIONNELS CRITIQUES IDENTIFIÉS

### 🚨 PRIORITÉ 1 - BLOQUANTS (À CORRIGER EN PREMIER)

#### 1. ÉCHEC DU BUILD DE PRODUCTION - CRITIQUE
**Statut** : 🔴 BLOQUANT - Le site ne peut pas être déployé

**Erreurs détectées** :
```
❌ Échec du build de production
❌ Erreurs de métadonnées (viewport, themeColor)
❌ Export statique défaillant (/_error: /404, /500)
❌ Bundle size non optimisé (analyse impossible)
```

**Impact** :
- Impossibilité de déployer en production
- Site non accessible en environnement réel
- Pas d'optimisation du bundle

**Actions à effectuer** :
1. Analyser les logs d'erreur du build Next.js
2. Corriger les problèmes de métadonnées dans `layout.tsx` ou `_app.tsx`
3. Vérifier la configuration `next.config.js`
4. Résoudre les erreurs de pages d'erreur personnalisées
5. Tester le build avec `npm run build`

**Fichiers à vérifier** :
- `next.config.js` ou `next.config.ts`
- `app/layout.tsx` ou `pages/_app.tsx`
- `pages/_error.tsx` et pages 404/500
- `.env.production`

---

#### 2. ADMIN DASHBOARD - FONCTIONNALITÉS NON FONCTIONNELLES
**Statut** : 🟠 IMPORTANT - L'admin ne peut pas gérer le site

**Problèmes identifiés** :
```
⚠️ SystemSettings : Configuration basique non opérationnelle
❌ Interface 2FA présente mais non fonctionnelle (peut causer confusion)
❌ Pas de logs d'audit (empêche le suivi des modifications)
❌ Session timeout configurable sans limites (peut causer des bugs)
```

**Fonctionnalités à tester et corriger** :

**A. Gestion des Produits**
- [ ] Ajout d'un nouveau produit (pièce détachée)
- [ ] Modification d'un produit existant
- [ ] Suppression d'un produit
- [ ] Upload d'images produits
- [ ] Gestion des catégories de produits
- [ ] Gestion des stocks (quantités)
- [ ] Gestion des prix et variations

**B. Gestion des Commandes**
- [ ] Visualisation de la liste des commandes
- [ ] Changement du statut de commande
- [ ] Impression de facture
- [ ] Détails de commande complets
- [ ] Recherche et filtrage des commandes

**C. Gestion des Clients**
- [ ] Liste des clients
- [ ] Historique d'achat par client
- [ ] Modification des informations client
- [ ] Recherche de clients

**D. Configuration du Site**
- [ ] Paramètres généraux (nom, logo, etc.)
- [ ] Configuration des modes de paiement
- [ ] Configuration de la livraison
- [ ] Gestion des taxes

**E. Dashboard Principal**
- [ ] Affichage des KPIs (ventes, commandes, etc.)
- [ ] Graphiques fonctionnels
- [ ] Statistiques en temps réel

**Actions à effectuer** :
1. Tester chaque fonctionnalité une par une
2. Identifier les erreurs dans la console
3. Corriger les appels API défaillants
4. Vérifier les permissions et l'authentification
5. S'assurer que les données s'affichent correctement

---

### 🟡 PRIORITÉ 2 - PROBLÈMES UTILISATEUR (APRÈS PRIORITÉ 1)

#### 3. SITE E-COMMERCE FRONTEND - EXPÉRIENCE UTILISATEUR

**Fonctionnalités à tester** :

**A. Navigation et Catalogue**
- [ ] Page d'accueil s'affiche correctement
- [ ] Menu de navigation fonctionne
- [ ] Catalogue de produits s'affiche
- [ ] Système de recherche fonctionne
- [ ] Filtres de produits fonctionnent
- [ ] Pagination fonctionne

**B. Page Produit**
- [ ] Détails du produit s'affichent
- [ ] Images produits se chargent
- [ ] Prix correct affiché
- [ ] Bouton "Ajouter au panier" fonctionne
- [ ] Variantes/options fonctionnent (si applicable)

**C. Panier et Checkout**
- [ ] Ajout au panier fonctionne
- [ ] Panier persiste (localStorage ou session)
- [ ] Modification des quantités fonctionne
- [ ] Suppression d'articles fonctionne
- [ ] Calcul du total correct
- [ ] Page de checkout accessible
- [ ] Formulaire de livraison fonctionne
- [ ] Sélection mode de paiement fonctionne
- [ ] Confirmation de commande fonctionne

**D. Compte Utilisateur**
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Déconnexion fonctionne
- [ ] Page "Mon compte" accessible
- [ ] Historique des commandes visible
- [ ] Modification du profil fonctionne

**E. Responsive et Compatibilité**
- [ ] Site fonctionne sur mobile
- [ ] Site fonctionne sur tablette
- [ ] Site fonctionne sur desktop
- [ ] Compatible Chrome
- [ ] Compatible Firefox
- [ ] Compatible Safari

---

### 🔵 PRIORITÉ 3 - OPTIMISATIONS (APRÈS PRIORITÉS 1 & 2)

#### 4. PERFORMANCES ET OPTIMISATIONS

**A. Vitesse de Chargement**
- [ ] Page d'accueil charge en < 3 secondes
- [ ] Images optimisées (format WebP, lazy loading)
- [ ] Code splitting implémenté
- [ ] Fonts optimisées
- [ ] CSS/JS minifiés

**B. Bundle Size**
- [ ] Analyser le bundle avec `npm run analyze`
- [ ] Identifier les gros packages
- [ ] Implémenter le lazy loading des composants
- [ ] Supprimer les dépendances inutilisées

**C. Cache et Performance**
- [ ] Cache des API responses
- [ ] Service Worker (si PWA)
- [ ] Compression gzip/brotli active

---

## 🛠️ MÉTHODOLOGIE DE CORRECTION

### PHASE 1 : DIAGNOSTIC (30 minutes)
1. **Cloner le projet et installer les dépendances**
```bash
git clone [repo]
cd frontend && npm install
cd ../backend && npm install
```

2. **Lancer en mode développement**
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

3. **Ouvrir la console développeur** (F12)
   - Noter TOUTES les erreurs console
   - Noter TOUTES les erreurs réseau (onglet Network)

4. **Tester le build de production**
```bash
cd frontend && npm run build
```
   - Noter les erreurs de build
   - Identifier les problèmes de configuration

### PHASE 2 : CORRECTION BUILD (1-2 heures)

**Étape 1 : Corriger les erreurs de métadonnées**

Vérifier `app/layout.tsx` ou équivalent :
```typescript
// Exemple de métadonnées correctes
export const metadata = {
  title: 'MJ Chauffage',
  description: 'Pièces détachées chauffage',
  // S'assurer que viewport et themeColor sont bien formatés
}
```

**Étape 2 : Corriger la configuration Next.js**

Vérifier `next.config.js` :
```javascript
module.exports = {
  // Vérifier les paramètres d'export
  output: 'standalone', // ou autre selon besoin
  images: {
    // Configuration correcte des images
  },
  // ...
}
```

**Étape 3 : Corriger les pages d'erreur**

Créer/corriger `pages/_error.tsx`, `pages/404.tsx`, `pages/500.tsx`

**Étape 4 : Tester le build**
```bash
npm run build
npm start # ou npm run preview
```

### PHASE 3 : CORRECTION ADMIN DASHBOARD (2-4 heures)

**Étape 1 : Tester toutes les routes admin**

Créer une checklist et tester :
1. Login admin → `/admin/login`
2. Dashboard → `/admin/dashboard`
3. Produits → `/admin/products`
4. Commandes → `/admin/orders`
5. Clients → `/admin/customers`
6. Paramètres → `/admin/settings`

**Étape 2 : Identifier les erreurs**

Pour chaque page qui ne fonctionne pas :
1. Noter l'erreur console
2. Vérifier l'appel API (Network tab)
3. Vérifier le code du composant
4. Corriger le problème

**Étape 3 : Corriger les appels API**

Exemple de problèmes courants :
```typescript
// ❌ Mauvais
fetch('/api/products') // URL relative peut échouer

// ✅ Bon
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
```

**Étape 4 : Corriger l'authentification**

S'assurer que :
- Les tokens JWT sont bien stockés
- Les headers Authorization sont envoyés
- Les redirections fonctionnent

### PHASE 4 : CORRECTION FRONTEND USER (2-3 heures)

**Étape 1 : Parcours utilisateur complet**

Simuler un achat complet :
1. Arriver sur le site
2. Chercher un produit
3. Cliquer sur un produit
4. Ajouter au panier
5. Aller au panier
6. Aller au checkout
7. Créer un compte ou se connecter
8. Finaliser la commande

**Étape 2 : Noter TOUS les problèmes rencontrés**

**Étape 3 : Corriger un par un**

Prioriser par gravité :
1. Bugs bloquants (crash, impossible de continuer)
2. Bugs majeurs (fonctionnalité importante cassée)
3. Bugs mineurs (esthétique, message d'erreur)

### PHASE 5 : OPTIMISATIONS (1-2 heures)

**Uniquement après que tout fonctionne !**

1. Analyser les performances
2. Optimiser les images
3. Réduire le bundle size
4. Implémenter le lazy loading

---

## 📝 TEMPLATE DE RAPPORT DE CORRECTION

Pour chaque problème corrigé, documenter :

```markdown
### [CORRIGÉ] Titre du problème

**Localisation** : `chemin/vers/fichier.tsx:ligne`

**Problème** :
Description du bug observé

**Cause** :
Explication de pourquoi ça ne marchait pas

**Solution appliquée** :
```code
// Code avant
...

// Code après
...
```

**Test de validation** :
- [ ] Testé en dev
- [ ] Testé en build production
- [ ] Fonctionne correctement
```

---

## 🎯 CHECKLIST FINALE AVANT VALIDATION

### Build et Déploiement
- [ ] `npm run build` réussit sans erreurs
- [ ] `npm start` lance le site correctement
- [ ] Aucune erreur console au démarrage
- [ ] Toutes les pages se chargent

### Admin Dashboard
- [ ] Login admin fonctionne
- [ ] Toutes les pages admin accessibles
- [ ] Ajout de produit fonctionne
- [ ] Modification de produit fonctionne
- [ ] Suppression de produit fonctionne
- [ ] Liste des commandes s'affiche
- [ ] Modification du statut de commande fonctionne
- [ ] Dashboard affiche les statistiques

### Frontend User
- [ ] Page d'accueil se charge
- [ ] Catalogue produits s'affiche
- [ ] Recherche fonctionne
- [ ] Ajout au panier fonctionne
- [ ] Panier persiste
- [ ] Checkout fonctionne
- [ ] Création de compte fonctionne
- [ ] Connexion fonctionne
- [ ] Commande peut être finalisée

### Responsive
- [ ] Fonctionne sur mobile (320px - 768px)
- [ ] Fonctionne sur tablette (768px - 1024px)
- [ ] Fonctionne sur desktop (>1024px)

### Performance
- [ ] Temps de chargement acceptable (< 3s)
- [ ] Pas de memory leaks
- [ ] Images se chargent correctement

---

## 🚫 CE QU'ON IGNORE POUR L'INSTANT

❌ **NE PAS corriger** (on le fera après) :
- Protection CSRF
- Sécurité JWT et cookies
- Validation stricte avec Joi
- Vulnérabilités des dépendances
- 2FA
- Logs d'audit
- Tests de sécurité

✅ **SE CONCENTRER uniquement sur** :
- Erreurs de build
- Bugs fonctionnels
- Features qui ne marchent pas
- UX et navigation
- Intégration API
- Affichage des données

---

## 📊 RAPPORT FINAL ATTENDU

```markdown
# RAPPORT DE CORRECTION FONCTIONNELLE - MJ CHAUFFAGE

## RÉSUMÉ
- Problèmes identifiés : X
- Problèmes corrigés : X
- Temps total : X heures
- Statut : ✅ FONCTIONNEL / ⚠️ PARTIELLEMENT FONCTIONNEL / ❌ NON FONCTIONNEL

## CORRECTIONS EFFECTUÉES

### 1. Build de Production
[Détails des corrections...]

### 2. Admin Dashboard
[Détails des corrections...]

### 3. Frontend User
[Détails des corrections...]

## PROBLÈMES RESTANTS
[Liste des problèmes non résolus avec raison]

## PROCHAINES ÉTAPES
1. [...]
2. [...]

## VALIDATION
- [ ] Build fonctionne
- [ ] Admin fonctionne
- [ ] Site user fonctionne
- [ ] Prêt pour phase sécurité
```

---

## 🔥 RÈGLES D'OR POUR L'AGENT

1. **Prioriser la fonctionnalité** : Si ça marche mais pas sécurisé → OK pour l'instant
2. **Tester systématiquement** : Après chaque correction, vérifier que ça fonctionne
3. **Documenter** : Noter chaque correction avec avant/après
4. **Être pragmatique** : Pas de sur-ingénierie, juste faire marcher le site
5. **Un problème à la fois** : Ne pas tout changer en même temps
6. **Communiquer** : Tenir informé de la progression

**OBJECTIF FINAL** : Un site qui fonctionne à 100% pour les utilisateurs et les admins, même si pas encore sécurisé.

Une fois tout fonctionnel → On passera à la phase sécurité avec les corrections du rapport d'audit.

---

## 💡 QUESTIONS À POSER AU DÉVELOPPEUR

Avant de commencer, demander :
1. Quels sont les bugs spécifiques que vous avez remarqués ?
2. Y a-t-il des features spécifiques qui ne fonctionnent pas ?
3. Avez-vous des logs d'erreur à partager ?
4. Quelle version de Node.js utilisez-vous ?
5. Pouvez-vous lancer `npm run build` et partager les erreurs ?

**COMMENÇONS LA CORRECTION ! 🚀**