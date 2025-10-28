'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Eye, Flame, Tag } from 'lucide-react';
import { Product } from '@/services/productService';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/contexts/WishlistContext';
import { Button } from '@/components/ui/Button';
import { getImageUrl } from '@/lib/images';

interface ModernProductCardProps {
  product: Product;
}

export function ModernProductCard({ product }: ModernProductCardProps) {
  const router = useRouter();
  const { locale } = useLanguage();
  const { addItem } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isArabic = locale === 'ar';
  const numberLocale = isArabic ? 'ar-DZ' : 'fr-DZ';
  
  const productImage = getImageUrl(product.images?.[0]?.url);
  const displayPrice = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const inStock = product.stockQuantity > 0;
  const isInWish = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inStock) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: displayPrice,
      image: productImage,
      maxStock: product.stockQuantity,
      sku: product.sku,
    });
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

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewDetails}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {hasDiscount && (
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <Tag className="w-3 h-3" />
            -{discountPercent}%
          </div>
        )}
        {product.isFeatured && (
          <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <Flame className="w-3 h-3" />
            {isArabic ? 'مميز' : 'Vedette'}
          </div>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleToggleWishlist}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-200 ${
          isInWish
            ? 'bg-red-500 text-white scale-110'
            : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
        } shadow-lg`}
        aria-label={isArabic ? 'إضافة إلى المفضلة' : 'Ajouter aux favoris'}
      >
        <Heart
          className={`w-5 h-5 ${isInWish ? 'fill-current' : ''}`}
        />
      </button>

      {/* Image Container */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={imageError ? '/placeholder-product.jpg' : productImage}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
          onError={() => setImageError(true)}
        />
        
        {!inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold">
              {isArabic ? 'غير متوفر' : 'Rupture de stock'}
            </span>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-center p-4 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
              className="flex-1 bg-white hover:bg-gray-50"
              icon={<Eye className="w-4 h-4" />}
            >
              {isArabic ? 'عرض' : 'Voir'}
            </Button>
            {inStock && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddToCart}
                className="flex-1"
                icon={<ShoppingCart className="w-4 h-4" />}
              >
                {isArabic ? 'أضف' : 'Ajouter'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-orange-600 font-medium uppercase tracking-wide mb-1">
          {product.category?.name || (isArabic ? 'غير مصنف' : 'Non classé')}
        </p>

        {/* Name */}
        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        {product.shortDescription && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.shortDescription}
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat(numberLocale, {
              style: 'currency',
              currency: 'DZD',
              minimumFractionDigits: 0,
            }).format(displayPrice)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-500 line-through">
              {new Intl.NumberFormat(numberLocale, {
                style: 'currency',
                currency: 'DZD',
                minimumFractionDigits: 0,
              }).format(product.price)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center justify-between text-xs">
          <span
            className={`px-2 py-1 rounded-full font-medium ${
              inStock
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {inStock
              ? `${product.stockQuantity} ${isArabic ? 'متوفر' : 'en stock'}`
              : isArabic
              ? 'غير متوفر'
              : 'Épuisé'}
          </span>

          {product.manufacturer && (
            <span className="text-gray-500">
              {product.manufacturer.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
