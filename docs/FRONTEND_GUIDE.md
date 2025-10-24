# Guide de Développement Frontend - MJ CHAUFFAGE

## Vue d'ensemble

Le frontend de MJ CHAUFFAGE est une application Next.js 14 moderne utilisant l'App Router, TypeScript, et une architecture modulaire optimisée pour les performances et l'expérience utilisateur.

### Démarrage local & Ports
- Dev server : `npm run dev` → http://localhost:3000
- API par défaut : `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
- Redirections Admin : `/admin` et `/[locale]/admin` redirigent vers `http://localhost:3002/dashboard`
- Pour l’Admin v2 : exécuter `cd admin-v2/admin-frontend && npm run dev` (port 3002)

## Stack Technique

### Technologies Principales
- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique pour la robustesse du code
- **Tailwind CSS** - Framework CSS utilitaire avec design system personnalisé
- **NextAuth.js** - Authentification complète avec providers multiples
- **Zustand** - Gestion d'état légère et performante
- **React Query** - Gestion des données serveur et cache
- **React Hook Form** - Gestion des formulaires avec validation
- **Zod** - Validation de schémas TypeScript-first
- **next-intl** - Internationalisation (Français/Arabe)

### Outils de Développement
- **Jest & Vitest** - Tests unitaires et d'intégration
- **Playwright** - Tests end-to-end
- **Bundle Analyzer** - Analyse de la taille des bundles
- **ESLint & Prettier** - Qualité et formatage du code

## Architecture du Projet

```
frontend/src/
├── app/                    # App Router (Next.js 14)
│   ├── [locale]/          # Routes internationalisées
│   ├── api/               # API Routes
│   └── layout.tsx         # Layout racine
├── components/            # Composants réutilisables
│   ├── common/           # Composants génériques
│   ├── auth/             # Authentification
│   ├── cart/             # Panier d'achat
│   ├── products/         # Produits
│   ├── admin/            # Administration
│   └── providers/        # Providers React
├── hooks/                # Hooks personnalisés
├── services/             # Services API
├── store/                # Gestion d'état (Zustand)
├── contexts/             # Contextes React
├── lib/                  # Utilitaires et configuration
├── styles/               # Styles globaux et tokens
└── utils/                # Fonctions utilitaires
```

## Composants Principaux

### 1. Layout et Navigation

#### Header (`components/common/Header.tsx`)
```typescript
interface HeaderProps {
  locale: string
}

// Fonctionnalités :
- Navigation responsive avec menu mobile
- Changement de langue (FR/AR)
- Panier mini avec compteur d'articles
- Effet de scroll avec backdrop blur
- Support RTL pour l'arabe
```

#### Footer (`components/common/Footer.tsx`)
- Liens institutionnels
- Informations de contact
- Réseaux sociaux
- Newsletter

### 2. Authentification

#### LoginForm (`components/auth/LoginForm.tsx`)
```typescript
interface LoginFormProps {
  callbackUrl?: string
}

// Fonctionnalités :
- Connexion avec email/mot de passe
- Authentification Google
- Gestion des erreurs
- Redirection après connexion
- Validation côté client
```

#### AuthProvider (`components/providers/AuthProvider.tsx`)
- Wrapper NextAuth.js
- Gestion des sessions
- Protection des routes

### 3. E-commerce

#### ProductCard (`components/products/ProductCard.tsx`)
```typescript
interface ProductCardProps {
  product: Product
  variant?: 'default' | 'compact' | 'featured'
  showQuickView?: boolean
  showWishlist?: boolean
}

// Fonctionnalités :
- Affichage produit avec images optimisées
- Prix avec réductions
- Bouton ajout au panier
- Wishlist
- Vue rapide
- Support multilingue
```

#### AddToCartButton (`components/cart/AddToCartButton.tsx`)
```typescript
interface AddToCartButtonProps {
  product: Product
  variant?: 'primary' | 'secondary' | 'icon'
  showQuantitySelector?: boolean
}

// Fonctionnalités :
- Ajout au panier avec animation
- Sélecteur de quantité
- Validation du stock
- Tracking analytics
- États de chargement
```

## Gestion d'�tat

### 1. Cart Store (Zustand)

`	ypescript
// store/cartStore.ts
interface CartState {
  items: CartItem[]
  isOpen: boolean
  isLoading: boolean
  error: string | null
  addItem: (item: AddItemInput) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: (value?: boolean) => void
  getTotalItems: () => number
  getSubtotal: () => number
  getShippingCost: (wilaya?: string) => number
  getTotal: (wilaya?: string) => number
}
`

- Persistance via persist + createJSONStorage (localStorage)
- Clamp automatique des quantit�s (maxStock) et �tats isLoading/error
- S�lecteurs m�tier (getSubtotal, getShippingCost, getTotal)
- API unique consomm�e par le hook useCart

### 2. Hook useCart

- Pont entre React et Zustand (formatage, validation de stock, rafra�chissement serveur)
- Fournit une API stable (ddItem, updateQuantity, ormatPrice, etc.)
- Tests unitaires d�di�s : src/test/cartStore.test.ts et AddToCartButton.test.tsx

### 3. Contextes React

- R�serv�s aux domaines sp�cialis�s (wishlist, comparaison, analytics, auth)
- Le panier n'utilise plus de CartContext depuis Octobre 2025
## Services API

### 1. Client API (`services/apiClient.ts`)

```typescript
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
});

// Intercepteurs :
- Ajout automatique du token JWT
- Gestion centralisée des erreurs 401
- Nettoyage du token expiré
```

### 2. Services Spécialisés

#### AuthService (`services/authService.ts`)
```typescript
class AuthService {
  async login(email: string, password: string): Promise<User | null>
  async register(data: RegisterData): Promise<User | null>
  async logout(): Promise<void>
  async getCurrentUser(): Promise<User | null>
  async refreshToken(): Promise<string | null>
}
```

#### ProductService (`services/productService.ts`)
- Récupération des produits avec filtres
- Recherche et pagination
- Gestion du cache
- Optimisation des images

## SSR et Data Fetching

- src/lib/ssr-api.ts fournit etchSSR et etchSSRWithISR (timeouts, fallbacks, revalidation).
- Les pages produits (/[locale]/products, /[locale]/products/[id]) pr�chargent c�t� serveur puis hydratent les composants client.
- Les erreurs r�seau en build retournent des structures vides, �vitant les ECONNREFUSED fatals.
- Pensez � utiliser 
evalidate sur les pages Next.js lorsque l'ISR est n�cessaire.
## Hooks Personnalisés

### 1. Analytics (`hooks/useAnalytics.ts`)

```typescript
export function usePageTracking() {
  // Tracking automatique des pages vues
}

export function useEcommerceTracking() {
  return {
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackBeginCheckout,
    trackPurchase,
    trackCategoryView,
    trackSearch
  }
}
```

### 2. Performance (`hooks/usePerformance.ts`)
- Mesure des Core Web Vitals
- Monitoring des performances
- Optimisation automatique

### 3. Language (`hooks/useLanguage.ts`)
- Gestion de l'internationalisation
- Changement de langue dynamique
- Support RTL

## Internationalisation

### Configuration (`lib/i18n.ts`)

```typescript
export const locales = ['fr', 'ar'] as const
export const defaultLocale = 'fr'

// Fonctionnalités :
- Détection automatique de la langue
- Routing par locale
- Support RTL pour l'arabe
- Dictionnaires JSON séparés
```

### Dictionnaires
- `lib/dictionaries/fr.json` - Traductions françaises
- `lib/dictionaries/ar.json` - Traductions arabes

## Styling et Design System

### 1. Tailwind Configuration (`tailwind.config.js`)

```typescript
// Couleurs de marque MJ CHAUFFAGE
colors: {
  primary: {
    500: '#0ea5e9', // Bleu principal
    // ... autres nuances
  },
  accent: {
    500: '#f3761a', // Orange accent
    // ... autres nuances
  },
  // Système de couleurs neutres étendu
}

// Composants personnalisés
components: {
  'btn-primary': 'bg-primary-500 hover:bg-primary-600 text-white',
  'card': 'bg-white rounded-xl shadow-card border border-neutral-200',
  // ... autres composants
}
```

### 2. Design Tokens (`styles/design-tokens.ts`)
- Espacements cohérents
- Typographie responsive
- Animations et transitions
- Breakpoints personnalisés

## Optimisations de Performance

### 1. Images (`utils/imageOptimization.ts`)
```typescript
// Optimisation automatique :
- Format WebP/AVIF
- Lazy loading
- Responsive images
- Placeholder blur
- Compression intelligente
```

### 2. Code Splitting
```typescript
// Chargement dynamique des composants
const DynamicComponent = dynamic(() => import('./Component'), {
  loading: () => <Skeleton />,
  ssr: false
})
```

### 3. Bundle Optimization
- Tree shaking automatique
- Compression Gzip/Brotli
- Analyse des bundles
- Lazy loading des routes

## Tests

### 1. Tests Unitaires (Jest/Vitest)
```bash
npm run test              # Tests unitaires
npm run test:watch        # Mode watch
npm run test:coverage     # Couverture de code
```

### 2. Tests d'Intégration
```typescript
// test/cart-integration.test.ts
describe('Cart Integration', () => {
  test('should add product to cart', async () => {
    // Test d'ajout au panier
  })
})
```

### 3. Tests E2E (Playwright)
```bash
npm run test:e2e          # Tests end-to-end
npm run test:e2e:ui       # Interface graphique
```

## Sécurité

### 1. Authentification
- JWT avec refresh tokens
- Protection CSRF
- Validation côté client et serveur
- Chiffrement des données sensibles

### 2. Headers de Sécurité
```typescript
// next.config.js
headers: [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  // ... autres headers
]
```

## Déploiement

### 1. Build de Production
```bash
npm run build             # Build optimisé
npm run start             # Serveur de production
npm run analyze           # Analyse des bundles
```

### 2. Variables d'Environnement
```env
NEXT_PUBLIC_API_URL=https://api.mjchauffage.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://mjchauffage.com
```

### 3. Optimisations de Production
- Minification automatique
- Compression des assets
- CDN pour les images
- Cache des API routes

## Bonnes Pratiques

### 1. Structure des Composants
```typescript
// Ordre recommandé :
1. Imports externes
2. Imports internes
3. Types/Interfaces
4. Composant principal
5. Styles (si nécessaire)
6. Export par défaut
```

### 2. Gestion des États
- Utiliser Zustand pour l'état global
- useState pour l'état local
- React Query pour les données serveur
- Éviter la prop drilling

### 3. Performance
- Utiliser React.memo pour les composants coûteux
- Optimiser les re-renders avec useCallback/useMemo
- Lazy loading pour les composants non critiques
- Préchargement des données critiques

### 4. Accessibilité
- Attributs ARIA appropriés
- Navigation au clavier
- Contraste des couleurs
- Support des lecteurs d'écran

## Monitoring et Analytics

### 1. Performance Monitoring
- Core Web Vitals
- Temps de chargement
- Erreurs JavaScript
- Métriques utilisateur

### 2. Business Analytics
- Tracking des conversions
- Analyse du comportement utilisateur
- A/B testing
- Heatmaps

## Maintenance

### 1. Mises à Jour
```bash
npm audit                 # Audit de sécurité
npm update               # Mise à jour des dépendances
npm run lint             # Vérification du code
```

### 2. Monitoring
- Logs d'erreurs centralisés
- Alertes de performance
- Monitoring de l'uptime
- Métriques business

## Support et Documentation

### Ressources
- **Documentation Next.js** : https://nextjs.org/docs
- **Tailwind CSS** : https://tailwindcss.com/docs
- **TypeScript** : https://www.typescriptlang.org/docs

### Contact Technique
- **Email** : dev@mjchauffage.com
- **Documentation interne** : Confluence
- **Issues** : GitHub Issues

---

*Guide mis à jour le : Janvier 2025*
*Version : 2.0.0*## Playwright E2E (Current Usage & Tips)

- Install browsers
  - `npx playwright install webkit`

- How tests start servers
  - Frontend: `npm run dev` (http://localhost:3000)
  - Backend: `npx tsx src/server.ts` in `../backend` (http://localhost:3001/health)
  - Both are configured in `frontend/playwright.config.ts` under `webServer`.

- Run tests
  - WebKit only: `npx playwright test --project=webkit`
  - Mobile Safari: `npx playwright test --project="Mobile Safari"`

- Writing stable tests (Next.js dev)
  - Prefer `getByLabel` / `getByRole` over brittle `data-testid`.
  - Use `page.goto(url, { waitUntil: 'domcontentloaded' })`.
  - Wait for visible UI (e.g., headings, buttons) instead of `networkidle`.

- Example (admin login)
  - `await page.goto('/admin/login', { waitUntil: 'domcontentloaded' })`
  - `await page.getByLabel(/Email/i).fill('admin@mjchauffage.com')`
  - `await page.getByLabel(/Mot de passe|Password/i).fill('Admin123!')`
  - `await page.getByRole('button', { name: /Se connecter|Sign in/i }).click()`
