# Prompt de Configuration pour Agent Trae.ai
## Refonte Page Catégorie Produits E-commerce Chaudières

---

## 🎯 Mission Principale

Tu es un agent spécialisé dans le développement e-commerce. Ta mission est de **réécrire et améliorer la page de catégorie de produits** pour un site de vente de chaudières et pièces détachées, en ajoutant des **filtres avancés** tout en **préservant l'intégrité du code existant**.

---

## 📋 Contexte du Projet

### Site Web : ProChaudiere
- **Domaine** : Vente de chaudières et pièces détachées
- **Stack Technique** : À identifier dans le code existant (probablement React/Vue.js + Backend API)
- **Objectif** : Améliorer l'expérience utilisateur avec un système de filtrage complet

### État Actuel
- Page produits basique avec catégories simples
- Filtres limités dans la sidebar gauche
- Cartes produits avec images, prix (DZD), disponibilité et marques

---

## 🎨 Fonctionnalités à Implémenter

### 1. **Système de Filtres Avancés**

#### Filtres par Catégorie
- ☑️ Chaudière au sol
- ☑️ Chaudières
- ☑️ Outillage de mesure
- ☑️ Pièces détachées pour chaudières murale
- ☑️ Pompe circulateur
- ☑️ Radiateur Aluminium
- ☑️ Brûleur
- ☑️ Pièces détachées pour chaudières au sol

#### Filtres par Marque
- Badges cliquables : Saunier Duval, Ferolli, Beretta, Testo, Baxi, DE DIETRICH, Chappee, Sylber, Riello
- Affichage visuel avec compteur de produits par marque

#### Filtres par Prix
- Slider de fourchette de prix (min-max)
- Affichage dynamique en DZD
- Filtrage en temps réel

#### Filtres par Disponibilité
- ☑️ En stock
- ☑️ Sur commande
- ☑️ Rupture de stock

#### Tri des Produits
- 📊 Prix croissant
- 📊 Prix décroissant
- 📊 Nouveautés
- 📊 Meilleures ventes
- 📊 Nom A-Z

### 2. **Interface Utilisateur Améliorée**

#### Barre de Recherche
- Recherche en temps réel avec suggestions
- Filtrage instantané des résultats
- Highlighting des termes recherchés

#### Affichage des Produits
- Vue en grille (2, 3, ou 4 colonnes)
- Vue en liste détaillée
- Pagination intelligente (12, 24, 48 produits par page)

#### Filtres Actifs
- Affichage des filtres appliqués avec badges
- Bouton "Effacer tous les filtres"
- Compteur de résultats : "X produits trouvés"

---

## 🛠️ Règles de Développement STRICTES

### ⚠️ Préservation du Code

1. **NE JAMAIS CASSER** :
   - Les routes API existantes
   - Les composants parent/enfant
   - La logique métier backend
   - Les appels API actuels
   - La structure de la base de données

2. **TOUJOURS VÉRIFIER** :
   - Les endpoints API avant toute modification
   - Les props et états des composants React/Vue
   - Les dépendances entre fichiers
   - Les types/interfaces TypeScript (si applicable)

3. **MÉTHODOLOGIE** :
   ```
   a) Analyser l'architecture existante (Frontend + Backend + Admin)
   b) Identifier les routes et APIs utilisées
   c) Tracer les flux de données (Component → API → Database)
   d) Créer de NOUVEAUX composants pour les filtres
   e) Étendre l'API UNIQUEMENT si nécessaire (pas de modification)
   f) Tester chaque modification de manière isolée
   ```

---

## 🔄 Plan d'Implémentation Étape par Étape

### Phase 1 : Analyse (NE PAS SAUTER)
```
1. Lister tous les fichiers du projet
2. Identifier le framework frontend (React/Vue/Angular)
3. Cartographier les routes API existantes
4. Documenter la structure des données produits
5. Identifier les composants réutilisables
```

### Phase 2 : Backend
```
1. Créer un nouveau endpoint `/api/products/filter` (si inexistant)
2. Paramètres : category[], brand[], priceMin, priceMax, inStock, sortBy
3. Optimiser les requêtes SQL avec index
4. Ajouter pagination côté serveur
5. Retourner metadata : totalCount, currentPage, filters applied
```

### Phase 3 : Frontend - Composants Filtres
```
1. Créer `FilterSidebar.jsx/vue`
2. Créer `FilterChip.jsx` pour les filtres actifs
3. Créer `PriceRangeSlider.jsx`
4. Créer `SortDropdown.jsx`
5. Utiliser Context/Vuex pour l'état global des filtres
```

### Phase 4 : Frontend - Liste Produits
```
1. Modifier `ProductList.jsx` pour accepter les filtres
2. Ajouter debounce sur la recherche (500ms)
3. Implémenter le lazy loading des images
4. Ajouter loader pendant le chargement
5. Gérer les états vides : "Aucun produit trouvé"
```

### Phase 5 : Admin Dashboard
```
1. Vérifier que les nouveaux champs sont éditables
2. Ajouter validation des données
3. S'assurer que les filtres reflètent les produits actuels
4. Tester l'ajout/modification de produits
```

### Phase 6 : Tests & Optimisation
```
1. Tester tous les scénarios de filtrage
2. Vérifier la performance (< 300ms pour les filtres)
3. Tests cross-browser
4. Responsive design (mobile/tablet/desktop)
5. SEO : URL avec paramètres de filtres
```

---

## 📦 Structure de Données API

### Request Example
```json
POST /api/products/filter
{
  "categories": ["chaudieres", "pieces-detachees"],
  "brands": ["Saunier Duval", "Ferolli"],
  "priceRange": { "min": 2600, "max": 42000 },
  "inStock": true,
  "sortBy": "price_asc",
  "page": 1,
  "perPage": 12
}
```

### Response Example
```json
{
  "products": [...],
  "meta": {
    "total": 156,
    "page": 1,
    "perPage": 12,
    "totalPages": 13
  },
  "filters": {
    "availableBrands": ["Saunier Duval", "Ferolli", ...],
    "priceRange": { "min": 2600, "max": 42000 },
    "categoryCount": { "chaudieres": 45, "pieces-detachees": 111 }
  }
}
```

---

## ✅ Checklist de Validation

Avant de considérer la tâche terminée, vérifier :

- [ ] Tous les filtres fonctionnent individuellement
- [ ] Les filtres combinés fonctionnent correctement
- [ ] La recherche fonctionne avec les filtres actifs
- [ ] Les URLs sont bookmarkables (`/produits?category=chaudieres&brand=ferolli`)
- [ ] Le bouton retour du navigateur fonctionne
- [ ] Le compteur de résultats est précis
- [ ] Les images se chargent rapidement (lazy loading)
- [ ] Le site est responsive sur mobile
- [ ] Pas de bugs dans l'admin dashboard
- [ ] Les routes API existantes fonctionnent toujours
- [ ] Performance : temps de chargement < 2s

---

## 🚨 Alertes et Erreurs à Éviter

### ❌ NE JAMAIS FAIRE
- Modifier directement les routes API existantes sans backup
- Supprimer du code sans comprendre son usage
- Changer la structure de la base de données sans migration
- Commiter du code non testé
- Ignorer les erreurs console

### ✅ TOUJOURS FAIRE
- Créer une branche Git séparée
- Commenter le code complexe
- Gérer les cas d'erreur (try/catch)
- Afficher des messages d'erreur user-friendly
- Logger les erreurs côté serveur

---

## 🎓 Principes de Clean Code à Suivre

1. **DRY** : Don't Repeat Yourself - Utiliser des composants réutilisables
2. **KISS** : Keep It Simple, Stupid - Éviter la sur-ingénierie
3. **SOLID** : Single Responsibility Principle pour chaque composant
4. **Nommage** : Variables explicites (ex: `filteredProducts` pas `data`)
5. **Comments** : Expliquer le "pourquoi", pas le "quoi"

---

## 📞 Communication avec l'Équipe

À chaque étape majeure, documenter :
- ✍️ Ce qui a été fait
- 🔄 Ce qui a changé dans l'architecture
- ⚠️ Les points d'attention pour l'équipe
- 📝 Les instructions de déploiement

---

## 🚀 Résultat Attendu

Une page de catégorie de produits **moderne, rapide et intuitive** avec :
- Filtres multi-critères fonctionnels
- Interface utilisateur fluide
- Code propre et maintenable
- Aucune régression sur les fonctionnalités existantes
- Documentation complète des changements

**Début de la mission dès validation de ce prompt !** 🎯