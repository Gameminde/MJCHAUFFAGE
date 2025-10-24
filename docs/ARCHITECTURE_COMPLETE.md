# 🏗️ ARCHITECTURE COMPLÈTE - MJ CHAUFFAGE

## 📋 TABLE DES MATIÈRES

1. [Vue d'Ensemble de l'Architecture](#-vue-densemble-de-larchitecture)
2. [Structure Exacte de l'Architecture](#-structure-exacte-de-larchitecture)
3. [Routes Disponibles (API Endpoints)](#-routes-disponibles-api-endpoints)
4. [Logique Métier Détaillée](#-logique-métier-détaillée)
5. [Flux de Traitement (Workflows)](#-flux-de-traitement-workflows)
6. [Schémas de Données](#-schémas-de-données)
7. [Dépendances entre Composants](#-dépendances-entre-composants)
8. [Sécurité et Performance](#-sécurité-et-performance)
9. [Déploiement et Monitoring](#-déploiement-et-monitoring)

---

## 🌐 Vue d'Ensemble de l'Architecture

MJ Chauffage est une plateforme e-commerce B2C spécialisée dans les pièces détachées de chauffage pour le marché algérien. L'architecture suit un pattern **microservices modulaire** avec séparation claire des responsabilités.

### Stack Technique Complète

| Composant | Technologies | Port | Description |
|-----------|--------------|------|-------------|
| **Frontend Public** | Next.js 14, TypeScript, Tailwind CSS | 3000 | Interface clients B2C |
| **Frontend Admin** | Next.js 15, TypeScript, Shadcn/ui | 3005 | Dashboard administrateur |
| **Backend API** | Express.js, TypeScript, Prisma | 3001 | API principale |
| **Admin API** | NestJS, TypeScript, Prisma | 3003 | API administration |
| **Base de Données** | PostgreSQL 14+ | 5432 | Base de données principale |
| **Cache** | Redis | 6379 | Cache sessions et données |
| **Load Balancer** | Nginx | 80/443 | Répartition de charge |
| **Storage** | AWS S3/Cloudinary | - | Stockage fichiers |
| **Email** | Resend/Nodemailer | - | Service d'emails |
| **Payments** | Stripe | - | Paiements en ligne |

### Diagramme d'Architecture Globale

```
┌─────────────────────────────────────────────────────────────────┐
│                        UTILISATEURS                             │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Clients B2C   │  Administrateurs │      Techniciens           │
│  (Port 3000)    │   (Port 3005)    │                            │
└─────────┬───────┴─────────┬───────┴─────────────────────────────┘
          │                 │
          ▼                 ▼
┌─────────────────┐ ┌─────────────────┐
│  FRONTEND       │ │  ADMIN FRONTEND │
│  Next.js 14     │ │  Next.js 15     │
│  (Port 3000)    │ │  (Port 3005)    │
└─────────┬───────┘ └─────────┬───────┘
          │                   │
          └─────────┬─────────┘
                    │
                    ▼
          ┌─────────────────┐
          │   LOAD BALANCER │
          │   (Nginx)       │
          └─────────┬───────┘
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
┌─────────────────┐ ┌─────────────────┐
│  BACKEND API    │ │  ADMIN API      │
│  Express.js     │ │  NestJS         │
│  (Port 3001)    │ │  (Port 3003)    │
└─────────┬───────┘ └─────────┬───────┘
          │                   │
          └─────────┬─────────┘
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
┌─────────────────┐ ┌─────────────────┐
│   PostgreSQL    │ │     Redis       │
│  (Port 5432)    │ │  (Port 6379)    │
│  Base Données   │ │     Cache       │
└─────────────────┘ └─────────────────┘
```

---

## 🏛️ Structure Exacte de l'Architecture

### Structure des Dossiers - Backend API

```
backend/
├── src/
│   ├── config/                 # Configuration centralisée
│   │   ├── database.ts         # Configuration Prisma
│   │   ├── environment.ts      # Variables d'environnement
│   │   ├── redis.ts           # Configuration Redis
│   │   ├── security.ts        # Paramètres sécurité
│   │   ├── storage.ts         # Configuration stockage
│   │   └── email.ts           # Configuration email
│   ├── controllers/           # Contrôleurs REST
│   │   ├── authController.ts   # Authentification
│   │   ├── productController.ts # Produits
│   │   ├── orderController.ts  # Commandes
│   │   ├── categoryController.ts # Catégories
│   │   ├── userController.ts   # Utilisateurs
│   │   ├── analyticsController.ts # Analytics
│   │   ├── paymentController.ts # Paiements
│   │   └── uploadController.ts # Upload fichiers
│   ├── services/             # Logique métier
│   │   ├── authService.ts    # Service authentification
│   │   ├── productService.ts # Service produits
│   │   ├── orderService.ts   # Service commandes
│   │   ├── emailService.ts   # Service emails
│   │   ├── paymentService.ts # Service paiements
│   │   ├── analyticsService.ts # Service analytics
│   │   ├── storageService.ts # Service stockage
│   │   └── cacheService.ts   # Service cache
│   ├── middleware/           # Middlewares Express
│   │   ├── auth.ts          # Authentification JWT
│   │   ├── security.ts      # Sécurité (Helmet, CORS)
│   │   ├── validation.ts    # Validation des données
│   │   ├── errorHandler.ts  # Gestion d'erreurs
│   │   ├── rateLimit.ts     # Rate limiting
│   │   ├── logging.ts       # Logging des requêtes
│   │   └── sanitize.ts      # Sanitisation inputs
│   ├── routes/              # Définition des routes
│   │   ├── auth.ts          # Routes authentification
│   │   ├── products.ts      # Routes produits
│   │   ├── orders.ts        # Routes commandes
│   │   ├── categories.ts   # Routes catégories
│   │   ├── users.ts        # Routes utilisateurs
│   │   ├── analytics.ts    # Routes analytics
│   │   ├── payments.ts     # Routes paiements
│   │   └── uploads.ts      # Routes uploads
│   ├── lib/                 # Utilitaires
│   │   ├── database.ts      # Client Prisma
│   │   ├── redis.ts        # Client Redis
│   │   ├── logger.ts       # Logger personnalisé
│   │   └── utils.ts        # Fonctions utilitaires
│   ├── types/               # Types TypeScript
│   │   ├── express.d.ts     # Extensions Express
│   │   ├── prisma.d.ts     # Types Prisma étendus
│   │   └── custom.d.ts     # Types personnalisés
│   ├── utils/               # Fonctions utilitaires
│   │   ├── validators.ts    # Validateurs de données
│   │   ├── formatters.ts    # Formateurs de données
│   │   ├── generators.ts    # Générateurs (IDs, tokens)
│   │   └── encryptors.ts   # Chiffrement/déchiffrement
│   ├── scripts/             # Scripts utilitaires
│   │   ├── seed.ts          # Peuplement base de données
│   │   ├── backup.ts        # Sauvegarde base de données
│   │   └── maintenance.ts   # Maintenance système
│   └── server.ts           # Point d'entrée serveur
├── prisma/
│   ├── schema.prisma        # Schéma de base de données
│   ├── migrations/         # Migrations de base de données
│   └── seed.ts             # Données de test
├── tests/
│   ├── unit/               # Tests unitaires
│   ├── integration/        # Tests d'intégration
│   └── e2e/                # Tests end-to-end
├── Dockerfile              # Configuration Docker
├── docker-compose.yml      # Composition Docker
├── package.json           # Dépendances Node.js
├── tsconfig.json          # Configuration TypeScript
├── .env.example           # Variables d'environnement
└── README.md              # Documentation
```

### Structure des Dossiers - Frontend Public

```
frontend/
├── src/
│   ├── app/                    # App Router Next.js 14
│   │   ├── (auth)/            # Groupe de routes auth
│   │   │   ├── login/         # Page de connexion
│   │   │   │   ├── page.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── error.tsx
│   │   │   └── register/      # Page d'inscription
│   │   │       ├── page.tsx
│   │   │       ├── loading.tsx
│   │   │       └── error.tsx
│   │   ├── admin/             # Dashboard admin
│   │   │   ├── analytics/     # Analytics
│   │   │   ├── products/      # Gestion produits
│   │   │   ├── orders/       # Gestion commandes
│   │   │   ├── customers/    # Gestion clients
│   │   │   ├── categories/   # Gestion catégories
│   │   │   └── settings/     # Paramètres
│   │   ├── products/         # Catalogue produits
│   │   │   ├── [id]/         # Détail produit
│   │   │   │   ├── page.tsx
│   │   │   │   └── loading.tsx
│   │   │   └── category/[slug]/ # Produits par catégorie
│   │   │       ├── page.tsx
│   │   │       └── loading.tsx
│   │   ├── cart/              # Panier
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── checkout/          # Processus de commande
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── success/       # Confirmation commande
│   │   ├── account/           # Compte client
│   │   │   ├── profile/      # Profil
│   │   │   ├── orders/       # Historique commandes
│   │   │   ├── addresses/    # Adresses
│   │   │   └── security/     # Sécurité compte
│   │   ├── layout.tsx         # Layout global
│   │   ├── page.tsx           # Page d'accueil
│   │   ├── loading.tsx        # Loading global
│   │   ├── error.tsx          # Erreur globale
│   │   ├── not-found.tsx      # Page 404
│   │   └── globals.css        # Styles globaux
│   ├── components/            # Composants réutilisables
│   │   ├── common/           # Composants génériques
│   │   │   ├── Button/       # Bouton
│   │   │   ├── Modal/        # Modal
│   │   │   ├── Form/         # Formulaires
│   │   │   ├── Input/        # Champs de saisie
│   │   │   ├── Select/       # Sélecteurs
│   │   │   ├── Table/        # Tableaux
│   │   │   ├── Card/         # Cartes
│   │   │   ├── Loading/      # Indicateurs de chargement
│   │   │   ├── Error/        # Composants d'erreur
│   │   │   └── Layout/       # Composants de layout
│   │   ├── products/         # Composants produits
│   │   │   ├── ProductCard/  # Carte produit
│   │   │   ├── ProductGrid/  # Grille produits
│   │   │   ├── ProductFilter/ # Filtres produits
│   │   │   ├── ProductImage/ # Images produits
│   │   │   ├── ProductDetails/ # Détails produit
│   │   │   ├── ProductReviews/ # Avis produits
│   │   │   └── ProductCarousel/ # Carousel produits
│   │   ├── cart/             # Composants panier
│   │   │   ├── CartItem/     # Élément panier
│   │   │   ├── CartSummary/  # Récapitulatif panier
│   │   │   ├── CartButton/   # Bouton panier
│   │   │   └── CartDrawer/   # Tiroir panier
│   │   ├── checkout/         # Composants checkout
│   │   │   ├── CheckoutForm/ # Formulaire checkout
│   │   │   ├── CheckoutSteps/ # Étapes checkout
│   │   │   ├── PaymentForm/  # Formulaire paiement
│   │   │   ├── AddressForm/  # Formulaire adresse
│   │   │   └── OrderSummary/ # Récapitulatif commande
│   │   ├── auth/             # Composants authentification
│   │   │   ├── LoginForm/    # Formulaire connexion
│   │   │   ├── RegisterForm/ # Formulaire inscription
│   │   │   ├── AuthModal/    # Modal authentification
│   │   │   └── ProtectedRoute/ # Route protégée
│   │   ├── admin/            # Composants admin
│   │   │   ├── AdminLayout/  # Layout admin
│   │   │   ├── AdminSidebar/ # Sidebar admin
│   │   │   ├── AdminHeader/  # Header admin
│   │   │   ├── DataTable/    # Tableau de données
│   │   │   ├── Chart/        # Graphiques
│   │   │   ├── DashboardCard/ # Cartes dashboard
│   │   │   ├── ProductForm/  # Formulaire produit
│   │   │   ├── OrderDetails/ # Détails commande
│   │   │   └── UserManager/  # Gestion utilisateurs
│   │   ├── navigation/       # Composants navigation
│   │   │   ├── Header/       # Header site
│   │   │   ├── Footer/       # Footer site
│   │   │   ├── Navbar/       # Barre de navigation
│   │   │   ├── Sidebar/      # Sidebar
│   │   │   ├── Breadcrumb/   # Fil d'Ariane
│   │   │   ├── Menu/         # Menus
│   │   │   └── MobileMenu/   # Menu mobile
│   │   ├── ui/               # Composants UI
│   │   │   ├── Badge/        # Badges
│   │   │   ├── Toast/        # Notifications
│   │   │   ├── Tooltip/      # Infobulles
│   │   │   ├── Accordion/    # Accordéons
│   │   │   ├── Tabs/         # Onglets
│   │   │   ├── Dialog/       # Dialogues
│   │   │   ├── Popover/      # Popovers
│   │   │   └── Dropdown/     # Menus déroulants
│   │   └── marketing/        # Composants marketing
│   │       ├── Hero/         # Section hero
│   │       ├── Features/     # Section fonctionnalités
│   │       ├── Testimonials/ # Témoignages
│   │       ├── Newsletter/   # Newsletter
│   │       ├── PromoBanner/  # Bannière promo
│   │       └── Countdown/    # Compte à rebours
│   ├── hooks/                # Custom hooks
│   │   ├── useAuth.ts        # Hook authentification
│   │   ├── useCart.ts        # Hook panier
│   │   ├── useProducts.ts    # Hook produits
│   │   ├── useOrders.ts      # Hook commandes
│   │   ├── useCategories.ts  # Hook catégories
│   │   ├── useSearch.ts      # Hook recherche
│   │   ├── useAnalytics.ts   # Hook analytics
│   │   ├── useLocalStorage.ts # Hook localStorage
│   │   ├── useDebounce.ts    # Hook debounce
│   │   ├── useIntersection.ts # Hook intersection
│   │   └── useMediaQuery.ts  # Hook media queries
│   ├── services/             # Services API
│   │   ├── apiClient.ts      # Client Axios configuré
│   │   ├── authService.ts    # Service authentification
│   │   ├── productService.ts # Service produits
│   │   ├── orderService.ts   # Service commandes
│   │   ├── categoryService.ts # Service catégories
│   │   ├── userService.ts    # Service utilisateurs
│   │   ├── paymentService.ts # Service paiements
│   │   ├── analyticsService.ts # Service analytics
│   │   ├── emailService.ts   # Service emails
│   │   └── storageService.ts # Service stockage
│   ├── store/                # State management
│   │   ├── authStore.ts      # Store authentification
│   │   ├── cartStore.ts      # Store panier
│   │   ├── productStore.ts   # Store produits
│   │   ├── orderStore.ts     # Store commandes
│   │   ├── categoryStore.ts  # Store catégories
│   │   ├── uiStore.ts        # Store interface
│   │   ├── notificationStore.ts # Store notifications
│   │   └── createStore.ts    # Créateur de stores
│   ├── lib/                  # Utilitaires
│   │   ├── auth.ts           # Configuration NextAuth
│   │   ├── utils.ts          # Fonctions utilitaires
│   │   ├── validations.ts    # Schémas Zod
│   │   ├── constants.ts      # Constantes
│   │   ├── formatters.ts     # Formateurs
│   │   ├── cookies.ts        # Gestion cookies
│   │   ├── storage.ts        # Gestion stockage
│   │   └── errors.ts         # Gestion erreurs
│   ├── types/                # Types TypeScript
│   │   ├── index.ts          # Export types
│   │   ├── auth.ts           # Types authentification
│   │   ├── product.ts        # Types produits
│   │   ├── order.ts          # Types commandes
│   │   ├── user.ts           # Types utilisateurs
│   │   ├── cart.ts           # Types panier
│   │   ├── category.ts       # Types catégories
│   │   ├── payment.ts        # Types paiements
│   │   ├── api.ts            # Types API
│   │   └── ui.ts             # Types interface
│   ├── styles/               # Styles
│   │   ├── globals.css       # Styles globaux
│   │   ├── components.css    # Styles composants
│   │   ├── themes/           # Thèmes
│   │   │   ├── light.css     # Thème clair
│   │   │   └── dark.css      # Thème sombre
│   │   ├── animations.css    # Animations
│   │   └── utilities.css     # Utilitaires
│   ├── utils/                # Utilitaires
│   │   ├── helpers.ts        # Fonctions helpers
│   │   ├── formatters.ts     # Formateurs données
│   │   ├── validators.ts     # Validateurs
│   │   ├── generators.ts     # Générateurs
│   │   ├── calculations.ts   # Calculs
│   │   └── parsers.ts        # Parseurs
│   ├── constants/            # Constantes
│   │   ├── routes.ts         # Routes applicatives
│   │   ├── api.ts           # Endpoints API
│   │   ├── products.ts      # Constantes produits
│   │   ├── orders.ts        # Constantes commandes
│   │   ├── payments.ts      # Constantes paiements
│   │   ├── categories.ts    # Constantes catégories
│   │   └── errors.ts        # Codes d'erreur
│   ├── config/               # Configuration
│   │   ├── app.ts           # Configuration app
│   │   ├── seo.ts           # Configuration SEO
│   │   ├── analytics.ts     # Configuration analytics
│   │   ├── payments.ts      # Configuration paiements
│   │   └── storage.ts       # Configuration stockage
│   └── middleware.ts         # Middleware Next.js
├── public/                   # Fichiers publics
│   ├── images/              # Images
│   │   ├── products/        # Images produits
│   │   ├── categories/     # Images catégories
│   │   ├── banners/        # Bannières
│   │   ├── icons/          # Icônes
│   │   ├── logos/          # Logos
│   │   └── avatars/        # Avatars
│   ├── fonts/              # Polices
│   ├── favicon.ico          # Favicon
│   ├── robots.txt           # Robots.txt
│   ├── manifest.json        # PWA manifest
│   └── sw.js                # Service Worker
├── messages/                # Internationalisation
│   ├── en.json             # Anglais
│   ├── fr.json             # Français
│   └── ar.json             # Arabe
├── tests/                   # Tests
│   ├── unit/               # Tests unitaires
│   ├── integration/        # Tests intégration
│   ├── e2e/                # Tests end-to-end
│   └── __mocks__/          # Mocks
├── Dockerfile              # Configuration Docker
├── docker-compose.yml      # Composition Docker
├── next.config.js         # Configuration Next.js
├── tailwind.config.js      # Configuration Tailwind
├── postcss.config.js       # Configuration PostCSS
├── tsconfig.json           # Configuration TypeScript
├── package.json            # Dépendances Node.js
├── .env.local              # Variables d'environnement
└── README.md               # Documentation
```

### Structure des Dossiers - Admin API (NestJS)

```
admin-backend/
├── src/
│   ├── main.ts              # Point d'entrée
│   ├── app.module.ts        # Module racine
│   ├── modules/             # Modules fonctionnels
│   │   ├── auth/            # Module authentification
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/   # Stratégies auth
│   │   │   ├── guards/       # Guards auth
│   │   │   ├── decorators/   # Décorateurs auth
│   │   │   └── dto/          # DTO auth
│   │   ├── users/           # Module utilisateurs
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── entities/     # Entités users
│   │   │   └── dto/          # DTO users
│   │   ├── products/        # Module produits
│   │   │   ├── products.module.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   ├── entities/     # Entités produits
│   │   │   └── dto/          # DTO produits
│   │   ├── orders/          # Module commandes
│   │   │   ├── orders.module.ts
│   │   │   ├── orders.controller.ts
│   │   │   ├── orders.service.ts
│   │   │   ├── entities/     # Entités commandes
│   │   │   └── dto/          # DTO commandes
│   │   ├── categories/      # Module catégories
│   │   │   ├── categories.module.ts
│   │   │   ├── categories.controller.ts
│   │   │   ├── categories.service.ts
│   │   │   ├── entities/     # Entités catégories
│   │   │   └── dto/          # DTO catégories
│   │   ├── analytics/       # Module analytics
│   │   │   ├── analytics.module.ts
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── entities/     # Entités analytics
│   │   │   └── dto/          # DTO analytics
│   │   ├── settings/        # Module paramètres
│   │   │   ├── settings.module.ts
│   │   │   ├── settings.controller.ts
│   │   │   ├── settings.service.ts
│   │   │   ├── entities/     # Entités settings
│   │   │   └── dto/          # DTO settings
│   │   └── shared/          # Module partagé
│   │       ├── shared.module.ts
│   │       ├── database/     # Database shared
│   │       ├── filters/      # Filtres shared
│   │       ├── interceptors/ # Intercepteurs shared
│   │       ├── pipes/        # Pipes shared
│   │       ├── guards/       # Guards shared
│   │       └── decorators/   # Décorateurs shared
│   ├── common/              # Commun
│   │   ├── filters/         # Filtres globaux
│   │   ├── interceptors/     # Intercepteurs globaux
│   │   ├── pipes/           # Pipes globaux
│   │   ├── guards/          # Guards globaux
│   │   ├── decorators/      # Décorateurs globaux
│   │   ├── middleware/      # Middleware globaux
│   │   └── constants/       # Constantes globales
│   ├── config/              # Configuration
│   │   ├── app.config.ts    # Configuration app
│   │   ├── database.config.ts # Configuration database
│   │   ├── auth.config.ts   # Configuration auth
│   │   ├── storage.config.ts # Configuration storage
│   │   ├── email.config.ts  # Configuration email
│   │   ├── payment.config.ts # Configuration payment
│   │   └── redis.config.ts  # Configuration redis
│   ├── entities/            # Entités TypeORM
│   ├── dto/                 # Data Transfer Objects
│   ├── interfaces/          # Interfaces
│   ├── types/               # Types
│   ├── utils/               # Utilitaires
│   ├── migrations/          # Migrations
│   ├── seeds/               # Données de test
│   └── templates/           # Templates
├── test/                    # Tests
│   ├── unit/               # Tests unitaires
│   ├── integration/        # Tests intégration
│   ├── e2e/                # Tests end-to-end
│   └── fixtures/           # Fixtures
├── prisma/                  # Prisma (si utilisé)
├── Dockerfile              # Configuration Docker
├── docker-compose.yml      # Composition Docker
├── package.json            # Dépendances Node.js
├── tsconfig.json           # Configuration TypeScript
├── nest-cli.json           # Configuration NestJS
├── .env.example            # Variables d'environnement
└── README.md               # Documentation
```

[La documentation continue dans la partie 2...]### Architecture de Communication et Flux de Données

#### Communication Inter-Services

```typescript
// Pattern de communication standardisé
interface ServiceCommunication {
  // REST API Calls
  publicApi: {
    baseURL: string;
    endpoints: Record<string, string>;
    timeout: number;
    retry: number;
  };
  
  // WebSocket Connections
  websocket: {
    url: string;
    reconnect: boolean;
    events: string[];
  };
  
  // Message Queue (Redis)
  messageQueue: {
    channel: string;
    pattern: 'pubsub' | 'rpc';
    timeout: number;
  };
}

// Exemple de configuration de communication
const apiConfig: ServiceCommunication = {
  publicApi: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:3001',
    endpoints: {
      products: '/api/products',
      orders: '/api/orders',
      users: '/api/users',
      auth: '/api/auth',
      categories: '/api/categories',
      analytics: '/api/analytics',
      payments: '/api/payments'
    },
    timeout: 10000,
    retry: 3
  },
  websocket: {
    url: process.env.WS_URL || 'ws://localhost:3001/ws',
    reconnect: true,
    events: ['order_update', 'notification', 'stock_update']
  },
  messageQueue: {
    channel: 'mj-chauffage-events',
    pattern: 'pubsub',
    timeout: 5000
  }
};
```

#### Flux de Données Principaux

1. **Flux d'Authentification**
```
Client → Frontend → Backend API → Database → Redis Cache
   ↑          ↓           ↓           ↓          ↓
JWT Token  Session    Validation  User Data  Session Cache
   ↓          ↓           ↓           ↓          ↓
Client ← Frontend ← Backend API ← Database ← Redis Cache
```

2. **Flux de Commande**
```
Client → Frontend → Backend API → Payment Service → Database
   ↑          ↓           ↓              ↓             ↓
Order     Validation   Stock Check    Payment       Order Create
   ↓          ↓           ↓              ↓             ↓
Email ← Email Service ← Backend API ← Payment Result ← Order Confirmation
```

3. **Flux d'Analytics**
```
Client → Frontend → Backend API → Analytics Service → Database
   ↓          ↓           ↓              ↓             ↓
Event     Tracking     Processing    Aggregation    Storage
   ↓          ↓           ↓              ↓             ↓
Dashboard ← Frontend Admin ← Admin API ← Analytics Data
```

---

## 🛣️ Routes Disponibles (API Endpoints)

### Backend API (Express.js - Port 3001)

#### Authentification

```typescript
// POST /api/auth/register
interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// POST /api/auth/login  
interface LoginRequest {
  email: string;
  password: string;
}

// POST /api/auth/refresh
interface RefreshRequest {
  refreshToken: string;
}

// POST /api/auth/logout
interface LogoutRequest {
  refreshToken: string;
}

// GET /api/auth/me
// Retourne les informations de l'utilisateur connecté
```

#### Produits

```typescript
// GET /api/products
// Liste tous les produits avec pagination et filtres
interface ProductsQuery {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// GET /api/products/:id
// Détails d'un produit spécifique

// GET /api/products/category/:slug
// Produits par catégorie

// GET /api/products/search?q=:query
// Recherche de produits

// POST /api/products (Admin only)
interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  sku: string;
  categoryId: string;
  brand: string;
  images: string[];
  specifications: Record<string, string>;
  stock: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

// PUT /api/products/:id (Admin only)
// PATCH /api/products/:id (Admin only)
// DELETE /api/products/:id (Admin only)
```

#### Commandes

```typescript
// GET /api/orders
// Liste des commandes de l'utilisateur

// GET /api/orders/:id
// Détails d'une commande spécifique

// POST /api/orders
interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  billingAddress?: {
    // Même structure que shippingAddress
  };
  paymentMethod: 'card' | 'bank_transfer' | 'cash_on_delivery';
  customerNotes?: string;
}

// PUT /api/orders/:id/cancel
// Annulation de commande

// GET /api/orders/tracking/:trackingNumber
// Suivi de commande
```

#### Catégories

```typescript
// GET /api/categories
// Liste toutes les catégories

// GET /api/categories/:id
// Détails d'une catégorie

// GET /api/categories/slug/:slug
// Catégorie par slug

// POST /api/categories (Admin only)
interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  image?: string;
  isActive: boolean;
}
```

#### Utilisateurs

```typescript
// GET /api/users/profile
// Profil utilisateur

// PUT /api/users/profile
interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

// GET /api/users/addresses
// Adresses de l'utilisateur

// POST /api/users/addresses
interface CreateAddressRequest {
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

// GET /api/users/orders
// Commandes de l'utilisateur
```

#### Paiements

```typescript
// POST /api/payments/create-intent
interface CreatePaymentIntentRequest {
  orderId: string;
  amount: number;
  currency: string;
}

// POST /api/payments/confirm
interface ConfirmPaymentRequest {
  paymentIntentId: string;
  orderId: string;
}

// GET /api/payments/methods
// Méthodes de paiement disponibles
```

#### Analytics

```typescript
// GET /api/analytics/dashboard
// Données dashboard admin

// GET /api/analytics/sales?period=:period
// Données de vente

// GET /api/analytics/products/top
// Produits les plus vendus

// GET /api/analytics/customers/stats
// Statistiques clients
```

#### Uploads

```typescript
// POST /api/upload/image
// Upload d'image (produits, avatars, etc.)

// POST /api/upload/bulk
// Upload multiple
```

### Admin API (NestJS - Port 3003)

#### Administration des Produits

```typescript
// GET /admin/products
// Liste produits avec filtres avancés

// POST /admin/products
// Création produit

// GET /admin/products/:id
// Détails produit admin

// PUT /admin/products/:id
// Mise à jour produit

// DELETE /admin/products/:id
// Suppression produit

// POST /admin/products/import
// Import produits CSV

// GET /admin/products/export
// Export produits CSV
```

#### Administration des Commandes

```typescript
// GET /admin/orders
// Liste commandes avec filtres

// GET /admin/orders/:id
// Détails commande admin

// PUT /admin/orders/:id/status
// Changement statut commande

// PUT /admin/orders/:id/shipping
// Mise à jour livraison

// GET /admin/orders/analytics
// Analytics commandes
```

#### Administration des Utilisateurs

```typescript
// GET /admin/users
// Liste utilisateurs

// GET /admin/users/:id
// Détails utilisateur

// PUT /admin/users/:id
// Mise à jour utilisateur

// DELETE /admin/users/:id
// Désactivation utilisateur

// GET /admin/users/stats
// Statistiques utilisateurs
```

#### Administration des Catégories

```typescript
// GET /admin/categories
// Arborescence catégories

// POST /admin/categories
// Création catégorie

// PUT /admin/categories/:id
// Mise à jour catégorie

// DELETE /admin/categories/:id
// Suppression catégorie
```

#### Dashboard Admin

```typescript
// GET /admin/dashboard/overview
// Vue d'ensemble dashboard

// GET /admin/dashboard/sales
// Données ventes

// GET /admin/dashboard/visitors
// Statistiques visiteurs

// GET /admin/dashboard/conversion
// Taux de conversion
```

#### Paramètres Système

```typescript
// GET /admin/settings
// Paramètres application

// PUT /admin/settings
// Mise à jour paramètres

// GET /admin/settings/shipping
// Paramètres livraison

// PUT /admin/settings/shipping
// Mise à jour livraison

// GET /admin/settings/taxes
// Paramètres taxes

// PUT /admin/settings/taxes
// Mise à jour taxes
```

### Frontend Routes (Next.js App Router)

#### Routes Publiques

```typescript
// Pages statiques
'/': HomePage
'/about': AboutPage
'/contact': ContactPage
'/terms': TermsPage
'/privacy': PrivacyPage
'/faq': FAQPage

// Catalogue produits
'/products': ProductListingPage
'/products/[id]': ProductDetailPage
'/products/category/[slug]': CategoryPage
'/products/search': SearchResultsPage

// Panier et commande
'/cart': CartPage
'/checkout': CheckoutPage
'/checkout/success': OrderConfirmationPage

// Authentification
'/login': LoginPage
'/register': RegisterPage
'/forgot-password': ForgotPasswordPage
'/reset-password': ResetPasswordPage

// Compte client
'/account': AccountDashboard
'/account/profile': ProfilePage
'/account/orders': OrderHistoryPage
'/account/addresses': AddressBookPage
'/account/security': SecuritySettingsPage

// Pages spéciales
'/promotions': PromotionsPage
'/new-arrivals': NewArrivalsPage
'/best-sellers': BestSellersPage
'/clearance': ClearancePage
```

#### Routes Admin (Protégées)

```typescript
// Dashboard
'/admin': AdminDashboard
'/admin/analytics': AnalyticsDashboard

// Gestion produits
'/admin/products': ProductManagement
'/admin/products/new': CreateProduct
'/admin/products/[id]': EditProduct
'/admin/products/import': ImportProducts
'/admin/products/categories': CategoryManagement

// Gestion commandes
'/admin/orders': OrderManagement
'/admin/orders/[id]': OrderDetails
'/admin/orders/processing': OrderProcessing
'/admin/orders/shipping': ShippingManagement

// Gestion clients
'/admin/customers': CustomerManagement
'/admin/customers/[id]': CustomerDetails

// Paramètres
'/admin/settings': SystemSettings
'/admin/settings/general': GeneralSettings
'/admin/settings/shipping': ShippingSettings
'/admin/settings/taxes': TaxSettings
'/admin/settings/payments': PaymentSettings
'/admin/settings/email': EmailSettings

// Rapports
'/admin/reports': ReportsDashboard
'/admin/reports/sales': SalesReports
'/admin/reports/inventory': InventoryReports
'/admin/reports/customers': CustomerReports
'/admin/reports/financial': FinancialReports
```

#### API Routes Next.js (Pages Router)

```typescript
// API Routes pour les fonctions côté serveur
'/api/hello': API Example
'/api/auth/[...nextauth]': NextAuth API
'/api/stripe/webhook': Stripe Webhook
'/api/email/subscribe': Newsletter Subscription
'/api/contact': Contact Form
'/api/newsletter': Newsletter Management
'/api/sitemap.xml': Sitemap Generator
'/api/robots.txt': Robots.txt
'/api/health': Health Check
```

---

## 🧠 Logique Métier Détaillée

### Gestion des Produits

#### Logique de Prix et Promotions

```typescript
class ProductPricing {
  // Calcul du prix final avec promotions
  calculateFinalPrice(
    basePrice: number,
    originalPrice?: number,
    promotions?: ProductPromotion[]
  ): {
    finalPrice: number;
    discountAmount: number;
    discountPercentage: number;
    isOnSale: boolean;
  } {
    let finalPrice = basePrice;
    let discountAmount = 0;
    
    // Application des promotions
    if (promotions && promotions.length > 0) {
      const applicablePromotions = promotions.filter(promo => 
        this.isPromotionApplicable(promo)
      );
      
      // Appliquer la promotion la plus avantageuse
      if (applicablePromotions.length > 0) {
        const bestPromotion = this.findBestPromotion(applicablePromotions, basePrice);
        finalPrice = this.applyPromotion(basePrice, bestPromotion);
        discountAmount = basePrice - finalPrice;
      }
    }
    
    // Comparaison avec le prix original
    const isOnSale = originalPrice !== undefined && originalPrice > basePrice;
    const discountPercentage = originalPrice 
      ? ((originalPrice - finalPrice) / originalPrice) * 100
      : 0;
    
    return {
      finalPrice: Math.max(0, finalPrice),
      discountAmount,
      discountPercentage,
      isOnSale
    };
  }
  
  // Vérification éligibilité promotion
  private isPromotionApplicable(promotion: ProductPromotion): boolean {
    const now = new Date();
    return (
      promotion.isActive &&
      new Date(promotion.startDate) <= now &&
      new Date(promotion.endDate) >= now
    );
  }
  
  // Application promotion
  private applyPromotion(price: number, promotion: ProductPromotion): number {
    switch (promotion.type) {
      case 'percentage':
        return price * (1 - promotion.value / 100);
      case 'fixed':
        return Math.max(0, price - promotion.value);
      case 'buy_x_get_y':
        // Logique spécifique
        return price;
      default:
        return price;
    }
  }
}
```

#### Gestion du Stock

```typescript
class InventoryManager {
  // Réserver du stock pour une commande
  async reserveStock(orderItems: OrderItem[]): Promise<void> {
    const transaction = await this.beginTransaction();
    
    try {
      for (const item of orderItems) {
        const product = await this.getProduct(item.productId);
        
        if (product.stock < item.quantity) {
          throw new Error(`Stock insuffisant pour ${product.name}`);
        }
        
        // Réserver le stock
        await this.updateStock(
          item.productId,
          product.stock - item.quantity,
          product.reservedStock + item.quantity
        );
      }
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  // Libérer du stock réservé
  async releaseStock(orderItems: OrderItem[]): Promise<void> {
    for (const item of orderItems) {
      const product = await this.getProduct(item.productId);
      await this.updateStock(
        item.productId,
        product.stock + item.quantity,
        product.reservedStock - item.quantity
      );
    }
  }
  
  // Mettre à jour le stock après commande
  async updateStockAfterOrder(order: Order): Promise<void> {
    if (order.status === 'completed') {
      for (const item of order.items) {
        const product = await this.getProduct(item.productId);
        await this.updateStock(
          item.productId,
          product.stock,
          product.reservedStock - item.quantity
        );
        
        // Mettre à jour les statistiques de vente
        await this.updateSalesStatistics(item.productId, item.quantity);
      }
    }
  }
}
```

### Gestion des Commandes

#### Workflow des Statuts de Commande

```typescript
const ORDER_STATUS_FLOW = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: ['completed', 'returned'],
  cancelled: [],
  returned: ['refunded'],
  refunded: [],
  completed: []
} as const;

class OrderWorkflow {
  // Validation transition de statut
  isValidStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus
  ): boolean {
    const allowedTransitions = ORDER_STATUS_FLOW[currentStatus];
    return allowedTransitions.includes(newStatus);
  }
  
  // Changer le statut d'une commande
  async changeOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    notes?: string
  ): Promise<void> {
    const order = await this.getOrder(orderId);
    
    if (!this.isValidStatusTransition(order.status, newStatus)) {
      throw new Error(
        `Transition invalide: ${order.status} -> ${newStatus}`
      );
    }
    
    // Mettre à jour le statut
    await this.updateOrderStatus(orderId, newStatus);
    
    // Ajouter une note d'historique
    await this.addStatusHistory(orderId, newStatus, notes);
    
    // Déclencher les événements correspondants
    await this.triggerStatusEvents(orderId, newStatus);
  }
  
  // Événements déclenchés par changement de statut
  private async triggerStatusEvents(
    orderId: string,
    status: OrderStatus
  ): Promise<void> {
    switch (status) {
      case 'processing':
        await this.notifyOrderProcessing(orderId);
        break;
      case 'shipped':
        await this.notifyOrderShipped(orderId);
        await this.updateShippingTracking(orderId);
        break;
      case 'delivered':
        await this.notifyOrderDelivered(orderId);
        await this.completeOrderIfReady(orderId);
        break;
      case 'cancelled':
        await this.notifyOrderCancelled(orderId);
        await this.releaseStock(orderId);
        break;
      case 'returned':
        await this.processReturn(orderId);
        break;
    }
  }
}
```

#### Calcul des Frais de Livraison

```typescript
class ShippingCalculator {
  async calculateShipping(
    items: CartItem[],
    shippingAddress: Address,
    customer?: Customer
  ): Promise<ShippingQuote[]> {
    const quotes: ShippingQuote[] = [];
    
    // Calcul du poids total
    const totalWeight = items.reduce((sum, item) => {
      return sum + (item.product.weight || 0) * item.quantity;
    }, 0);
    
    // Calcul des dimensions totales
    const totalDimensions = this.calculateTotalDimensions(items);
    
    // Récupérer les méthodes de livraison disponibles
    const shippingMethods = await this.getAvailableShippingMethods(
      shippingAddress,
      totalWeight,
      totalDimensions
    );
    
    // Calculer les frais pour chaque méthode
    for (const method of shippingMethods) {
      const baseCost = this.calculateBaseCost(method, totalWeight);
      const additionalFees = this.calculateAdditionalFees(method, shippingAddress);
      const tax = this.calculateTax(baseCost + additionalFees, shippingAddress);
      const discount = await this.calculateShippingDiscount(method, customer);
      
      const totalCost = Math.max(0, baseCost + additionalFees + tax - discount);
      
      quotes.push({
        method,
        cost: totalCost,
        estimatedDelivery: this.calculateEstimatedDelivery(method, shippingAddress),
        details: {
          baseCost,
          additionalFees,
          tax,
          discount
        }
      });
    }
    
    return quotes.sort((a, b) => a.cost - b.cost);
  }
}
```

### Gestion de l'Authentification et Autorisations

#### Système de Rôles et Permissions

```typescript
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  CUSTOMER: 'customer',
  GUEST: 'guest'
} as const;

const PERMISSIONS = {
  // Produits
  VIEW_PRODUCTS: 'view_products',
  CREATE_PRODUCTS: 'create_products',
  EDIT_PRODUCTS: 'edit_products',
  DELETE_PRODUCTS: 'delete_products',
  
  // Commandes
  VIEW_ORDERS: 'view_orders',
  CREATE_ORDERS: 'create_orders',
  EDIT_ORDERS: 'edit_orders',
  DELETE_ORDERS: 'delete_orders',
  
  // Utilisateurs
  VIEW_USERS: 'view_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  
  // Catégories
  VIEW_CATEGORIES: 'view_categories',
  EDIT_CATEGORIES: 'edit_categories',
  
  // Paramètres
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
  
  // Analytics
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data'
} as const;

// Mapping rôles → permissions
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.CREATE_PRODUCTS,
    PERMISSIONS.EDIT_PRODUCTS,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.EDIT_ORDERS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.VIEW_CATEGORIES,
    PERMISSIONS.EDIT_CATEGORIES,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.EDIT_SETTINGS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_DATA
  ],
  [ROLES.MODERATOR]: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.EDIT_PRODUCTS,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_CATEGORIES,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  [ROLES.CUSTOMER]: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.CREATE_ORDERS,
    PERMISSIONS.VIEW_ORDERS
  ],
  [ROLES.GUEST]: [
    PERMISSIONS.VIEW_PRODUCTS
  ]
};

class AuthorizationService {
  // Vérifier si un utilisateur a une permission
  hasPermission(user: User, permission: Permission): boolean {
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
  }
  
  // Vérifier l'accès à une ressource
  async canAccessResource(
    user: User,
    resourceType: string,
    resourceId?: string,
    action: string = 'view'
  ): Promise<boolean> {
    const permission = this.mapActionToPermission(resourceType, action);
    
    if (!this.hasPermission(user, permission)) {
      return false;
    }
    
    // Vérifications spécifiques selon le type de ressource
    switch (resourceType) {
      case 'order':
        return await this.canAccessOrder(user, resourceId!, action);
      case 'product':
        return await this.canAccessProduct(user, resourceId!, action);
      case 'user':
        return await this.canAccessUser(user, resourceId!, action);
      default:
        return true;
    }
  }
  
  // Vérification spécifique pour les commandes
  private async canAccessOrder(
    user: User,
    orderId: string,
    action: string
  ): Promise<boolean> {
    if (user.role === ROLES.CUSTOMER) {
      const order = await this.getOrder(orderId);
      return order.customerId === user.id;
    }
    return true;
  }
}
```

### Système de Notifications

```typescript
class NotificationSystem {
  private channels: NotificationChannel[] = [
    new EmailChannel(),
    new SMSChannel(),
    new PushNotificationChannel(),
    new InAppNotificationChannel()
  ];
  
  // Envoyer une notification
  async sendNotification(
    userId: string,
    type: NotificationType,
    data: any,
    preferences?: NotificationPreferences
  ): Promise<void> {
    const user = await this.getUser(userId);
    const notification = this.createNotification(type, data);
    
    // Déterminer les canaux à utiliser
    const channelsToUse = preferences 
      ? this.filterChannelsByPreferences(preferences)
      : this.channels;
    
    // Envoyer via chaque canal
    for (const channel of channelsToUse) {
      if (await channel.canSend(user, notification)) {
        try {
          await channel.send(user, notification);
          await this.logNotificationSent(userId, type, channel.constructor.name);
        } catch (error) {
          await this.logNotificationError(userId, type, channel.constructor.name, error);
        }
      }
    }
  }
  
  // Notifications système
  async sendSystemNotification(
    type: SystemNotificationType,
    data: any,
    targetUsers?: string[]
  ): Promise<void> {
    const users = targetUsers 
      ? await this.getUsersByIds(targetUsers)
      : await this.getAllUsers();
    
    for (const user of users) {
      await this.sendNotification(
        user.id,
        type as NotificationType,
        data,
        user.notificationPreferences
      );
    }
  }
}

// Types de notifications
const NOTIFICATION_TYPES = {
  // Commandes
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  
  // Compte
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password_reset',
  EMAIL_VERIFICATION: 'email_verification',
  
  // Promotions
  NEW_PROMOTION: 'new_promotion',
  PRICE_DROP: 'price_drop',
  BACK_IN_STOCK: 'back_in_stock',
  
  // Système
  SYSTEM_UPDATE: 'system_update',
  MAINTENANCE: 'maintenance',
  SECURITY_ALERT: 'security_alert'
} as const;
```

[La documentation continue dans la partie 3...]