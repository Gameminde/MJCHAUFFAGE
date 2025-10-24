# 🎯 Instructions Prioritaires pour l'Agent

## Phase 1 : Optimisation UX (À FAIRE EN PREMIER)

### 1️⃣ Debounce sur Search & Price Inputs
**Priorité : CRITIQUE**

```typescript
// Dans ClientProductsPage.tsx
import { useDebounce } from '@/hooks/useDebounce';

// Debounce search (500ms)
const debouncedSearch = useDebounce(filters.search, 500);

useEffect(() => {
  if (debouncedSearch !== initialFilters.search) {
    handleFilterChange({ search: debouncedSearch });
  }
}, [debouncedSearch]);

// Debounce price inputs (800ms)
const debouncedMinPrice = useDebounce(filters.minPrice, 800);
const debouncedMaxPrice = useDebounce(filters.maxPrice, 800);

useEffect(() => {
  handleFilterChange({ 
    minPrice: debouncedMinPrice, 
    maxPrice: debouncedMaxPrice 
  });
}, [debouncedMinPrice, debouncedMaxPrice]);
```

**Hook useDebounce.ts à créer :**
```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

---

### 2️⃣ SortDropdown Component
**Priorité : HAUTE**

Créer `/components/products/SortDropdown.tsx` :

```typescript
'use client';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

type SortOption = {
  label: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

const SORT_OPTIONS: SortOption[] = [
  { label: 'Prix croissant', sortBy: 'price', sortOrder: 'asc' },
  { label: 'Prix décroissant', sortBy: 'price', sortOrder: 'desc' },
  { label: 'Nouveautés', sortBy: 'createdAt', sortOrder: 'desc' },
  { label: 'Nom A-Z', sortBy: 'name', sortOrder: 'asc' },
  { label: 'Nom Z-A', sortBy: 'name', sortOrder: 'desc' },
  { label: 'Meilleure note', sortBy: 'rating', sortOrder: 'desc' },
];

interface Props {
  currentSortBy?: string;
  currentSortOrder?: 'asc' | 'desc';
  onChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export function SortDropdown({ currentSortBy, currentSortOrder, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentOption = SORT_OPTIONS.find(
    opt => opt.sortBy === currentSortBy && opt.sortOrder === currentSortOrder
  ) || SORT_OPTIONS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
      >
        <span>Trier par: {currentOption.label}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-10">
          {SORT_OPTIONS.map((option) => (
            <button
              key={`${option.sortBy}-${option.sortOrder}`}
              onClick={() => {
                onChange(option.sortBy, option.sortOrder);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Intégrer dans ClientProductsPage :**
```typescript
import { SortDropdown } from '@/components/products/SortDropdown';

// Dans le return JSX, avant ProductList
<div className="flex justify-between items-center mb-4">
  <p className="text-gray-600">
    {products.length} produit{products.length > 1 ? 's' : ''} trouvé{products.length > 1 ? 's' : ''}
  </p>
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

### 3️⃣ Active Filters Chips
**Priorité : MOYENNE**

Créer `/components/products/ActiveFilters.tsx` :

```typescript
'use client';
import { X } from 'lucide-react';

interface Props {
  filters: {
    search?: string;
    categories?: string[];
    manufacturers?: string[];
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
  };
  onRemove: (key: string, value?: string) => void;
  onClearAll: () => void;
}

export function ActiveFilters({ filters, onRemove, onClearAll }: Props) {
  const hasActiveFilters = 
    filters.search ||
    (filters.categories && filters.categories.length > 0) ||
    (filters.manufacturers && filters.manufacturers.length > 0) ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.inStock;

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filters.search && (
        <Chip label={`"${filters.search}"`} onRemove={() => onRemove('search')} />
      )}
      
      {filters.categories?.map(cat => (
        <Chip key={cat} label={cat} onRemove={() => onRemove('categories', cat)} />
      ))}
      
      {filters.manufacturers?.map(mfr => (
        <Chip key={mfr} label={mfr} onRemove={() => onRemove('manufacturers', mfr)} />
      ))}
      
      {filters.minPrice && (
        <Chip label={`Min: ${filters.minPrice} DZD`} onRemove={() => onRemove('minPrice')} />
      )}
      
      {filters.maxPrice && (
        <Chip label={`Max: ${filters.maxPrice} DZD`} onRemove={() => onRemove('maxPrice')} />
      )}
      
      {filters.inStock && (
        <Chip label="En stock" onRemove={() => onRemove('inStock')} />
      )}

      <button
        onClick={onClearAll}
        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-full"
      >
        Effacer tout
      </button>
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
      {label}
      <button onClick={onRemove} className="hover:bg-blue-200 rounded-full p-0.5">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
```

---

## Phase 2 : États & Performance

### 4️⃣ Loading States & Empty States

**Dans ClientProductsPage, ajouter :**
```typescript
const [isLoading, setIsLoading] = useState(false);

// Modifier handleFilterChange
const handleFilterChange = async (newFilters: Partial<FiltersState>) => {
  setIsLoading(true);
  const updated = { ...filters, ...newFilters };
  setFilters(updated);
  
  const query = buildQueryString(updated);
  await router.push(`?${query}`);
  setIsLoading(false);
};

// Dans le JSX
{isLoading ? (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
) : products.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-xl text-gray-600 mb-4">Aucun produit trouvé</p>
    <button
      onClick={() => handleFilterChange({})} // Reset filters
      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      Réinitialiser les filtres
    </button>
  </div>
) : (
  <ProductList products={products} />
)}
```

---

### 5️⃣ Lazy Loading Images

**Dans ProductCard.tsx :**
```typescript
import Image from 'next/image';

<Image
  src={product.image}
  alt={product.name}
  width={300}
  height={300}
  loading="lazy"
  className="object-cover"
/>
```

---

## Phase 3 : Tests & Admin

### 6️⃣ Tests à Ajouter

**Créer `/tests/products-filter.test.ts` :**
```typescript
import { describe, it, expect } from 'vitest';
import { buildQueryString } from '@/lib/ssr-api';

describe('Product Filters', () => {
  it('should build query string with multiple categories', () => {
    const filters = { categories: ['chaudieres', 'pieces'] };
    const query = buildQueryString(filters);
    expect(query).toContain('categories[]=chaudieres');
    expect(query).toContain('categories[]=pieces');
  });

  it('should handle price range', () => {
    const filters = { minPrice: 1000, maxPrice: 5000 };
    const query = buildQueryString(filters);
    expect(query).toContain('minPrice=1000');
    expect(query).toContain('maxPrice=5000');
  });
});
```

---

### 7️⃣ Admin Dashboard Verification

**Checklist à vérifier :**
- [ ] Champs catégories éditables
- [ ] Champs fabricants (manufacturers) éditables
- [ ] Prix min/max validés (pas de négatifs)
- [ ] Stock (inStock) = boolean strict
- [ ] Champs de tri (createdAt, rating) remplis automatiquement

---

## 🎯 Ordre d'Exécution Recommandé

```
1. Debounce (30 min) ← COMMENCE PAR ÇA
2. SortDropdown (45 min)
3. ActiveFilters (30 min)
4. Loading/Empty States (20 min)
5. Lazy Loading Images (10 min)
6. Tests unitaires (1h)
7. Admin verification (30 min)
```

---

## 📊 Métriques de Performance à Atteindre

- ⏱️ **Temps de réponse API** : < 300ms
- 🚀 **First Contentful Paint** : < 1.5s
- 📱 **Responsive** : Mobile-first, testé sur 320px-1920px
- ♿ **Accessibilité** : Score Lighthouse > 90
- 🔍 **SEO** : Toutes les URLs bookmarkables avec params

---

## 🔥 Commande à Donner à l'Agent

**Option 1 (Recommandée) :**
> "Implémente d'abord le **debounce sur search et price inputs** pour éviter les appels SSR excessifs. Utilise le code fourni ci-dessus comme référence. Teste sur http://localhost:3000/fr/products et confirme que ça fonctionne avant de continuer."

**Option 2 (Si urgent) :**
> "Implémente le **SortDropdown** avec les 6 options de tri (prix asc/desc, date, nom, rating). Intègre-le dans ClientProductsPage et propage sortBy/sortOrder via URL params."

**Option 3 (Tout en une fois) :**
> "Implémente dans l'ordre : 1) Debounce, 2) SortDropdown, 3) ActiveFilters, 4) Loading states. Teste chaque fonctionnalité avant de passer à la suivante."