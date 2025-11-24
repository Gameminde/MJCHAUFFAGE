'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, Grid3x3, List, X, Menu } from 'lucide-react';
import { Product } from '@/services/productService';
import { ModernProductCardOptimized } from '@/components/products/ModernProductCardOptimized';
import FilterSidebarOptimized, { FilterValues } from '@/components/products/FilterSidebarOptimized';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

export type ModernProductsPageProps = {
  locale: string;
  initialProducts: Product[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  initialPage: number;
  categories?: Array<{ id: string; name: string; slug?: string; productCount?: number }>;
  manufacturers?: Array<{ id: string; name: string; slug?: string; productCount?: number }>;
  initialFilters?: {
    search?: string;
    categories?: string[];
    manufacturers?: string[];
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    featured?: boolean;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
};

export default function ModernProductsPage({
  locale,
  initialProducts,
  initialPagination,
  categories = [],
  manufacturers = [],
  initialFilters = {},
}: ModernProductsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || '');

  const isArabic = locale === 'ar';
  const productCount = initialProducts?.length ?? 0;
  const totalProducts = initialPagination.total;

  const applyFilters = (filters: FilterValues) => {
    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    if (filters.categories && filters.categories.length) {
      params.set('categories', filters.categories.join(','));
    }
    if (filters.manufacturers && filters.manufacturers.length) {
      params.set('manufacturers', filters.manufacturers.join(','));
    }
    if (filters.minPrice != null) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice != null) params.set('maxPrice', String(filters.maxPrice));
    if (filters.inStock !== undefined) params.set('inStock', String(filters.inStock));
    if (filters.featured !== undefined) params.set('featured', String(filters.featured));
    if (filters.limit != null) params.set('limit', String(filters.limit));
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

    params.set('page', '1');
    router.push(`/${locale}/products?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ ...initialFilters, search: searchQuery });
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    router.push(`/${locale}/products`);
  };

  const hasActiveFilters =
    initialFilters.search ||
    (initialFilters.categories && initialFilters.categories.length > 0) ||
    (initialFilters.manufacturers && initialFilters.manufacturers.length > 0) ||
    initialFilters.minPrice != null ||
    initialFilters.maxPrice != null ||
    initialFilters.inStock !== undefined ||
    initialFilters.featured !== undefined;

  return (
    <div className={`min-h-screen bg-neutral-50 ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <h1 className="flex-shrink-0 text-2xl font-bold text-neutral-900">
              MJ CHAUFFAGE
            </h1>

            {/* Barre de recherche */}
            <div className="flex-1 max-w-2xl relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <Input
                type="text"
                placeholder={isArabic ? 'Rechercher un produit...' : 'Rechercher un produit...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                className="pl-10"
              />
            </div>

            {/* Bouton filtres mobile */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden h-11 px-4"
              onClick={() => setShowFilters(true)}
            >
              <Menu className="w-5 h-5" />
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800">
                  {hasActiveFilters ? 1 : 0}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filtres - Desktop */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <FilterSidebarOptimized
              locale={locale}
              categories={categories}
              manufacturers={manufacturers}
              value={initialFilters}
              onChange={applyFilters}
            />
          </aside>

          {/* Sidebar Filtres - Mobile */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowFilters(false)}>
              <div
                className="absolute inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4">
                  <FilterSidebarOptimized
                    locale={locale}
                    categories={categories}
                    manufacturers={manufacturers}
                    value={initialFilters}
                    onChange={applyFilters}
                    isMobile={true}
                    onClose={() => setShowFilters(false)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contenu Principal */}
          <main className="flex-1 min-w-0">
            {/* Barre d'action */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-neutral-600">
                  {productCount} produit{productCount > 1 ? 's' : ''} trouvé{productCount > 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700' : 'hover:bg-orange-50 hover:text-orange-700'}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700' : 'hover:bg-orange-50 hover:text-orange-700'}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Grille de produits */}
            {productCount === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                  <Search className="w-10 h-10 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {isArabic ? 'Aucun produit trouvé' : 'Aucun produit trouvé'}
                </h3>
                <p className="text-neutral-600 mb-4">
                  {isArabic
                    ? 'Essayez de modifier vos critères de recherche'
                    : 'Essayez de modifier vos critères de recherche'}
                </p>
                <Button onClick={clearAllFilters} className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700">
                  {isArabic ? 'Effacer les filtres' : 'Effacer les filtres'}
                </Button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6'
                  : 'space-y-4'
              }>
                {initialProducts.map(product => (
                  <ModernProductCardOptimized
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    onClick={() => {
                      // Navigation vers la page produit
                      router.push(`/${locale}/products/${product.id}`);
                    }}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {initialPagination.totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-2">
                  {Array.from({ length: initialPagination.totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => {
                          const params = new URLSearchParams(searchParams?.toString() || '');
                          params.set('page', String(page));
                          router.push(`/${locale}/products?${params.toString()}`);
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${page === initialPagination.page
                          ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg'
                          : 'bg-white text-neutral-700 hover:bg-orange-50 hover:text-orange-700 border border-neutral-200'
                          }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
