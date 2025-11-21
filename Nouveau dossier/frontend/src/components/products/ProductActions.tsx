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
    <div className="space-y-4">
      {/* Wishlist and Add to Cart Actions */}
      <div className="flex gap-3">
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg font-medium transition-all duration-300 ${
            isWishlisted
              ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
              : 'border-gray-300 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50'
          }`}
        >
          <Heart
            className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`}
          />
          <span>
            {isWishlisted
              ? (isArabic ? 'في المفضلة' : 'Dans les favoris')
              : (isArabic ? 'أضف للمفضلة' : 'Ajouter aux favoris')
            }
          </span>
        </button>

        {/* Add to Cart Button */}
        <div className="flex-[2]">
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
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
