# ⚡ PLAN D'ACTION IMMÉDIAT - MJ CHAUFFAGE

**Ce qu'il faut faire MAINTENANT pour terminer le projet**

---

## 🎯 PROBLÈMES CRITIQUES À RÉGLER MAINTENANT

### 🔴 1. ADMIN NE FONCTIONNE PAS (2-3h)

**Problème:** Impossible de créer/modifier des produits  
**Erreur:** `403 Forbidden - Invalid or expired token`

**Solution Rapide:**

```bash
# 1. Vérifier que le backend tourne
cd backend
npm run dev  # Port 3001

# 2. Créer un admin dans la DB
npx prisma studio
# Créer un User avec:
# - email: admin@mjchauffage.com
# - password: (hashé avec bcrypt)
# - role: ADMIN

# 3. Tester login admin
# Aller sur http://localhost:3000/admin/login
# Se connecter
```

**Modifications code nécessaires:**

1. **Supprimer next-auth** (cause des erreurs)
```bash
cd frontend
npm uninstall next-auth
```

2. **Créer contexte auth custom** 
Fichier: `frontend/src/contexts/AdminAuthContext.tsx`
```typescript
// Auth basique avec localStorage
// POST /api/v1/admin/login
// Stocker token dans localStorage
// Envoyer token dans headers Authorization
```

3. **Fixer AdminAuthGuard**
Fichier: `frontend/src/components/admin/AdminAuthGuard.tsx`
```typescript
// Vérifier token dans localStorage
// Valider avec backend: GET /api/v1/admin/me
// Rediriger si non authentifié
```

---

### 🔴 2. ROUTES API MANQUANTES (1h)

**Routes à créer:**

#### A. GET /api/v1/manufacturers
Fichier: `backend/src/routes/products.ts`
```typescript
router.get('/manufacturers', async (req, res) => {
  const manufacturers = await prisma.product.findMany({
    select: { manufacturer: true },
    distinct: ['manufacturer'],
  });
  res.json(manufacturers.map(p => p.manufacturer).filter(Boolean));
});
```

#### B. POST /api/v1/analytics/events
Fichier: `backend/src/routes/analytics.ts`
```typescript
router.post('/events', async (req, res) => {
  const { eventType, data, sessionId } = req.body;
  // Stocker dans DB ou ignorer (non critique)
  res.json({ success: true });
});
```

---

## 🟡 AMÉLIORATIONS IMPORTANTES (4-5h)

### 3. MODERNISER PAGE DÉTAIL PRODUIT (3h)

**Créer:** `frontend/src/app/[locale]/products/[id]/ModernProductDetail.tsx`

**Sections:**
```typescript
// 1. Galerie images (avec zoom)
<ProductGallery images={product.images} />

// 2. Infos + Panier
<ProductInfo product={product} />

// 3. Tabs (Description / Specs / Reviews)
<ProductTabs product={product} />

// 4. Produits similaires
<RelatedProducts categoryId={product.categoryId} />
```

---

### 4. MODERNISER UI ADMIN (2h)

**Priorité: Dashboard + Products**

#### Dashboard Admin Moderne
Fichier: `frontend/src/app/admin/dashboard/page.tsx`

```typescript
// 4 Stats Cards
<div className="grid grid-cols-4 gap-4">
  <StatsCard title="Ventes" value="152,430 DA" trend="+12%" />
  <StatsCard title="Commandes" value="47" trend="+8%" />
  <StatsCard title="Clients" value="234" trend="+15%" />
  <StatsCard title="Produits" value="156" trend="+3%" />
</div>

// Graphique ventes
<SalesChart data={last30Days} />

// Commandes récentes
<RecentOrders orders={recentOrders} />
```

#### Gestion Produits Moderne
Fichier: `frontend/src/app/admin/products/page.tsx`

```typescript
// Table avec actions
<DataTable
  data={products}
  columns={[
    { key: 'image', label: 'Image' },
    { key: 'name', label: 'Nom' },
    { key: 'price', label: 'Prix' },
    { key: 'stock', label: 'Stock' },
    { key: 'actions', label: 'Actions' },
  ]}
  actions={{
    edit: (product) => router.push(`/admin/products/${product.id}/edit`),
    delete: (product) => handleDelete(product.id),
  }}
/>
```

---

## 🟢 NETTOYAGE & FINITION (2-3h)

### 5. REMPLACER console.log (30min)

```bash
cd backend
..\scripts\replace-console-logs.ps1
npm run lint --fix
```

### 6. SUPPRIMER admin-v2 (15min)

```bash
# Backup d'abord
cp -r admin-v2 backups/

# Supprimer
rm -rf admin-v2/
```

### 7. TESTS COMPLETS (1-2h)

**Checklist rapide:**
```
Frontend Public:
✓ Homepage charge
✓ Catalogue produits affiche
✓ Panier fonctionne
✓ Checkout fonctionne
✓ i18n FR/AR fonctionne

Admin Dashboard:
✓ Login admin OK
✓ Dashboard affiche stats
✓ Créer produit OK
✓ Modifier produit OK
✓ Supprimer produit OK
✓ Liste commandes OK
```

---

## 📊 ORDRE D'EXÉCUTION RECOMMANDÉ

### 🔥 AUJOURD'HUI (3-4h)
1. ✅ **Fix Admin Auth** (2h)
2. ✅ **Routes API manquantes** (1h)
3. ✅ **Test admin complet** (1h)

### 📅 DEMAIN (3-4h)
4. ✅ **Page détail produit** (3h)
5. ✅ **Tests frontend** (1h)

### 📅 APRÈS-DEMAIN (2-3h)
6. ✅ **Moderniser admin UI** (2h)
7. ✅ **Nettoyage** (1h)

---

## 🆘 COMMANDES RAPIDES

### Démarrer le projet
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Créer un admin
```bash
cd backend
npx prisma studio
# Créer User avec role: ADMIN
```

### Tester une API
```bash
# Test produits
curl http://localhost:3001/api/v1/products

# Test health
curl http://localhost:3001/api/v1/health
```

### Rebuild si erreurs
```bash
# Backend
cd backend
rm -rf dist node_modules
npm install
npm run build

# Frontend
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

---

## 📝 NOTES IMPORTANTES

### Ce qui marche déjà ✅
- Backend compile (0 erreurs)
- Frontend public fonctionne
- Panier + Checkout OK
- Design moderne 2025
- i18n FR/AR/EN

### Ce qui ne marche pas ❌
- Admin login/token
- CRUD produits admin
- Routes manufacturers/analytics
- Page détail produit basique

### Fichiers critiques à modifier
```
backend/src/routes/admin.ts          # Login admin
backend/src/routes/products.ts       # Manufacturers
backend/src/routes/analytics.ts      # Events
frontend/src/contexts/AdminAuthContext.tsx  # Auth custom
frontend/src/components/admin/AdminAuthGuard.tsx  # Guard
frontend/src/app/admin/products/page.tsx  # CRUD produits
```

---

## ✅ CHECKLIST AVANT DÉPLOIEMENT

Minimum vital:
- [ ] Admin peut se connecter
- [ ] Admin peut créer/modifier/supprimer produits
- [ ] Clients peuvent acheter (panier → checkout)
- [ ] Emails confirmation envoyés
- [ ] i18n FR/AR fonctionne
- [ ] Responsive mobile OK
- [ ] 0 erreurs console critiques

Bonus si temps:
- [ ] Page détail produit moderne
- [ ] Dashboard admin avec stats
- [ ] Lighthouse > 90
- [ ] Documentation complète

---

## 🎯 OBJECTIF FINAL

**Un site e-commerce fonctionnel où:**
1. Les clients peuvent acheter des produits ✅
2. L'admin peut gérer le catalogue ⚠️ (À FIXER EN PRIORITÉ)
3. Le site est beau et moderne ✅
4. Le code est propre et maintainable 🟡 (Presque)

**Temps restant estimé:** 8-12 heures de travail

**Prochaine action:** Fixer l'authentification admin (Section 1)

---

**TU PEUX LE FAIRE ! 💪🚀**
