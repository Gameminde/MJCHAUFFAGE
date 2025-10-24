// Image optimization utilities

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

// Generate optimized image URL for Next.js Image component
export function getOptimizedImageUrl(
  src: string,
  options: ImageOptimizationOptions = {}
): string {
  const {
    quality = 75,
    format = 'webp',
    width,
    height,
    fit = 'cover'
  } = options;

  // If it's already an optimized URL, return as is
  if (src.includes('/_next/image')) {
    return src;
  }

  // Build query parameters
  const params = new URLSearchParams();
  params.set('url', src);
  params.set('q', quality.toString());
  
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  
  return `/_next/image?${params.toString()}`;
}

// Generate responsive image sizes
export function generateResponsiveSizes(breakpoints: Record<string, number>): string {
  const sizes = Object.entries(breakpoints)
    .sort(([, a], [, b]) => a - b)
    .map(([size, width]) => {
      if (size === 'default') {
        return `${width}px`;
      }
      return `(max-width: ${width}px) ${width}px`;
    });
  
  return sizes.join(', ');
}

// Common responsive breakpoints
export const RESPONSIVE_BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
  default: 1920,
};

// Generate srcSet for responsive images
export function generateSrcSet(
  src: string,
  widths: number[],
  options: Omit<ImageOptimizationOptions, 'width'> = {}
): string {
  return widths
    .map(width => {
      const optimizedUrl = getOptimizedImageUrl(src, { ...options, width });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
}

// Preload critical images
export function preloadImage(src: string, options: ImageOptimizationOptions = {}): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = getOptimizedImageUrl(src, options);
  
  // Add responsive preload if width is specified
  if (options.width) {
    link.setAttribute('imagesrcset', generateSrcSet(src, [options.width]));
    link.setAttribute('imagesizes', `${options.width}px`);
  }
  
  document.head.appendChild(link);
}

// Lazy load images with intersection observer
export function setupLazyLoading(): void {
  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers without IntersectionObserver
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      const image = img as HTMLImageElement;
      image.src = image.dataset.src!;
      image.removeAttribute('data-src');
    });
    return;
  }

  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
          // Load the image
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          // Load srcset if available
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
          }
          
          // Remove loading class and add loaded class
          img.classList.remove('lazy-loading');
          img.classList.add('lazy-loaded');
          
          imageObserver.unobserve(img);
        }
      });
    },
    {
      rootMargin: '50px 0px', // Start loading 50px before the image enters viewport
      threshold: 0.01,
    }
  );

  // Observe all lazy images
  const lazyImages = document.querySelectorAll('img[data-src]');
  lazyImages.forEach(img => imageObserver.observe(img));
}

// Convert images to modern formats
export function convertToModernFormat(src: string): string {
  // Check browser support for modern formats
  const supportsWebP = checkWebPSupport();
  const supportsAVIF = checkAVIFSupport();
  
  if (supportsAVIF) {
    return src.replace(/\.(jpg|jpeg|png)$/i, '.avif');
  } else if (supportsWebP) {
    return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }
  
  return src;
}

// Check WebP support
function checkWebPSupport(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

// Check AVIF support
function checkAVIFSupport(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
}

// Generate blur placeholder
export function generateBlurPlaceholder(
  width: number = 10,
  height: number = 10,
  color: string = '#f3f4f6'
): string {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return `data:image/svg+xml;base64,${btoa(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
      </svg>`
    )}`;
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  }
  
  return canvas.toDataURL();
}

// Image compression utility
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: string;
  } = {}
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        format,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

// Predefined image configurations
export const IMAGE_CONFIGS = {
  hero: {
    quality: 90,
    format: 'webp' as const,
    sizes: generateResponsiveSizes({
      mobile: 640,
      tablet: 1024,
      desktop: 1920,
      default: 1920,
    }),
  },
  product: {
    quality: 80,
    format: 'webp' as const,
    sizes: generateResponsiveSizes({
      mobile: 300,
      tablet: 400,
      desktop: 500,
      default: 600,
    }),
  },
  thumbnail: {
    quality: 70,
    format: 'webp' as const,
    width: 150,
    height: 150,
  },
  gallery: {
    quality: 85,
    format: 'webp' as const,
    sizes: generateResponsiveSizes({
      mobile: 400,
      tablet: 600,
      desktop: 800,
      default: 1200,
    }),
  },
};