# 🎯 Instructions Suivantes pour l'Agent (SANS MockData)

## ✅ Étape 1 TERMINÉE : Debounce
- ✔️ Hook `useDebounce.ts` créé
- ✔️ Search débounce à 500ms
- ✔️ Prix débounce à 800ms
- ✔️ Navigation SSR optimisée

---

## 🚀 Étape 2 : SortDropdown (À FAIRE MAINTENANT)

### Objectif
Créer un menu déroulant de tri qui :
- Utilise les **données réelles** de la base de données
- Met à jour l'URL avec `sortBy` et `sortOrder`
- Déclenche le SSR pour recharger les produits triés

### Instructions Précises

#### 1. Créer le Composant SortDropdown

**Fichier : `frontend/src/components/products/SortDropdown.tsx`**

```typescript
'use client';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

type SortOption = {
  label: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

const SORT_OPTIONS: SortOption[] = [
  { label: 'Prix croissant', sortBy: 'price', sortOrder: 'asc' },
  { label: 'Prix décroissant', sortBy: 'price', sortOrder: 'desc' },
  { label: 'Nouveautés', sortBy: 'createdAt', sortOrder: 'desc' },
  { label: 'Plus anciens', sortBy: 'createdAt', sortOrder: 'asc' },
  { label: 'Nom A-Z', sortBy: 'name', sortOrder: 'asc' },
  { label: 'Nom Z-A', sortBy: 'name', sortOrder: 'desc' },
];

interface Props {
  currentSortBy?: string;
  currentSortOrder?: 'asc' | 'desc';
  onChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export function SortDropdown({ currentSortBy = 'createdAt', currentSortOrder = 'desc', onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const currentOption = SORT_OPTIONS.find(
    opt => opt.sortBy === currentSortBy && opt.sortOrder === currentSortOrder
  ) || SORT_OPTIONS[1]; // Default: Nouveautés

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white"
        aria-label="Trier les produits"
      >
        <span className="text-sm text-gray-700">Trier: {currentOption.label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
          {SORT_OPTIONS.map((option) => {
            const isActive = option.sortBy === currentSortBy && option.sortOrder === currentSortOrder;
            return (
              <button
                key={`${option.sortBy}-${option.sortOrder}`}
                onClick={() => {
                  onChange(option.sortBy, option.sortOrder);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

---

#### 2. Intégrer dans ClientProductsPage

**Fichier : `frontend/src/app/[locale]/products/ClientProductsPage.tsx`**

**A. Ajouter dans les imports :**
```typescript
import { SortDropdown } from '@/components/products/SortDropdown';
```

**B. Ajouter sortBy et sortOrder dans FiltersState (si pas déjà fait) :**
```typescript
interface FiltersState {
  search?: string;
  categories?: string[];
  manufacturers?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: string;      // ← Ajouter
  sortOrder?: 'asc' | 'desc';  // ← Ajouter
  page: number;
}
```

**C. Ajouter la barre de tri AVANT ProductList :**
```typescript
// Dans le return JSX, juste avant <ProductList />

<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
  {/* Compteur de résultats */}
  <p className="text-gray-600 text-sm">
    <span className="font-semibold text-gray-900">{products.length}</span> produit{products.length > 1 ? 's' : ''} trouvé{products.length > 1 ? 's' : ''}
  </p>

  {/* Menu de tri */}
  <SortDropdown
    currentSortBy={filters.sortBy}
    currentSortOrder={filters.sortOrder}
    onChange={(sortBy, sortOrder) => {
      handleFilterChange({ sortBy, sortOrder, page: 1 });
    }}
  />
</div>
```

---

#### 3. Vérifier le Backend SSR

**Fichier : `frontend/src/lib/ssr-api.ts`**

**Assure-toi que `buildQueryString` inclut bien sortBy et sortOrder :**
```typescript
export function buildQueryString(filters: any): string {
  const params = new URLSearchParams();
  
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.search) params.set('search', filters.search);
  if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
  if (filters.inStock !== undefined) params.set('inStock', filters.inStock.toString());
  
  // ← Ajouter ces lignes si manquantes
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
  
  // Arrays
  if (filters.categories?.length) {
    filters.categories.forEach((cat: string) => params.append('categories[]', cat));
  }
  if (filters.manufacturers?.length) {
    filters.manufacturers.forEach((mfr: string) => params.append('manufacturers[]', mfr));
  }
  
  return params.toString();
}
```

---

#### 4. Vérifier le Backend API (si nécessaire)

**Fichier Backend (ex: `backend/routes/products.js` ou équivalent)**

**Assure-toi que l'API gère `sortBy` et `sortOrder` :**
```javascript
// Exemple avec Sequelize/SQL
const { sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

const validSortFields = ['price', 'createdAt', 'name', 'rating'];
const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

const products = await Product.findAll({
  where: { /* tes filtres */ },
  order: [[sortField, order]],
  // ... reste de la query
});
```

---

### 🧪 Tests à Effectuer

1. **Ouvre** : http://localhost:3000/fr/products
2. **Clique** sur le SortDropdown
3. **Sélectionne** "Prix croissant"
4. **Vérifie** que :
   - ✅ L'URL contient `?sortBy=price&sortOrder=asc`
   - ✅ Les produits sont triés du moins cher au plus cher
   - ✅ Le label du dropdown affiche "Trier: Prix croissant"
5. **Teste** tous les autres tris (prix desc, nouveautés, nom, etc.)
6. **Vérifie** que le tri persiste si tu changes de page ou ajoutes des filtres

---

### ⚠️ Points d'Attention

- **NE PAS créer de données fictives** : utilise uniquement les produits réels de la DB
- **Champs requis** : Assure-toi que tous les produits ont bien :
  - `price` (number)
  - `createdAt` (date)
  - `name` (string)
  - `rating` (number, optionnel mais si présent doit être valide)
- **Performance** : Le tri doit se faire côté backend (SQL ORDER BY), pas en JavaScript
- **URL** : Les paramètres de tri doivent être visibles et bookmarkables

---

## 📝 Message à Envoyer à l'Agent

**Copie-colle exactement ceci :**

```
Implémente maintenant le SortDropdown selon ces instructions :

1. Crée components/products/SortDropdown.tsx avec 6 options de tri :
   - Prix croissant/décroissant
   - Nouveautés/Plus anciens (createdAt)
   - Nom A-Z/Z-A

2. Intègre-le dans ClientProductsPage AVANT ProductList avec :
   - Compteur de résultats à gauche
   - Dropdown à droite
   - Responsive (stack vertical sur mobile)

3. Vérifie que buildQueryString inclut sortBy et sortOrder

4. Teste sur http://localhost:3000/fr/products et confirme que :
   - Le dropdown fonctionne
   - L'URL se met à jour
   - Les produits RÉELS sont triés correctement
   - Aucune donnée fictive n'est utilisée

NE CRÉE AUCUNE DONNÉE MOCKÉE. Utilise uniquement les produits de la base de données.

Après tests, confirme que tout fonctionne avant de passer à l'étape suivante.
```

---

## 🎯 Après le SortDropdown

Une fois que le tri fonctionne, on passera à :
1. **ActiveFilters** (chips pour voir les filtres actifs)
2. **Loading States** (spinner pendant chargement)
3. **Empty State** (message quand 0 résultat)
4. **Tests unitaires**

Mais **UN SEUL à la fois** ! Ne jamais en faire 2 simultanément.
