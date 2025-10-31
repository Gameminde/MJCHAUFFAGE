import { setRequestLocale } from 'next-intl/server';
import ModernProductsPage from './ModernProductsPage';
import { fetchProductsSSRWithParams, fetchCategoriesSSR, fetchManufacturersSSR } from '@/lib/ssr-api';

type Props = {
  params: { locale: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

export const revalidate = 0;

export const metadata = {
  title: 'Produits - MJ CHAUFFAGE',
  description:
    'Découvrez notre gamme complète de chaudières, radiateurs, et équipements de chauffage premium.',
};

export default async function ProductsPage({ params, searchParams = {} }: Props) {
  const { locale } = params;
  setRequestLocale(locale);

  // Fetch products + filters data in parallel
  const [{ products, pagination }, { categories }, { manufacturers }] = await Promise.all([
    fetchProductsSSRWithParams(searchParams as Record<string, any>),
    fetchCategoriesSSR(),
    fetchManufacturersSSR(),
  ]);

  const page = Number(searchParams?.page ?? 1) || 1;

  return (
    <ModernProductsPage
      locale={locale}
      initialProducts={products}
      initialPagination={pagination}
      initialPage={page}
      categories={categories}
      manufacturers={manufacturers}
      initialFilters={{
        search: typeof searchParams.search === 'string' ? searchParams.search : undefined,
        categories: typeof searchParams.categories === 'string' ? searchParams.categories.split(',') : undefined,
        manufacturers: typeof searchParams.manufacturers === 'string' ? searchParams.manufacturers.split(',') : undefined,
        minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
        maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
        inStock: searchParams.inStock ? searchParams.inStock === 'true' : undefined,
        featured: searchParams.featured ? searchParams.featured === 'true' : undefined,
        sortBy: typeof searchParams.sortBy === 'string' ? searchParams.sortBy : undefined,
        sortOrder: typeof searchParams.sortOrder === 'string' ? (searchParams.sortOrder as 'asc' | 'desc') : undefined,
        limit: searchParams.limit ? Number(searchParams.limit) : undefined,
      }}
    />
  );
}
