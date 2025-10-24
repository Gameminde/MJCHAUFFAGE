# 🎨 MJ CHAUFFAGE - Design System 2025

> Design system moderne pour une expérience utilisateur optimale dans le secteur du chauffage et climatisation en Algérie.

## 📐 Principes de Design

### Vision
Un design **moderne, professionnel et accessible** qui inspire confiance dans le domaine du chauffage tout en offrant une expérience fluide et engageante.

### Valeurs
- **Clarté** : Information facile à trouver et comprendre
- **Confiance** : Design professionnel qui inspire la fiabilité
- **Performance** : Expérience rapide et fluide
- **Accessibilité** : Utilisable par tous, partout
- **Modernité** : Tendances 2025 intégrées intelligemment

---

## 🎨 Palette de Couleurs

### Couleurs Principales

#### Bleu (Primary) - Confiance & Professionnalisme
```
primary-50:  #f0f9ff  ← Backgrounds légers
primary-100: #e0f2fe
primary-200: #bae6fd
primary-300: #7dd3fc
primary-400: #38bdf8
primary-500: #0ea5e9  ← Couleur principale (boutons, liens)
primary-600: #0284c7  ← Hover states
primary-700: #0369a1
primary-800: #075985
primary-900: #0c4a6e
primary-950: #082f49  ← Textes sur fonds clairs
```

#### Orange (Accent) - Énergie & Chaleur
```
accent-50:  #fef7ee
accent-100: #fdedd6
accent-200: #fbd7ac
accent-300: #f8bb77
accent-400: #f59440
accent-500: #f3761a  ← Couleur secondaire (CTA, highlights)
accent-600: #e45a10  ← Hover pour accent
accent-700: #bd440f
accent-800: #973714
accent-900: #7c2f14
accent-950: #431507
```

### Couleurs Sémantiques

```
success: #22c55e  ← Confirmations, succès
warning: #f59e0b  ← Alertes, attention
error:   #ef4444  ← Erreurs, problèmes
info:    #3b82f6  ← Informations
```

### Neutral Scale (Grays)

```
neutral-50:  #fafbfc  ← Backgrounds
neutral-100: #f4f6f8
neutral-200: #e5e9f0
neutral-300: #d1d8e4
neutral-400: #9ca3af  ← Borders
neutral-500: #6b7280  ← Text secondary
neutral-600: #4b5563
neutral-700: #374151  ← Text primary
neutral-800: #1f2937
neutral-900: #0f172a
neutral-950: #030712  ← Dark backgrounds
```

### Gradients Modernes

```css
/* Gradient Principal */
gradient-primary: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)

/* Gradient Accent */
gradient-accent: linear-gradient(135deg, #f3761a 0%, #e45a10 100%)

/* Gradient Mesh (Hero sections) */
gradient-mesh: 
  radial-gradient(at 40% 20%, #0ea5e9 0px, transparent 50%),
  radial-gradient(at 80% 0%, #f3761a 0px, transparent 50%),
  radial-gradient(at 0% 50%, #22c55e 0px, transparent 50%)
```

---

## 📝 Typographie

### Familles de Polices

```css
font-sans:    'Inter Variable', Inter, system-ui, sans-serif  /* Corps de texte */
font-display: 'Cal Sans', 'Inter Variable', sans-serif        /* Titres hero */
font-mono:    'JetBrains Mono', monospace                     /* Code, prix */
```

### Échelle Typographique

#### Display (Hero Sections)
```
display-2xl: 72px / 1.1 / -0.02em    ← Hero principal
display-xl:  60px / 1.2 / -0.02em
display-lg:  48px / 1.2 / -0.01em
display-md:  36px / 1.3 / -0.01em
```

#### Headings (Titres)
```
heading-xl:  36px / 1.3 / -0.01em    ← H1
heading-lg:  30px / 1.4              ← H2
heading-md:  24px / 1.4              ← H3
heading-sm:  20px / 1.5              ← H4
```

#### Body (Corps de texte)
```
body-xl:  20px / 1.6    ← Introductions, leads
body-lg:  18px / 1.6    ← Texte important
body-md:  16px / 1.6    ← Texte standard
body-sm:  14px / 1.5    ← Texte secondaire
body-xs:  12px / 1.4    ← Labels, hints
```

### Poids de Police

```
light:      300  ← Rarement utilisé
regular:    400  ← Texte standard
medium:     500  ← Emphasis léger
semibold:   600  ← Boutons, labels
bold:       700  ← Titres importants
extrabold:  800  ← Hero titles
```

---

## 📏 Spacing System

### Échelle de Base (4px)

```
0:   0px
1:   4px     ← Micro spacing
2:   8px     ← Très petit
3:   12px    ← Petit
4:   16px    ← Standard
5:   20px
6:   24px    ← Sections internes
8:   32px    ← Entre sections
10:  40px
12:  48px    ← Sections majeures
16:  64px
20:  80px    ← Grandes séparations
24:  96px
32:  128px   ← Hero sections
40:  160px
```

### Usage Recommandé

```
Padding bouton:       py-3 px-6  (12px 24px)
Padding card:         p-6        (24px)
Gap grid:             gap-6      (24px)
Margin entre section: my-20      (80px)
Padding hero:         py-32      (128px)
```

---

## 🎭 Composants UI

### Buttons

#### Primary Button
```tsx
<button className="btn-primary">
  Action Principale
</button>
```
```css
.btn-primary {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease-in-out;
  border: none;
  cursor: pointer;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: white;
  color: #0ea5e9;
  border: 2px solid #0ea5e9;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.2s ease-in-out;
}
.btn-secondary:hover {
  background: #0ea5e9;
  color: white;
}
```

#### Ghost Button
```css
.btn-ghost {
  background: transparent;
  color: #0ea5e9;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.2s ease-in-out;
}
.btn-ghost:hover {
  background: rgba(14, 165, 233, 0.1);
}
```

### Cards

#### Card Standard
```tsx
<div className="card-modern">
  <h3>Titre</h3>
  <p>Contenu</p>
</div>
```
```css
.card-modern {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;
}
.card-modern:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}
```

#### Glass Card
```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
}
```

### Inputs

```css
.input-modern {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 2px solid #e5e9f0;
  font-size: 0.875rem;
  transition: all 0.2s ease-in-out;
}
.input-modern:focus {
  outline: none;
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}
```

### Badges

```css
/* Success Badge */
.badge-success {
  background: #dcfce7;
  color: #166534;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Warning Badge */
.badge-warning {
  background: #fef3c7;
  color: #92400e;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}
```

---

## 🎬 Animations

### Transitions Standard

```css
/* Hover rapide */
transition: all 0.2s ease-in-out;

/* Modal/Drawer */
transition: all 0.3s ease-out;

/* Page transitions */
transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
```

### Keyframes Animations

#### Fade In Up (Cards, Sections)
```css
@keyframes fadeInUp {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}
```

#### Float (CTA, Icons)
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
.animate-float {
  animation: float 3s ease-in-out infinite;
}
```

#### Scale In (Modals)
```css
@keyframes scaleIn {
  0% { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-scale-in {
  animation: scaleIn 0.2s ease-out;
}
```

---

## 🌐 Responsive Breakpoints

```
xs:  475px   ← Petits mobiles
sm:  640px   ← Mobiles
md:  768px   ← Tablettes
lg:  1024px  ← Petits desktops
xl:  1280px  ← Desktops
2xl: 1536px  ← Grands écrans
3xl: 1680px  ← Ultra-wide
```

### Usage Mobile-First

```tsx
/* Mobile par défaut */
<div className="text-sm p-4">
  
/* Tablette et plus */
<div className="text-sm md:text-base p-4 md:p-6">
  
/* Desktop */
<div className="text-sm md:text-base lg:text-lg p-4 md:p-6 lg:p-8">
```

---

## 🎯 Patterns de Design

### Hero Section
```tsx
<section className="relative overflow-hidden bg-gradient-mesh py-32">
  <div className="container mx-auto px-4">
    <h1 className="text-display-xl font-bold text-neutral-900 mb-6">
      Votre Confort, Notre Priorité
    </h1>
    <p className="text-body-xl text-neutral-600 mb-8 max-w-2xl">
      Solutions de chauffage professionnelles pour votre maison
    </p>
    <div className="flex gap-4">
      <button className="btn-primary">Découvrir</button>
      <button className="btn-secondary">Contact</button>
    </div>
  </div>
</section>
```

### Bento Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div className="card-modern">...</div>
  <div className="card-modern md:col-span-2">...</div>
  <div className="card-modern">...</div>
</div>
```

### Product Card
```tsx
<div className="card-modern group">
  <div className="relative overflow-hidden rounded-lg mb-4">
    <img 
      src="..." 
      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
    />
    <div className="absolute top-4 right-4">
      <span className="badge-success">En stock</span>
    </div>
  </div>
  <h3 className="text-heading-sm font-semibold mb-2">Nom Produit</h3>
  <p className="text-body-sm text-neutral-500 mb-4">Description courte</p>
  <div className="flex items-center justify-between">
    <span className="text-heading-md font-bold text-primary-600">25,000 DZD</span>
    <button className="btn-primary">Ajouter</button>
  </div>
</div>
```

---

## ♿ Accessibilité

### Contraste
- Ratio minimum : **4.5:1** pour texte normal
- Ratio minimum : **3:1** pour texte large (18px+)
- Tous les textes important : **7:1** (AAA)

### Focus States
```css
.interactive:focus-visible {
  outline: 3px solid #0ea5e9;
  outline-offset: 2px;
}
```

### ARIA Labels
```tsx
<button aria-label="Ajouter au panier">
  <CartIcon />
</button>
```

---

## 🌍 Internationalisation (i18n)

### RTL Support (Arabe)
```tsx
<html dir={locale === 'ar' ? 'rtl' : 'ltr'}>
```

```css
[dir="rtl"] .ml-4 { margin-left: 0; margin-right: 1rem; }
```

---

## 📱 Micro-interactions

### Hover States
```css
.interactive {
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}
.interactive:hover {
  transform: translateY(-2px);
}
```

### Button Click
```css
.interactive:active {
  transform: translateY(0) scale(0.98);
}
```

### Cart Badge Bounce
```css
@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
.cart-badge-updated {
  animation: bounce 0.3s ease-in-out;
}
```

---

## 🎨 Dark Mode (Futur)

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #0f172a;
    --text-primary: #f1f5f9;
  }
}
```

---

## 📦 Composants Réutilisables

### Structure de Composant
```
components/
├── ui/              ← Composants atomiques
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Badge.tsx
│   └── Modal.tsx
├── common/          ← Composants communs
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Loading.tsx
└── products/        ← Composants métier
    ├── ProductCard.tsx
    └── ProductGrid.tsx
```

---

## ✅ Checklist Design

- [ ] Contraste AA minimum (4.5:1)
- [ ] Focus visible sur tous les éléments interactifs
- [ ] Responsive mobile-first testé
- [ ] Animations respectent `prefers-reduced-motion`
- [ ] i18n FR/AR/EN supporté
- [ ] RTL testé pour l'arabe
- [ ] Performance : LCP < 2.5s
- [ ] Accessibility score > 95

---

**Version:** 1.0.0  
**Date:** 18 Octobre 2025  
**Auteur:** MJ CHAUFFAGE Design Team

