'use client';

import { useEffect, useState, useRef } from 'react';
import { usePerformance } from '@/hooks/usePerformance';
import { performanceService } from '@/services/performanceService';
import cacheService from '@/services/cacheService';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
  enablePreloading?: boolean;
  enableCaching?: boolean;
  enableLazyLoading?: boolean;
}

export function PerformanceOptimizer({
  children,
  enablePreloading = true,
  enableCaching = true,
  enableLazyLoading = true,
}: PerformanceOptimizerProps) {
  const [isOptimized, setIsOptimized] = useState(false);
  const { measureWebVitals } = usePerformance();
  
  // Store cleanup functions in refs to avoid memory leaks
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    const optimizePerformance = async () => {
      // 1. Preload critical resources
      if (enablePreloading) {
        const cleanup = preloadCriticalResources();
        if (cleanup) cleanupFunctionsRef.current.push(cleanup);
      }

      // 2. Initialize caching strategies
      if (enableCaching) {
        const cleanup = initializeCaching();
        if (cleanup) cleanupFunctionsRef.current.push(cleanup);
      }

      // 3. Set up lazy loading observers
      if (enableLazyLoading) {
        const cleanup = setupLazyLoading();
        if (cleanup) cleanupFunctionsRef.current.push(cleanup);
      }

      // 4. Optimize images
      optimizeImages();

      // 5. Set up performance monitoring
      measureWebVitals();

      // 6. Check resource compression in development
      if (process.env.NODE_ENV === 'development') {
        checkCompression();
      }

      // 7. Register service worker for production
      if (process.env.NODE_ENV === 'production') {
        registerServiceWorker();
      }

      setIsOptimized(true);
    };

    optimizePerformance();

    // Cleanup on unmount
    return () => {
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
    };
  }, [enablePreloading, enableCaching, enableLazyLoading, measureWebVitals]);

  return (
    <>
      {children}
      {/* Performance monitoring overlay in development */}
      {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
    </>
  );
}

// Preload critical resources with enhanced security and cleanup
function preloadCriticalResources(): () => void {
  const preloadLinks: HTMLLinkElement[] = [];
  
  // Preload critical fonts with security validation
  const criticalFonts: string[] = [
    // Fonts are loaded from Google Fonts, no local preloading needed
  ];

  criticalFonts.forEach(font => {
    try {
      // Validate font path to prevent XSS
      if (!font.startsWith('/fonts/') || font.includes('..')) {
        console.warn(`Invalid font path: ${font}`);
        return;
      }

      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font;
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.setAttribute('fetchpriority', 'high'); // Priority hint for critical fonts
      
      // Add error handling for font loading
      link.addEventListener('error', () => {
        console.warn(`Failed to preload font: ${font}`);
        link.remove();
      });
      
      document.head.appendChild(link);
      preloadLinks.push(link);
    } catch (error) {
      console.error(`Error preloading font ${font}:`, error);
    }
  });

  // Preload critical images with validation
  const criticalImages = [
    '/images/hero-bg.webp',
    '/images/logo.svg',
  ];

  criticalImages.forEach(image => {
    try {
      // Validate image path to prevent XSS
      if (!image.startsWith('/images/') || image.includes('..')) {
        console.warn(`Invalid image path: ${image}`);
        return;
      }

      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = image;
      link.as = 'image';
      link.setAttribute('fetchpriority', 'high'); // Priority hint for critical images
      
      // Add error handling for image loading
      link.addEventListener('error', () => {
        console.warn(`Failed to preload image: ${image}`);
        link.remove();
      });
      
      document.head.appendChild(link);
      preloadLinks.push(link);
    } catch (error) {
      console.error(`Error preloading image ${image}:`, error);
    }
  });

  // Enhanced DNS prefetch with protocol validation and preconnect
  const externalDomains = [
    'https://fonts.googleapis.com',
    'https://www.google-analytics.com',
    'https://js.stripe.com',
  ];

  const ALLOWED_DOMAINS = new Set([
    'fonts.googleapis.com',
    'www.google-analytics.com',
    'js.stripe.com',
  ]);

  externalDomains.forEach(domain => {
    try {
      const url = new URL(domain);
      
      // Validate protocol
      if (url.protocol !== 'https:') {
        console.warn(`Insecure protocol for DNS prefetch: ${domain}`);
        return;
      }
      
      // Validate hostname
      if (!ALLOWED_DOMAINS.has(url.hostname)) {
        console.warn(`Untrusted domain for DNS prefetch: ${domain}`);
        return;
      }

      // DNS prefetch
      const dnsLink = document.createElement('link');
      dnsLink.rel = 'dns-prefetch';
      dnsLink.href = domain;
      document.head.appendChild(dnsLink);
      preloadLinks.push(dnsLink);

      // Preconnect for faster connection establishment
      const preconnectLink = document.createElement('link');
      preconnectLink.rel = 'preconnect';
      preconnectLink.href = domain;
      preconnectLink.crossOrigin = 'anonymous';
      document.head.appendChild(preconnectLink);
      preloadLinks.push(preconnectLink);
    } catch (error) {
      console.error(`Invalid domain for DNS prefetch: ${domain}`, error);
    }
  });

  // Return cleanup function
  return () => {
    preloadLinks.forEach(link => link.remove());
  };
}

// Initialize caching strategies with request deduplication and proper cleanup
function initializeCaching(): () => void {
  // Request deduplication map to prevent duplicate simultaneous requests
  const pendingRequests = new Map<string, Promise<any>>();

  // Warm up cache with critical data - improved type safety
  const criticalDataLoaders: Record<string, () => Promise<any>> = {
    'products:featured': () => fetch('/api/products?featured=true').then(r => r.json()),
    'categories:main': () => fetch('/api/categories?main=true').then(r => r.json()),
    'settings:site': () => fetch('/api/settings').then(r => r.json()),
  };

  // Deduplicated fetch function
  function deduplicatedFetch(key: string, fetcher: () => Promise<any>) {
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key)!;
    }
    
    const promise = fetcher()
      .finally(() => pendingRequests.delete(key));
    
    pendingRequests.set(key, promise);
    return promise;
  }

  // Warm up cache with critical data and error handling
  Object.entries(criticalDataLoaders).forEach(([key, loader]) => {
    try {
      deduplicatedFetch(key, () => 
        cacheService.cachedFetch(key, loader, 10 * 60 * 1000) // 10 minutes TTL
      ).catch(error => {
        console.warn(`Failed to cache ${key}:`, error);
      });
    } catch (error) {
      console.error(`Error initializing cache for ${key}:`, error);
    }
  });

  // Set up periodic cache cleanup with proper cleanup
  const cleanupInterval = setInterval(() => {
    try {
      cacheService.clearExpired();
    } catch (error) {
      console.error('Error during cache cleanup:', error);
    }
  }, 5 * 60 * 1000); // Every 5 minutes

  // Return cleanup function instead of storing on window
  return () => {
    clearInterval(cleanupInterval);
    pendingRequests.clear();
    try {
      cacheService.clear();
    } catch (error) {
      console.error('Error during final cache cleanup:', error);
    }
  };
}

// Set up lazy loading for images and components with proper cleanup
function setupLazyLoading(): () => void {
  // Native lazy loading for images
  const images = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
    
    // Return cleanup function
    return () => imageObserver.disconnect();
  } else {
    // Fallback for browsers without IntersectionObserver
    images.forEach(img => {
      const image = img as HTMLImageElement;
      image.src = image.dataset.src!;
      image.removeAttribute('data-src');
    });
    
    return () => {}; // No-op cleanup for fallback
  }
}

// Optimize images with native loading attributes
function optimizeImages() {
  // Add native loading and decoding attributes
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
    if (!img.hasAttribute('decoding')) {
      img.setAttribute('decoding', 'async');
    }
  });

  // Convert images to WebP format when supported
  if (supportsWebP()) {
    const jpgPngImages = document.querySelectorAll('img[src$=".jpg"], img[src$=".png"]');
    jpgPngImages.forEach(img => {
      const image = img as HTMLImageElement;
      const webpSrc = image.src.replace(/\.(jpg|png)$/, '.webp');
      
      // Test if WebP version exists
      const testImg = new Image();
      testImg.onload = () => {
        image.src = webpSrc;
      };
      testImg.onerror = () => {
        // Keep original format if WebP not available
        console.debug(`WebP version not available for: ${image.src}`);
      };
      testImg.src = webpSrc;
    });
  }
}

// Register service worker for advanced caching
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }
}

// Check WebP support
function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

// Resource compression check for development
function checkCompression() {
  if (process.env.NODE_ENV === 'development') {
    performance.getEntriesByType('resource').forEach((entry: any) => {
      const compressionRatio = entry.encodedBodySize / entry.decodedBodySize;
      if (compressionRatio > 0.9 && entry.decodedBodySize > 10000) {
        console.warn(`Resource not compressed: ${entry.name}`);
      }
    });
  }
}

// Performance monitoring component for development
function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      const performanceMetrics = performanceService.getMetrics();
      const cacheStats = cacheService.getStats();
      
      setMetrics({
        ...performanceMetrics,
        cache: cacheStats,
        memory: (performance as any).memory?.usedJSHeapSize || 0,
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 2000);
    
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg z-50"
        title="Show Performance Metrics"
      >
        📊
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-sm">Performance</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        {metrics.lcp && (
          <div className={`flex justify-between ${metrics.lcp > 2500 ? 'text-red-600' : 'text-green-600'}`}>
            <span>LCP:</span>
            <span>{Math.round(metrics.lcp)}ms</span>
          </div>
        )}
        
        {metrics.fid && (
          <div className={`flex justify-between ${metrics.fid > 100 ? 'text-red-600' : 'text-green-600'}`}>
            <span>FID:</span>
            <span>{Math.round(metrics.fid)}ms</span>
          </div>
        )}
        
        {metrics.cls && (
          <div className={`flex justify-between ${metrics.cls > 0.1 ? 'text-red-600' : 'text-green-600'}`}>
            <span>CLS:</span>
            <span>{metrics.cls.toFixed(3)}</span>
          </div>
        )}
        
        {metrics.cache && (
          <div className="flex justify-between">
            <span>Cache Hit Rate:</span>
            <span>{metrics.cache.hitRate?.toFixed(1)}%</span>
          </div>
        )}
        
        {metrics.memory && (
          <div className="flex justify-between">
            <span>Memory:</span>
            <span>{Math.round(metrics.memory / 1024 / 1024)}MB</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default PerformanceOptimizer;