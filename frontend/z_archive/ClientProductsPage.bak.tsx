'use client'

import React from 'react';
import { useState, useEffect, useCallback, useRef, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Star,
  ShoppingCart,
  Search,
  Grid3X3,
  List,
  SlidersHorizontal,
  ArrowRight,
  Flame,
  Zap,
  Award,
  TrendingUp,
} from 'lucide-react';
import ProductService, { Product } from '@/services/productService';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import FilterSidebar from '@/components/products/FilterSidebar';
import type { FilterValues } from '@/components/products/FilterSidebar';
import { useDebounce } from '@/hooks/useDebounce';
import { SortDropdown } from '@/components/products/SortDropdown';
import Image from 'next/image';
import { ProductsLoading } from '@/components/products/ProductsLoading';
import { ProductsEmpty } from '@/components/products/ProductsEmpty';

// Update Props to include optional filters and lists for future FilterSidebar integration
type Props = {
  locale: string;
  initialProducts: Product[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  initialPage: number;
  // Optional SSR-provided lists (not yet used in UI)
  categories?: Array<{ id: string; name: string; slug?: string; productCount?: number }>;
  manufacturers?: Array<{ id: string; name: string; slug?: string; productCount?: number }>;
  // Optional initial filters from URL (not yet used in UI)
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

interface DisplayProduct {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  originalPrice?: number | null;
  rating: number;
  reviews: number;
  image?: string;
  stockQuantity: number;
  inStock: boolean;
  badge?: string | null;
  badgeColor?: string;
  features: string[];
  isFeatured: boolean;
  category: string;
  brand: string;
}

// Refactor signature to avoid destructuring unused optional props (keeps TS happy if noUnusedLocals is enabled)
export default function ClientProductsPage(props: Props) {
  const { locale, initialProducts, initialPagination, initialPage } = props;
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const [filters, setFilters] = useState<FilterValues>(props.initialFilters ?? {});

  // Keep local state in sync with SSR props on URL changes
  useEffect(() => {
    setProducts(props.initialProducts);
    setPagination(props.initialPagination);
  }, [props.initialProducts, props.initialPagination]);

  // Track user-initiated changes to avoid pushing during initial hydration
  const hasUserChangedSearch = useRef(false);
  const hasUserChangedPrice = useRef(false);

  // Debounced values for search and price inputs to avoid excessive SSR navigations
  const debouncedSearch = useDebounce(filters.search ?? '', 500);
  const debouncedMinPrice = useDebounce(filters.minPrice, 800);
  const debouncedMaxPrice = useDebounce(filters.maxPrice, 800);

  useEffect(() => {
    // Avoid initial hydration push; only push when user has changed the search
    if (!hasUserChangedSearch.current) return;
    if (typeof debouncedSearch === 'string') {
      pushFilters({ ...filters, search: debouncedSearch });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    // Avoid initial hydration push; only push when user has changed the price range
    if (!hasUserChangedPrice.current) return;
    pushFilters({ ...filters, minPrice: debouncedMinPrice, maxPrice: debouncedMaxPrice });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMinPrice, debouncedMaxPrice]);
  

  const isArabic = locale === 'ar';
  const numberLocale = isArabic ? 'ar-DZ' : 'fr-DZ';

  // Helper to push filters to URL (triggers SSR refresh)
  const pushFilters = useCallback(
    (next: FilterValues) => {
      const q = new URLSearchParams();
      // Always reset to first page when filters change
      q.set('page', '1');

      if (next.search) q.set('search', next.search);
      if (next.inStock !== undefined) q.set('inStock', String(next.inStock));
      if (next.minPrice !== undefined) q.set('minPrice', String(next.minPrice));
      if (next.maxPrice !== undefined) q.set('maxPrice', String(next.maxPrice));
      if (next.featured !== undefined) q.set('featured', String(next.featured));
      if (next.limit !== undefined) q.set('limit', String(next.limit));
      (next.categories ?? []).forEach((id) => q.append('categories', id));
      (next.manufacturers ?? []).forEach((id) => q.append('manufacturers', id));

      if (next.sortBy) q.set('sortBy', String(next.sortBy));
      if (next.sortOrder) q.set('sortOrder', String(next.sortOrder));

      setIsLoading(true);
      startTransition(() => {
        router.push(`${pathname}?${q.toString()}`, { scroll: false });
      });
    },
    [router, pathname],
  );

  const goToPage = useCallback((page: number) => {
    setIsLoading(true);
    startTransition(() => {
      const next = { ...filters } as FilterValues;
      const q = new URLSearchParams();
      q.set('page', String(page));
      if (next.search) q.set('search', next.search);
      if (next.inStock !== undefined) q.set('inStock', String(next.inStock));
      if (next.featured !== undefined) q.set('featured', String(next.featured));
      if (next.minPrice !== undefined) q.set('minPrice', String(next.minPrice));
      if (next.maxPrice !== undefined) q.set('maxPrice', String(next.maxPrice));
      (next.categories ?? []).forEach((id) => q.append('categories', id));
      (next.manufacturers ?? []).forEach((id) => q.append('manufacturers', id));
      if (next.sortBy) q.set('sortBy', String(next.sortBy));
      if (next.sortOrder) q.set('sortOrder', String(next.sortOrder));
      if (next.limit !== undefined) q.set('limit', String(next.limit));
      router.push(`${pathname}?${q.toString()}`, { scroll: false });
    });
  }, [router, pathname, filters]);

  const applyFilters = useCallback(
    (partial: Partial<FilterValues>) => {
      const next = { ...filters, ...partial } as FilterValues;
      setFilters(next);

      const changedKeys = Object.keys(partial) as (keyof FilterValues)[];
      // Mark that user changed price range to enable debounced push
      if (changedKeys.includes('minPrice') || changedKeys.includes('maxPrice')) {
        hasUserChangedPrice.current = true;
      }

      const immediateKeys: (keyof FilterValues)[] = ['categories', 'manufacturers', 'inStock', 'featured', 'sortBy', 'sortOrder', 'limit'];
      const shouldImmediate = changedKeys.some((k) => immediateKeys.includes(k));
      if (shouldImmediate) {
        pushFilters(next);
      }
    },
    [filters, pushFilters],
  );

  // Stop loading when new products arrive from SSR
  useEffect(() => {
    setIsLoading(false);
  }, [products]);

  useEffect(() => {
    if (initialProducts.length > 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        const productsData = await ProductService.getProducts();
        if (cancelled) return;

        setProducts(productsData);
        setPagination((prev) => ({
          ...prev,
          page: initialPage,
          total: productsData.length,
          totalPages: Math.max(
            1,
            Math.ceil(
              productsData.length / (prev.limit || productsData.length || 1),
            ),
          ),
        }));
        setError(null);
      } catch (err) {
        if (cancelled) return;
        console.error('❌ Error fetching products:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch products',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [initialProducts.length, initialPage]);

  const displayProducts: DisplayProduct[] = products.map((product: Product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    salePrice: product.salePrice,
    originalPrice: product.salePrice ? product.price : null,
    rating: 4.5,
    reviews: 15,
    image:
      product.images && product.images.length > 0
        ? typeof product.images[0] === 'string'
          ? product.images[0]
          : product.images[0].url
        : '/images/default-product.jpg',
    stockQuantity: product.stockQuantity,
    inStock: product.stockQuantity > 0,
    badge: product.isFeatured ? (isArabic ? 'مميز' : 'Premium') : null,
    badgeColor: product.isFeatured ? 'bg-blue-500' : '',
    features: product.features || [],
    isFeatured: product.isFeatured,
    category: product.category?.name || 'Unknown',
    brand: product.manufacturer?.name || 'Unknown',
  }));

  const hasActiveFilters = useCallback(() => {
    return Boolean(
      (filters.search && filters.search.length > 0) ||
      (filters.categories && filters.categories.length > 0) ||
      (filters.manufacturers && filters.manufacturers.length > 0) ||
      filters.inStock !== undefined ||
      filters.featured !== undefined ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined
    );
  }, [filters]);

  const resetFilters = useCallback(() => {
    setFilters({});
    pushFilters({} as FilterValues);
  }, [pushFilters]);


  return (
    <div className={'min-h-screen bg-gray-50 ' + (isArabic ? 'rtl' : '')}>
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-orange-500/20 rounded-full text-orange-200 text-sm font-medium mb-6">
              <Flame className="w-4 h-4 mr-2" />
              {isArabic
                ? `+${products.length} منتج متاح`
                : `+${products.length} produits disponibles`}
            </div>
            <h1 className="text-5xl font-bold mb-4">
              {isArabic ? 'منتجاتنا' : 'Nos Produits'}
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              {isArabic
                ? 'اكتشف مجموعتنا الواسعة من معدات التدفئة عالية الجودة من أفضل العلامات التجارية العالمية'
                : "Découvrez notre large gamme d'équipements de chauffage de haute qualité des meilleures marques internationales"}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={isArabic ? 'ابحث عن منتجات، علامات تجارية...' : 'Rechercher des produits, marques...'}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                value={filters.search ?? ''}
                onChange={(e) => { hasUserChangedSearch.current = true; setFilters(prev => ({ ...prev, search: e.target.value })); }}
                
                
              />
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                <SlidersHorizontal className="h-4 w-4" />
                {isArabic ? 'تصفية' : 'Filtres'}
              </button>
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button className="p-2 bg-white rounded-lg shadow-sm">
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-2">
                <TrendingUp className="w-4 h-4 mr-1" />
                {isArabic ? 'منتجات متاحة' : 'Produits disponibles'}
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                {isArabic ? 'كل منتجاتنا' : 'Tous nos produits'}
              </h2>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <p className="text-gray-600 text-sm">
              <span className="font-semibold text-gray-900">{products.length}</span> produit{products.length > 1 ? 's' : ''} trouvé{products.length > 1 ? 's' : ''}
            </p>

            <div className="flex items-center gap-4">
              <SortDropdown
                currentSortBy={filters.sortBy}
                currentSortOrder={filters.sortOrder}
                onChange={(sortBy, sortOrder) => {
                  applyFilters({ sortBy, sortOrder });
                }}
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{isArabic ? 'لكل صفحة' : 'par page'}</span>
                <select
                  value={filters.limit ?? pagination.limit}
                  onChange={(e) => applyFilters({ limit: Number(e.target.value) })}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
              </div>
            </div>
          </div>

          {hasActiveFilters() && (
            <div className="flex flex-wrap gap-2 mb-6">
              {(filters.categories ?? []).map((id) => {
                const cat = props.categories?.find((c) => c.id === id);
                return (
                  <button
                    key={`cat-${id}`}
                    onClick={() => applyFilters({ categories: (filters.categories ?? []).filter((c) => c !== id) })}
                    className="px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {(cat?.name ?? id)} ×
                  </button>
                );
              })}
              {(filters.manufacturers ?? []).map((id) => {
                const m = props.manufacturers?.find((mm) => mm.id === id);
                return (
                  <button
                    key={`man-${id}`}
                    onClick={() => applyFilters({ manufacturers: (filters.manufacturers ?? []).filter((c) => c !== id) })}
                    className="px-3 py-1 text-xs rounded-full bg-purple-50 text-purple-700 border border-purple-200"
                  >
                    {(m?.name ?? id)} ×
                  </button>
                );
              })}
              {filters.inStock !== undefined && (
                <button
                  onClick={() => applyFilters({ inStock: undefined })}
                  className="px-3 py-1 text-xs rounded-full bg-green-50 text-green-700 border border-green-200"
                >
                  {isArabic ? 'متوفر' : 'En stock'} ×
                </button>
              )}
              {filters.featured !== undefined && (
                <button
                  onClick={() => applyFilters({ featured: undefined })}
                  className="px-3 py-1 text-xs rounded-full bg-orange-50 text-orange-700 border border-orange-200"
                >
                  {isArabic ? 'مميز' : 'Mis en avant'} ×
                </button>
              )}
              {filters.minPrice !== undefined && (
                <button
                  onClick={() => applyFilters({ minPrice: undefined })}
                  className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                >
                  ≥ {Number(filters.minPrice).toLocaleString(numberLocale)} {isArabic ? 'د.ج' : 'DA'} ×
                </button>
              )}
              {filters.maxPrice !== undefined && (
                <button
                  onClick={() => applyFilters({ maxPrice: undefined })}
                  className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                >
                  ≤ {Number(filters.maxPrice).toLocaleString(numberLocale)} {isArabic ? 'د.ج' : 'DA'} ×
                </button>
              )}
              <button
                onClick={resetFilters}
                className="px-3 py-1 text-xs rounded-full bg-red-50 text-red-700 border border-red-200"
              >
                {isArabic ? 'مسح الكل' : 'Tout effacer'}
              </button>
            </div>
          )}
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-80 shrink-0">
              <FilterSidebar
                locale={locale}
                categories={props.categories}
                manufacturers={props.manufacturers}
                value={filters}
                onChange={applyFilters}
              />
            </div>
            <div className="flex-1">
              {(isLoading || isPending || loading) ? (
            <ProductsLoading />
          ) : displayProducts.length === 0 ? (
            <ProductsEmpty locale={locale} hasActiveFilters={hasActiveFilters()} onResetFilters={resetFilters} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
                >
                  <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {product.badge && (
                      <div className="absolute top-4 left-4 z-10">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${product.badgeColor}`}
                        >
                          {product.badge}
                        </span>
                      </div>
                    )}

                    <div className="w-full h-full flex items-center justify-center">
                      {product.image && product.image !== '/images/default-product.jpg' ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="flex -space-x-2">
                          {Array.from({ length: 3 }).map((_, index) => (
                            <div
                              key={index}
                              className="w-8 h-8 rounded-full border-2 border-white bg-white flex items-center justify-center shadow"
                            >
                              <Star className="w-4 h-4 text-yellow-400" />
                            </div>
                          ))}
                        </div>
                        <span className="px-3 py-1 bg-white/90 backdrop-blur text-gray-900 text-xs font-semibold rounded-full shadow-sm">
                          {product.rating} ({product.reviews})
                        </span>
                      </div>
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg">
                        {product.brand}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          {product.category}
                        </span>
                        {product.features.includes('Éco')
                          ? (
                            <span className="flex items-center text-xs font-medium text-green-600">
                              <Zap className="w-4 h-4 mr-1" />
                              {isArabic ? 'موفر للطاقة' : 'Éco-énergétique'}
                            </span>
                          )
                          : null}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      {product.features.slice(0, 2).join(' • ') || (isArabic ? 'حلول تدفئة عالية الأداء' : 'Solution de chauffage haute performance')}
                    </p>

                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">
                          {product.price.toLocaleString(numberLocale)} {isArabic ? 'د.ج' : 'DA'}
                        </span>
                        {product.originalPrice && (
                          <>
                            <span className="text-sm text-gray-500 line-through ml-2">
                              {product.originalPrice.toLocaleString(numberLocale)} {isArabic ? 'د.ج' : 'DA'}
                            </span>
                            <div className="text-sm text-green-600 font-medium">
                              {isArabic ? 'وفر' : 'Économisez'}{' '}
                              {(product.originalPrice - product.price).toLocaleString(numberLocale)} {isArabic ? 'د.ج' : 'DA'}
                            </div>
                          </>
                        )}
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {product.inStock
                          ? (isArabic ? 'متوفر' : 'En stock')
                          : (isArabic ? 'غير متوفر' : 'Rupture')}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <AddToCartButton
                        product={{
                          id: product.id,
                          name: product.name,
                          price: product.salePrice || product.price,
                          sku: product.id,
                          stockQuantity: product.stockQuantity,
                          images: product.image ? [{ url: product.image }] : [],
                        }}
                        variant="primary"
                        size="md"
                        className="flex-1"
                      />
                      <Link
                        href={`/${locale}/products/${product.id}`}
                        className="px-4 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
              {/* Pagination controls */}
              <div className="mt-10 flex items-center justify-center gap-4">
                <button
                  disabled={pagination.page <= 1 || isLoading || isPending}
                  onClick={() => goToPage(Math.max(1, pagination.page - 1))}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  {isArabic ? 'السابق' : 'Précédent'}
                </button>
                <span className="text-sm text-gray-600">
                  {isArabic ? 'صفحة' : 'Page'} {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page >= pagination.totalPages || isLoading || isPending}
                  onClick={() => goToPage(Math.min(pagination.totalPages, pagination.page + 1))}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  {isArabic ? 'التالي' : 'Suivant'}
                </button>
              </div>
            </div>
          </div>

        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {isArabic ? 'جودة مضمونة' : 'Qualité garantie'}
              </h3>
              <p className="text-gray-600 text-sm">
                {isArabic ? 'ضمان على جميع المنتجات' : 'Garantie sur tous nos produits'}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {isArabic ? 'توصيل سريع' : 'Livraison rapide'}
              </h3>
              <p className="text-gray-600 text-sm">
                {isArabic ? 'في جميع أنحاء الجزائر' : 'Partout en Algérie'}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {isArabic ? 'دعم متخصص' : 'Support expert'}
              </h3>
              <p className="text-gray-600 text-sm">
                {isArabic ? 'فريق متخصص لمساعدتك' : 'Équipe dédiée pour vous aider'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
