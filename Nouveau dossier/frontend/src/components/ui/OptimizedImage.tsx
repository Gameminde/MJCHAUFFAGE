'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/useMobile';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
  mobileOptimized?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  objectFit = 'cover',
  onLoad,
  onError,
  mobileOptimized = true,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { isMobile } = useMobile();
  const imgRef = useRef<HTMLImageElement>(null);

  // Optimisations mobiles
  const mobileQuality = isMobile ? Math.max(quality - 20, 50) : quality;
  const mobileSizes = sizes || (isMobile
    ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  );

  // Lazy loading pour mobile
  const shouldLazyLoad = !priority && mobileOptimized;

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Skeleton loader */}
      {!isLoaded && !hasError && (
        <div
          className={cn(
            'absolute inset-0 bg-neutral-200 animate-pulse rounded-lg',
            fill ? 'absolute' : 'relative'
          )}
          style={fill ? {} : { width, height }}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div
          className={cn(
            'flex items-center justify-center bg-neutral-100 text-neutral-400 rounded-lg',
            fill ? 'absolute inset-0' : 'relative'
          )}
          style={fill ? {} : { width, height }}
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* Main image */}
      {!hasError && (
        <Image
          ref={imgRef}
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          quality={mobileQuality}
          priority={priority}
          loading={shouldLazyLoad ? 'lazy' : 'eager'}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          sizes={mobileSizes}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            fill && `object-${objectFit}`
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
