# 🎯 PLAN D'ACTION PRIORITAIRE - MJ CHAUFFAGE

## 🔴 PHASE 1: CORRECTIFS CRITIQUES (1-2 jours)

### ✅ Jour 1: Stabilisation Backend

#### 1.1 Corriger les 64 erreurs TypeScript
```bash
cd backend

# Corriger adminController.ts (21 erreurs)
- Ajouter null checks pour Prisma aggregations
- Utiliser l'opérateur ?? pour valeurs par défaut

# Corriger orderController.ts (15 erreurs)  
- Gérer payment optionnel
- Ajouter guards de type

# Corriger authController.ts (8 erreurs)
- Gérer req.ip et userAgent optionnels
- Valider données avant save

# Vérifier
npm run type-check
```

#### 1.2 Fixer Base de Données
```bash
# Vérifier provider Prisma
cat prisma/schema.prisma | grep provider
# Doit être: provider = "postgresql"

# Appliquer migrations
npx prisma migrate deploy
npx prisma generate
npm run build
```

#### 1.3 Corriger Redis
```bash
# .env
REDIS_URL=redis://localhost:6379  # ou votre Redis cloud

# Tester connexion
redis-cli ping

# Si pas de Redis, garder mock mais documenter
# backend/src/config/redis.ts - déjà implémenté
```

### ✅ Jour 2: Stabilisation Frontend

#### 2.1 Fixer Routing i18n (404 /fr)
```bash
cd frontend

# Nettoyer cache
rm -rf .next

# Vérifier middleware.ts
# Matcher: /((?!api|_next|.*\..*).*)

# Vérifier i18n/request.ts
# locales: ['fr', 'ar']

# Tester
npm run dev
curl http://localhost:3000/fr
```

#### 2.2 Corriger Analytics
```bash
# Vérifier que backend tourne sur 3001
curl http://localhost:3001/api/health

# Vérifier NEXT_PUBLIC_API_URL
echo $NEXT_PUBLIC_API_URL
# Doit pointer vers backend sans /api

# Tester geolocation
curl http://localhost:3000/api/geolocation
```

---

## 🟡 PHASE 2: AMÉLIORATIONS CRITIQUES E-COMMERCE (3-5 jours)

### ✅ Jour 3-4: Gestion de Stock Robuste

#### 3.1 Implémenter InventoryService
```typescript
// Créer backend/src/services/inventoryService.ts
// Voir artifact "stock_management"

Fonctionnalités clés:
✅ Réservation atomique avec transactions Prisma
✅ Libération automatique après timeout (30 min)
✅ Alertes stock faible
✅ Historique complet (InventoryLog)
✅ Cache Redis pour performance
✅ WebSocket pour mises à jour temps réel
```

#### 3.2 Intégrer avec le système de commande
```typescript
// orderController.ts
async createOrder() {
  // 1. Vérifier disponibilité
  const availability = await inventoryService.checkAvailability();
  
  // 2. Réserver stock
  const reserved = await inventoryService.reserveStock(items, orderId);
  
  // 3. Si paiement échoue après 30min
  //    → Auto-release via cron job
  
  // 4. Si paiement réussi
  await inventoryService.confirmSale(items, orderId);
}
```

#### 3.3 Dashboard Stock Admin
```tsx
// admin-frontend/src/pages/inventory/dashboard.tsx

Features:
- Vue temps réel du stock
- Alertes visuelles (rouge < minStock)
- Graphiques mouvements stock
- Prédictions rupture stock
- Export rapports Excel
```

### ✅ Jour 5: Analytics Avancées

#### 5.1 Implémenter AnalyticsService
```typescript
// Créer backend/src/services/analyticsService.ts
// Voir artifact "analytics_system"

Métriques clés:
✅ Revenue + growth rate
✅ Orders by status
✅ Customer segments (RFM)
✅ Product performance
✅ Inventory turnover
✅ Sales by wilaya
```

#### 5.2 Dashboard Admin Metrics
```tsx
// admin-frontend/src/pages/dashboard/overview.tsx

Widgets:
- Revenue card (avec sparkline)
- Orders timeline (Chart.js)
- Top products table
- Customer segments pie chart
- Stock alerts list
- Real-time notifications
```

---

## 🟢 PHASE 3: OPTIMISATIONS PERFORMANCE (2-3 jours)

### ✅ Jour 6: Optimisation Base de Données

#### 6.1 Ajouter Index Stratégiques
```sql
-- Migration: add_performance_indexes.sql

-- Index pour recherche produits
CREATE INDEX idx_products_search ON "Product" USING gin(
  to_tsvector('french', name || ' ' || COALESCE(description, ''))
);

-- Index pour analytics
CREATE INDEX idx_orders_analytics ON "Order"(status, "createdAt" DESC);
CREATE INDEX idx_order_items_product ON "OrderItem"("productId", "orderId");

-- Index pour stock
CREATE INDEX idx_products_stock ON "Product"("stockQuantity", "reservedStock");
CREATE INDEX idx_inventory_logs_date ON "InventoryLog"("createdAt" DESC);
```

#### 6.2 Optimiser Requêtes Prisma
```typescript
// Utiliser select au lieu de include quand possible
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    price: true,
    // Ne charger que ce qui est nécessaire
  }
});

// Paginer systématiquement
const products = await prisma.product.findMany({
  take: 20,
  skip: (page - 1) * 20,
  orderBy: { createdAt: 'desc' }
});
```

### ✅ Jour 7: Cache Stratégique

#### 7.1 Implémenter Cache Multi-Niveaux
```typescript
// backend/src/services/cacheService.ts

class CacheService {
  // L1: In-memory (node-cache) - 1 min
  private l1Cache = new NodeCache({ stdTTL: 60 });
  
  // L2: Redis - 5 min
  private l2Cache = redis;
  
  async get(key: string) {
    // Try L1
    let value = this.l1Cache.get(key);
    if (value) return value;
    
    // Try L2
    const cached = await this.l2Cache.get(key);
    if (cached) {
      value = JSON.parse(cached);
      this.l1Cache.set(key, value);
      return value;
    }
    
    return null;
  }
}

// Cacher:
- Liste produits (5 min)
- Catégories (10 min)
- Metrics dashboard (5 min)
- Product details (10 min)
```

#### 7.2 Implémenter ISR Next.js
```typescript
// frontend/src/app/[locale]/products/page.tsx

export const revalidate = 300; // 5 minutes ISR

export async function generateStaticParams() {
  // Pre-render top 100 produits
  const products = await fetchTopProducts(100);
  return products.map(p => ({ id: p.id }));
}
```

### ✅ Jour 8: Optimisation Frontend

#### 8.1 Code Splitting Agressif
```typescript
// Lazy load admin dashboard
const AdminDashboard = dynamic(() => import('@/components/admin/Dashboard'), {
  loading: () => <Skeleton />,
  ssr: false
});

// Lazy load charts
const Charts = dynamic(() => import('@/components/charts'), {
  ssr: false
});
```

#### 8.2 Image Optimization
```typescript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
    domains: ['your-cdn.com'],
  }
};

// Utiliser Next Image partout
<Image
  src={product.image}
  alt={product.name}
  width={400}
  height={400}
  placeholder="blur"
  priority={false}
/>
```

---

## 🔵 PHASE 4: SÉCURITÉ RENFORCÉE (2 jours)

### ✅ Jour 9: Audit Sécurité

#### 9.1 Secrets Management
```bash
# Générer secrets forts
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Valider longueur minimale
JWT_SECRET: minimum 64 caractères
SESSION_SECRET: minimum 32 caractères
NEXTAUTH_SECRET: minimum 32 caractères
```

#### 9.2 Rate Limiting Granulaire
```typescript
// backend/src/middleware/rateLimit.ts

// Par endpoint
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Trop de tentatives de connexion'
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
});

// Appliquer
app.use('/api/auth/login', authLimiter);
app.use('/api', apiLimiter);
app.use('/api/admin', adminLimiter);
```

#### 9.3 CSRF Protection
```typescript
// backend/src/middleware/csrf.ts
import csrf from 'csurf';

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Appliquer sur routes mutantes
app.use('/api', csrfProtection);
```

### ✅ Jour 10: Monitoring Production

#### 10.1 Logging Structuré
```typescript
// backend/src/utils/logger.ts

import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ 
      filename: 'error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'combined.log' 
    })
  ]
});

// Log structure
logger.info('Order created', {
  orderId: order.id,
  customerId: order.customerId,
  total: order.totalAmount,
  timestamp: new Date().toISOString()
});
```

#### 10.2 Error Tracking
```typescript
// Intégrer Sentry
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});

// Middleware error
app.use(Sentry.Handlers.errorHandler());
```

---

## 📊 MÉTRIQUES DE SUCCÈS

### KPIs Techniques
- ✅ 0 erreurs TypeScript
- ✅ Code coverage > 80%
- ✅ API response time < 200ms (p95)
- ✅ Lighthouse score > 90
- ✅ Zero downtime deployments

### KPIs Business
- ✅ Taux de conversion > 3%
- ✅ Panier abandonné < 70%
- ✅ Stock accuracy > 99%
- ✅ Order processing < 24h
- ✅ Customer satisfaction > 4.5/5

---

## 🔧 OUTILS RECOMMANDÉS

### Développement
- **VSCode Extensions**: Prisma, ESLint, TypeScript
- **Testing**: Jest, Playwright, Postman
- **Git Hooks**: Husky + lint-staged

### Monitoring
- **APM**: New Relic / Datadog
- **Logs**: Winston + Elasticsearch
- **Errors**: Sentry
- **Analytics**: Google Analytics 4 + Mixpanel

### Infrastructure
- **Database**: PostgreSQL (Neon/Supabase)
- **Cache**: Redis Cloud
- **CDN**: Cloudflare
- **Hosting**: Vercel (frontend) + Railway (backend)

---

## 📚 DOCUMENTATION À MAINTENIR

### Obligatoire
- [ ] API Documentation (Swagger/OpenAPI)
- [ ] Database Schema (ERD diagram)
- [ ] Environment Variables (avec exemples)
- [ ] Deployment Guide
- [ ] Troubleshooting Guide

### Recommandé
- [ ] Architecture Decision Records (ADR)
- [ ] Code Style Guide
- [ ] Testing Strategy
- [ ] Security Policy
- [ ] Contributing Guidelines

---

## ✅ CHECKLIST FINALE

### Avant Production
- [ ] Tous les tests passent (unit + e2e)
- [ ] Audit de sécurité complet
- [ ] Performance benchmarks OK
- [ ] Backup stratégie définie
- [ ] Monitoring configuré
- [ ] Error tracking actif
- [ ] Documentation à jour
- [ ] Secrets rotés
- [ ] SSL/TLS configuré
- [ ] GDPR compliance vérifié

### Post-Déploiement
- [ ] Health checks passent
- [ ] Smoke tests OK
- [ ] Monitoring dashboard vérifié
- [ ] Alertes configurées
- [ ] Rollback plan testé
- [ ] Support team briefé

---

**DURÉE TOTALE ESTIMÉE: 10-12 jours**

**PRIORISATION:**
1. 🔴 Phase 1 (Critique) - Ne pas skiper
2. 🟡 Phase 2 (Important) - Core business
3. 🟢 Phase 3 (Optimisation) - Performance
4. 🔵 Phase 4 (Sécurité) - Avant production
