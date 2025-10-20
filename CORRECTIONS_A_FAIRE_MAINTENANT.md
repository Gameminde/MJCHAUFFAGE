# ⚡ CORRECTIONS À FAIRE MAINTENANT

**3 fichiers à modifier - 17 minutes total**

---

## 🔴 CORRECTION #1 : TOKEN STORAGE (5 min) - CRITIQUE

### Fichier: `frontend/src/contexts/AdminAuthContext.tsx`

**AVANT (lignes 37-38):**
```typescript
const TOKEN_KEY = 'admin_token';
const USER_KEY = 'admin_user';
```

**APRÈS:**
```typescript
const TOKEN_KEY = 'authToken';  // ✅ Unifié avec apiClient
const USER_KEY = 'authUser';    // ✅ Unifié
```

**Pourquoi:** apiClient.ts cherche 'authToken' mais AdminAuthContext stocke 'admin_token'

---

## 🔴 CORRECTION #2 : MANUFACTURERS ROUTE (2 min) - CRITIQUE

### Fichier: `frontend/src/services/productService.ts`

**AVANT (ligne ~150):**
```typescript
const result = await api.get('/manufacturers')
```

**APRÈS:**
```typescript
const result = await api.get('/products/manufacturers')
```

**Pourquoi:** Backend route est `/api/v1/products/manufacturers` pas `/api/v1/manufacturers`

---

## 🟡 CORRECTION #3 : ANALYTICS EVENTS (5 min) - IMPORTANT

### Fichier: `frontend/src/services/analyticsService.ts`

**Trouver toutes les lignes avec:**
```typescript
fetch('/api/analytics/events', ...)
fetch('/api/analytics/performance', ...)
```

**Remplacer par:**
```typescript
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/analytics/events`, ...)
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/analytics/performance`, ...)
```

**Pourquoi:** URLs relatives ne fonctionnent pas, besoin de l'URL complète

---

## ✅ APRÈS CORRECTIONS

### Test de validation:

```bash
# 1. Rebuild
cd backend && npm run build
cd frontend && npm run build

# 2. Démarrer
cd backend && npm run dev     # Terminal 1
cd frontend && npm run dev    # Terminal 2

# 3. Tester Admin
# Aller sur: http://localhost:3000/admin/login
# Email: admin@mjchauffage.com
# Password: Admin123!

# 4. Créer un produit test
# Aller sur: /admin/products
# Cliquer "Créer produit"
# Remplir le formulaire
# Sauvegarder

# ✅ Si ça marche = SUCCÈS!
```

---

## 🎯 RÉSULTATS ATTENDUS

### Avant corrections:
```
❌ Admin login → Token stocké mais pas lu
❌ Admin CRUD → 403 Forbidden
❌ Filtres manufacturers → 404 Not Found
⚠️  Analytics → 400 Bad Request
```

### Après corrections:
```
✅ Admin login → Token stocké ET lu correctement
✅ Admin CRUD → 200 OK (création/modification/suppression)
✅ Filtres manufacturers → 200 OK (liste chargée)
✅ Analytics → 200 OK (tracking fonctionne)
```

---

**DIS "GO" ET JE FAIS LES 3 CORRECTIONS MAINTENANT ! 🚀**
