# 🔧 Guide de Résolution des Problèmes - MJ Chauffage

Ce guide vous aide à diagnostiquer et résoudre les problèmes courants rencontrés dans le projet MJ Chauffage.

---

## 📋 Table des Matières

1. [Problèmes de Démarrage](#problèmes-de-démarrage)
2. [Erreurs TypeScript](#erreurs-typescript)
3. [Problèmes de Base de Données](#problèmes-de-base-de-données)
4. [Erreurs d'Authentification](#erreurs-dauthentification)
5. [Problèmes CORS](#problèmes-cors)
6. [Erreurs de Performance](#erreurs-de-performance)
7. [Problèmes de Sécurité](#problèmes-de-sécurité)
8. [Erreurs de Déploiement](#erreurs-de-déploiement)
9. [Outils de Diagnostic](#outils-de-diagnostic)

---

## 🚀 Problèmes de Démarrage

### Backend ne démarre pas

**Symptômes :**
- Le serveur s'arrête silencieusement
- Erreur "Cannot find module"
- Port 3001 inaccessible

**Solutions :**

#### 1. Problème de résolution des chemins TypeScript
```bash
# Vérifier la configuration tsconfig.json
cat backend/tsconfig.json

# Solution 1 : Corriger tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"]
    }
  }
}

# Solution 2 : Compiler puis exécuter
cd backend
npm run build
node dist/server.js
```

#### 2. Variables d'environnement manquantes
```bash
# Copier le fichier d'exemple
cp backend/.env.example backend/.env

# Vérifier les variables critiques
DATABASE_URL=
JWT_SECRET=
REDIS_URL=
```

#### 3. Dépendances manquantes
```bash
cd backend
npm install
npm audit fix
```

### Frontend ne démarre pas

**Symptômes :**
- Erreur de compilation Next.js
- Port 3000 inaccessible
- Erreurs de build

**Solutions :**

```bash
# Nettoyer le cache
cd frontend
rm -rf .next node_modules
npm install
npm run dev

# Vérifier les variables d'environnement
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

---

## 🔧 Erreurs TypeScript

### Erreurs de compilation (64+ erreurs)

**Symptômes :**
- `npm run build` échoue
- Erreurs de types Prisma
- Propriétés undefined

**Solutions prioritaires :**

#### 1. Erreurs adminService.ts (21 erreurs)
```typescript
// AVANT (incorrect)
const revenue = item._sum.totalAmount;

// APRÈS (correct)
const revenue = item._sum?.totalAmount || 0;
```

#### 2. Erreurs orderController.ts (15 erreurs)
```typescript
// AVANT (incorrect)
paymentMethod: order.paymentMethod

// APRÈS (correct)
paymentMethod: order.payment?.method || 'UNKNOWN'
```

#### 3. Erreurs authController.ts (8 erreurs)
```typescript
// AVANT (incorrect)
ipAddress: ipAddress,
userAgent: userAgent,

// APRÈS (correct)
ipAddress: ipAddress || null,
userAgent: userAgent || null,
```

#### Script de correction automatique
```bash
cd backend
npm run type-check 2>&1 | tee errors_before.log
# Appliquer les corrections manuelles
npm run type-check 2>&1 | tee errors_after.log
```

---

## 🗄️ Problèmes de Base de Données

### Connexion échoue

**Symptômes :**
- "Database connection failed"
- Timeout de connexion
- Erreurs Prisma

**Solutions :**

#### 1. Vérifier la configuration
```bash
# Tester la connexion
cd backend
npx prisma db pull

# Vérifier l'URL de base de données
echo $DATABASE_URL
```

#### 2. Migrations manquantes
```bash
# Appliquer les migrations
npx prisma migrate deploy

# Générer le client Prisma
npx prisma generate

# Peupler la base de données
npx prisma db seed
```

#### 3. Problèmes de permissions
```bash
# Vérifier les permissions PostgreSQL
psql $DATABASE_URL -c "SELECT current_user, current_database();"
```

### Erreurs de schéma

**Symptômes :**
- Types Prisma incorrects
- Relations manquantes
- Contraintes violées

**Solutions :**

```bash
# Réinitialiser la base de données
npx prisma migrate reset

# Vérifier le schéma
npx prisma validate

# Visualiser la base de données
npx prisma studio
```

---

## 🔐 Erreurs d'Authentification

### Login admin échoue

**Symptômes :**
- 401 Unauthorized
- Token invalide
- Redirection échoue

**Solutions :**

#### 1. Créer un utilisateur admin
```bash
cd backend
node -e "
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@mjchauffage.com',
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'MJ Chauffage',
      phone: '+213555000000',
      isActive: true
    }
  });
  console.log('Admin créé:', admin);
}

createAdmin().catch(console.error);
"
```

#### 2. Vérifier la configuration JWT
```bash
# Variables d'environnement
JWT_SECRET=mj-chauffage-super-secret-key-2025
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=mj-chauffage-refresh-secret-2025
JWT_REFRESH_EXPIRES_IN=7d
```

#### 3. Tester l'authentification
```bash
# Test avec curl
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mjchauffage.com","password":"admin123"}'
```

---

## 🌐 Problèmes CORS

### Erreurs Cross-Origin

**Symptômes :**
- "CORS policy blocked"
- Requêtes bloquées depuis le frontend
- Erreurs preflight

**Solutions :**

#### 1. Configuration CORS backend
```typescript
// backend/src/server.ts
import cors from 'cors';

app.use(cors({
  origin: [
    'http://localhost:3000',  // Frontend
    'http://localhost:3005',  // Admin
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

#### 2. Configuration Next.js
```javascript
// frontend/next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};
```

#### 3. Géolocalisation API
```typescript
// Déplacer les appels API côté serveur
// frontend/src/app/api/geolocation/route.ts
export async function GET() {
  const response = await fetch('https://ipapi.co/json/');
  const data = await response.json();
  return Response.json(data);
}
```

---

## ⚡ Erreurs de Performance

### Requêtes lentes

**Symptômes :**
- Timeout > 5 secondes
- Interface qui freeze
- Erreurs 504 Gateway Timeout

**Solutions :**

#### 1. Optimiser les requêtes Prisma
```typescript
// AVANT (lent)
const orders = await prisma.order.findMany({
  include: { customer: true, items: true }
});

// APRÈS (rapide)
const orders = await prisma.order.findMany({
  select: {
    id: true,
    status: true,
    customer: { select: { firstName: true, lastName: true } },
    _count: { select: { items: true } }
  },
  take: 50 // Pagination
});
```

#### 2. Ajouter des index
```sql
-- Ajouter dans une migration
CREATE INDEX idx_orders_status ON "Order"(status);
CREATE INDEX idx_orders_created_at ON "Order"("createdAt");
CREATE INDEX idx_customers_email ON "Customer"(email);
```

#### 3. Cache Redis
```typescript
// Mettre en cache les données fréquentes
const cacheKey = `dashboard:stats:${userId}`;
let stats = await redis.get(cacheKey);

if (!stats) {
  stats = await calculateDashboardStats();
  await redis.setex(cacheKey, 300, JSON.stringify(stats)); // 5 min
}
```

---

## 🛡️ Problèmes de Sécurité

### Vulnérabilités critiques

**Symptômes :**
- Tokens exposés
- Erreurs détaillées en production
- Sessions sans timeout

**Solutions :**

#### 1. Sécuriser les tokens
```typescript
// Utiliser httpOnly cookies au lieu de localStorage
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 24h
});
```

#### 2. Gestion d'erreurs sécurisée
```typescript
// AVANT (dangereux)
res.status(500).json({ error: err.message, stack: err.stack });

// APRÈS (sécurisé)
if (process.env.NODE_ENV === 'production') {
  res.status(500).json({ error: 'Erreur interne du serveur' });
} else {
  res.status(500).json({ error: err.message });
}
```

#### 3. Rate limiting
```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  message: 'Trop de tentatives de connexion'
});

app.use('/api/auth/login', authLimiter);
```

---

## 🚀 Erreurs de Déploiement

### Docker Compose échoue

**Symptômes :**
- Services ne démarrent pas
- Erreurs de réseau
- Volumes non montés

**Solutions :**

#### 1. Vérifier les logs
```bash
# Voir les logs détaillés
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs backend

# Redémarrer les services
docker-compose down
docker-compose up --build
```

#### 2. Problèmes de réseau
```bash
# Nettoyer les réseaux Docker
docker network prune

# Recréer les services
docker-compose up --force-recreate
```

#### 3. Variables d'environnement
```bash
# Vérifier que .env existe
ls -la .env

# Tester les variables
docker-compose config
```

---

## 🔍 Outils de Diagnostic

### Scripts de diagnostic

#### 1. Vérification complète
```bash
#!/bin/bash
# scripts/health-check.sh

echo "=== DIAGNOSTIC MJ CHAUFFAGE ==="

# Backend
echo "Backend (port 3001):"
curl -f http://localhost:3001/health && echo "✅ OK" || echo "❌ FAILED"

# Frontend
echo "Frontend (port 3000):"
curl -f http://localhost:3000/api/health && echo "✅ OK" || echo "❌ FAILED"

# Base de données
echo "Base de données:"
cd backend && npx prisma db pull > /dev/null 2>&1 && echo "✅ OK" || echo "❌ FAILED"

# Redis
echo "Redis:"
redis-cli ping > /dev/null 2>&1 && echo "✅ OK" || echo "❌ FAILED"

# TypeScript
echo "TypeScript:"
cd backend && npm run type-check > /dev/null 2>&1 && echo "✅ OK" || echo "❌ ERRORS"
```

#### 2. Monitoring des erreurs
```bash
# Surveiller les logs en temps réel
tail -f backend/logs/error.log

# Compter les erreurs TypeScript
npm run type-check 2>&1 | grep -c "error"

# Vérifier les performances
curl -w "Temps de réponse: %{time_total}s\n" -o /dev/null -s http://localhost:3001/api/products
```

### Logs utiles

#### 1. Localisation des logs
```
backend/logs/
├── error.log          # Erreurs applicatives
├── access.log         # Logs d'accès
├── security.log       # Événements de sécurité
└── performance.log    # Métriques de performance
```

#### 2. Commandes de monitoring
```bash
# Surveiller les erreurs
grep -i "error" backend/logs/*.log | tail -20

# Analyser les performances
grep "slow query" backend/logs/performance.log

# Vérifier la sécurité
grep "failed login" backend/logs/security.log
```

---

## 🆘 Support et Escalade

### Niveaux de gravité

#### 🔴 CRITIQUE (Résolution immédiate)
- Site inaccessible
- Faille de sécurité
- Perte de données

#### 🟡 ÉLEVÉ (Résolution < 4h)
- Fonctionnalité majeure cassée
- Performance dégradée
- Erreurs utilisateur

#### 🟢 MOYEN (Résolution < 24h)
- Bugs mineurs
- Améliorations UX
- Optimisations

### Contacts d'urgence

- **Développeur Principal :** [email]
- **DevOps :** [email]
- **Sécurité :** [email]

### Checklist avant escalade

- [ ] Consulté ce guide de troubleshooting
- [ ] Vérifié les logs d'erreur
- [ ] Testé en local
- [ ] Documenté les étapes de reproduction
- [ ] Évalué l'impact utilisateur

---

## 📚 Ressources Supplémentaires

- [Guide d'Installation](./INSTALLATION.md)
- [Architecture Technique](./ARCHITECTURE.md)
- [Documentation API](./API_DOCUMENTATION.md)
- [Variables d'Environnement](./ENVIRONMENT_VARIABLES.md)

---

*Dernière mise à jour : Décembre 2024*
*Version : 1.0*## Playwright (WebKit) Timeouts & Selector Issues

Symptoms
- `page.goto('/')` or `/products` time out on Next.js dev.
- Admin login tests hang on `[data-testid="admin-email"]` selectors.

Causes
- Dev server `load`/`networkidle` can be unreliable due to overlays/SW.
- UI lacks expected `data-testid` attributes; locator never resolves.

Fixes
- Use `await page.goto(url, { waitUntil: 'domcontentloaded' })`.
- Prefer `getByLabel`/`getByRole` over `data-testid`.
- Wait for visible, stable elements (headers, buttons, cards).
- Ensure WebKit is installed: `npx playwright install webkit`.

Example (login)
```
await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
await page.getByLabel(/Email/i).fill('admin@mjchauffage.com');
await page.getByLabel(/Mot de passe|Password/i).fill('Admin123!');
await page.getByRole('button', { name: /Se connecter|Sign in/i }).click();
```

Re-run with readable output
- `npx playwright test -c playwright.config.ts --project=webkit --reporter=list`
