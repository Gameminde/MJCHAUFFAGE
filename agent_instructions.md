# 🚀 Instructions Agent - Migration Pages Admin

## 📋 Contexte
Migration des 3 dernières pages Admin critiques vers les services centralisés. **27 fetch() à éliminer**.

---

## 📦 Fichiers Fournis (Prêts à Copier)

### **Services Backend**
```
✅ frontend/src/services/customersService.ts
✅ frontend/src/services/ordersService.ts  
✅ frontend/src/services/optimizationService.ts
```

### **Guides**
```
✅ Guide de refactoring complet (admin_pages_refactor_guide)
```

---

## 🎯 Mission : Refactoriser 3 Pages

### **1️⃣ CustomersManagement.tsx** (Priorité 1)

**Fichier :** `frontend/src/pages/admin/CustomersManagement.tsx`

**Actions :**
1. Ajouter les imports :
```typescript
import { customersService, type Customer, type CustomerFilters } from '@/services/customersService';
import { ApiError } from '@/lib/api';
```

2. Remplacer **toutes** les fonctions utilisant `fetch()` :

| Fonction actuelle | Remplacer par | Endpoint |
|------------------|---------------|----------|
| Charger les clients | `customersService.getCustomers(filters)` | GET /admin/customers |
| Modifier un client | `customersService.updateCustomer(id, data)` | PATCH /admin/customers/:id |
| Supprimer un client | `customersService.deleteCustomer(id)` | DELETE /admin/customers/:id |
| Recherche | `customersService.searchCustomers(query)` | GET /admin/customers/search |
| Stats | `customersService.getCustomerStats()` | GET /admin/customers/stats |
| Bloquer/Débloquer | `customersService.toggleCustomerStatus(id, status)` | PATCH /admin/customers/:id/status |

3. Supprimer :
```typescript
// ❌ À supprimer
const API_URL = 'http://localhost:5000/api';
const httpUrl = `${API_URL}/admin/customers`;
const token = localStorage.getItem('authToken');
```

4. Unifier la gestion d'erreurs :
```typescript
const handleError = (error: unknown) => {
  if (error instanceof ApiError) {
    toast.error(`Erreur ${error.statusCode}: ${error.message}`);
  } else {
    toast.error('Une erreur inattendue est survenue');
  }
};
```

5. Exemple de refactoring complet :
```typescript
// ❌ AVANT
const fetchCustomers = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:5000/api/admin/customers', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setCustomers(data.data);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

// ✅ APRÈS
const fetchCustomers = async (filters?: CustomerFilters) => {
  setLoading(true);
  try {
    const result = await customersService.getCustomers(filters);
    setCustomers(result.customers);
    setTotalPages(result.totalPages);
  } catch (error) {
    handleError(error);
  } finally {
    setLoading(false);
  }
};
```

---

### **2️⃣ OrdersManagement.tsx** (Priorité 2)

**Fichier :** `frontend/src/pages/admin/OrdersManagement.tsx`

**Actions :**
1. Ajouter les imports :
```typescript
import { 
  ordersService, 
  OrderStatusUtils,
  type Order, 
  type OrderFilters 
} from '@/services/ordersService';
import { paymentService } from '@/services/paymentService';
import { ApiError } from '@/lib/api';
```

2. Remplacer les fonctions :

| Fonction actuelle | Remplacer par | Endpoint |
|------------------|---------------|----------|
| Charger commandes | `ordersService.getOrders(filters)` | GET /admin/orders |
| Mettre à jour statut | `ordersService.updateOrderStatus(id, status)` | PATCH /admin/orders/:id/status |
| Annuler commande | `ordersService.cancelOrder(id, reason)` | POST /admin/orders/:id/cancel |
| Marquer expédiée | `ordersService.markAsShipped(id, tracking)` | POST /admin/orders/:id/ship |
| Rembourser | `ordersService.refundOrder(id, amount)` | Composite (payment + order) |
| Générer facture | `ordersService.generateInvoice(id)` | GET /admin/orders/:id/invoice |
| Stats | `ordersService.getOrderStats()` | GET /admin/orders/stats |

3. **Cas spécial : Remboursement** (utilise 2 services)
```typescript
const handleRefund = async (orderId: string, amount?: number) => {
  if (!confirm('Confirmer le remboursement ?')) return;
  
  setLoading(true);
  try {
    // ordersService appelle automatiquement paymentService
    const { order, refundId } = await ordersService.refundOrder(
      orderId, 
      amount, 
      'Demandé par l\'admin'
    );
    
    setOrders(prev => prev.map(o => o.id === orderId ? order : o));
    toast.success(`Remboursement effectué (ID: ${refundId})`);
  } catch (error) {
    handleError(error);
  } finally {
    setLoading(false);
  }
};
```

4. **Utiliser les helpers de statut** :
```typescript
// ❌ AVANT : Logique dispersée
const canRefund = (order) => {
  return order.paymentStatus === 'paid' && 
         ['processing', 'shipped', 'delivered'].includes(order.status);
};

// ✅ APRÈS : Helper centralisé
import { OrderStatusUtils } from '@/services/ordersService';

<Button 
  disabled={!OrderStatusUtils.canRefund(order)}
  onClick={() => handleRefund(order.id)}
>
  Rembourser
</Button>

<Badge color={OrderStatusUtils.getStatusColor(order.status)}>
  {OrderStatusUtils.getStatusLabel(order.status)}
</Badge>
```

5. **Pagination et filtres** :
```typescript
const [filters, setFilters] = useState<OrderFilters>({
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
});

const loadOrders = async () => {
  setLoading(true);
  try {
    const result = await ordersService.getOrders(filters);
    setOrders(result.orders);
    setTotalPages(result.totalPages);
  } catch (error) {
    handleError(error);
  } finally {
    setLoading(false);
  }
};

// Recharger quand les filtres changent
useEffect(() => {
  loadOrders();
}, [filters]);
```

---

### **3️⃣ PerformanceOptimizer.tsx** (Priorité 3)

**Fichier :** `frontend/src/pages/admin/PerformanceOptimizer.tsx`

**Actions :**
1. Ajouter les imports :
```typescript
import { 
  optimizationService, 
  OptimizationUtils,
  type SystemStats 
} from '@/services/optimizationService';
import { ApiError } from '@/lib/api';
```

2. Remplacer les fonctions :

| Fonction actuelle | Remplacer par | Endpoint |
|------------------|---------------|----------|
| Optimiser images | `optimizationService.optimizeImages()` | POST /admin/optimize/images |
| Vider cache | `optimizationService.clearCache()` | POST /admin/optimize/cache |
| Optimiser DB | `optimizationService.optimizeDatabase()` | POST /admin/optimize/database |
| Stats système | `optimizationService.getStats()` | GET /admin/optimize/stats |
| Analyser perfs | `optimizationService.analyzePerformance()` | GET /admin/optimize/analyze |
| Optimisation complète | `optimizationService.runFullOptimization()` | Composite (images + cache + DB) |

3. Exemple d'utilisation :
```typescript
const PerformanceOptimizer = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await optimizationService.getStats();
      setStats(data);
    } catch (error) {
      handleError(error);
    }
  };

  const handleOptimizeAll = async () => {
    setLoading(true);
    try {
      const results = await optimizationService.runFullOptimization();
      
      toast.success(
        `Optimisation complète : ${OptimizationUtils.formatBytes(results.totalSaved)} économisés en ${OptimizationUtils.formatDuration(results.totalDuration)}`
      );
      
      await loadStats(); // Recharger
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {stats && (
        <div>
          <p>Disque: {OptimizationUtils.formatBytes(stats.diskUsage.used)} / {OptimizationUtils.formatBytes(stats.diskUsage.total)}</p>
          <p>Cache: {OptimizationUtils.formatBytes(stats.cacheSize)}</p>
          <p>Images non optimisées: {stats.unoptimizedImages}</p>
        </div>
      )}
      
      <Button onClick={handleOptimizeAll} disabled={loading}>
        {loading ? 'Optimisation en cours...' : 'Tout optimiser'}
      </Button>
    </div>
  );
};
```

4. **Utiliser les helpers** :
```typescript
import { OptimizationUtils } from '@/services/optimizationService';

// Formater les octets
OptimizationUtils.formatBytes(1024000) // "1 MB"

// Formater la durée
OptimizationUtils.formatDuration(5400) // "5.4s"

// Calculer le score
const score = OptimizationUtils.calculatePerformanceScore(metrics);

// Couleur du badge selon le score
const color = OptimizationUtils.getScoreColor(score);
```

---

## ✅ Checklist de Validation

### **Pour chaque page migrée :**

**Code :**
- [ ] Tous les `fetch()` remplacés par les services
- [ ] Tous les `localStorage.getItem('authToken')` supprimés
- [ ] Toutes les URLs hardcodées (`http://localhost:5000/api/...`) supprimées
- [ ] Imports corrects (`@/services/...`, `@/lib/api`)
- [ ] Gestion d'erreurs avec `ApiError`
- [ ] Types TypeScript complets

**Tests :**
- [ ] `npm run typecheck` → Aucune erreur
- [ ] `npm run test` → Tous les tests passent
- [ ] `npm run build` → Build réussi
- [ ] Test manuel → Fonctionnalités identiques à avant

---

## 🎯 Ordre d'Exécution

```bash
# 1. Copier les services
cp customersService.ts frontend/src/services/
cp ordersService.ts frontend/src/services/
cp optimizationService.ts frontend/src/services/

# 2. Refactoriser dans l'ordre
# → CustomersManagement.tsx (30 min)
# → OrdersManagement.tsx (45 min)
# → PerformanceOptimizer.tsx (20 min)

# 3. Valider après chaque migration
npm run typecheck
npm run test
npm run build

# 4. Test manuel de chaque page
```

---

## 🚨 Points d'Attention

### **Erreurs courantes**

**1. Erreur d'import**
```typescript
// ❌ Import relatif
import { api } from '../lib/api';

// ✅ Alias @/
import { api } from '@/lib/api';
```

**2. Format de réponse API**
```typescript
// Les services s'attendent à ce format (géré par api.ts) :
{
  success: true,
  data: { /* vos données */ }
}
```

**3. Gestion des blobs (PDF, CSV)**
```typescript
// Pour les téléchargements, le client API retourne du JSON
// Si vous avez besoin de vrais blobs, gérez manuellement :
const blob = new Blob([data], { type: 'application/pdf' });
const url = URL.createObjectURL(blob);
window.open(url);
```

**4. Timeouts**
```typescript
// Si une opération prend >30s, elle timeout
// Pour les optimisations longues, augmentez dans api.ts :
const API_CONFIG = {
  timeout: 60000, // 60s
};
```

---

## 📊 Résultat Attendu

| Métrique | Avant | Après | Gain |
|----------|-------|-------|------|
| **fetch() dans pages Admin** | 27 | 0 | ✅ **-100%** |
| **URLs hardcodées** | 27 | 0 | ✅ **-100%** |
| **Total fetch() projet** | 60 | 12 | ✅ **-80%** |
| **Services créés** | 1 | 6 | ✅ **+500%** |
| **Couverture TypeScript** | 60% | 95% | ✅ **+58%** |

---

## 🎬 Commande à Lancer

```bash
# Après avoir copié les 3 services, lance cette commande :
npm run typecheck && npm run test && npm run build

# Si tout passe, les 3 pages Admin sont prêtes à migrer
```

---

## 📚 Ressources Fournies

1. **customersService.ts** → Gestion clients (CRUD, stats, recherche)
2. **ordersService.ts** → Gestion commandes (statuts, paiements, factures)
3. **optimizationService.ts** → Optimisation système (images, cache, DB)
4. **Guide de refactoring** → Exemples avant/après détaillés
5. **Client API** → Déjà en place (`frontend/src/lib/api.ts`)

---

## 🚀 Prêt à Démarrer ?

**Commande pour l'agent :**
```
1. Copie les 3 services dans frontend/src/services/
2. Lance npm run typecheck pour vérifier que tout compile
3. Commence par CustomersManagement.tsx (la plus simple)
4. Valide avec npm run test après chaque migration
5. Rapporte-moi les résultats + fichiers modifiés
```

---

**Temps estimé total : 1h30**
**Impact : Élimination de 27 fetch() + harmonisation complète de l'admin** 🎯