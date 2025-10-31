'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Eye, Flame, Tag, Star, Package } from 'lucide-react';
import { Product } from '@/services/productService';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/contexts/WishlistContext';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { getImageUrl } from '@/lib/images';

interface ModernProductCardProps {
  product: Product;
}

export const ModernProductCard = React.memo(function ModernProductCard({ product }: ModernProductCardProps) {
  const router = useRouter();
  const { locale } = useLanguage();
  const { addItem } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const isArabic = locale === 'ar';
  const numberLocale = isArabic ? 'ar-DZ' : 'fr-DZ';

  const productImage = getImageUrl(product.images?.[0]?.url);
  const displayPrice = (product.salePrice && product.salePrice > 0) ? product.salePrice : product.price;
  const hasDiscount = product.salePrice && product.salePrice > 0 && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const inStock = product.stockQuantity > 0;
  const isInWish = isInWishlist(product.id);
  const isLowStock = inStock && product.stockQuantity <= 5;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inStock || isAddingToCart) return;

    setIsAddingToCart(true);
    try {
      addItem({
        productId: product.id,
        name: product.name,
        price: displayPrice,
        image: productImage,
        maxStock: product.stockQuantity,
        sku: product.sku,
      });
      // Small delay for better UX feedback
      setTimeout(() => setIsAddingToCart(false), 300);
    } catch (error) {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToWishlist({
      productId: product.id,
      name: product.name,
      price: displayPrice,
      image: productImage,
      sku: product.sku,
    });
  };

  const handleViewDetails = () => {
    router.push(`/${locale}/products/${product.id}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(numberLocale, {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-700 overflow-hidden cursor-pointer border-2 hover:-translate-y-3 ${
        product.isFeatured
          ? 'border-gradient-to-r from-[#3EC4D0] to-[#051937] shadow-[#3EC4D0]/30 hover:shadow-[#3EC4D0]/50'
          : 'border-gray-100 hover:border-[#3EC4D0]/30'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewDetails}
    >
      {/* Enhanced Badges */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {hasDiscount && (
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-1.5 animate-pulse">
            <Tag className="w-3 h-3 animate-bounce" />
            -{discountPercent}%
          </div>
        )}
        {product.isFeatured && (
          <div className="bg-gradient-to-r from-[#051937] to-[#3EC4D0] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-1.5">
            <Flame className="w-3 h-3 animate-pulse" />
            <span className="hidden sm:inline">{isArabic ? 'مميز' : 'Premium'}</span>
          </div>
        )}
        {isLowStock && (
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-1.5">
            <Package className="w-3 h-3" />
            <span className="hidden sm:inline">{isArabic ? 'مخزون قليل' : 'Stock faible'}</span>
          </div>
        )}
      </div>

      {/* Enhanced Wishlist Button */}
      <button
        onClick={handleToggleWishlist}
        className={`absolute top-4 right-4 z-20 p-3 rounded-full transition-all duration-500 transform shadow-xl ${
          isInWish
            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white scale-110 shadow-red-500/50 animate-bounce-once'
            : 'bg-white/95 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:scale-110 backdrop-blur-sm'
        }`}
        aria-label={isArabic ? 'إضافة إلى المفضلة' : 'Ajouter aux favoris'}
      >
        <Heart
          className={`w-5 h-5 transition-all duration-500 ${isInWish ? 'fill-current animate-pulse' : ''}`}
        />
      </button>

      {/* Enhanced Image Container */}
      <div className="relative w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {/* Loading Skeleton */}
        {imageLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded-t-3xl" />
        )}

        <Image
          src={imageError ? '/placeholder-product.svg' : productImage}
          alt={product.name}
          width={400}
          height={256}
          className={`w-full h-full object-cover object-center transition-all duration-700 rounded-t-3xl ${
            isHovered ? 'scale-105 brightness-105' : 'scale-100'
          } ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
          onError={() => setImageError(true)}
          onLoad={() => setImageLoading(false)}
          priority={false}
        />

        {/* Stock Status Overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/40 flex items-center justify-center">
            <div className="bg-white/95 backdrop-blur-sm text-gray-900 px-6 py-3 rounded-2xl font-bold text-center shadow-2xl">
              <Package className="w-6 h-6 mx-auto mb-2 text-red-500" />
              {isArabic ? 'غير متوفر' : 'Rupture de stock'}
            </div>
          </div>
        )}

        {/* Enhanced Quick Actions Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end justify-center p-6 transition-all duration-700 transform ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
              className="flex-1 bg-white/95 hover:bg-white backdrop-blur-sm border-white/30 text-gray-900 hover:text-[#3EC4D0] transition-all duration-300"
              icon={<Eye className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">{isArabic ? 'عرض' : 'Voir'}</span>
            </Button>
            {inStock && (
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="flex-1 bg-gradient-to-r from-[#3EC4D0] to-[#051937] hover:from-[#35b4bf] hover:to-[#0a2a4a] disabled:from-gray-400 disabled:to-gray-600 text-white border-none shadow-xl hover:shadow-2xl disabled:shadow-none transition-all duration-300 rounded-lg px-3 py-2 text-sm font-medium flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {isAddingToCart
                    ? (isArabic ? 'إضافة...' : 'Ajout...')
                    : (isArabic ? 'أضف' : 'Ajouter')
                  }
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Image Counter */}
        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
            1 / {product.images.length}
          </div>
        )}
      </div>

      {/* Enhanced Product Info */}
      <div className="p-6 flex-1 flex flex-col bg-gradient-to-b from-white to-gray-50">
        {/* Category & Brand */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#3EC4D0] uppercase tracking-wider">
            {product.category?.name || (isArabic ? 'غير مصنف' : 'Non classé')}
          </span>
          {product.manufacturer && (
            <span className="text-xs text-gray-500 font-medium">
              {product.manufacturer.name}
            </span>
          )}
        </div>

        {/* Product Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#3EC4D0] transition-colors duration-300 leading-tight min-h-[56px]">
          {product.name}
        </h3>


        {/* Enhanced Price Section */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xs font-semibold text-red-600">
                  -{discountPercent}%
                </span>
              </div>
            )}
          </div>

          {/* Enhanced Stock Status */}
          <div className="flex items-center justify-between">
            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              !inStock
                ? 'bg-red-100 text-red-700'
                : isLowStock
                ? 'bg-orange-100 text-orange-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {!inStock ? (
                <>
                  <span className="w-2 h-2 bg-red-500 rounded-full inline-block mr-1.5"></span>
                  {isArabic ? 'غير متوفر' : 'Épuisé'}
                </>
              ) : isLowStock ? (
                <>
                  <span className="w-2 h-2 bg-orange-500 rounded-full inline-block mr-1.5"></span>
                  {product.stockQuantity} {isArabic ? 'متبقي' : 'restants'}
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-1.5"></span>
                  {isArabic ? 'متوفر' : 'En stock'}
                </>
              )}
            </div>

            {/* SKU */}
            <span className="text-xs text-gray-400 font-mono">
              {product.sku}
            </span>
          </div>
        </div>
      </div>

      {/* Subtle glow effect for featured products */}
      {product.isFeatured && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#3EC4D0]/5 to-[#051937]/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      )}
    </div>
  );
});
