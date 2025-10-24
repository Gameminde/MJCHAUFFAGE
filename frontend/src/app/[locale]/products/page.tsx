import { setRequestLocale } from 'next-intl/server';
import ClientProductsPage from './ClientProductsPage';
import {
  fetchProductsSSRWithParams,
  fetchCategoriesSSR,
  fetchManufacturersSSR,
} from '@/lib/ssr-api';

type Props = {
  params: { locale: string };
  searchParams?: {
    page?: string;
    limit?: string;
    search?: string;
    category?: string;
    categories?: string | string[];
    manufacturer?: string;
    manufacturers?: string | string[];
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    featured?: string;
    sortBy?: string;
    sortOrder?: string;
  };
};

export const revalidate = 0;

export const metadata = {
  title: 'Produits - MJ CHAUFFAGE',
  description:
    "Découvrez notre gamme complète de chaudières, radiateurs, et équipements de chauffage premium.",
};

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale } = params;
  setRequestLocale(locale);

  const paramsObject = searchParams ?? {};
  const page = Number(paramsObject.page ?? 1) || 1;

  const [productsResult, categoriesResult, manufacturersResult] = await Promise.all([
    fetchProductsSSRWithParams(paramsObject as Record<string, any>),
    fetchCategoriesSSR(),
    fetchManufacturersSSR(),
  ]);

  const { products, pagination } = productsResult;
  const { categories } = categoriesResult;
  const { manufacturers } = manufacturersResult;

  return (
    <ClientProductsPage
      locale={locale}
      initialProducts={products}
      initialPagination={pagination}
      initialPage={page}
      categories={categories}
      manufacturers={manufacturers}
      initialFilters={{
        search: typeof paramsObject.search === 'string' ? paramsObject.search : undefined,
        categories:
          Array.isArray(paramsObject.categories)
            ? (paramsObject.categories as string[])
            : typeof paramsObject.categories === 'string'
            ? paramsObject.categories.split(',').filter(Boolean)
            : paramsObject.category
            ? [paramsObject.category]
            : undefined,
        manufacturers:
          Array.isArray(paramsObject.manufacturers)
            ? (paramsObject.manufacturers as string[])
            : typeof paramsObject.manufacturers === 'string'
            ? paramsObject.manufacturers.split(',').filter(Boolean)
            : paramsObject.manufacturer
            ? [paramsObject.manufacturer]
            : undefined,
        minPrice: paramsObject.minPrice ? Number(paramsObject.minPrice) : undefined,
        maxPrice: paramsObject.maxPrice ? Number(paramsObject.maxPrice) : undefined,
        inStock:
          paramsObject.inStock !== undefined
            ? paramsObject.inStock === 'true'
            : undefined,
        featured:
          paramsObject.featured !== undefined
            ? paramsObject.featured === 'true'
            : undefined,
        sortBy: typeof paramsObject.sortBy === 'string' ? paramsObject.sortBy : undefined,
        sortOrder:
          typeof paramsObject.sortOrder === 'string'
            ? (paramsObject.sortOrder as 'asc' | 'desc')
            : undefined,
      }}
    />
  );
}
