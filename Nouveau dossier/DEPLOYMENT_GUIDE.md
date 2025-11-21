# 📦 Guide de Déploiement - MJ CHAUFFAGE

## 🌐 Déploiement sur Netlify

### 1. Préparation du Build

Le dossier de build Next.js se trouve dans `frontend/.next/`. Pour Netlify, nous devons utiliser le répertoire `.next` avec les bonnes configurations.

#### Configuration Netlify

Créez un fichier `netlify.toml` à la racine du projet frontend:

```toml
[build]
  command = "npm run build"
  publish = ".next"
  
[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "8"
  NEXT_TELEMETRY_DISABLED = "1"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### 2. Variables d'Environnement Netlify

Configurez ces variables dans **Netlify Dashboard → Site Settings → Environment Variables**:

```bash
# Backend API (votre backend Railway)
NEXT_PUBLIC_API_URL=https://pretty-stillness-production.up.railway.app/api
BACKEND_API_URL=https://pretty-stillness-production.up.railway.app/api

# Application
NEXT_PUBLIC_APP_URL=https://votre-site.netlify.app
NEXT_PUBLIC_SITE_URL=https://votre-site.netlify.app
NODE_ENV=production

# NextAuth (si utilisé)
NEXTAUTH_URL=https://votre-site.netlify.app
NEXTAUTH_SECRET=votre-secret-tres-securise-32-caracteres-minimum

# Google OAuth
GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre-client-secret
```

### 3. Déploiement

#### Option A: Déploiement via Git (Recommandé)

1. **Connectez votre repo GitHub à Netlify**
   - Allez sur https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Sélectionnez votre repo GitHub
   - Configurez:
     - Base directory: `frontend`
     - Build command: `npm run build`
     - Publish directory: `.next`

2. **Déploiement automatique**
   - Chaque push sur `main` déclenchera un déploiement automatique

#### Option B: Déploiement Manuel

1. **Build local**
   ```bash
   cd frontend
   npm run build
   ```

2. **Déployer via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod
   ```

---

## 🔐 Accès au Dashboard Admin en Production

### URL d'Accès

Une fois déployé, le dashboard admin sera accessible à:

```
https://votre-site.netlify.app/admin
```

Ou spécifiquement la page de connexion:

```
https://votre-site.netlify.app/admin/login
```

### Identifiants Admin

**Email**: `admin@mjchauffage.com`  
**Mot de passe**: `Admin123!`

⚠️ **IMPORTANT**: Changez ce mot de passe après la première connexion!

### Routes Admin Disponibles

Après connexion réussie, vous aurez accès à:

- **Dashboard**: `/admin` - Vue d'ensemble
- **Commandes**: `/admin/orders` - Gestion des commandes
- **Produits**: `/admin/products` - Gestion du catalogue
- **Clients**: `/admin/customers` - Gestion des clients
- **Services**: `/admin/services` - Demandes de service
- **Techniciens**: `/admin/technicians` - Gestion de l'équipe
- **Analytiques**: `/admin/analytics` - Statistiques et rapports

### Vérifications Post-Déploiement

1. **Testez la connexion admin**:
   ```bash
   curl https://votre-site.netlify.app/api/admin/login \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@mjchauffage.com","password":"Admin123!"}'
   ```

2. **Vérifiez les endpoints API**:
   - `/api/products` - Liste des produits
   - `/api/admin/dashboard` - Stats dashboard (avec auth)

### Sécurité Admin en Production

#### 1. Variables d'environnement sensibles

Assurez-vous que ces variables sont configurées dans Netlify:

```bash
JWT_SECRET=votre-jwt-secret-securise
DATABASE_URL=votre-database-url-postgres
REDIS_URL=votre-redis-url
```

#### 2. CORS Configuration

Le backend (Railway) doit autoriser votre domaine Netlify:

```javascript
// backend/src/server.ts
const allowedOrigins = [
  'https://votre-site.netlify.app',
  'https://pretty-stillness-production.up.railway.app',
  process.env.FRONTEND_URL
];
```

#### 3. Rate Limiting

Le rate limiting est déjà configuré pour les routes admin:
- Max 5 tentatives de connexion par 15 minutes
- Protection contre le brute force

### Changer le Mot de Passe Admin

#### Via l'interface admin (après connexion):

1. Allez sur `/admin/settings`
2. Section "Sécurité"
3. "Changer le mot de passe"

#### Via la base de données directement:

```typescript
// Exécuter ce script sur Railway
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function changeAdminPassword() {
  const newPassword = 'VotreNouveauMotDePasse123!';
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  await prisma.user.update({
    where: { email: 'admin@mjchauffage.com' },
    data: { password: hashedPassword }
  });
  
  console.log('✅ Mot de passe admin mis à jour');
}

changeAdminPassword();
```

---

## 🚀 Checklist de Déploiement

### Avant le déploiement:

- [ ] Build local réussi (`npm run build`)
- [ ] Tests passent (`npm test`)
- [ ] Variables d'environnement configurées
- [ ] Backend déployé et fonctionnel (Railway)
- [ ] Base de données migrée et seedée
- [ ] Admin user créé dans la DB

### Après le déploiement:

- [ ] Site accessible (https://votre-site.netlify.app)
- [ ] Page de connexion admin fonctionne
- [ ] Login admin réussi
- [ ] Dashboard admin s'affiche correctement  
- [ ] API calls fonctionnent (check Network tab)
- [ ] Images et assets chargent
- [ ] Performance acceptable (Lighthouse > 80)
- [ ] Pas d'erreurs console
- [ ] SSL/HTTPS actif
- [ ] Redirections configurées
- [ ] Sitemap disponible (/sitemap.xml)
- [ ] Robots.txt configuré

---

## 🔧 Dépannage

### Erreur "Cannot connect to backend"

1. Vérifiez que `NEXT_PUBLIC_API_URL` est bien configuré
2. Testez l'URL du backend directement: `curl https://pretty-stillness-production.up.railway.app/health`
3. Vérifiez les CORS sur le backend

### Erreur 404 sur /admin

1. Vérifiez que le build Next.js inclut bien les routes admin
2. Configurez les redirections Netlify si nécessaire
3. Check `_redirects` file dans `/public`

### Login admin ne fonctionne pas

1. Vérifiez que l'user admin existe dans la DB
2. Testez le endpoint `/api/admin/login` directement
3. Check les logs du backend sur Railway
4. Vérifiez que le JWT_SECRET est le même partout

### Build échoue sur Netlify

1. Check les logs de build Netlify
2. Vérifiez Node version (doit être 18+)
3. Supprimez node_modules et package-lock, puis rebuild
4. Vérifiez qu'il n'y a pas d'erreurs TypeScript

---

## 📱 Accès Mobile au Dashboard Admin

Le dashboard admin est **responsive** et fonctionne sur mobile:

- **Tablettes**: Interface adaptée avec sidebar collapsible
- **Smartphones**: Navigation mobile optimisée
- **Touch-friendly**: Tous les éléments sont tactiles

URL identique: `https://votre-site.netlify.app/admin`

---

## 📊 Monitoring Post-Déploiement

1. **Netlify Analytics**: Activez dans les settings
2. **Google Analytics**: Déjà configuré dans le code
3. **Sentry**: Pour le monitoring d'erreurs (recommandé)
4. **Uptime Robot**: Pour surveiller la disponibilité

---

## 🎯 Performance Optimizations

Le site est déjà optimisé avec:

- ✅ Next.js 14 App Router
- ✅ Image optimization (next/image)
- ✅ Code splitting automatique
- ✅ Static generation où possible
- ✅ API routes proxifiées
- ✅ Compression Gzip/Brotli
- ✅ Cache headers optimisés
- ✅ Progressive Web App (PWA) ready

---

Pour toute question, consultez:
- [Documentation Netlify](https://docs.netlify.com)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Railway Docs](https://docs.railway.app)
