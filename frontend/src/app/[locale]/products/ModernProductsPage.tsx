'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, Grid3x3, List, X } from 'lucide-react';
import { Product } from '@/services/productService';
import { ModernProductCard } from '@/components/products/ModernProductCard';
import FilterSidebar, { FilterValues } from '@/components/products/FilterSidebar';
import { Button } from '@/components/ui/Button';

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
    <div className={`min-h-screen bg-white ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Reduced Header Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                {isArabic ? 'منتجاتنا' : 'Nos Produits'}
              </h1>
              <p className="text-white/90 text-sm">
                {isArabic
                  ? `${totalProducts} منتج متاح`
                  : `${totalProducts} produits disponibles`}
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="w-full md:w-96">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isArabic ? 'ابحث عن المنتجات...' : 'Rechercher...'}
                  className="w-full px-4 py-2 pr-11 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white shadow-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 bg-gray-50">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={<SlidersHorizontal className="w-4 h-4" />}
              className="lg:hidden"
            >
              {isArabic ? 'الفلاتر' : 'Filtres'}
            </Button>

            {/* Results Count */}
            <p className="text-gray-600">
              {isArabic ? (
                <>
                  عرض <span className="font-semibold text-gray-900">{productCount}</span> من{' '}
                  <span className="font-semibold text-gray-900">{totalProducts}</span> منتج
                </>
              ) : (
                <>
                  Affichage de <span className="font-semibold text-gray-900">{productCount}</span> sur{' '}
                  <span className="font-semibold text-gray-900">{totalProducts}</span> produits
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                icon={<X className="w-4 h-4" />}
              >
                {isArabic ? 'مسح الفلاتر' : 'Effacer filtres'}
              </Button>
            )}

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-sm text-orange-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Vue grille"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm text-orange-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Vue liste"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Sidebar */}
          <div
            className={`${
              showFilters ? 'fixed inset-0 z-50 bg-black/50 lg:relative lg:bg-transparent' : 'hidden'
            } lg:block lg:col-span-1`}
            onClick={() => setShowFilters(false)}
          >
            <div
              className={`${
                showFilters ? 'fixed left-0 top-0 h-full w-80 bg-white shadow-2xl overflow-y-auto' : ''
              } lg:sticky lg:top-4`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Filter Header */}
              <div className="lg:hidden flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">
                  {isArabic ? 'الفلاتر' : 'Filtres'}
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <FilterSidebar
                locale={locale}
                categories={categories}
                manufacturers={manufacturers}
                value={initialFilters}
                onChange={applyFilters}
              />
            </div>
          </div>

          {/* Products Grid/List */}
          <div className="lg:col-span-3">
            {productCount === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {isArabic ? 'لم يتم العثور على منتجات' : 'Aucun produit trouvé'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {isArabic
                    ? 'جرب تغيير معايير البحث أو الفلاتر'
                    : 'Essayez de modifier vos critères de recherche ou filtres'}
                </p>
                <Button variant="outline" onClick={clearAllFilters}>
                  {isArabic ? 'مسح جميع الفلاتر' : 'Effacer tous les filtres'}
                </Button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {initialProducts.map((product) => (
                  <ModernProductCard key={product.id} product={product} />
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
                          const params = new URLSearchParams(window.location.search);
                          params.set('page', String(page));
                          router.push(`/${locale}/products?${params.toString()}`);
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          page === initialPagination.page
                            ? 'bg-orange-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
