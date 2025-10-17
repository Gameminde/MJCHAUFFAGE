# Guide de Refactoring - Pages Admin

Ce guide détaille comment migrer les 3 pages Admin critiques vers les services centralisés.

---

## 📋 Plan de Migration

| Page | Appels fetch() | Service utilisé | Priorité |
|------|---------------|-----------------|----------|
| `CustomersManagement.tsx` | 9 | `customersService` | 🔴 Haute |
| `OrdersManagement.tsx` | 9 | `ordersService` + `paymentService` | 🔴 Haute |
| `PerformanceOptimizer.tsx` | 9 | Client API direct | 🟡 Moyenne |

---

## 1️⃣ CustomersManagement.tsx

### **Avant** (avec fetch direct)
```typescript
// ❌ Code dupliqué et verbeux
const fetchCustomers = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:5000/api/admin/customers', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Erreur réseau');
    }
    
    const data = await response.json();
    setCustomers(data.data);
  } catch (error) {
    console.error(error);
    setError('Impossible de charger les clients');
  } finally {
    setLoading(false);
  }
};
```

### **Après** (avec customersService)
```typescript
// ✅ Code simplifié et réutilisable
import { customersService } from '@/services/customersService';
import { ApiError } from '@/lib/api';

const fetchCustomers = async (filters?: CustomerFilters) => {
  setLoading(true);
  try {
    const result = await customersService.getCustomers(filters);
    setCustomers(result.customers);
    setTotalPages(result.totalPages);
  } catch (error) {
    if (error instanceof ApiError) {
      setError(`Erreur ${error.statusCode}: ${error.message}`);
    } else {
      setError('Impossible de charger les clients');
    }
  } finally {
    setLoading(false);
  }
};
```

### **Migrations à effectuer dans CustomersManagement.tsx**

1. **Imports**
```typescript
// Ajouter en haut du fichier
import { customersService, type Customer, type CustomerFilters } from '@/services/customersService';
import { ApiError } from '@/lib/api';
```

2. **Remplacer toutes les fonctions fetch**

| Fonction actuelle | Nouvelle fonction | Méthode service |
|------------------|-------------------|-----------------|
| `fetchCustomers()` | `customersService.getCustomers()` | GET /admin/customers |
| `updateCustomer()` | `customersService.updateCustomer()` | PATCH /admin/customers/:id |
| `deleteCustomer()` | `customersService.deleteCustomer()` | DELETE /admin/customers/:id |
| `searchCustomers()` | `customersService.searchCustomers()` | GET /admin/customers/search |
| `getCustomerStats()` | `customersService.getCustomerStats()` | GET /admin/customers/stats |
| `blockCustomer()` | `customersService.toggleCustomerStatus()` | PATCH /admin/customers/:id/status |

3. **Gestion d'erreurs unifiée**
```typescript
// Créer un helper pour afficher les erreurs
const handleError = (error: unknown) => {
  if (error instanceof ApiError) {
    toast.error(`Erreur ${error.statusCode}: ${error.message}`);
  } else {
    toast.error('Une erreur inattendue est survenue');
  }
};

// Utiliser dans tous les try/catch
try {
  await customersService.deleteCustomer(customerId);
  toast.success('Client supprimé');
  fetchCustomers(); // Recharger la liste
} catch (error) {
  handleError(error);
}
```

4. **Supprimer les URLs hardcodées**
```typescript
// ❌ Supprimer
const API_URL = 'http://localhost:5000/api';
const httpUrl = `${API_URL}/admin/customers`;

// ✅ Utiliser directement le service (l'URL est dans api.ts)
```

---

## 2️⃣ OrdersManagement.tsx

### **Avant** (avec fetch direct)
```typescript
// ❌ Gestion manuelle du statut et des erreurs
const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(
      `http://localhost:5000/api/admin/orders/${orderId}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }
    );
    
    const data = await response.json();
    if (data.success) {
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status } : o
      ));
    }
  } catch (error) {
    console.error(error);
  }
};
```

### **Après** (avec ordersService)
```typescript
// ✅ Logique claire et maintenable
import { ordersService, OrderStatusUtils } from '@/services/ordersService';

const updateOrderStatus = async (orderId: string, status: Order['status']) => {
  setLoading(true);
  try {
    const updatedOrder = await ordersService.updateOrderStatus(orderId, status);
    
    // Mettre à jour l'état local
    setOrders(prev => prev.map(o => 
      o.id === orderId ? updatedOrder : o
    ));
    
    toast.success(`Commande ${OrderStatusUtils.getStatusLabel(status)}`);
  } catch (error) {
    handleError(error);
  } finally {
    setLoading(false);
  }
};
```

### **Migrations à effectuer dans OrdersManagement.tsx**

1. **Imports**
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

2. **Remplacer toutes les fonctions fetch**

| Fonction actuelle | Nouvelle fonction | Méthode service |
|------------------|-------------------|-----------------|
| `fetchOrders()` | `ordersService.getOrders()` | GET /admin/orders |
| `updateOrderStatus()` | `ordersService.updateOrderStatus()` | PATCH /admin/orders/:id/status |
| `cancelOrder()` | `ordersService.cancelOrder()` | POST /admin/orders/:id/cancel |
| `markAsShipped()` | `ordersService.markAsShipped()` | POST /admin/orders/:id/ship |
| `refundOrder()` | `ordersService.refundOrder()` | Composite (payment + order) |
| `getOrderStats()` | `ordersService.getOrderStats()` | GET /admin/orders/stats |
| `generateInvoice()` | `ordersService.generateInvoice()` | GET /admin/orders/:id/invoice |

3. **Cas spécial : Remboursement (utilise 2 services)**
```typescript
// ✅ Le service ordersService gère l'orchestration
const handleRefund = async (orderId: string, amount?: number) => {
  if (!confirm('Confirmer le remboursement ?')) return;
  
  setLoading(true);
  try {
    const { order, refundId } = await ordersService.refundOrder(
      orderId, 
      amount, 
      'Demandé par l\'admin'
    );
    
    // Mettre à jour l'UI
    setOrders(prev => prev.map(o => o.id === orderId ? order : o));
    
    toast.success(`Remboursement effectué (ID: ${refundId})`);
  } catch (error) {
    handleError(error);
  } finally {
    setLoading(false);
  }
};
```

4. **Utiliser les helpers de statut**
```typescript
// ❌ Avant : logique dispersée
const canRefund = (order: Order) => {
  return order.paymentStatus === 'paid' && 
         ['processing', 'shipped', 'delivered'].includes(order.status);
};

// ✅ Après : utiliser OrderStatusUtils
import { OrderStatusUtils } from '@/services/ordersService';

// Dans le composant
<Button 
  disabled={!OrderStatusUtils.canRefund(order)}
  onClick={() => handleRefund(order.id)}
>
  Rembourser
</Button>

// Pour les couleurs de badges
<Badge color={OrderStatusUtils.getStatusColor(order.status)}>
  {OrderStatusUtils.getStatusLabel(order.status)}
</Badge>
```

5. **Pagination et filtres**
```typescript
// État local pour les filtres
const [filters, setFilters] = useState<OrderFilters>({
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
});

// Charger les commandes avec filtres
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

// Changer de page
const handlePageChange = (newPage: number) => {
  setFilters(prev => ({ ...prev, page: newPage }));
};

// Effet pour recharger quand les filtres changent
useEffect(() => {
  loadOrders();
}, [filters]);
```

---

## 3️⃣ PerformanceOptimizer.tsx

Cette page semble gérer des tâches d'optimisation système (images, cache, DB, etc.).

### **Avant** (avec fetch direct)
```typescript
// ❌ URLs hardcodées et gestion d'erreurs basique
const optimizeImages = async () => {
  setOptimizing(true);
  try {
    const response = await fetch('http://localhost:5000/api/admin/optimize/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  } finally {
    setOptimizing(false);
  }
};
```

### **Après** (avec client API)
```typescript
// ✅ Client centralisé avec timeout et erreurs gérées
import { api } from '@/lib/api';

const optimizeImages = async () => {
  setOptimizing(true);
  try {
    const result = await api.post<{ 
      optimized: number; 
      savedBytes: number; 
      duration: number 
    }>('/admin/optimize/images');
    
    toast.success(
      `${result.data.optimized} images optimisées (${formatBytes(result.data.savedBytes)} économisés)`
    );
    
    // Recharger les stats
    await fetchStats();
  } catch (error) {
    handleError(error);
  } finally {
    setOptimizing(false);
  }
};
```

### **Migrations à effectuer dans PerformanceOptimizer.tsx**

1. **Imports**
```typescript
import { api, ApiError } from '@/lib/api';
```

2. **Remplacer tous les fetch() par api.*

| Fonction actuelle | Nouvelle approche | Endpoint |
|------------------|-------------------|----------|
| `optimizeImages()` | `api.post('/admin/optimize/images')` | POST /admin/optimize/images |
| `clearCache()` | `api.post('/admin/optimize/cache')` | POST /admin/optimize/cache |
| `optimizeDatabase()` | `api.post('/admin/optimize/database')` | POST /admin/optimize/database |
| `analyzePerformance()` | `api.get('/admin/optimize/analyze')` | GET /admin/optimize/analyze |
| `getStats()` | `api.get('/admin/optimize/stats')` | GET /admin/optimize/stats |

3. **Créer un service dédié (optionnel mais recommandé)**
```typescript
// frontend/src/services/optimizationService.ts
import { api } from '@/lib/api';

export interface OptimizationResult {
  success: boolean;
  itemsProcessed: number;
  savedBytes?: number;
  duration: number;
  errors?: string[];
}

export interface SystemStats {
  diskUsage: { used: number; total: number };
  cacheSize: number;
  databaseSize: number;
  imageCount: number;
  unoptimizedImages: number;
}

export const optimizationService = {
  async optimizeImages(): Promise<OptimizationResult> {
    const response = await api.post<OptimizationResult>('/admin/optimize/images');
    return response.data;
  },

  async clearCache(): Promise<OptimizationResult> {
    const response = await api.post<OptimizationResult>('/admin/optimize/cache');
    return response.data;
  },

  async optimizeDatabase(): Promise<OptimizationResult> {
    const response = await api.post<OptimizationResult>('/admin/optimize/database');
    return response.data;
  },

  async analyzePerformance(): Promise<{
    pageLoadTime: number;
    apiResponseTime: number;
    databaseQueryTime: number;
    recommendations: string[];
  }> {
    const response = await api.get('/admin/optimize/analyze');
    return response.data;
  },

  async getStats(): Promise<SystemStats> {
    const response = await api.get<SystemStats>('/admin/optimize/stats');
    return response.data;
  },

  async runFullOptimization(): Promise<{
    images: OptimizationResult;
    cache: OptimizationResult;
    database: OptimizationResult;
  }> {
    const [images, cache, database] = await Promise.all([
      this.optimizeImages(),
      this.clearCache(),
      this.optimizeDatabase(),
    ]);

    return { images, cache, database };
  },
};
```

4. **Utiliser le service dans le composant**
```typescript
import { optimizationService } from '@/services/optimizationService';

const PerformanceOptimizer = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Charger les stats au montage
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
      
      const totalSaved = 
        (results.images.savedBytes || 0) + 
        (results.cache.savedBytes || 0) + 
        (results.database.savedBytes || 0);

      toast.success(`Optimisation complète : ${formatBytes(totalSaved)} économisés`);
      
      await loadStats(); // Recharger les stats
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {stats && (
        <StatsPanel 
          diskUsage={stats.diskUsage}
          cacheSize={stats.cacheSize}
          unoptimizedImages={stats.unoptimizedImages}
        />
      )}
      
      <Button onClick={handleOptimizeAll} disabled={loading}>
        {loading ? 'Optimisation en cours...' : 'Tout optimiser'}
      </Button>
    </div>
  );
};
```

---

## ✅ Checklist de Migration Complète

### **Pour chaque page :**

- [ ] **Imports**
  - [ ] Importer les services nécessaires
  - [ ] Importer `ApiError` de `@/lib/api`
  - [ ] Importer les types TypeScript

- [ ] **Remplacer fetch()**
  - [ ] Supprimer tous les appels `fetch()` directs
  - [ ] Remplacer par les méthodes du service
  - [ ] Supprimer la gestion manuelle du token

- [ ] **URLs**
  - [ ] Supprimer les constantes `API_URL`, `httpUrl`
  - [ ] Vérifier qu'aucune URL hardcodée ne reste

- [ ] **Gestion d'erreurs**
  - [ ] Remplacer les `console.error()` par des toasts/alertes
  - [ ] Utiliser `instanceof ApiError` pour typer les erreurs
  - [ ] Créer un helper `handleError()` si beaucoup de try/catch

- [ ] **Loading states**
  - [ ] Garder les `setLoading(true/false)`
  - [ ] Ajouter des indicateurs visuels pendant les requêtes

- [ ] **Tests**
  - [ ] `npm run typecheck` → Aucune erreur TypeScript
  - [ ] `npm run test` → Tests unitaires passent
  - [ ] Test manuel → Fonctionnalités identiques

---

## 🚀 Ordre d'Exécution Recommandé

1. **CustomersManagement.tsx** (30 min)
   - Plus simple, bon pour valider l'approche
   - Service bien défini (`customersService`)

2. **OrdersManagement.tsx** (45 min)
   - Plus complexe (utilise 2 services)
   - Logique métier importante (paiements, remboursements)

3. **PerformanceOptimizer.tsx** (20 min)
   - Créer `optimizationService.ts` si pas déjà fait
   - Moins de logique métier, migration rapide

**Temps total estimé : ~1h30**

---

## 📦 Fichiers à Créer/Modifier

### **Nouveaux fichiers**
```
frontend/src/services/
  ├── customersService.ts      ✅ (fourni)
  ├── ordersService.ts         ✅ (fourni)
  └── optimizationService.ts   📝 (à créer)
```

### **Fichiers à modifier**
```
frontend/src/pages/admin/
  ├── CustomersManagement.tsx  🔧 (refactor)
  ├── OrdersManagement.tsx     🔧 (refactor)
  └── PerformanceOptimizer.tsx 🔧 (refactor)
```

---

## 🎯 Résultat Attendu

| Métrique | Avant | Après | Gain |
|----------|-------|-------|------|
| **fetch() directs** | 27 | 0 | ✅ **-100%** |
| **URLs hardcodées** | 27 | 0 | ✅ **-100%** |
| **Gestion auth** | Manuelle (x27) | Automatique | ✅ **Unifié** |
| **Gestion erreurs** | Inconsistante | Centralisée | ✅ **+Maintenabilité** |
| **TypeScript** | Partiel | Complet | ✅ **+Sécurité** |
| **Timeouts** | Non gérés | 30s auto | ✅ **+Robustesse** |

---

## 🐛 Troubleshooting

### **Erreur : "Cannot find module '@/services/...'"**
```bash
# Vérifier l'alias dans tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### **Erreur : "ApiError is not defined"**
```typescript
// Ajouter l'import
import { api, ApiError } from '@/lib/api';
```

### **Erreur 401 : "Unauthorized"**
```typescript
// Vérifier que next-auth est configuré
// Ou que le token est dans localStorage si fallback
```

### **Timeouts fréquents**
```typescript
// Augmenter le timeout dans api.ts si nécessaire
const API_CONFIG = {
  timeout: 60000, // 60s au lieu de 30s
};
```

---

## 📚 Ressources

- [Client API centralisé](./frontend/src/lib/api.ts)
- [Plan de migration complet](./migration_plan.md)
- [Services refactorés](./frontend/src/services/)

---

**Prêt à migrer ? Commencez par `CustomersManagement.tsx` ! 🚀**