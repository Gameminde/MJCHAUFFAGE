# 🔧 CONTEXT D'INGÉNIERIE - CORRECTION/RÉÉCRITURE ADMIN DASHBOARD

## 🎯 MISSION CRITIQUE
**Résoudre le problème d'authentification admin et rendre le dashboard 100% fonctionnel**

### PROBLÈME ACTUEL
```
❌ ERREUR DE CONNEXION AU DASHBOARD ADMIN
- Impossible de se connecter avec username/password
- Erreur : "Erreur de connexion"
- Backend non accessible (ERR_CONNECTION_REFUSED http://localhost:3001)
```

---

## 📊 DIAGNOSTIC INITIAL REQUIS

### ÉTAPE 1 : IDENTIFIER LA CAUSE RACINE

**A. Vérifier l'état du serveur backend**

```bash
# Vérifier si le backend tourne
lsof -i :3001
# ou
netstat -an | grep 3001
```

**Questions de diagnostic :**
1. ✅ Le serveur backend démarre-t-il ?
2. ✅ Y a-t-il des erreurs dans les logs backend ?
3. ✅ La base de données est-elle accessible ?
4. ✅ Redis est-il fonctionnel ?
5. ✅ Les variables d'environnement sont-elles correctes ?

**B. Tester l'authentification directement**

```bash
# Tester l'endpoint d'authentification
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

**Résultats possibles :**
- ❌ `Connection refused` → Backend ne démarre pas (PROBLÈME CRITIQUE)
- ❌ `404 Not Found` → Route d'authentification manquante
- ❌ `401 Unauthorized` → Credentials incorrects ou logique d'auth cassée
- ❌ `500 Server Error` → Erreur serveur (BDD, Redis, code)
- ✅ `200 OK + token` → Backend fonctionne, problème côté frontend

---

## 🔀 DÉCISION : CORRIGER OU RÉÉCRIRE ?

### CRITÈRES DE DÉCISION

#### ✅ CORRIGER L'EXISTANT SI :
- Le backend démarre et répond
- Le problème est uniquement dans la configuration
- Les routes d'authentification existent
- Le code est compréhensible et bien structuré
- Temps de correction estimé < 2 heures

#### 🔄 RÉÉCRIRE SI :
- Le backend ne démarre pas du tout
- Architecture trop complexe ou corrompue
- Code incompréhensible ou mal structuré
- Multiples dépendances cassées
- Temps de correction estimé > 3 heures

---

## OPTION A : 🔧 CORRIGER L'EXISTANT

### PHASE 1 : RÉPARER LE BACKEND (PRIORITÉ ABSOLUE)

#### 1.1 Diagnostic des Logs Backend

**Localisation des logs :**
- Console de démarrage : `npm run dev` dans `/backend`
- Fichiers de logs (si existants)

**Erreurs à rechercher :**
```
❌ Database connection failed
❌ Redis connection failed
❌ Port 3001 already in use
❌ Missing environment variables
❌ Module not found errors
❌ Prisma client generation failed
```

#### 1.2 Vérification de la Configuration

**Fichier : `backend/.env`**
```env
# Vérifier que TOUTES ces variables existent
DATABASE_URL="postgresql://..."
REDIS_HOST="localhost"
REDIS_PORT="6379"
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
NODE_ENV="development"
PORT="3001"
```

**Fichier : `backend/src/index.ts` ou `backend/src/server.ts`**

Vérifier le point d'entrée :
```typescript
// Le serveur démarre-t-il correctement ?
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
```

#### 1.3 Correction de la Connexion Redis

**PROBLÈME IDENTIFIÉ :** Redis mock peut causer des erreurs silencieuses

**SOLUTION 1 : Désactiver Redis temporairement**

```typescript
// backend/src/config/redis.ts
export const redisClient = {
  get: async () => null,
  set: async () => 'OK',
  del: async () => 1,
  // Mock simple pour bypass Redis
};
```

**SOLUTION 2 : Installer Redis localement**

```bash
# macOS
brew install redis
redis-server

# Linux
sudo apt-get install redis-server
sudo systemctl start redis

# Windows
# Utiliser WSL ou Docker
```

#### 1.4 Correction de la Connexion Base de Données

```bash
# Dans /backend
npx prisma generate
npx prisma db push
npx prisma studio  # Tester l'accès à la BDD
```

#### 1.5 Créer un Utilisateur Admin de Test

**Fichier : `backend/prisma/seed.ts`**

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Supprimer l'ancien admin s'il existe
  await prisma.user.deleteMany({
    where: { email: 'admin@mjchauffage.com' }
  });

  // Créer un admin de test
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@mjchauffage.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'MJ Chauffage',
      role: 'SUPER_ADMIN', // ou 'ADMIN' selon votre schema
      isEmailVerified: true,
    },
  });

  console.log('✅ Admin créé:', admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Exécuter le seed :**
```bash
npx prisma db seed
# ou
npx ts-node prisma/seed.ts
```

#### 1.6 Tester l'Authentification Backend

**Créer un fichier de test : `backend/test-auth.ts`**

```typescript
import axios from 'axios';

async function testAuth() {
  try {
    console.log('🧪 Test de connexion admin...');
    
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@mjchauffage.com',
      password: 'Admin@123',
    });

    console.log('✅ Connexion réussie !');
    console.log('Token:', response.data.accessToken);
    return true;
  } catch (error: any) {
    console.log('❌ Échec de connexion');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message);
    console.log('Erreur complète:', error.message);
    return false;
  }
}

testAuth();
```

**Exécuter :**
```bash
npx ts-node test-auth.ts
```

### PHASE 2 : RÉPARER LE FRONTEND ADMIN

#### 2.1 Vérifier la Configuration API

**Fichier : `frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
# ou
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

#### 2.2 Vérifier le Code de Connexion

**Fichier : `frontend/app/admin/login/page.tsx` ou équivalent**

```typescript
// Vérifier que l'appel API est correct
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password }),
});
```

**Points de vérification :**
- ✅ URL correcte ?
- ✅ Headers corrects ?
- ✅ Body JSON correct ?
- ✅ Gestion des erreurs présente ?

#### 2.3 Corriger la Gestion des Erreurs

```typescript
// Améliorer la gestion d'erreur pour voir le problème exact
try {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('❌ Erreur backend:', error);
    throw new Error(error.message || 'Erreur de connexion');
  }

  const data = await response.json();
  console.log('✅ Connexion réussie:', data);
  
  // Stocker le token
  localStorage.setItem('accessToken', data.accessToken);
  
  // Rediriger vers le dashboard
  window.location.href = '/admin/dashboard';
  
} catch (error) {
  console.error('❌ Erreur complète:', error);
  setError(error.message || 'Erreur de connexion au serveur');
}
```

#### 2.4 Tester dans la Console Navigateur

Ouvrir la console (F12) et tester manuellement :

```javascript
// Tester l'API depuis la console
fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@mjchauffage.com',
    password: 'Admin@123'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

---

## OPTION B : 🔄 RÉÉCRIRE L'ADMIN DASHBOARD

### SI LA CORRECTION ÉCHOUE → RÉÉCRITURE COMPLÈTE

#### CRITÈRES DE RÉÉCRITURE :
- ❌ Backend impossible à démarrer après 1h de debug
- ❌ Architecture trop complexe/cassée
- ❌ Dépendances incompatibles
- ✅ Besoin d'un dashboard simple et fonctionnel RAPIDEMENT

### NOUVELLE ARCHITECTURE SIMPLIFIÉE

#### STACK TECHNIQUE PROPOSÉE :

**Backend :**
- ✅ Express.js (simple et fiable)
- ✅ Prisma ORM (déjà en place)
- ✅ JWT pour authentification
- ❌ PAS de Redis (optionnel, ajouté plus tard)
- ❌ PAS de complexité inutile

**Frontend :**
- ✅ Next.js 14+ (déjà en place)
- ✅ Tailwind CSS (déjà en place)
- ✅ Fetch API (pas de dépendances lourdes)
- ✅ React Hook Form pour les formulaires

### STRUCTURE DE RÉÉCRITURE

```
backend-new/
├── src/
│   ├── index.ts              # Point d'entrée simple
│   ├── routes/
│   │   ├── auth.routes.ts    # Authentification uniquement
│   │   ├── products.routes.ts
│   │   ├── orders.routes.ts
│   │   └── users.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── products.controller.ts
│   │   ├── orders.controller.ts
│   │   └── users.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts  # Vérification JWT simple
│   │   └── admin.middleware.ts # Vérification role admin
│   └── utils/
│       └── jwt.utils.ts
└── prisma/
    └── schema.prisma          # Réutiliser le schema existant

frontend/
├── app/
│   └── admin/
│       ├── login/
│       │   └── page.tsx       # Page de connexion SIMPLE
│       ├── dashboard/
│       │   └── page.tsx       # Dashboard principal
│       ├── products/
│       │   └── page.tsx       # Gestion produits
│       ├── orders/
│       │   └── page.tsx       # Gestion commandes
│       └── layout.tsx         # Layout admin avec guard
└── lib/
    └── api.ts                 # Client API simple
```

### IMPLEMENTATION MINIMALE - BACKEND

**Fichier : `backend-new/src/index.ts`**

```typescript
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/products.routes';
import orderRoutes from './routes/orders.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware basiques
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Démarrage
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});
```

**Fichier : `backend-new/src/routes/auth.routes.ts`**

```typescript
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation basique
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email et mot de passe requis' 
      });
    }

    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ 
        message: 'Identifiants incorrects' 
      });
    }

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ 
        message: 'Identifiants incorrects' 
      });
    }

    // Vérifier si admin
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ 
        message: 'Accès refusé - Admin uniquement' 
      });
    }

    // Générer le token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'secret-dev-key',
      { expiresIn: '24h' }
    );

    // Retourner le token
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('❌ Erreur login:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la connexion' 
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Déconnexion réussie' });
});

export default router;
```

**Fichier : `backend-new/src/middleware/auth.middleware.ts`**

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const authMiddleware = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Récupérer le token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Token manquant' 
      });
    }

    const token = authHeader.substring(7);

    // Vérifier le token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'secret-dev-key'
    ) as JwtPayload;

    // Ajouter les infos user à la requête
    req.user = decoded;
    next();

  } catch (error) {
    return res.status(401).json({ 
      message: 'Token invalide ou expiré' 
    });
  }
};

export const adminMiddleware = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ 
      message: 'Accès refusé - Admin uniquement' 
    });
  }
  next();
};
```

### IMPLEMENTATION MINIMALE - FRONTEND

**Fichier : `frontend/app/admin/login/page.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Tentative de connexion...');
      
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
      }

      console.log('✅ Connexion réussie !');

      // Stocker le token
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));

      // Rediriger vers le dashboard
      router.push('/admin/dashboard');

    } catch (err: any) {
      console.error('❌ Erreur:', err);
      setError(err.message || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Admin Login - MJ Chauffage
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="admin@mjchauffage.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
          <p className="font-semibold">Compte de test :</p>
          <p>Email: admin@mjchauffage.com</p>
          <p>Mot de passe: Admin@123</p>
        </div>
      </div>
    </div>
  );
}
```

**Fichier : `frontend/lib/api.ts`**

```typescript
// Client API simplifié
const API_URL = 'http://localhost:3001/api';

export async function apiRequest(
  endpoint: string, 
  options: RequestInit = {}
) {
  const token = localStorage.getItem('adminToken');

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur API');
  }

  return response.json();
}

// Fonctions helpers
export const auth = {
  login: (email: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
    
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  },
};

export const products = {
  getAll: () => apiRequest('/products'),
  getOne: (id: string) => apiRequest(`/products/${id}`),
  create: (data: any) => apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/products/${id}`, {
    method: 'DELETE',
  }),
};

export const orders = {
  getAll: () => apiRequest('/orders'),
  getOne: (id: string) => apiRequest(`/orders/${id}`),
  updateStatus: (id: string, status: string) =>
    apiRequest(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};
```

---

## 📋 PROTOCOLE DE DÉCISION FINALE

### AGENT : SUIS CE PROTOCOLE EXACTEMENT

1. **TESTER LE BACKEND ACTUEL (15 min max)**
   ```bash
   cd backend
   npm run dev
   ```
   - ✅ Démarre sans erreur → OPTION A (Corriger)
   - ❌ Ne démarre pas → Passer à l'étape 2

2. **TENTATIVE DE CORRECTION RAPIDE (30 min max)**
   - Vérifier `.env`
   - Corriger Redis (désactiver si nécessaire)
   - Recréer un admin avec seed
   - Tester l'authentification
   - ✅ Fonctionne → SUCCÈS, continuer avec corrections
   - ❌ Ne fonctionne toujours pas → OPTION B (Réécrire)

3. **SI RÉÉCRITURE NÉCESSAIRE**
   - Créer `backend-new/` avec le code minimal fourni ci-dessus
   - Tester que ça démarre et que login fonctionne
   - Créer la page de login simplifiée frontend
   - Tester la connexion end-to-end
   - ✅ Fonctionne → Migrer progressivement les autres features
   - ❌ Toujours cassé → DEMANDER DE L'AIDE

---

## 🎯 CRITÈRES DE SUCCÈS

### ✅ CONNEXION ADMIN FONCTIONNELLE SI :
1. Backend démarre sur port 3001
2. Endpoint `/api/auth/login` répond
3. Credentials corrects retournent un token
4. Page de login frontend envoie la requête correctement
5. Token est stocké et utilisé pour les requêtes suivantes
6. Dashboard admin est accessible après connexion

### 📊 MÉTRIQUES DE VALIDATION

```
AVANT CORRECTION :
- Backend : ❌ Ne démarre pas
- Login : ❌ ERR_CONNECTION_REFUSED
- Dashboard : ❌ Inaccessible

APRÈS CORRECTION/RÉÉCRITURE :
- Backend : ✅ Tourne sur :3001
- Login : ✅ Authentification réussie
- Dashboard : ✅ Accessible avec token valide
```

---

## 🚨 INSTRUCTIONS FINALES POUR L'AGENT

1. **COMMENCE PAR UN DIAGNOSTIC COMPLET**
   - Partage les logs backend complets
   - Teste l'endpoint avec curl
   - Vérifie les variables d'environnement

2. **CHOISIS LA BONNE APPROCHE**
   - Correction si rapide (< 1h)
   - Réécriture si bloqué (> 1h de debug)

3. **DOCUMENTE CHAQUE ÉTAPE**
   - Note les erreurs rencontrées
   - Explique les corrections appliquées
   - Fournis les credentials de test

4. **TESTE COMPLÈTEMENT**
   - Connexion admin fonctionne
   - Token est généré
   - Dashboard accessible

5. **FOURNIS UN RAPPORT FINAL**
   ```markdown
   ## RÉSULTAT FINAL
   - Approche choisie : [Correction / Réécriture]
   - Temps passé : X heures
   - Problème résolu : ✅/❌
   - Credentials admin : email + password
   - URL dashboard : http://localhost:3005/dashboard
   
   ## PROCHAINES ÉTAPES
   1. [...]
   2. [...]
   ```

**OBJECTIF** : Que le client puisse se connecter au dashboard admin dans les 2-3 prochaines heures maximum.

**GO ! 🚀**