# 🎨 MJ CHAUFFAGE - DESIGN SYSTEM

## Brand Identity

### Company Profile
- **Name**: MJ Chauffage
- **Industry**: Heating, Plumbing & HVAC Parts E-commerce
- **Target Audience**: 
  - B2C: Homeowners needing heating repairs
  - B2B: Professional plumbers & technicians
- **Key Values**: Trust, Reliability, Technical Expertise, Fast Service

---

## Color Palette

### Primary Colors
```css
--primary-blue: #0047AB;      /* Trust, Professional */
--primary-dark: #002855;      /* Headers, Important CTAs */
--primary-light: #4A90E2;     /* Links, Hover states */
```

### Secondary Colors
```css
--secondary-orange: #FF6B35;  /* CTAs, Sale badges, Urgency */
--secondary-warm: #FF8F5E;    /* Hover, Highlights */
```

### Neutral Colors
```css
--gray-900: #1A1A1A;         /* Primary text */
--gray-700: #4A4A4A;         /* Secondary text */
--gray-500: #9E9E9E;         /* Muted text */
--gray-300: #E0E0E0;         /* Borders */
--gray-100: #F5F5F5;         /* Backgrounds */
--white: #FFFFFF;
```

### Semantic Colors
```css
--success: #4CAF50;          /* In stock, Success messages */
--warning: #FFC107;          /* Low stock warnings */
--error: #F44336;            /* Out of stock, Errors */
--info: #2196F3;             /* Info messages */
```

---

## Typography

### Font Families
```css
--font-primary: 'Inter', -apple-system, sans-serif;     /* Body text */
--font-heading: 'Poppins', 'Inter', sans-serif;         /* Headings */
--font-mono: 'Roboto Mono', monospace;                  /* SKU, Codes */
```

### Font Sizes
```css
--text-xs: 0.75rem;    /* 12px - Labels */
--text-sm: 0.875rem;   /* 14px - Small text */
--text-base: 1rem;     /* 16px - Body */
--text-lg: 1.125rem;   /* 18px - Large body */
--text-xl: 1.25rem;    /* 20px - Small headings */
--text-2xl: 1.5rem;    /* 24px - H3 */
--text-3xl: 1.875rem;  /* 30px - H2 */
--text-4xl: 2.25rem;   /* 36px - H1 */
--text-5xl: 3rem;      /* 48px - Hero */
```

---

## Layout Components

### 1. Header / Navigation
**Desktop:**
```
┌─────────────────────────────────────────────────────────┐
│ [LOGO MJ]  Produits ▼  Services  Contact  [🔍 Search]  │
│                                            🛒 Cart  👤   │
└─────────────────────────────────────────────────────────┘
│ Chaudières  Radiateurs  Pièces  Vannes  Circulateurs   │
└─────────────────────────────────────────────────────────┘
```

**Mobile:**
```
┌──────────────────────┐
│ ☰  [LOGO]  🔍  🛒    │
└──────────────────────┘
```

### 2. Product Card
```
┌───────────────────┐
│                   │
│   [Image]         │
│                   │
├───────────────────┤
│ Brand Name        │
│ Product Name      │
│                   │
│ ⭐⭐⭐⭐⭐ (45)     │
│                   │
│ 89,99 € TTC       │
│ ✓ En stock        │
│                   │
│ [+ Ajouter]       │
└───────────────────┘
```

### 3. Product Detail Page
```
┌─────────────────────────────────────────────┐
│ Home > Catégorie > Produit                  │
├──────────────────┬──────────────────────────┤
│                  │ Brand Name               │
│                  │                          │
│  [Main Image]    │ Product Full Name        │
│                  │                          │
│  [thumb][thumb]  │ ⭐⭐⭐⭐⭐ (45 avis)       │
│  [thumb][thumb]  │                          │
│                  │ SKU: ABC-123             │
├──────────────────┤                          │
│                  │ 89,99 € TTC             │
│                  │ 75,62 € HT              │
│                  │                          │
│                  │ ✓ En stock (12)          │
│                  │ 📦 Livraison 24-48h      │
│                  │                          │
│                  │ Quantité: [- 1 +]        │
│                  │                          │
│                  │ [🛒 Ajouter au panier]   │
│                  │ [♥ Liste de souhaits]    │
└──────────────────┴──────────────────────────┘
│                                              │
│ 📋 Description                               │
│ 🔧 Caractéristiques Techniques              │
│ 🔄 Compatibilité                             │
│ 💬 Avis Clients                              │
└──────────────────────────────────────────────┘
```

### 4. Shopping Cart
```
┌─────────────────────────────────────────────┐
│ 🛒 Votre Panier (3 articles)                │
├────────────────────────────────────┬────────┤
│ [img] Product 1                    │ 89,99€ │
│       Quantité: [- 2 +]    [🗑️]   │        │
├────────────────────────────────────┼────────┤
│ [img] Product 2                    │ 45,50€ │
│       Quantité: [- 1 +]    [🗑️]   │        │
├────────────────────────────────────┼────────┤
│                          Sous-total│ 225,48€│
│                          Livraison │   9,90€│
│                          TVA (19%) │  42,84€│
├────────────────────────────────────┼────────┤
│                          TOTAL TTC │ 278,22€│
└────────────────────────────────────┴────────┘
│ [← Continuer achats]  [Commander →]         │
└─────────────────────────────────────────────┘
```

### 5. Homepage Hero
```
┌─────────────────────────────────────────────┐
│                                              │
│   Pièces de Chauffage                       │
│   Livraison Express 24h                     │
│                                              │
│   Plus de 10,000 références en stock        │
│                                              │
│   [Voir le catalogue]                       │
│                                              │
│   [Background: Modern heating system image] │
└─────────────────────────────────────────────┘
```

---

## UI Components Library

### Buttons

#### Primary Button
```css
background: var(--primary-blue)
color: white
padding: 12px 24px
border-radius: 8px
font-weight: 600
hover: background: var(--primary-dark)
```

#### Secondary Button
```css
background: var(--secondary-orange)
color: white
padding: 12px 24px
border-radius: 8px
font-weight: 600
hover: background: var(--secondary-warm)
```

#### Ghost Button
```css
background: transparent
border: 2px solid var(--primary-blue)
color: var(--primary-blue)
padding: 10px 22px
border-radius: 8px
hover: background: var(--primary-blue), color: white
```

### Input Fields
```css
border: 1px solid var(--gray-300)
padding: 12px 16px
border-radius: 6px
font-size: var(--text-base)
focus: border-color: var(--primary-blue), outline: 2px solid rgba(0,71,171,0.1)
```

### Cards
```css
background: white
border: 1px solid var(--gray-300)
border-radius: 12px
padding: 20px
box-shadow: 0 2px 8px rgba(0,0,0,0.05)
hover: box-shadow: 0 4px 16px rgba(0,0,0,0.1)
transition: all 0.3s ease
```

### Badges

**In Stock**
```css
background: var(--success)
color: white
padding: 4px 8px
border-radius: 4px
font-size: var(--text-xs)
```

**Low Stock**
```css
background: var(--warning)
color: var(--gray-900)
```

**Out of Stock**
```css
background: var(--error)
color: white
```

**Sale**
```css
background: var(--secondary-orange)
color: white
font-weight: bold
```

---

## Page Layouts

### 1. Homepage
1. **Hero Section** - Main banner with CTA
2. **Featured Categories** - 6-8 category cards with images
3. **Featured Products** - Carousel of best sellers
4. **Why Choose Us** - Trust signals (delivery, warranty, support)
5. **Brands** - Logo carousel of manufacturers
6. **Newsletter** - Email signup
7. **Footer** - Links, contact, social

### 2. Product Listing
1. **Breadcrumbs** - Navigation path
2. **Page Header** - Category name, count
3. **Filters Sidebar** - Category, brand, price, stock, features
4. **Sort Dropdown** - Price, name, newest, best sellers
5. **Product Grid** - 3-4 columns desktop, 2 mobile
6. **Pagination** - Load more or numbered pages

### 3. Product Detail
1. **Breadcrumbs**
2. **Product Gallery** - Main image + thumbnails
3. **Product Info** - Name, SKU, price, stock, rating
4. **Add to Cart** - Quantity selector, CTA
5. **Tabs** - Description, specs, compatibility, reviews
6. **Related Products** - Similar items carousel
7. **Recently Viewed** - User history

### 4. Cart & Checkout
1. **Cart Summary** - Items list, quantities
2. **Shipping Form** - Address fields
3. **Payment Method** - Selection
4. **Order Review** - Final confirmation
5. **Success Page** - Order confirmation, tracking

### 5. Admin Panel
1. **Dashboard** - Stats, charts
2. **Product Management** - List, create, edit, delete
3. **Order Management** - List, update status
4. **Customer List** - View customers
5. **Analytics** - Sales, traffic reports

---

## Responsive Breakpoints

```css
--mobile: 320px - 768px
--tablet: 769px - 1024px
--desktop: 1025px - 1440px
--wide: 1441px+
```

### Grid System
```css
--grid-columns-mobile: 2
--grid-columns-tablet: 3
--grid-columns-desktop: 4
--grid-gap: 24px
```

---

## Accessibility

### WCAG 2.1 AA Compliance
- ✅ Color contrast ratio ≥ 4.5:1 for text
- ✅ Focus indicators visible
- ✅ Keyboard navigation support
- ✅ Alt text for all images
- ✅ ARIA labels where needed
- ✅ Form labels and error messages

---

## Animation & Interactions

### Transitions
```css
--transition-fast: 0.15s ease
--transition-base: 0.3s ease
--transition-slow: 0.5s ease
```

### Hover Effects
- **Cards**: Lift + shadow increase
- **Buttons**: Background color darkens
- **Images**: Slight zoom (1.05x)
- **Links**: Underline slide-in

### Loading States
- **Skeleton loaders** for images/cards
- **Spinner** for page transitions
- **Progress bar** for uploads

---

## Icons & Images

### Icon Library
- **Lucide Icons** or **Hero Icons** (consistent, modern)
- Icons for: Cart, Search, User, Heart, Trash, Edit, Check, X, etc.

### Image Guidelines
- **Product images**: 800x800px, white background, JPG/WebP
- **Category images**: 1200x600px, contextual backgrounds
- **Hero images**: 1920x800px, high quality
- **Thumbnails**: 200x200px
- **Format**: WebP preferred, JPG fallback

---

## Status: ✅ DESIGN SYSTEM READY

Next step: Implement components in React/Next.js with Tailwind CSS
