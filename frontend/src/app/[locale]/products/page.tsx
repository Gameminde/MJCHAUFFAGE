import ClientProductsPage from './ClientProductsPage';
import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: { locale: string };
};

export default function ProductsPage({ params }: Props) {
  const { locale } = params;
  setRequestLocale(locale);
  
  return <ClientProductsPage locale={locale} />;
}

export const metadata = {
  title: 'Produits - MJ CHAUFFAGE',
  description: 'Découvrez notre gamme complète de chaudières, radiateurs, et équipements de chauffage premium.',
};
