# 📋 MJ CHAUFFAGE - Résumé du Projet

## ✅ Corrections Appliquées Aujourd'hui

### 1. **Problème d'authentification résolu**
- ❌ **Problème**: Route `/api/auth/login` retournait 404
- ✅ **Solution**: 
  - Corrigé le typo `rateLimitAuth` → `authRateLimit` dans `backend/src/routes/auth.ts`
  - Modifié `config.ts` pour utiliser `/api` au lieu de `/api/v1`
  - Mis à jour `AuthContext.tsx` pour que les routes admin utilisent `ssrBaseURL` (appel direct backend)

### 2. **Build de production corrigé**
- ❌ **Problème**: Échec du build Next.js à cause de Google Fonts et erreurs TypeScript
- ✅ **Solution**:
  - Supprimé l'import de `next/font/google` pour éviter les erreurs réseau
  - Déplacé `authOptions` dans un fichier séparé `lib/auth-options.ts`
  - Le site utilise maintenant des system fonts (fiables pour le build)

---

## 🔑 Accès au Dashboard Admin

### En Développement (Local)
```
URL: http://localhost:3000/admin/login
Email: admin@mjchauffage.com
Password: Admin123!
```

### En Production (Netlify)
```
URL: https://votre-site.netlify.app/admin/login
Email: admin@mjchauffage.com
Password: Admin123!
```

⚠️ **IMPORTANT**: Changez le mot de passe admin après le premier déploiement!

---

## 🏗️ Architecture Système

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   FRONTEND      │         │    BACKEND       │         │   DATABASE      │
│   (Netlify)     │────────▶│   (Railway)      │────────▶│  (PostgreSQL)   │
│   Next.js 14    │         │   Express + TS   │         │   + Redis       │
└─────────────────┘         └──────────────────┘         └─────────────────┘
      |                              |
      | Client side               Server side
      | calls /api/*              API /api/*
      |
      └──── Proxy via Next.js API Routes (pour utilisateurs)
      └──── Direct backend call (pour admin)
```

---

## 📂 Structure des Fichiers Importants

```
MJCHAUFFAGE/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/              # Pages admin
│   │   │   ├── api/                # Next.js API routes (proxy)
│   │   │   └── [locale]/           # Pages publiques i18n
│   │   ├── components/
│   │   │   ├── admin/              # Composants admin
│   │   │   └── auth/               # Authentification
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx     # ✅ CORRIGÉ - Gestion auth
│   │   └── lib/
│   │       ├── config.ts           # ✅ CORRIGÉ - Config API
│   │       └── auth-options.ts     # ✅ NOUVEAU - NextAuth config
│   ├── netlify.toml                # ✅ NOUVEAU - Config Netlify
│   └── .next/                      # Build output
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts             # ✅ CORRIGÉ - Routes auth
│   │   │   └── admin.ts            # Routes admin
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   └── adminAuthController.ts
│   │   └── server.ts               # Express server
│   └── prisma/
│       └── schema.prisma           # Schéma DB
│
└── DEPLOYMENT_GUIDE.md             # ✅ NOUVEAU - Guide déploiement
```

---

## 🚀 Commandes Essentielles

### Développement:
```bash
# Lancer tout (frontend + backend)
npm run dev

# Frontend seulement
cd frontend && npm run dev

# Backend seulement
cd backend && npm run dev
```

### Production:
```bash
# Build frontend pour déploiement
cd frontend
npm run build

# Le dossier .next/ contient le build optimisé
```

### Base de données:
```bash
# Migrations
cd backend
npx prisma migrate dev

# Reset DB
npx prisma migrate reset

# Studio visuel
npx prisma studio
```

---

## 🌐 URLs Importantes

### Développement Local:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Admin**: http://localhost:3000/admin
- **API**: http://localhost:3001/api
- **Prisma Studio**: http://localhost:5555

### Production:
- **Frontend**: https://votre-site.netlify.app
- **Backend**: https://pretty-stillness-production.up.railway.app
- **Admin**: https://votre-site.netlify.app/admin
- **API**: https://pretty-stillness-production.up.railway.app/api

---

## 🔧 Variables d'Environnement

### Frontend (.env.local):
```bash
# Backend URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api
BACKEND_API_URL=http://localhost:3001/api

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-secret-32-chars-minimum

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Backend (.env):
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mjchauffage

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-jwt-secret-very-secure
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 📊 Routes API Principales

### Publiques:
```
GET  /api/products          - Liste produits
GET  /api/products/:id      - Détail produit
POST /api/auth/register     - Inscription
POST /api/auth/login        - Connexion utilisateur
GET  /api/services          - Liste services
```

### Admin (nécessite authentification):
```
POST /api/admin/login       - Connexion admin
GET  /api/admin/me          - Info admin actuel
GET  /api/admin/dashboard   - Stats dashboard
GET  /api/admin/orders      - Liste commandes
PUT  /api/admin/orders/:id  - Modifier commande
GET  /api/admin/customers   - Liste clients
GET  /api/admin/products    - CRUD produits
```

---

## 🎯 Prochaines Étapes pour le Déploiement

1. ✅ **Build réussi** (vérifié avec `npm run build`)
2. ⬜ **Créer compte Netlify**
   - https://app.netlify.com
   - Connecter repo GitHub

3. ⬜ **Configurer variables d'environnement Netlify**
   - Copier toutes les variables depuis le guide
   - Mettre les vraies URLs de production

4. ⬜ **Déployer sur Netlify**
   - Auto-deploy depuis GitHub
   - Ou manual deploy via CLI

5. ⬜ **Tester en production**
   - Login admin
   - Fonctionnalités CRUD
   - Images et assets
   - Performance (Lighthouse)

6. ⬜ **Sécurité post-déploiement**
   - Changer mot de passe admin
   - Vérifier CORS
   - Activer HTTPS
   - Rate limiting actif

---

## 📱 Fonctionnalités Disponibles

### Interface Publique:
- ✅ Catalogue produits avec filtres
- ✅ Détails produits
- ✅ Panier d'achat
- ✅ Multi-langue (FR/AR/EN)
- ✅ Authentification (Email + Google OAuth)
- ✅ Demande de devis
- ✅ Blog/Actualités
- ✅ Contact

### Dashboard Admin:
- ✅ Vue d'ensemble (stats)
- ✅ Gestion commandes
- ✅ Gestion produits (CRUD)
- ✅ Gestion clients
- ✅ Gestion services/devis
- ✅ Gestion techniciens
- ✅ Analytiques & rapports
- ✅ Paramètres système

---

## 🐛 Problèmes Connus & Solutions

### Problème: "Cannot connect to backend"
**Solution**: Vérifier que le backend est bien démarré et que `NEXT_PUBLIC_API_URL` est correct

### Problème: "JWT malformed"  
**Solution**: Vérifier que `JWT_SECRET` est identique entre frontend et backend

### Problème: Images ne chargent pas
**Solution**: Vérifier les CORS sur le backend, ajouter le domaine frontend aux origins autorisées

### Problème: Admin login failed 401
**Solution**: Vérifier que l'utilisateur admin existe dans la DB avec le bon rôle (ADMIN ou SUPER_ADMIN)

---

## 📚 Documentation Utile

- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **NextAuth**: https://next-auth.js.org
- **Tailwind**: https://tailwindcss.com/docs
- **Railway**: https://docs.railway.app
- **Netl ify**: https://docs.netlify.com

---

## 👤 Contact & Support

Pour toute question sur le déploiement ou le développement:
- Consulter le `DEPLOYMENT_GUIDE.md`
- Vérifier les logs (Netlify Functions / Railway Logs)
- Tester les endpoints API directement avec curl/Postman

---

**Date de dernière mise à jour**: 2025-11-20  
**Version**: 1.0.0  
**Status**: ✅ Prêt pour déploiement
