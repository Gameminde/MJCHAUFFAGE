# 🔥 MJ CHAUFFAGE - Site Web E-commerce

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.0-38B2AC?logo=tailwind-css)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)

Site web moderne et responsive pour **MJ CHAUFFAGE**, spécialisé dans les équipements de chauffage premium en Algérie. Interface multilingue (Français/Arabe) avec dashboard administrateur complet.

## ✨ Fonctionnalités

### 🛍️ **E-commerce Complet**
- ✅ Catalogue produits dynamique avec filtres
- ✅ Système de panier et wishlist
- ✅ Pages produits détaillées
- ✅ Comparaison de produits
- ✅ Processus de commande sécurisé

### 🎨 **Interface Moderne**
- ✅ Design responsive (mobile-first)
- ✅ Interface multilingue (FR/AR)
- ✅ Animations et transitions fluides
- ✅ Dark/Light mode support
- ✅ PWA (Progressive Web App)

### 🔐 **Dashboard Administrateur**
- ✅ Authentification sécurisée
- ✅ Gestion des produits (CRUD complet)
- ✅ Upload d'images fonctionnel
- ✅ Gestion des commandes
- ✅ Analytics et statistiques
- ✅ Gestion des utilisateurs

### 🌐 **Multilingue & SEO**
- ✅ Support Français/Arabe (RTL)
- ✅ URLs localisées
- ✅ Métadonnées SEO optimisées
- ✅ Sitemap automatique

## 🚀 Installation Rapide

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Git

### 1. Cloner le repository
```bash
git clone https://github.com/karimhablal100-sudo/MJCHAUFFAGE.git
cd MJCHAUFFAGE
```

### 2. Installation des dépendances
```bash
# Dépendances racine
npm install

# Frontend
cd frontend
npm install
cd ..

# Backend (si nécessaire)
cd backend
npm install
cd ..
```

### 3. Configuration
```bash
# Copier les variables d'environnement
cp frontend/.env.example frontend/.env.local

# Éditer les variables selon votre environnement
# NEXT_PUBLIC_API_URL=http://localhost:3001
# (NextAuth retiré) Utilisation d'auth maison (cookies/JWT), pas de NEXTAUTH_SECRET
```

### 4. Lancement en développement
```bash
# Démarrage rapide (frontend + backend)
npm run dev

# Ou séparément :
# Frontend (port 3000)
cd frontend && npm run dev

# Backend (port 3001) 
cd backend && node simple-server.js
```

### 5. Accès aux interfaces
- **Site web** : http://localhost:3000
- **Admin** : http://localhost:3005
  - Email : `admin@mjchauffage.com`
  - Mot de passe : `Admin123!`

## 📁 Structure du Projet

```
MJCHAUFFAGE/
├── 📂 frontend/                 # Application Next.js
│   ├── 📂 src/
│   │   ├── 📂 app/             # App Router (Next.js 14)
│   │   │   ├── 📂 [locale]/    # Pages multilingues
│   │   │   │   ├── 📂 admin/   # Dashboard admin
│   │   │   │   ├── 📂 products/# Pages produits
│   │   │   │   └── 📂 auth/    # Authentification
│   │   │   └── 📂 api/         # API Routes
│   │   ├── 📂 components/      # Composants React
│   │   │   ├── 📂 admin/       # Composants admin
│   │   │   ├── 📂 common/      # Composants partagés
│   │   │   └── 📂 products/    # Composants produits
│   │   ├── 📂 services/        # Services API
│   │   └── 📂 styles/          # Styles CSS
│   ├── 📂 public/              # Assets statiques
│   └── 📂 messages/            # Traductions i18n
├── 📂 backend/                  # API Node.js/Express
│   ├── 📄 simple-server.js     # Serveur de développement
│   └── 📄 dist/               # Build production
├── 📂 docs/                    # Documentation
└── 📄 README.md               # Ce fichier
```

## 🛠️ Stack Technique

### Frontend
- **Framework** : Next.js 14 (App Router)
- **Language** : TypeScript 5.0+
- **Styling** : Tailwind CSS 3.0
- **Icons** : Lucide React
- **Internationalisation** : next-intl
- **Authentification** : Auth maison (JWT en cookies + services)
- **State Management** : React Context + Hooks

### Backend
- **Runtime** : Node.js 18+
- **Framework** : Express.js
- **Base de données** : Prisma ORM (PostgreSQL/MySQL)
- **Authentification** : JWT + bcrypt
- **Upload** : Multer (images)
- **Validation** : Joi/Zod

### DevOps & Tools
- **Bundler** : Webpack (Next.js)
- **Linting** : ESLint + Prettier
- **Testing** : Jest + Testing Library
- **CI/CD** : GitHub Actions
- **Deployment** : Vercel/Netlify (Frontend), Railway/Heroku (Backend)

## 📋 Scripts Disponibles

```bash
# Développement
npm run dev              # Démarre frontend + backend
npm run dev:frontend     # Frontend uniquement
npm run dev:backend      # Backend uniquement

# Build & Production
npm run build            # Build complet
npm run start            # Démarre en production
npm run export           # Export statique

# Qualité de code
npm run lint             # ESLint
npm run type-check       # Vérification TypeScript
npm run test             # Tests unitaires

# Base de données
npm run db:migrate       # Migrations Prisma
npm run db:seed          # Données de test
npm run db:studio        # Interface Prisma Studio
```

## 🎯 Fonctionnalités Détaillées

### 🛒 **E-commerce**
- Catalogue produits avec pagination
- Filtres avancés (prix, catégorie, marque)
- Recherche intelligente
- Panier persistant (localStorage)
- Wishlist utilisateur
- Comparaison de produits
- Processus de checkout sécurisé

### 👨‍💼 **Administration**
- Dashboard avec métriques en temps réel
- Gestion complète des produits (CRUD)
- Upload d'images avec prévisualisation
- Gestion des catégories et marques
- Suivi des commandes
- Gestion des utilisateurs et rôles
- Paramètres système

### 🌍 **Multilingue**
- Interface complète FR/AR
- Support RTL pour l'arabe
- URLs localisées (`/fr/products`, `/ar/منتجات`)
- Formatage des devises (DA, €)
- Dates et nombres localisés

## 🔧 Configuration Avancée

### Variables d'Environnement

**Frontend (.env.local)**
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Auth
# (NextAuth retiré) Utilisation d'auth maison basée sur JWT/cookies

# Database (si utilisée côté frontend)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Upload
NEXT_PUBLIC_MAX_FILE_SIZE=5242880  # 5MB
NEXT_PUBLIC_ALLOWED_TYPES=image/jpeg,image/png,image/webp
```

**Backend (.env)**
```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Email (si configuré)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🚀 Déploiement

### Frontend (Vercel)
```bash
# 1. Connecter à Vercel
npm i -g vercel
vercel login

# 2. Déployer
cd frontend
vercel --prod

# 3. Configurer les variables d'environnement sur Vercel
```

### Backend (Railway)
```bash
# 1. Installer Railway CLI
npm i -g @railway/cli

# 2. Login et déployer
railway login
railway init
railway up
```

### Base de Données (Supabase/PlanetScale)
```bash
# Avec Prisma
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:coverage

# Tests spécifiques
npm run test -- --testPathPattern=products
```

## 📊 Performance & Monitoring

### Métriques Next.js
- **Core Web Vitals** optimisés
- **Bundle size** < 250KB (gzipped)
- **First Paint** < 1.5s
- **Time to Interactive** < 3s

### Monitoring
- Vercel Analytics (frontend)
- Sentry (error tracking)
- Google Analytics 4
- Performance monitoring

## 🤖 CodeRabbit AI Code Review

Ce projet utilise **CodeRabbit** pour des revues de code automatiques alimentées par l'IA :

- ✅ **Revues automatiques** sur chaque Pull Request
- ✅ **Suggestions d'amélioration** en temps réel
- ✅ **Détection de bugs** et problèmes de sécurité
- ✅ **Optimisations de performance** suggérées
- ✅ **Conformité aux bonnes pratiques** TypeScript/React

### Configuration CodeRabbit
Le fichier `.coderabbit.yaml` configure les paramètres de revue pour :
- Sécurité des API et validation
- Optimisation des requêtes base de données
- Performance frontend
- Support multilingue (FR/AR)
- Fonctionnalités e-commerce

## 🤝 Contribution

1. **Fork** le repository
2. **Créer** une branche feature (`git checkout -b feature/amazing-feature`)
3. **Commit** les changements (`git commit -m 'Add amazing feature'`)
4. **Push** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrir** une Pull Request (CodeRabbit analysera automatiquement)

### Standards de Code
- **ESLint** + **Prettier** configurés
- **Conventional Commits** requis
- **Tests** obligatoires pour nouvelles features
- **TypeScript strict** mode

## 📝 Changelog

### v1.0.0 (2025-09-29)
- ✅ **Initial release**
- ✅ Site web complet avec e-commerce
- ✅ Dashboard admin fonctionnel
- ✅ Système d'images opérationnel
- ✅ Interface multilingue FR/AR
- ✅ Authentification sécurisée
- ✅ Architecture scalable

## 📞 Support & Contact

- **Email** : karimhablal100@gmail.com
- **GitHub** : [@karimhablal100-sudo](https://github.com/karimhablal100-sudo)
- **Issues** : [GitHub Issues](https://github.com/karimhablal100-sudo/MJCHAUFFAGE/issues)

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**Développé avec ❤️ pour MJ CHAUFFAGE**

*Site web moderne, performant et sécurisé pour le leader des équipements de chauffage en Algérie.*
