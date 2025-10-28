import { setRequestLocale } from 'next-intl/server';
import ModernProductsPage from './ModernProductsPage';
import { fetchProductsSSR } from '@/lib/ssr-api';

type Props = {
  params: { locale: string };
  searchParams?: { page?: string };
};

export const revalidate = 0;

export const metadata = {
  title: 'Produits - MJ CHAUFFAGE',
  description:
    'Découvrez notre gamme complète de chaudières, radiateurs, et équipements de chauffage premium.',
};

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale } = params;
  setRequestLocale(locale);

  const page = Number(searchParams?.page ?? 1) || 1;
  const { products, pagination } = await fetchProductsSSR(page);

  return (
    <ModernProductsPage
      locale={locale}
      initialProducts={products}
      initialPagination={pagination}
      initialPage={page}
    />
  );
}
