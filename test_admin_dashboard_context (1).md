# 🎯 CONTEXT D'INGÉNIERIE - TEST & CORRECTION ADMIN DASHBOARD

## ✅ ÉTAT ACTUEL VALIDÉ

### Backend : OPÉRATIONNEL ✅
```
✅ Serveur : Port 3001 actif
✅ Compilation : TypeScript → JavaScript OK
✅ Health check : Endpoints fonctionnels
✅ Base de données : SQLite connectée
✅ Redis : Mock fonctionnel
✅ Middlewares : Ordre corrigé
```

---

## 🎯 MISSION ACTUELLE
**Tester et corriger toutes les fonctionnalités du dashboard administrateur**

### Objectifs :
1. ✅ Connexion admin fonctionnelle
2. ✅ Dashboard principal accessible
3. ✅ Gestion des produits (CRUD complet)
4. ✅ Gestion des commandes
5. ✅ Gestion des clients
6. ✅ Paramètres système
7. ✅ Analytics et statistiques

---

## 📋 PLAN DE TEST SYSTÉMATIQUE

### PHASE 1 : TEST DE CONNEXION ADMIN (PRIORITÉ 1)

#### 1.1 Vérifier l'existence de l'utilisateur admin

**Action** :
```bash
cd backend

# Créer un script de vérification
cat > check-admin.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@mjchauffage.com' }
    });
    
    if (admin) {
      console.log('✅ Admin trouvé:', {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        firstName: admin.firstName,
        lastName: admin.lastName
      });
    } else {
      console.log('❌ Aucun admin trouvé');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
EOF

node check-admin.js
```

**Si aucun admin n'existe** :
```bash
# Créer l'admin
cat > create-admin.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@mjchauffage.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'MJ Chauffage',
        role: 'SUPER_ADMIN',
        isEmailVerified: true,
        phone: '+213555000000',
      }
    });
    
    console.log('✅ Admin créé avec succès:', admin.email);
    console.log('📧 Email: admin@mjchauffage.com');
    console.log('🔑 Password: Admin@123');
  } catch (error) {
    console.error('❌ Erreur création admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
EOF

node create-admin.js
```

#### 1.2 Tester l'authentification API directement

```bash
# Test de login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mjchauffage.com",
    "password": "Admin@123"
  }' | jq
```

**Résultats possibles** :

**✅ SUCCÈS (200 OK)** :
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "admin@mjchauffage.com",
    "role": "SUPER_ADMIN"
  }
}
```
→ Backend auth fonctionne, passer à 1.3

**❌ ÉCHEC (401 Unauthorized)** :
```json
{
  "message": "Identifiants incorrects"
}
```
→ Problème de credentials ou hash password

**❌ ÉCHEC (404 Not Found)** :
```json
{
  "message": "Route not found"
}
```
→ Route `/api/auth/login` n'existe pas

**❌ ÉCHEC (500 Server Error)** :
```json
{
  "message": "Internal server error"
}
```
→ Erreur dans le code du controller

#### 1.3 Identifier et corriger les problèmes d'authentification

**Si 404 - Route manquante** :

Vérifier `backend/dist/routes/auth.js` existe :
```bash
ls -la backend/dist/routes/auth.js
```

Si absent, vérifier `backend/src/routes/auth.ts` :
```typescript
// Doit contenir
import { Router } from 'express';
import { authController } from '@/controllers/authController';

const router = Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.get('/profile', authMiddleware, authController.getProfile);

export default router;
```

Et vérifier dans `server.ts` :
```typescript
import authRoutes from '@/routes/auth';
app.use('/api/auth', authRoutes);
```

**Si 500 - Erreur serveur** :

Vérifier les logs backend :
```bash
# Dans le terminal où tourne le backend
# Observer les erreurs
```

Problèmes courants :
- ❌ Prisma client pas généré
- ❌ Bcrypt compare échoue
- ❌ JWT secret manquant

**Si 401 - Credentials incorrects** :

Tester différents mots de passe :
```bash
# Test 1
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mjchauffage.com","password":"Admin@123"}'

# Test 2
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mjchauffage.com","password":"admin123"}'

# Test 3
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mjchauffage.com","password":"admin"}'
```

Ou recréer l'admin avec un mot de passe connu.

---

### PHASE 2 : TEST DU FRONTEND ADMIN (PRIORITÉ 1)

#### 2.1 Vérifier la configuration frontend

**Fichier** : `frontend/.env.local` ou `frontend/.env`

Créer/vérifier :
```bash
cd frontend

# Créer le fichier s'il n'existe pas
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME="MJ Chauffage"
EOF
```

**Redémarrer le frontend** :
```bash
# Arrêter (Ctrl+C)
npm run dev
```

#### 2.2 Accéder à la page de login admin

**URL** : http://localhost:3005/login

**Ouvrir la console développeur (F12)**

**Vérifier** :
- ✅ Page se charge sans erreur
- ✅ Formulaire de connexion visible
- ✅ Aucune erreur console
- ✅ Aucune erreur dans l'onglet Network

**Si erreurs visibles** :

**Erreur : "Cannot read property 'NEXT_PUBLIC_API_URL'"**
→ `.env.local` mal configuré, recommencer 2.1

**Erreur : "Failed to fetch"**
→ Backend pas accessible, vérifier qu'il tourne sur :3001

**Erreur : "CORS policy blocked"**
→ Configuration CORS incorrecte dans backend

#### 2.3 Tester la connexion depuis le navigateur

**Dans le formulaire** :
- Email : `admin@mjchauffage.com`
- Password : `Admin@123` (ou celui qui a fonctionné en curl)

**Cliquer "Se connecter"**

**Observer la console (F12)** :
- Onglet **Console** : Messages de log
- Onglet **Network** : Requête POST vers `/api/auth/login`

**Résultats possibles** :

**✅ SUCCÈS** :
- Status : 200 OK
- Réponse contient un token
- Redirection vers `/admin/dashboard`
→ Connexion OK, passer à Phase 3

**❌ ÉCHEC - Erreur réseau** :
```
POST http://localhost:3001/api/auth/login net::ERR_CONNECTION_REFUSED
```
→ Backend pas démarré ou pas sur le bon port

**❌ ÉCHEC - CORS** :
```
Access to fetch at 'http://localhost:3001/api/auth/login' has been blocked by CORS policy
```
→ Corriger la configuration CORS backend

**❌ ÉCHEC - 401** :
```
Response: {"message": "Identifiants incorrects"}
```
→ Mauvais credentials ou problème backend

**❌ ÉCHEC - Pas de requête** :
→ Problème dans le code frontend, vérifier le composant

#### 2.4 Corriger les problèmes frontend identifiés

**PROBLÈME : Erreur CORS**

**Fichier** : `backend/src/server.ts` ou `backend/dist/server.js`

Vérifier la configuration CORS :
```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    config.frontend.url
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));
```

Recompiler et redémarrer :
```bash
cd backend
npm run build
npm start
```

**PROBLÈME : Code frontend ne fait pas la requête**

**Fichier** : `frontend/app/admin/login/page.tsx`

Vérifier le code du formulaire :
```typescript
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Tentative de connexion...');
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Réponse reçue:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur de connexion');
      }

      const data = await response.json();
      console.log('✅ Connexion réussie:', data);

      // Stocker le token
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Rediriger vers le dashboard
      router.push('/admin/dashboard');

    } catch (err: any) {
      console.error('❌ Erreur connexion:', err);
      setError(err.message || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Connexion Admin
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@mjchauffage.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          <p className="font-semibold text-blue-800">Compte de test :</p>
          <p className="text-blue-700">Email: admin@mjchauffage.com</p>
          <p className="text-blue-700">Mot de passe: Admin@123</p>
        </div>
      </div>
    </div>
  );
}
```

---

### PHASE 3 : TEST DU DASHBOARD PRINCIPAL (PRIORITÉ 2)

Une fois la connexion réussie, tester le dashboard :

#### 3.1 Vérifier l'accès au dashboard

**URL automatique** : http://localhost:3005/dashboard

**Vérifier** :
- ✅ Page se charge
- ✅ Layout admin visible (sidebar, header)
- ✅ Pas de redirection vers login
- ✅ Nom de l'utilisateur affiché
- ✅ Bouton de déconnexion visible

**Si redirigé vers login** :
→ Protection de route trop stricte ou token non envoyé

**Si erreur 404** :
→ Page dashboard n'existe pas

**Si page blanche** :
→ Erreur JavaScript, vérifier console

#### 3.2 Tester la protection de route

**Ouvrir** : http://localhost:3005/dashboard

**Sans être connecté** :
- ✅ Doit rediriger vers `/admin/login`

**Après connexion** :
- ✅ Doit afficher le dashboard

**Code de protection** : `frontend/app/admin/layout.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      console.log('❌ Non authentifié, redirection...');
      router.push('/admin/login');
      return;
    }

    // Vérifier si l'utilisateur est admin
    const userData = JSON.parse(user);
    if (userData.role !== 'ADMIN' && userData.role !== 'SUPER_ADMIN') {
      console.log('❌ Non autorisé, redirection...');
      router.push('/');
      return;
    }

    console.log('✅ Authentification validée');
  }, [router]);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white min-h-screen">
        <div className="p-4">
          <h2 className="text-xl font-bold">MJ Chauffage Admin</h2>
        </div>
        <nav className="mt-4">
          <a href="/admin/dashboard" className="block px-4 py-2 hover:bg-gray-700">
            Dashboard
          </a>
          <a href="/admin/products" className="block px-4 py-2 hover:bg-gray-700">
            Produits
          </a>
          <a href="/admin/orders" className="block px-4 py-2 hover:bg-gray-700">
            Commandes
          </a>
          <a href="/admin/customers" className="block px-4 py-2 hover:bg-gray-700">
            Clients
          </a>
          <a href="/admin/settings" className="block px-4 py-2 hover:bg-gray-700">
            Paramètres
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
```

#### 3.3 Tester les statistiques du dashboard

**Fonctionnalités à vérifier** :
- [ ] Nombre total de produits
- [ ] Nombre de commandes
- [ ] Chiffre d'affaires
- [ ] Nouveaux clients
- [ ] Graphiques (si présents)

**Si les données ne s'affichent pas** :
→ Vérifier les appels API dans console
→ Vérifier que les endpoints backend existent

---

### PHASE 4 : TEST GESTION DES PRODUITS (PRIORITÉ 3)

#### 4.1 Accéder à la page produits

**URL** : http://localhost:3005/dashboard/products

**Vérifier** :
- ✅ Liste des produits s'affiche (vide ou avec données)
- ✅ Bouton "Ajouter un produit"
- ✅ Recherche/filtres fonctionnels
- ✅ Actions : Modifier, Supprimer

#### 4.2 Tester l'ajout de produit

**Cliquer "Ajouter un produit"**

**Formulaire attendu** :
- Nom du produit
- Description
- Prix
- Catégorie
- Stock
- Images
- Références

**Remplir et soumettre**

**Vérifier** :
- Console : Requête POST `/api/products`
- Réponse : Status 201 Created
- Liste : Nouveau produit ajouté

**Si erreur 400** :
→ Validation côté backend, champs manquants

**Si erreur 500** :
→ Erreur dans le controller de création

#### 4.3 Tester la modification de produit

**Cliquer sur "Modifier" d'un produit**

**Vérifier** :
- Formulaire pré-rempli avec les données
- Modifier des champs
- Soumettre

**Observer** :
- Requête PUT `/api/products/:id`
- Réponse : Status 200 OK
- Liste mise à jour

#### 4.4 Tester la suppression de produit

**Cliquer sur "Supprimer"**

**Vérifier** :
- Confirmation demandée
- Requête DELETE `/api/products/:id`
- Produit retiré de la liste

---

### PHASE 5 : TEST GESTION DES COMMANDES (PRIORITÉ 3)

#### 5.1 Accéder aux commandes

**URL** : http://localhost:3005/dashboard/orders

**Vérifier** :
- Liste des commandes
- Détails : Client, produits, montant, statut
- Filtres par statut

#### 5.2 Tester le changement de statut

**Sélectionner une commande**

**Changer le statut** : En attente → En cours → Expédiée → Livrée

**Vérifier** :
- Requête PUT `/api/orders/:id/status`
- Mise à jour immédiate
- Notifications envoyées (si configuré)

#### 5.3 Tester l'impression de facture

**Cliquer "Imprimer facture"**

**Vérifier** :
- PDF généré ou page d'impression
- Données correctes (produits, montant, client)

---

### PHASE 6 : TEST PARAMÈTRES SYSTÈME (PRIORITÉ 4)

#### 6.1 Accéder aux paramètres

**URL** : http://localhost:3005/dashboard/settings

**Sections à tester** :
- Informations générales (nom site, logo)
- Moyens de paiement
- Options de livraison
- Taxes et frais
- Gestion des utilisateurs admin

#### 6.2 Tester les modifications

**Modifier un paramètre**

**Vérifier** :
- Requête PUT `/api/settings`
- Confirmation de sauvegarde
- Changement effectif

---

## 📋 CHECKLIST COMPLÈTE DE VALIDATION

### ✅ Authentification
- [ ] Utilisateur admin créé
- [ ] Login backend fonctionne (curl)
- [ ] Login frontend fonctionne
- [ ] Token généré et stocké
- [ ] Redirection après connexion
- [ ] Protection des routes admin
- [ ] Déconnexion fonctionne

### ✅ Dashboard
- [ ] Page accessible après connexion
- [ ] Statistiques affichées
- [ ] Graphiques visibles (si présents)
- [ ] Navigation sidebar fonctionne
- [ ] Header avec nom utilisateur

### ✅ Gestion Produits
- [ ] Liste des produits s'affiche
- [ ] Ajout de produit fonctionne
- [ ] Modification de produit fonctionne
- [ ] Suppression de produit fonctionne
- [ ] Upload d'images fonctionne
- [ ] Recherche/filtres fonctionnent

### ✅ Gestion Commandes
- [ ] Liste des commandes s'affiche
- [ ] Détails de commande visibles
- [ ] Changement de statut fonctionne
- [ ] Filtres par statut fonctionnent
- [ ] Impression facture fonctionne

### ✅ Gestion Clients
- [ ] Liste des clients s'affiche
- [ ] Détails client accessibles
- [ ] Historique d'achat visible
- [ ] Recherche clients fonctionne

### ✅ Paramètres
- [ ] Page paramètres accessible
- [ ] Modification paramètres fonctionne
- [ ] Sauvegarde effective
- [ ] Gestion utilisateurs admin

---

## 🎯 RAPPORT DE TEST À FOURNIR

```markdown
# RAPPORT DE TEST - ADMIN DASHBOARD MJ CHAUFFAGE

## Résumé Exécutif
- Tests effectués : XX/XX
- Fonctionnalités OK : XX
- Bugs identifiés : XX
- Gravité : [Critique/Majeur/Mineur]

## Détail des Tests

### ✅ Authentification
- Login backend : [OK/KO]
- Login frontend : [OK/KO]
- Protection routes : [OK/KO]
- Credentials : admin@mjchauffage.com / Admin@123

### ✅ Dashboard Principal
- Accès : [OK/KO]
- Statistiques : [OK/KO]
- Navigation : [OK/KO]

### ✅ Gestion Produits
- Liste : [OK/KO]
- Ajout : [OK/KO]
- Modification : [OK/KO]
- Suppression : [OK/KO]
- Upload images : [OK/KO]

### ✅ Gestion Commandes
- Liste : [OK/KO]
- Détails : [OK/KO]
- Changement statut : [OK/KO]
- Facture : [OK/KO]

### ✅ Gestion Clients
- Liste : [OK/KO]
- Détails : [OK/KO]
- Historique : [OK/KO]

### ✅ Paramètres
- Accès : [OK/KO]
- Modifications : [OK/KO]

## Bugs Identifiés

### [CRITIQUE] Titre du bug
- Localisation : 
- Description : 
- Impact : 
- Solution : 

### [MAJEUR] Titre du bug
- Localisation : 
- Description : 
- Impact : 
- Solution : 

## Prochaines Actions
1. Corriger les bugs critiques
2. Corriger les bugs majeurs
3. Optimisations
4. Phase sécurité

## Statut Final
[FONCTIONNEL / PARTIELLEMENT FONCTIONNEL / NON FONCTIONNEL]
```

---

## 🚀 COMMENCER LES TESTS MAINTENANT

**Étape 1** : Vérifier que backend et frontend tournent
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Étape 2** : Créer l'admin (si pas déjà fait)
```bash
cd backend
node create-admin.js
```

**Étape 3** : Ouvrir http://localhost:3005/login

**Étape 4** : Se connecter et tester chaque fonctionnalité

**GO ! 🔍**