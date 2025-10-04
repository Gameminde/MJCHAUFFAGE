'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const optimizePerformance = async () => {
      // 1. Preload critical resources
      if (enablePreloading) {
        preloadCriticalResources();
      }

      // 2. Initialize caching strategies
      if (enableCaching) {
        initializeCaching();
      }

      // 3. Set up lazy loading observers
      if (enableLazyLoading) {
        setupLazyLoading();
      }

      // 4. Optimize images
      optimizeImages();

      // 5. Set up performance monitoring
      measureWebVitals();

      // 6. Clean up unused resources
      cleanupResources();

      setIsOptimized(true);
    };

    optimizePerformance();
  }, [enablePreloading, enableCaching, enableLazyLoading, measureWebVitals]);

  return (
    <>
      {children}
      {/* Performance monitoring overlay in development */}
      {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
    </>
  );
}

// Preload critical resources with error handling
function preloadCriticalResources() {
  // Preload critical fonts with security validation
  const criticalFonts = [
    '/fonts/inter-var.woff2',
    '/fonts/cal-sans.woff2',
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
      
      // Add error handling for font loading
      link.addEventListener('error', () => {
        console.warn(`Failed to preload font: ${font}`);
        link.remove();
      });
      
      document.head.appendChild(link);
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
      
      // Add error handling for image loading
      link.addEventListener('error', () => {
        console.warn(`Failed to preload image: ${image}`);
        link.remove();
      });
      
      document.head.appendChild(link);
    } catch (error) {
      console.error(`Error preloading image ${image}:`, error);
    }
  });

  // DNS prefetch for external domains with security validation
  const externalDomains = [
    'https://fonts.googleapis.com',
    'https://www.google-analytics.com',
    'https://js.stripe.com',
  ];

  externalDomains.forEach(domain => {
    try {
      // Validate domain to prevent DNS prefetch attacks
      const url = new URL(domain);
      if (!['fonts.googleapis.com', 'www.google-analytics.com', 'js.stripe.com'].includes(url.hostname)) {
        console.warn(`Untrusted domain for DNS prefetch: ${domain}`);
        return;
      }

      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    } catch (error) {
      console.error(`Invalid domain for DNS prefetch: ${domain}`, error);
    }
  });
}

// Initialize caching strategies with better error handling
function initializeCaching() {
  // Warm up cache with critical data - improved type safety
  const criticalDataLoaders: Record<string, () => Promise<any>> = {
    'products:featured': () => fetch('/api/products?featured=true').then(r => r.json()),
    'categories:main': () => fetch('/api/categories?main=true').then(r => r.json()),
    'settings:site': () => fetch('/api/settings').then(r => r.json()),
  };

  // Warm up cache with critical data and error handling
  Object.entries(criticalDataLoaders).forEach(([key, loader]) => {
    try {
      cacheService.cachedFetch(key, loader, 10 * 60 * 1000) // 10 minutes TTL
        .catch(error => {
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

  // Store interval ID for cleanup
  (window as any).cacheCleanupInterval = cleanupInterval;
}

// Set up lazy loading for images and components
function setupLazyLoading() {
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
  } else {
    // Fallback for browsers without IntersectionObserver
    images.forEach(img => {
      const image = img as HTMLImageElement;
      image.src = image.dataset.src!;
      image.removeAttribute('data-src');
    });
  }
}

// Optimize images
function optimizeImages() {
  // Convert images to WebP format when supported
  if (supportsWebP()) {
    const images = document.querySelectorAll('img[src$=".jpg"], img[src$=".png"]');
    images.forEach(img => {
      const image = img as HTMLImageElement;
      const webpSrc = image.src.replace(/\.(jpg|png)$/, '.webp');
      
      // Test if WebP version exists
      const testImg = new Image();
      testImg.onload = () => {
        image.src = webpSrc;
      };
      testImg.src = webpSrc;
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

// Clean up unused resources with proper memory management
function cleanupResources() {
  // Remove unused stylesheets
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  stylesheets.forEach(stylesheet => {
    try {
      const link = stylesheet as HTMLLinkElement;
      if (link.sheet && link.sheet.cssRules.length === 0) {
        link.remove();
      }
    } catch (error) {
      console.warn('Error removing stylesheet:', error);
    }
  });

  // Clean up cache cleanup interval
  const cleanupInterval = (window as any).cacheCleanupInterval;
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    delete (window as any).cacheCleanupInterval;
  }

  // Clean up event listeners on page unload
  const cleanupHandler = () => {
    try {
      // Disconnect performance observers
      performanceService.disconnect();
      
      // Clear cache if needed
      const cacheStats = cacheService.getStats();
      if (cacheStats.size > 100) {
        cacheService.clear();
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  window.addEventListener('beforeunload', cleanupHandler, { once: true });
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