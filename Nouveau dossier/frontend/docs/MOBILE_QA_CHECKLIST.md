# Checklist QA Mobile - MJ CHAUFFAGE

## Vue d'ensemble
Cette checklist garantit la qualité des optimisations mobiles sur tous les appareils et navigateurs supportés.

## 1. Tests Fonctionnels

### Navigation Mobile
- [ ] **Menu hamburger** s'ouvre/ferme correctement
- [ ] **Overlay** apparaît/disparaît avec le menu
- [ ] **Scroll** désactivé quand menu ouvert
- [ ] **Fermeture** au clic extérieur ou Échap
- [ ] **Liens menu** fonctionnels et redirigent correctement
- [ ] **Logo** cliquable et redirige vers l'accueil

### Pages Principales
- [ ] **Homepage** : Hero responsive, catégories visibles
- [ ] **Produits** : Grille responsive, cartes tactiles
- [ ] **À propos** : Contenu lisible, équipe présentée
- [ ] **Contact** : Formulaire fonctionnel
- [ ] **Navigation** : Entre pages fluide

### Interactions Tactiles
- [ ] **Boutons** : 44px minimum, feedback visuel
- [ ] **Liens** : Zones cliquables suffisantes
- [ ] **Formulaires** : Inputs adaptés mobile
- [ ] **Images** : Zoom possible, chargement fluide

## 2. Tests Responsive

### Breakpoints
- [ ] **Mobile** (320px-767px) : Layout adapté
- [ ] **Tablette** (768px-1023px) : Colonnes ajustées
- [ ] **Desktop** (1024px+) : Layout complet

### Éléments Visuels
- [ ] **Images** : Pas de débordement, aspect correct
- [ ] **Texte** : Lisible sans zoom (16px+)
- [ ] **Espacement** : Cohérent sur tous écrans
- [ ] **Boutons** : Alignés et accessibles

### Orientation
- [ ] **Portrait** : Layout optimisé
- [ ] **Paysage** : Contenu adapté

## 3. Tests d'Accessibilité

### Navigation Clavier
- [ ] **Tab order** logique
- [ ] **Skip links** visibles au focus
- [ ] **Focus indicators** visibles
- [ ] **Échap** ferme les modales

### Lecteurs d'Écran
- [ ] **Logo** décrit correctement
- [ ] **Images** avec alt text approprié
- [ ] **Headings** hiérarchiques
- [ ] **Liens** contextuels

### Conformité WCAG
- [ ] **Contraste** suffisant (4.5:1 minimum)
- [ ] **Zones tactiles** 44px minimum
- [ ] **Labels** sur tous les inputs
- [ ] **Messages d'erreur** accessibles

## 4. Tests de Performance

### Métriques Lighthouse
- [ ] **Performance** : ≥85/100
- [ ] **Accessibilité** : ≥90/100
- [ ] **Bonnes pratiques** : ≥85/100
- [ ] **SEO** : ≥90/100

### Chargement
- [ ] **Time to First Byte** < 1.5s
- [ ] **First Contentful Paint** < 2s
- [ ] **Largest Contentful Paint** < 2.5s
- [ ] **Cumulative Layout Shift** < 0.1

### Ressources
- [ ] **Bundle size** optimisé (< 200KB JS)
- [ ] **Images** compressées et lazy-loaded
- [ ] **Cache** configuré correctement
- [ ] **CDN** utilisé pour les assets

## 5. Tests Cross-Platform

### iOS Safari
- [ ] **Gestes natifs** fonctionnels
- [ ] **Scroll momentum** préservé
- [ ] **Zoom** désactivé sur inputs
- [ ] **Safe areas** respectées

### Android Chrome
- [ ] **Material Design** compatible
- [ ] **Scroll** fluide
- [ ] **Touch targets** précises
- [ ] **Status bar** adaptée

### Autres Navigateurs
- [ ] **Firefox Mobile** compatible
- [ ] **Samsung Internet** fonctionnel
- [ ] **Edge Mobile** supporté

## 6. Tests de Compatibilité

### Appareils
- [ ] **iPhone SE** (375px width)
- [ ] **iPhone 12/13** (390px width)
- [ ] **iPhone 12/13 Pro Max** (428px width)
- [ ] **Samsung Galaxy S21** (360px width)
- [ ] **Google Pixel 5** (393px width)
- [ ] **Tablettes** (768px+ width)

### OS Versions
- [ ] **iOS 14+** supporté
- [ ] **Android 8+** compatible

## 7. Tests Utilisateur

### Scénarios
- [ ] **Découverte** : Navigation intuitive
- [ ] **Recherche produit** : Filtrage fonctionnel
- [ ] **Ajout panier** : Processus fluide
- [ ] **Checkout** : Formulaire adapté mobile
- [ ] **Support** : Contact facile

### Feedback
- [ ] **Performance** ressentie bonne
- [ ] **Navigation** claire
- [ ] **Contenu** lisible
- [ ] **Actions** évidentes

## 8. Tests d'Intégration

### APIs
- [ ] **Chargement produits** rapide
- [ ] **Images** se chargent correctement
- [ ] **Cache** fonctionnel
- [ ] **Offline** basique (service worker)

### Analytics
- [ ] **Événements** trackés correctement
- [ ] **Performance** monitorée
- [ ] **Erreurs** capturées

## Scripts de Test

### Automatisés
```bash
# Audit complet mobile
npm run mobile:audit

# Test réseau 4G simulé
npm run mobile:perf-test

# Performance Lighthouse
npm run performance:audit
```

### Manuels
```bash
# Tests E2E Playwright
npm run test:e2e

# Tests composants
npm run test:components
```

## Résultats Attendus

### Scores Minimums
- **Performance Lighthouse** : ≥85/100
- **Accessibilité** : ≥90/100
- **Temps de chargement** : < 3s sur 4G
- **Core Web Vitals** : Tous "Good"

### Métriques Business
- **Bounce rate mobile** : < 50%
- **Conversion mobile** : ≥80% du desktop
- **Temps session** : > 2 minutes
- **Satisfaction utilisateur** : ≥4/5

## Maintenance

### Fréquence
- **Tests quotidiens** : Build + audit de base
- **Tests hebdomadaires** : Audit Lighthouse complet
- **Tests mensuels** : Tests utilisateur réels
- **Tests trimestriels** : Compatibilité nouveaux appareils

### Alertes
- **Performance** < 80 : Alerte équipe dev
- **Accessibilité** < 85 : Revue immédiate
- **Erreurs JS** > 1% : Investigation
- **Chargement** > 5s : Optimisation prioritaire

## Documentation

### Guides
- [Guide Accessibilité Mobile](./MOBILE_ACCESSIBILITY_GUIDE.md)
- [Guide Développement Mobile](./MOBILE_DEVELOPMENT_GUIDE.md)
- [Audit Performance](./performance-audit.json)

### Outils
- **Lighthouse** : Audit automatique
- **WebPageTest** : Tests multi-emplacements
- **BrowserStack** : Tests cross-platform
- **Sentry** : Monitoring erreurs

