# 🚀 GUIDE D'INSTALLATION - MJ CHAUFFAGE

## ⚙️ Prérequis Système

### Versions Requises
```bash
Node.js: v18.0.0 ou supérieur
npm: v9.0.0 ou supérieur
Git: version récente
PostgreSQL: v14+ (ou SQLite pour développement)
Redis: v6+ (optionnel pour développement)
```

### Vérification des Prérequis
```bash
# Vérifier les versions installées
node --version          # Doit afficher v18+
npm --version           # Doit afficher v9+
git --version           # Version récente
psql --version          # PostgreSQL (optionnel)
redis-server --version  # Redis (optionnel)
```

### Installation des Prérequis (Windows)

#### Node.js
```bash
# Télécharger depuis https://nodejs.org/
# Ou utiliser Chocolatey
choco install nodejs

# Ou utiliser winget
winget install OpenJS.NodeJS
```

#### PostgreSQL (Optionnel - SQLite par défaut)
```bash
# Télécharger depuis https://www.postgresql.org/download/windows/
# Ou utiliser Chocolatey
choco install postgresql

# Créer une base de données
createdb mjchauffage_dev
createdb mjchauffage_test
```

#### Redis (Optionnel)
```bash
# Télécharger depuis https://github.com/microsoftarchive/redis/releases
# Ou utiliser Docker
docker run -d -p 6379:6379 redis:alpine
```

---

## 📥 Installation Complète

### Étape 1 : Cloner le Projet
```bash
# Cloner le repository
git clone <repository-url>
cd MJCHAUFFAGE

# Vérifier la structure
ls -la
# Vous devriez voir : frontend/, backend/, admin-v2/, docs/
```

### Étape 2 : Installation Frontend
```bash
# Aller dans le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Vérifier l'installation
npm list --depth=0
```

**Dépendances principales installées :**
- Next.js 14 (Framework React)
- TypeScript (Typage statique)
- Tailwind CSS (Styling)
- Zustand (State management)
- React Query (Data fetching)
- NextAuth.js (Authentication)
- Stripe (Paiements)

### Étape 3 : Installation Backend
```bash
# Aller dans le dossier backend
cd ../backend

# Installer les dépendances
npm install

# Vérifier l'installation
npm list --depth=0
```

**Dépendances principales installées :**
- Express.js (Framework web)
- Prisma (ORM)
- TypeScript (Typage statique)
- JWT (Authentication)
- bcryptjs (Hachage mots de passe)
- Helmet (Sécurité)

### Étape 4 : Installation Admin (Optionnel)
```bash
# Admin Backend (NestJS)
cd ../admin-v2/admin-backend
npm install

# Admin Frontend (Next.js)
cd ../admin-frontend
npm install
```

---

## 🔧 Configuration

### Étape 5 : Configuration Frontend
```bash
cd frontend

# Copier le fichier d'exemple
copy .env.example .env.local

# Éditer le fichier .env.local
notepad .env.local
```

**Contenu de `.env.local` :**
```env
# URL de l'API backend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Configuration NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# Configuration Stripe (optionnel)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Configuration Google OAuth (optionnel)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Nom du site
NEXT_PUBLIC_SITE_NAME="MJ CHAUFFAGE"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Étape 6 : Configuration Backend
```bash
cd ../backend

# Copier le fichier d'exemple
copy .env.example .env

# Éditer le fichier .env
notepad .env
```

**Contenu de `.env` (Configuration minimale) :**
```env
# Base de données (SQLite pour développement)
DATABASE_URL="file:./dev.db"

# JWT Secrets (générer avec crypto.randomBytes(64).toString('hex'))
JWT_SECRET="your-jwt-secret-256-bits-minimum"
JWT_REFRESH_SECRET="your-refresh-secret-256-bits-minimum"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Session Secret
SESSION_SECRET="your-session-secret"

# Configuration serveur
PORT=3001
NODE_ENV=development

# CORS Origins
CORS_ORIGIN="http://localhost:3000,http://localhost:3005"

# Configuration email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Configuration Stripe (optionnel)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Configuration PostgreSQL (Production) :**
```env
# Remplacer DATABASE_URL par :
DATABASE_URL="postgresql://username:password@localhost:5432/mjchauffage_dev"
DATABASE_URL_TEST="postgresql://username:password@localhost:5432/mjchauffage_test"
```

---

## 💾 Configuration Base de Données

### Étape 7 : Initialisation Prisma
```bash
cd backend

# Générer le client Prisma
npx prisma generate

# Appliquer le schéma à la base de données
npx prisma db push

# Vérifier la base de données
npx prisma studio
# Ouvre http://localhost:5555 pour voir la DB
```

### Étape 8 : Peupler la Base de Données
```bash
# Exécuter le script de seed
npx prisma db seed

# Vérifier les données créées
npx prisma studio
```

**Données créées par le seed :**
- Utilisateur admin : `admin@mjchauffage.com` / `admin123`
- Utilisateur test : `client@test.com` / `client123`
- Catégories de produits
- Produits d'exemple
- Données de test

### Étape 9 : Créer un Administrateur (Manuel)
```bash
# Script pour créer un admin personnalisé
node -e "
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('votre-mot-de-passe', 12);
  
  const admin = await prisma.user.create({
    data: {
      email: 'votre-email@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'MJ Chauffage',
      role: 'ADMIN',
      isEmailVerified: true
    }
  });
  
  console.log('Admin créé:', admin.email);
  await prisma.\$disconnect();
}

createAdmin().catch(console.error);
"
```

---

## 🚀 Lancement des Serveurs

### Étape 10 : Lancer le Backend
```bash
cd backend

# Mode développement (avec rechargement automatique)
npm run dev

# Ou mode production
npm run build
npm run start:compiled
```

**Vérification Backend :**
- Serveur : http://localhost:3001
- API Health : http://localhost:3001/api/health
- Swagger Docs : http://localhost:3001/api/docs (si configuré)

### Étape 11 : Lancer le Frontend
```bash
# Nouveau terminal
cd frontend

# Mode développement
npm run dev

# Ou mode production
npm run build
npm run start
```

**Vérification Frontend :**
- Site : http://localhost:3000
- Page admin : http://localhost:3000/admin

### Étape 12 : Lancer l'Admin (Optionnel)
```bash
# Terminal 3 - Admin Backend
cd admin-v2/admin-backend
npm run start:dev

# Terminal 4 - Admin Frontend
cd admin-v2/admin-frontend
npm run dev
```

**URLs Admin :**
- Dashboard : http://localhost:3005
- API Admin : http://localhost:3003

---

## ✅ Vérification de l'Installation

### Tests de Fonctionnement

#### 1. Test Backend API
```bash
# Test de santé de l'API
curl http://localhost:3001/api/health

# Test d'authentification
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mjchauffage.com","password":"admin123"}'

# Test des produits
curl http://localhost:3001/api/products
```

#### 2. Test Frontend
```bash
# Ouvrir dans le navigateur
start http://localhost:3000

# Vérifier les pages principales :
# - Page d'accueil : http://localhost:3000
# - Produits : http://localhost:3000/products
# - Connexion : http://localhost:3000/auth/login
# - Admin : http://localhost:3000/admin
```

#### 3. Test Base de Données
```bash
cd backend

# Ouvrir Prisma Studio
npx prisma studio

# Vérifier les tables :
# - User (doit contenir admin et client test)
# - Product (doit contenir produits d'exemple)
# - Category (doit contenir catégories)
```

#### 4. Test Complet
```bash
# Lancer tous les tests
cd frontend && npm run test
cd ../backend && npm run test

# Tests d'intégration
cd frontend && npm run test:integration
cd backend && npm run test:integration
```

---

## 🐛 Résolution de Problèmes Courants

### Erreur : Port déjà utilisé
```bash
# Symptôme : Error: listen EADDRINUSE :::3000
# Solution : Trouver et tuer le processus
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Ou changer le port
# Frontend : PORT=3001 npm run dev
# Backend : PORT=3002 npm run dev
```

### Erreur : Prisma Client non généré
```bash
# Symptôme : Cannot find module '@prisma/client'
# Solution : Régénérer le client
cd backend
npx prisma generate
npm run build
```

### Erreur : Base de données verrouillée
```bash
# Symptôme : database is locked
# Solution : Fermer Prisma Studio et redémarrer
# Ou supprimer le fichier de lock
rm backend/prisma/dev.db-journal
```

### Erreur : Dépendances manquantes
```bash
# Symptôme : Module not found
# Solution : Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install

# Ou nettoyer le cache npm
npm cache clean --force
npm install
```

### Erreur : Variables d'environnement
```bash
# Symptôme : Environment variable not found
# Solution : Vérifier les fichiers .env
# Frontend : .env.local doit exister
# Backend : .env doit exister

# Redémarrer les serveurs après modification des .env
```

### Erreur : CORS
```bash
# Symptôme : Access-Control-Allow-Origin
# Solution : Vérifier CORS_ORIGIN dans backend/.env
CORS_ORIGIN="http://localhost:3000,http://localhost:3005"

# Redémarrer le backend
```

### Erreur : JWT Invalid
```bash
# Symptôme : JsonWebTokenError: invalid token
# Solution : Vérifier JWT_SECRET dans backend/.env
# Générer un nouveau secret :
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📋 Checklist d'Installation

### Prérequis
- [ ] Node.js v18+ installé
- [ ] npm v9+ installé
- [ ] Git installé
- [ ] PostgreSQL installé (optionnel)

### Installation
- [ ] Projet cloné
- [ ] Dépendances frontend installées
- [ ] Dépendances backend installées
- [ ] Fichiers .env configurés
- [ ] Base de données initialisée
- [ ] Données de seed créées

### Vérification
- [ ] Backend démarre sur port 3001
- [ ] Frontend démarre sur port 3000
- [ ] API répond aux requêtes
- [ ] Connexion admin fonctionne
- [ ] Base de données accessible
- [ ] Tests passent

### Optionnel
- [ ] Admin backend installé (port 3003)
- [ ] Admin frontend installé (port 3005)
- [ ] Redis configuré
- [ ] PostgreSQL configuré
- [ ] Stripe configuré
- [ ] Google OAuth configuré

---

## 🚀 Prochaines Étapes

Une fois l'installation terminée :

1. **Lire la documentation** : [Architecture](ARCHITECTURE.md)
2. **Comprendre l'API** : [API Documentation](API_DOCUMENTATION.md)
3. **Développer** : [Frontend Guide](FRONTEND_GUIDE.md) | [Backend Guide](BACKEND_GUIDE.md)
4. **Résoudre les problèmes** : [Troubleshooting](TROUBLESHOOTING.md)

---

## 📞 Support

En cas de problème :
1. Consulter [Troubleshooting](TROUBLESHOOTING.md)
2. Vérifier les logs des serveurs
3. Consulter la documentation technique
4. Créer une issue sur le repository

---

**Dernière mise à jour** : 12 octobre 2025

**Temps d'installation estimé** : 30-45 minutes (première fois)