# 🏗️ ARCHITECTURE TECHNIQUE - MJ CHAUFFAGE

## 📋 Vue d'Ensemble

MJ Chauffage est une plateforme e-commerce B2C spécialisée dans les pièces détachées de chauffage pour le marché algérien. L'architecture suit un pattern **microservices modulaire** avec séparation claire des responsabilités.

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

## 🎯 Stack Technique Détaillé

### Frontend Public (Next.js 14)
```typescript
// Technologies principales
- Framework: Next.js 14 (App Router)
- Language: TypeScript 5.0+
- Styling: Tailwind CSS 3.4
- State Management: Zustand + React Query
- Authentication: NextAuth.js
- Forms: React Hook Form + Zod
- Payments: Stripe
- Internationalization: next-intl
- Analytics: Custom + Google Analytics
```

**Justifications Techniques :**
- **Next.js 14** : SSR/SSG pour SEO optimal, App Router pour performance
- **Zustand** : State management léger vs Redux (bundle size -60%)
- **React Query** : Cache intelligent, synchronisation automatique
- **Tailwind CSS** : Développement rapide, bundle optimisé

### Backend API (Express.js)
```typescript
// Architecture Express.js
- Framework: Express.js 4.18
- Language: TypeScript 5.0+
- ORM: Prisma 5.0
- Authentication: JWT + bcryptjs
- Validation: Joi + class-validator
- Security: Helmet, CORS, Rate Limiting
- Real-time: Socket.IO
- File Upload: Multer
- Email: Nodemailer
- AI: Google Generative AI
```

**Justifications Techniques :**
- **Express.js** : Flexibilité maximale, écosystème mature
- **Prisma** : Type-safety, migrations automatiques, performance
- **JWT** : Stateless, scalable, sécurisé
- **Socket.IO** : Real-time pour notifications et analytics

### Admin Dashboard (NestJS)
```typescript
// Architecture NestJS
- Framework: NestJS 10.0
- Language: TypeScript 5.0+
- Architecture: Modular (Modules/Controllers/Services)
- Guards: JWT + Role-based
- Validation: class-validator + class-transformer
- Documentation: Swagger/OpenAPI
- Testing: Jest + Supertest
```

**Justifications Techniques :**
- **NestJS** : Architecture enterprise, dependency injection
- **Modular Design** : Séparation des responsabilités
- **Guards** : Sécurité granulaire par rôle

### Base de Données (PostgreSQL + Prisma)
```sql
-- Architecture de données
- SGBD: PostgreSQL 14+
- ORM: Prisma 5.0
- Migrations: Prisma Migrate
- Seeding: Prisma Seed
- Backup: pg_dump automatisé
- Monitoring: Prisma Studio
```

---

## 🏛️ Architecture Backend Détaillée

### Structure des Dossiers
```
backend/src/
├── config/                 # Configuration centralisée
│   ├── database.ts         # Config Prisma
│   ├── environment.ts      # Variables d'environnement
│   ├── redis.ts           # Configuration Redis
│   └── security.ts        # Paramètres sécurité
├── controllers/           # Contrôleurs REST
│   ├── adminController.ts
│   ├── authController.ts
│   ├── productController.ts
│   ├── orderController.ts
│   ├── analyticsController.ts
│   └── ...
├── services/             # Logique métier
│   ├── authService.ts
│   ├── productService.ts
│   ├── orderService.ts
│   ├── paymentService.ts
│   └── ...
├── middleware/           # Middlewares Express
│   ├── auth.ts          # Authentification JWT
│   ├── security.ts      # Sécurité (Helmet, CORS)
│   ├── validation.ts    # Validation des données
│   └── errorHandler.ts  # Gestion d'erreurs
├── routes/              # Définition des routes
│   ├── auth.ts
│   ├── products.ts
│   ├── orders.ts
│   └── ...
├── lib/                 # Utilitaires
│   └── database.ts      # Client Prisma
├── types/               # Types TypeScript
│   └── express.d.ts     # Extensions Express
└── utils/               # Fonctions utilitaires
    ├── logger.ts
    ├── validation.ts
    └── queryOptimizer.ts
```

### Pattern Architectural : MVC + Services

```typescript
// Exemple : Gestion des Produits

// 1. Route (routes/products.ts)
router.get('/products', authMiddleware, productController.getProducts);

// 2. Controller (controllers/productController.ts)
export const getProducts = async (req: Request, res: Response) => {
  const filters = validateFilters(req.query);
  const products = await productService.getProducts(filters);
  res.json({ success: true, data: products });
};

// 3. Service (services/productService.ts)
export const getProducts = async (filters: ProductFilters) => {
  return await prisma.product.findMany({
    where: buildWhereClause(filters),
    include: { category: true, images: true },
    orderBy: { createdAt: 'desc' }
  });
};
```

### Middleware Stack
```typescript
// Ordre d'exécution des middlewares
app.use(compression());                    // 1. Compression GZIP
app.use(morgan('combined'));               // 2. Logging des requêtes
app.use(helmet());                         // 3. Sécurité headers
app.use(cors(corsOptions));                // 4. CORS
app.use(express.json({ limit: '10mb' }));  // 5. Parsing JSON
app.use(cookieParser());                   // 6. Parsing cookies
app.use(session(sessionConfig));           // 7. Sessions
app.use(sanitizeRequestBody);              // 8. Sanitisation
app.use(authRateLimit);                    // 9. Rate limiting
app.use('/api', routes);                   // 10. Routes API
app.use(errorHandler);                     // 11. Gestion erreurs
```

---

## 🎨 Architecture Frontend Détaillée

### Structure Next.js 14 (App Router)
```
frontend/src/
├── app/                    # App Router Next.js 14
│   ├── (auth)/            # Route groups
│   │   ├── login/
│   │   └── register/
│   ├── admin/             # Dashboard admin
│   │   ├── analytics/
│   │   ├── products/
│   │   ├── orders/
│   │   └── customers/
│   ├── products/          # Catalogue produits
│   │   ├── [id]/
│   │   └── category/[slug]/
│   ├── cart/              # Panier
│   ├── checkout/          # Commande
│   ├── account/           # Compte client
│   ├── layout.tsx         # Layout global
│   ├── page.tsx           # Page d'accueil
│   └── loading.tsx        # Loading UI
├── components/            # Composants réutilisables
│   ├── common/           # Composants génériques
│   │   ├── Button/
│   │   ├── Modal/
│   │   └── Form/
│   ├── products/         # Composants produits
│   │   ├── ProductCard/
│   │   ├── ProductGrid/
│   │   └── ProductFilter/
│   ├── cart/             # Composants panier
│   ├── admin/            # Composants admin
│   └── layout/           # Layout components
├── hooks/                # Custom hooks
│   ├── useAuth.ts
│   ├── useCart.ts
│   ├── useProducts.ts
│   └── useAnalytics.ts
├── services/             # Services API
│   ├── apiClient.ts      # Client Axios configuré
│   ├── authService.ts
│   ├── productService.ts
│   └── cartService.ts
├── store/                # State management
│   ├── authStore.ts      # Zustand store
│   ├── cartStore.ts
│   └── productStore.ts
├── lib/                  # Utilitaires
│   ├── auth.ts           # NextAuth config
│   ├── utils.ts          # Fonctions utilitaires
│   └── validations.ts    # Schémas Zod
└── styles/               # Styles globaux
    ├── globals.css
    └── components.css
```

### Pattern de Composants
```typescript
// Structure type d'un composant
components/products/ProductCard/
├── index.ts              # Export principal
├── ProductCard.tsx       # Composant principal
├── ProductCard.test.tsx  # Tests unitaires
├── ProductCard.stories.tsx # Storybook
└── types.ts              # Types TypeScript

// Exemple de composant
interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  onAddToWishlist: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist
}) => {
  // Logique du composant
};
```

### State Management (Zustand)
```typescript
// Store Zustand pour le panier
interface CartState {
  items: CartItem[];
  total: number;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  addItem: (product, quantity) => {
    // Logique d'ajout
  },
  // ... autres actions
}));
```

---

## 💾 Architecture Base de Données

### Schéma Prisma Principal
```prisma
// Modèles principaux
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  firstName    String
  lastName     String
  password     String?
  role         UserRole @default(CUSTOMER)
  isActive     Boolean  @default(true)
  
  // Relations
  customer     Customer?
  orders       Order[]
  reviews      Review[]
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Product {
  id           String   @id @default(cuid())
  name         String
  description  String?
  price        Decimal
  stock        Int      @default(0)
  isActive     Boolean  @default(true)
  
  // Relations
  category     Category @relation(fields: [categoryId], references: [id])
  categoryId   String
  images       ProductImage[]
  orderItems   OrderItem[]
  reviews      Review[]
  
  // SEO
  slug         String   @unique
  metaTitle    String?
  metaDescription String?
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Order {
  id           String      @id @default(cuid())
  orderNumber  String      @unique
  status       OrderStatus @default(PENDING)
  total        Decimal
  
  // Relations
  customer     Customer    @relation(fields: [customerId], references: [id])
  customerId   String
  items        OrderItem[]
  payments     Payment[]
  
  // Adresses
  shippingAddress Json
  billingAddress  Json
  
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}
```

### Relations et Index
```sql
-- Index pour performance
CREATE INDEX idx_product_category ON Product(categoryId);
CREATE INDEX idx_product_active ON Product(isActive);
CREATE INDEX idx_order_customer ON Order(customerId);
CREATE INDEX idx_order_status ON Order(status);
CREATE INDEX idx_order_created ON Order(createdAt);

-- Relations complexes
-- Un utilisateur peut avoir plusieurs commandes
-- Une commande contient plusieurs produits
-- Un produit appartient à une catégorie
-- Une commande a plusieurs paiements (paiements partiels)
```

---

## 🔄 Flow de Données

### Flow d'Achat Complet
```mermaid
sequenceDiagram
    participant C as Client
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant P as Payment
    
    C->>F: Ajouter au panier
    F->>F: Mise à jour state local
    F->>B: POST /api/cart/add
    B->>DB: Vérifier stock
    DB-->>B: Stock disponible
    B-->>F: Confirmation
    
    C->>F: Procéder au checkout
    F->>B: POST /api/orders/create
    B->>DB: Créer commande
    B->>DB: Réserver stock
    B-->>F: Order ID
    
    F->>P: Redirection Stripe
    P-->>B: Webhook payment
    B->>DB: Confirmer commande
    B->>F: Notification success
    F-->>C: Confirmation commande
```

### Flow d'Authentification
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    
    U->>F: Login (email/password)
    F->>B: POST /api/auth/login
    B->>DB: Vérifier credentials
    DB-->>B: User data
    B->>B: Générer JWT
    B-->>F: JWT + Refresh Token
    F->>F: Stocker tokens
    F-->>U: Redirection dashboard
    
    Note over F,B: Pour chaque requête protégée
    F->>B: Request + JWT Header
    B->>B: Valider JWT
    B-->>F: Response ou 401
```

---

## 🛡️ Architecture Sécurité

### Couches de Sécurité
```typescript
// 1. Niveau Infrastructure
- HTTPS obligatoire (TLS 1.3)
- Firewall (ports 80, 443, 22 uniquement)
- DDoS protection (Cloudflare)
- Rate limiting (Redis)

// 2. Niveau Application
- Helmet.js (security headers)
- CORS configuré strictement
- Input validation (Joi + Zod)
- SQL injection prevention (Prisma)
- XSS protection (sanitization)

// 3. Niveau Authentification
- JWT avec expiration courte (15min)
- Refresh tokens (7 jours)
- Password hashing (bcrypt, cost 12)
- Session management sécurisé
- Role-based access control

// 4. Niveau Données
- Encryption at rest (PostgreSQL)
- Backup chiffré quotidien
- Logs sécurisés (Winston)
- Monitoring (Prometheus)
```

### Middleware de Sécurité
```typescript
// Configuration sécurité complète
export const applySecurity = (app: Express) => {
  // Headers de sécurité
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
        fontSrc: ["'self'", "fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // Rate limiting progressif
  app.use('/api/auth', authRateLimit);      // 5 req/min
  app.use('/api/admin', adminRateLimit);    // 100 req/min
  app.use('/api', apiRateLimit);            // 1000 req/min
};
```

---

## ⚡ Architecture Performance

### Optimisations Frontend
```typescript
// 1. Code Splitting
- Dynamic imports pour routes
- Lazy loading composants
- Bundle analysis (webpack-bundle-analyzer)

// 2. Image Optimization
- Next.js Image component
- WebP/AVIF formats
- Responsive images
- Lazy loading

// 3. Caching Strategy
- Static Generation (SSG)
- Incremental Static Regeneration (ISR)
- Service Worker caching
- CDN (Cloudflare)

// 4. Performance Monitoring
- Web Vitals tracking
- Real User Monitoring (RUM)
- Performance budgets
- Lighthouse CI
```

### Optimisations Backend
```typescript
// 1. Database Optimization
- Index stratégiques
- Query optimization (Prisma)
- Connection pooling
- Read replicas

// 2. Caching Layers
- Redis pour sessions
- Application-level cache
- Database query cache
- CDN pour assets

// 3. API Optimization
- Pagination efficace
- Field selection (GraphQL-style)
- Compression (gzip/brotli)
- HTTP/2 support
```

---

## 📊 Architecture Analytics

### Système de Tracking
```typescript
// Analytics multi-niveaux
interface AnalyticsEvent {
  event: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  properties: Record<string, any>;
  page: string;
  userAgent: string;
  ip: string;
}

// Collecte de données
- Page views
- User interactions
- E-commerce events
- Performance metrics
- Error tracking
- A/B testing data
```

### Dashboard Analytics
```typescript
// Métriques business
- Revenus par période
- Conversion funnel
- Produits populaires
- Géolocalisation clients
- Performance par canal
- Retention utilisateurs

// Métriques techniques
- Response times
- Error rates
- Database performance
- Cache hit rates
- Server resources
```

---

## 🚀 Architecture Déploiement

### Environnements
```yaml
# docker-compose.production.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.mjchauffage.com
    
  backend:
    build: ./backend
    ports: ["3001:3001"]
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://...
    depends_on: [postgres, redis]
    
  postgres:
    image: postgres:14
    environment:
      - POSTGRES_DB=mjchauffage
    volumes: ["postgres_data:/var/lib/postgresql/data"]
    
  redis:
    image: redis:7-alpine
    volumes: ["redis_data:/data"]
    
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes: ["./nginx/nginx.conf:/etc/nginx/nginx.conf"]
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          npm install
          npm run test
          npm run test:e2e
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        run: |
          docker-compose -f docker-compose.production.yml up -d
          docker system prune -f
```

---

## 🔧 Configuration et Variables

### Variables d'Environnement Critiques
```bash
# Backend (.env)
DATABASE_URL="postgresql://user:pass@localhost:5432/mjchauffage"
JWT_SECRET="super-secret-key-256-bits"
JWT_REFRESH_SECRET="refresh-secret-key-256-bits"
REDIS_URL="redis://localhost:6379"
STRIPE_SECRET_KEY="sk_live_..."
SMTP_HOST="smtp.gmail.com"

# Frontend (.env.local)
NEXT_PUBLIC_API_URL="https://api.mjchauffage.com"
NEXTAUTH_URL="https://mjchauffage.com"
NEXTAUTH_SECRET="nextauth-secret-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

---

## 📈 Métriques et Monitoring

### KPIs Techniques
- **Performance** : Response time < 200ms (95th percentile)
- **Disponibilité** : Uptime > 99.9%
- **Sécurité** : 0 vulnérabilité critique
- **Qualité** : Code coverage > 80%

### KPIs Business
- **Conversion** : Taux de conversion > 3%
- **Panier** : Taux d'abandon < 70%
- **Performance** : Page load < 3s
- **SEO** : Core Web Vitals > 90

---

## 🔮 Évolution Architecture

### Roadmap Technique
1. **Q1 2024** : Migration PostgreSQL → MongoDB (flexibilité)
2. **Q2 2024** : Microservices (Docker + Kubernetes)
3. **Q3 2024** : GraphQL API (performance)
4. **Q4 2024** : PWA + Offline support

### Scalabilité Prévue
- **Horizontal scaling** : Load balancer + multiple instances
- **Database sharding** : Par région géographique
- **CDN global** : Cloudflare + edge computing
- **Caching distribué** : Redis Cluster

---

**Dernière mise à jour** : 12 octobre 2025  
**Version architecture** : 2.1.0  
**Prochaine révision** : Q1 2025