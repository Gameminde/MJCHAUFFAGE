# Guide d'Accessibilité Mobile - MJ CHAUFFAGE

## Vue d'ensemble

Ce guide détaille les fonctionnalités d'accessibilité mobile implémentées sur le site MJ CHAUFFAGE, conformes aux standards WCAG 2.1 AA.

## Fonctionnalités d'Accessibilité

### 1. Liens de Navigation Rapide (Skip Links)

#### Qu'est-ce que c'est ?
Les skip links permettent aux utilisateurs de lecteurs d'écran de sauter directement aux sections principales de la page.

#### Implémentation
```html
<!-- Liens skip (invisibles par défaut) -->
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
<a href="#navigation" className="skip-link">
  Skip to navigation
</a>

<!-- Sections cibles -->
<header id="navigation">...</header>
<main id="main-content">...</main>
```

#### Styles CSS
```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 6px;
}
```

#### Utilisation
- Appuyer sur Tab au début de la page fait apparaître les skip links
- Permet de naviguer rapidement sans parcourir tout le header

### 2. Logo Accessible

#### Implémentation
```html
<Link
  href={`/${locale}`}
  aria-label="MJ CHAUFFAGE - Accueil"
>
  <div
    role="img"
    aria-label="Logo MJ CHAUFFAGE - Flamme stylisée"
  >
    <Flame aria-hidden="true" />
  </div>
  <span className="sr-only">
    MJ CHAUFFAGE - Solutions de chauffage professionnel
  </span>
</Link>
```

#### Avantages
- Lecteurs d'écran annoncent correctement le logo
- Texte alternatif complet pour la compréhension
- Navigation clavier fonctionnelle

### 3. Menu Mobile Accessible

#### Bouton Menu
```html
<button
  aria-label="Fermer le menu"
  aria-expanded={isMobileMenuOpen}
  type="button"
>
  <X aria-hidden="true" />
</button>
```

#### Menu Panel
```html
<div
  role="dialog"
  aria-label="Menu de navigation"
  aria-modal="true"
>
  <!-- Liens de navigation -->
</div>
```

### 4. Composants Tactiles

#### Zones de Touch Minimum
- Boutons : 44px minimum (recommandation Apple)
- Liens : 44px minimum
- Espacement : 8px minimum entre éléments tactiles

#### Feedback Visuel et Tactile
- `active:scale-95` pour le feedback tactile
- Indicateurs de focus visibles
- États hover et active différenciés

### 5. Images et Médias

#### Images de Produits
```html
<Image
  src={productImage}
  alt={`Produit: ${product.name}`}
  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
/>
```

#### Placeholders Accessibles
- Texte alternatif descriptif
- Fallbacks par catégorie
- Support multilingue (FR/AR)

### 6. Navigation Clavier

#### Ordre Logique
- Tab order respecté
- Éléments interactifs focusables
- Indicateurs de focus visibles

#### Raccourcis
- Échap pour fermer les modales
- Tab pour naviguer entre éléments

### 7. Support des Préférences Utilisateur

#### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### High Contrast
```css
@media (prefers-contrast: high) {
  :root {
    --color-primary: #000000;
    --color-text: #000000;
  }
}
```

#### Color Scheme
- Support automatique du mode sombre/clair
- Contraste suffisant dans tous les modes

## Tests d'Accessibilité

### Outils de Test
1. **Lighthouse** : Audit automatique
2. **Wave** : Extension navigateur
3. **NVDA/JAWS** : Lecteurs d'écran
4. **Navigateur en mode clavier uniquement**

### Checklist de Test

#### Navigation
- [ ] Skip links visibles au focus
- [ ] Tab order logique
- [ ] Tous les liens fonctionnels au clavier

#### Contenu
- [ ] Images avec alt text approprié
- [ ] Headings hiérarchiques (h1→h2→h3)
- [ ] Texte avec contraste suffisant

#### Interactions
- [ ] Boutons avec labels appropriés
- [ ] Formulaires avec labels associés
- [ ] Messages d'erreur accessibles

#### Responsive
- [ ] Fonctionnel sur mobile (iOS/Android)
- [ ] Zones tactiles suffisantes
- [ ] Gestes natifs supportés

## Métriques d'Accessibilité

### Scores Lighthouse
- **Performance** : >85/100
- **Accessibilité** : >90/100
- **Bonnes pratiques** : >85/100
- **SEO** : >90/100

### Conformité WCAG 2.1 AA
- **Niveau A** : ✅ Respecté
- **Niveau AA** : ✅ Respecté
- **Niveau AAA** : 🎯 En cours

## Scripts d'Audit

### Audit Automatique
```bash
# Audit complet mobile
npm run mobile:audit

# Audit en développement
npm run mobile:audit:dev
```

### Audit Manuel
```bash
# Performance uniquement
npm run performance:audit

# Tests unitaires accessibilité
npm run test:accessibility
```

## Maintenance

### Mises à jour régulières
1. **Tests mensuels** : Audit Lighthouse complet
2. **Revue de code** : Checklist accessibilité
3. **Tests utilisateurs** : Feedback réel
4. **Mises à jour** : Nouvelles fonctionnalités testées

### Documentation
- **Guide développeur** : Ce document
- **Checklist QA** : Liste de contrôle
- **Rapports d'audit** : Historique des scores

## Contact

Pour toute question sur l'accessibilité :
- **Équipe développement** : Accessibilité et UX
- **Documentation** : `/docs/MOBILE_ACCESSIBILITY_GUIDE.md`
- **Issues** : Créer une issue GitHub avec le tag `accessibility`

