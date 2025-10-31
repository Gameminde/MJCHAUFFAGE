import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { fetchProductDetailSSR, fetchProductsSSR } from '@/lib/ssr-api';
import { ProductImageGallery } from '@/components/products/ProductImageGallery';
import { ProductActions } from '@/components/products/ProductActions';
import { getImageUrl } from '@/lib/images';

type Props = {
  params: { locale: string; id: string };
};

export const revalidate = 7200;

export async function generateStaticParams() {
  const locales = ['fr', 'ar'];
  const { products } = await fetchProductsSSR(1, 50);

  if (!products || products.length === 0) {
    return [];
  }

  return locales.flatMap((locale) =>
    products.map((product) => ({
      locale,
      id: product.id,
    })),
  );
}

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const product = await fetchProductDetailSSR(params.id);

  if (!product) {
    return {
      title: 'Produit non trouvé | MJ CHAUFFAGE',
      description:
        'Le produit recherché est introuvable. Découvrez les autres solutions MJ CHAUFFAGE.',
    };
  }

  return {
    title: `${product.name} | MJ CHAUFFAGE`,
    description:
      product.description ??
      'Découvrez ce produit MJ CHAUFFAGE et ses caractéristiques techniques.',
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale, id } = params;
  setRequestLocale(locale);

  const product = await fetchProductDetailSSR(id);

  if (!product) {
    notFound();
  }

  const isArabic = locale === 'ar';
  const numberLocale = isArabic ? 'ar-DZ' : 'fr-DZ';

  // Process all product images
  const productImages: string[] = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map(img => typeof img === 'string' ? img : img.url)
    : [];

  return (
    <main className={`min-h-screen bg-gray-50 ${isArabic ? 'rtl' : ''}`}>
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center gap-4 text-sm text-gray-500">
          <Link href={`/${locale}`} className="hover:text-blue-600 transition-colors">
            {isArabic ? 'الرئيسية' : 'Accueil'}
          </Link>
          <span>/</span>
          <Link href={`/${locale}/products`} className="hover:text-blue-600 transition-colors">
            {isArabic ? 'المنتجات' : 'Produits'}
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-4 py-12 grid gap-10 lg:grid-cols-2">
        <ProductImageGallery
          images={productImages}
          productName={product.name}
        />

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-6">
          <div>
            <span className="text-sm uppercase text-blue-600">{product.category?.name}</span>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">{product.name}</h1>
          </div>

          <p className="text-gray-600 leading-relaxed">
            {product.description ??
              (isArabic
                ? 'وصف المنتج غير متوفر حاليًا.'
                : 'La description détaillée du produit sera bientôt disponible.')}
          </p>

          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-bold text-gray-900">
              {new Intl.NumberFormat(numberLocale).format(product.salePrice ?? product.price)} {isArabic ? 'د.ج' : 'DA'}
            </span>
            {product.salePrice && (
              <span className="text-sm text-gray-500 line-through">
-                {product.price.toLocaleString()} {isArabic ? 'د.ج' : 'DA'}
+                {product.price.toLocaleString(numberLocale)} {isArabic ? 'د.ج' : 'DA'}
              </span>
            )}
          </div>

          <div className="grid gap-3 text-sm">
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-500">{isArabic ? 'المخزون المتاح' : 'Stock disponible'}</span>
              <span className={product.stockQuantity > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                {product.stockQuantity > 0
                  ? `${product.stockQuantity} ${isArabic ? 'وحدة' : 'unités'}`
                  : isArabic
                    ? 'غير متوفر'
                    : 'Rupture'}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-500">{isArabic ? 'العلامة التجارية' : 'Marque'}</span>
              <span className="text-gray-800">
                {product.manufacturer?.name ?? (isArabic ? 'غير محدد' : 'Non précisé')}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-500">{isArabic ? 'المرجع (SKU)' : 'Référence (SKU)'}</span>
              <span className="text-gray-800">{product.sku}</span>
            </div>
          </div>

          <ProductActions
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              salePrice: product.salePrice,
              sku: product.sku,
              stockQuantity: product.stockQuantity,
              images: productImages.map(img => ({ url: img })),
            }}
          />

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
            {isArabic
              ? 'هل تحتاج إلى مزيد من المعلومات حول هذا المنتج؟ اتصل بخبرائنا للحصول على نصيحة شخصية.'
              : 'Besoin de plus d’informations sur ce produit ? Contactez nos experts pour un conseil personnalisé.'}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <Link
          href={`/${locale}/products`}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {isArabic ? '← الرجوع إلى المنتجات' : '← Retour aux produits'}
        </Link>
      </section>
    </main>
  );
}
