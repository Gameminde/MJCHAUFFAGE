import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye, Star, TrendingUp, Percent } from 'lucide-react';
import { Product } from '@/services/productService';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/contexts/WishlistContext';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { getProductImageUrl } from '@/lib/images';

interface ModernProductCardOptimizedProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  onClick?: () => void;
}

export const ModernProductCardOptimized = React.memo(function ModernProductCardOptimized({
  product,
  viewMode = 'grid',
  onClick
}: ModernProductCardOptimizedProps) {
  const router = useRouter();
  const { locale } = useLanguage();
  const { addItem } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const isArabic = locale === 'ar';
  const numberLocale = isArabic ? 'ar-DZ' : 'fr-DZ';

  const productImage = getProductImageUrl(product);
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
        sku: product.sku || `SKU-${product.id}`,
        name: product.name,
        price: displayPrice,
        image: productImage,
        quantity: 1,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInWish) {
      // Remove from wishlist logic would go here
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        price: displayPrice,
        image: productImage,
        sku: product.sku || `SKU-${product.id}`,
      });
    }
    setIsFavorite(!isFavorite);
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-neutral-100"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex gap-6 p-6">
          {/* Image */}
          <div className="relative w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={productImage}
              alt={product.name}
              width={192}
              height={192}
              className="w-full h-full object-cover"
              sizes="192px"
              priority={false}
            />
            {!inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold">Rupture</span>
              </div>
            )}
            {hasDiscount && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                -{discountPercent}%
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 line-clamp-2">{product.name}</h3>
              <p className="text-sm text-neutral-600 mt-1">{product.manufacturer?.name}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor((product as any).rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
              <span className="text-sm text-neutral-600 ml-2">({(product as any).reviews || 0})</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-neutral-900">
                {new Intl.NumberFormat(numberLocale).format(displayPrice)} DA
              </span>
              {hasDiscount && (
                <span className="text-sm text-neutral-500 line-through">
                  {new Intl.NumberFormat(numberLocale).format(product.price)} DA
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {inStock ? (
                <div className="flex items-center gap-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">
                    {isLowStock ? `Stock faible (${product.stockQuantity})` : 'En stock'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Rupture</span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-neutral-600 line-clamp-2">{product.description}</p>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleAddToCart}
                disabled={!inStock || isAddingToCart}
                className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 touch-manipulation min-h-[48px]"
              >
                {isAddingToCart ? 'Ajout...' : <><ShoppingCart className="w-4 h-4 mr-2" />Ajouter</>}
              </Button>

              <Button
                variant="outline"
                onClick={handleToggleWishlist}
                className={`touch-manipulation min-h-[48px] ${isFavorite ? 'text-red-500 border-red-200' : ''}`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid View
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group cursor-pointer h-full"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-neutral-100 overflow-hidden flex flex-col h-full">
        {/* Image Container */}
        <div className="relative w-full aspect-square overflow-hidden bg-gray-50 flex-shrink-0">
          <Image
            src={productImage}
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            priority={false}
          />

          {/* Overlay on hover */}
          <motion.div
            className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasDiscount && (
              <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                -{discountPercent}%
              </div>
            )}
            {product.isFeatured && (
              <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                Populaire
              </div>
            )}
          </div>

          {/* Stock Status */}
          <div className="absolute top-3 right-3">
            {inStock ? (
              <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                ✓ En stock
              </div>
            ) : (
              <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                ✗ Rupture
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <motion.div
            className="absolute bottom-3 left-3 right-3 flex gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 10
            }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={handleAddToCart}
              disabled={!inStock || isAddingToCart}
              className="flex-1 bg-white/90 text-neutral-900 hover:bg-white touch-manipulation"
              size="sm"
            >
              {isAddingToCart ? '...' : <ShoppingCart className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              onClick={handleToggleWishlist}
              className="bg-white/90 border-white/50 text-neutral-900 hover:bg-white touch-manipulation"
              size="sm"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              variant="outline"
              className="bg-white/90 border-white/50 text-neutral-900 hover:bg-white touch-manipulation"
              size="sm"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 flex-1 flex flex-col min-h-[160px]">
          {/* Category & Brand */}
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>{product.category?.name}</span>
            <span>{product.manufacturer?.name}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-neutral-900 line-clamp-2 group-hover:text-orange-600 transition-colors min-h-[48px]">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.floor((product as any).rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
              />
            ))}
            <span className="text-xs text-neutral-500 ml-1">({(product as any).reviews || 0})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mt-auto">
            <span className="text-lg font-bold text-neutral-900">
              {new Intl.NumberFormat(numberLocale).format(displayPrice)} DA
            </span>
            {hasDiscount && (
              <span className="text-sm text-neutral-500 line-through">
                {new Intl.NumberFormat(numberLocale).format(product.price)} DA
              </span>
            )}
          </div>

          {/* Features */}
          {product.description && (
            <p className="text-xs text-neutral-600 line-clamp-2">{product.description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
});
