'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Search, Grid3X3, List, SlidersHorizontal, ArrowRight, Flame, Zap, Award, TrendingUp } from 'lucide-react';
import ProductService, { Product, Category } from '@/services/productService';

type Props = {
  locale: string;
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

export default function ClientProductsPage({ locale }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isArabic = locale === 'ar';

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        console.log('🔄 Fetching products from API...');
        
        const productsData = await ProductService.getProducts();
        
        console.log('✅ Products fetched:', productsData.length);
        console.log('📋 Products data:', productsData);
        setProducts(productsData);
        
      } catch (err) {
        console.error('❌ Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Transform products for display
  const displayProducts: DisplayProduct[] = products.map((product: Product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    salePrice: product.salePrice,
    originalPrice: product.salePrice ? product.price : null,
    rating: 4.5, // Mock rating since not in API yet
    reviews: 15, // Mock reviews since not in API yet
    image: product.images && product.images.length > 0 ? product.images[0] : '/images/default-product.jpg',
    stockQuantity: product.stockQuantity,
    inStock: product.stockQuantity > 0,
    badge: product.isFeatured ? (isArabic ? 'مميز' : 'Premium') : null,
    badgeColor: product.isFeatured ? 'bg-blue-500' : '',
    features: product.features || [],
    isFeatured: product.isFeatured,
    category: product.category?.name || 'Unknown',
    brand: product.manufacturer?.name || 'Unknown'
  }));

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isArabic ? 'rtl' : ''}`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {isArabic ? 'جاري تحميل المنتجات...' : 'Chargement des produits...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isArabic ? 'rtl' : ''}`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">
              {isArabic ? 'خطأ في تحميل المنتجات' : 'Erreur lors du chargement des produits'}
            </p>
            <p className="text-gray-500 text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isArabic ? 'إعادة المحاولة' : 'Réessayer'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isArabic ? 'rtl' : ''}`}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-orange-500/20 rounded-full text-orange-200 text-sm font-medium mb-6">
              <Flame className="w-4 h-4 mr-2" />
              {isArabic ? `+${products.length} منتج متاح` : `+${products.length} produits disponibles`}
            </div>
            <h1 className="text-5xl font-bold mb-4">
              {isArabic ? 'منتجاتنا' : 'Nos Produits'}
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              {isArabic 
                ? 'اكتشف مجموعتنا الواسعة من معدات التدفئة عالية الجودة من أفضل العلامات التجارية العالمية'
                : 'Découvrez notre large gamme d\'équipements de chauffage de haute qualité des meilleures marques internationales'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={isArabic ? 'ابحث عن المنتجات، العلامات التجارية...' : 'Rechercher des produits, marques...'}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                <SlidersHorizontal className="h-4 w-4" />
                {isArabic ? 'فلترة' : 'Filtres'}
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

        {/* Products Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-2">
                <TrendingUp className="w-4 h-4 mr-1" />
                {isArabic ? 'الأكثر مبيعاً' : 'Produits disponibles'}
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                {isArabic ? 'المنتجات المتاحة' : 'Tous nos produits'}
              </h2>
            </div>
          </div>
          
          {displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayProducts.map((product) => (
                <div key={product.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
                  {/* Product Image */}
                  <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {product.badge && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${product.badgeColor}`}>
                          {product.badge}
                        </span>
                      </div>
                    )}
                    
                    <div className="w-full h-full flex items-center justify-center">
                      {product.image && product.image !== '/images/default-product.jpg' ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to emoji if image fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span className="text-8xl" style={{ display: product.image && product.image !== '/images/default-product.jpg' ? 'none' : 'block' }}>🔥</span>
                    </div>
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    
                    {/* Category and Brand */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {product.category}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                        {product.brand}
                      </span>
                    </div>
                    
                    {/* Features */}
                    {product.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {product.features.slice(0, 2).map((feature: string, index: number) => (
                          <span key={index} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">
                            {feature}
                          </span>
                        ))}
                        {product.features.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{product.features.length - 2} autres
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Price */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">
                          {product.price.toLocaleString()} {isArabic ? 'د.ج' : 'DA'}
                        </span>
                        {product.originalPrice && (
                          <>
                            <span className="text-sm text-gray-500 line-through ml-2">
                              {product.originalPrice.toLocaleString()} {isArabic ? 'د.ج' : 'DA'}
                            </span>
                            <div className="text-sm text-green-600 font-medium">
                              {isArabic ? 'وفر' : 'Économisez'} {product.originalPrice - product.price} {isArabic ? 'د.ج' : 'DA'}
                            </div>
                          </>
                        )}
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        product.inStock 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {product.inStock 
                          ? (isArabic ? 'متوفر' : 'En stock')
                          : (isArabic ? 'غير متوفر' : 'Rupture')
                        }
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button 
                        disabled={!product.inStock}
                        className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${
                          product.inStock
                            ? 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-[1.02]'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {isArabic ? 'أضف للسلة' : 'Ajouter'}
                      </button>
                      <Link
                        href={`/${locale}/products/details/${product.id}`}
                        className="px-4 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isArabic ? 'لا توجد منتجات متاحة' : 'Aucun produit disponible'}
              </h3>
              <p className="text-gray-500 mb-4">
                {isArabic ? 'يرجى المحاولة مرة أخرى لاحقاً' : 'Les produits créés dans l\'admin apparaîtront ici'}
              </p>
              <Link 
                href={`/${locale}/admin/products`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isArabic ? 'إضافة منتجات' : 'Ajouter des produits'}
              </Link>
            </div>
          )}
        </div>

        {/* Trust Indicators */}
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
