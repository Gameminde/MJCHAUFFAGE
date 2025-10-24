'use client'

import { useMemo } from 'react';
import Image from 'next/image';
import { Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FilterSidebar, { FilterValues } from '@/components/products/FilterSidebar';
import { Product } from '@/services/productService'
import { ProductCard } from '@/components/products/ProductCard'

// Props kept compatible with previous implementation
export type Props = {
  locale: string;
  initialProducts: Product[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  initialPage: number;
  // Optional SSR-provided lists and filters (kept for compatibility)
  categories?: Array<{ id: string; name: string; slug?: string; productCount?: number; [key: string]: any }>;
  manufacturers?: Array<{ id: string; name: string; slug?: string; productCount?: number; [key: string]: any }>;
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

export default function ClientProductsPage({ locale, initialProducts, initialPagination, initialPage, categories = [], manufacturers = [], initialFilters = {} }: Props) {
  const isArabic = useMemo(() => locale?.toLowerCase()?.startsWith('ar'), [locale]);
  const productCount = initialProducts?.length ?? 0;
  const numberLocale = isArabic ? 'ar-DZ' : 'fr-DZ';
  const router = useRouter();

  const applyFilters = (filters: FilterValues) => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.categories && filters.categories.length) params.set('categories', filters.categories.join(','));
    if (filters.manufacturers && filters.manufacturers.length) params.set('manufacturers', filters.manufacturers.join(','));
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

  return (
    <div className={`min-h-screen bg-gray-50 ${isArabic ? 'rtl' : ''}`}>
      <div className="max-w-7xl mx-auto p-4">
        {/* Simple hero header to ensure valid JSX while we fix the complex layout */}
        <div className="mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-orange-500/20 rounded-full text-orange-700 text-sm font-medium mb-4">
            <Flame className="w-4 h-4 mr-2" />
            {isArabic ? `+${productCount} منتج متاح` : `+${productCount} produits disponibles`}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isArabic ? 'منتجاتنا' : 'Nos Produits'}
          </h1>
          <p className="text-gray-600">
            {isArabic
              ? 'واجهة مبسطة مؤقتًا للتأكد من صحة بناء JSX.'
              : 'Interface simplifiée temporairement pour valider le JSX.'}
          </p>
        </div>

        {/* Content with filter sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <FilterSidebar
              locale={locale}
              categories={categories}
              manufacturers={manufacturers}
              value={initialFilters}
              onChange={applyFilters}
            />
          </div>
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
