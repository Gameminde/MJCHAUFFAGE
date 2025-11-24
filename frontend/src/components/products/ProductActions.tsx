'use client';

import React, { useState, useEffect } from 'react';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { useWishlist } from '@/contexts/WishlistContext';
import { useLanguage } from '@/hooks/useLanguage';
import { Heart } from 'lucide-react';
import { getImageUrl } from '@/lib/images';

interface ProductActionsProps {
  product: {
    id: string;
    name: string;
    price: number;
    salePrice?: number | null;
    sku: string;
    stockQuantity: number;
    images?: Array<{ url: string }>;
  };
}

export function ProductActions({ product }: ProductActionsProps) {
  const { addToWishlist, isInWishlist } = useWishlist();
  const { t, locale } = useLanguage();
  const [isWishlisted, setIsWishlisted] = useState(isInWishlist(product.id));
  const isArabic = locale === 'ar';

  const handleWishlistToggle = () => {
    const wishlistItem = {
      productId: product.id,
      name: product.name,
      price: product.salePrice ?? product.price,
      image: product.images && product.images.length > 0
        ? getImageUrl(product.images[0].url)
        : undefined,
      sku: product.sku,
    };

    addToWishlist(wishlistItem);
    setIsWishlisted(!isWishlisted);
  };

  // Update local state when wishlist changes
  React.useEffect(() => {
    setIsWishlisted(isInWishlist(product.id));
  }, [isInWishlist, product.id]);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-50 md:static md:p-0 md:bg-transparent md:border-0 space-y-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-none">
        {/* Wishlist and Add to Cart Actions */}
        <div className="flex gap-3 max-w-6xl mx-auto">
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg font-medium transition-all duration-300 h-[48px] ${isWishlisted
                ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
                : 'border-gray-300 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50'
              }`}
          >
            <Heart
              className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`}
            />
            <span className="hidden sm:inline">
              {isWishlisted
                ? (isArabic ? 'في المفضلة' : 'Dans les favoris')
                : (isArabic ? 'أضف للمفضلة' : 'Ajouter aux favoris')
              }
            </span>
          </button>

          {/* Add to Cart Button */}
          <div className="flex-[3]">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price: product.salePrice ?? product.price,
                sku: product.sku,
                stockQuantity: product.stockQuantity,
                images: product.images,
              }}
              variant="primary"
              size="lg"
              className="w-full h-[48px]"
            />
          </div>
        </div>
      </div>
      {/* Spacer to prevent content overlap on mobile */}
      <div className="h-24 md:hidden" />
    </>
  );
}
