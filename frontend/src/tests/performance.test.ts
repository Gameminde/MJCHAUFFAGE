/**
 * Performance optimization tests
 * Tests bundle size, lazy loading, caching, and Core Web Vitals
 */

import { test, expect } from '@playwright/test';

test.describe('Performance Optimizations', () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance monitoring
    await page.addInitScript(() => {
      window.performanceMetrics = [];
      
      // Capture performance entries
      const observer = new PerformanceObserver((list) => {
        window.performanceMetrics.push(...list.getEntries());
      });
      
      observer.observe({ entryTypes: ['navigation', 'resource', 'paint', 'largest-contentful-paint'] });
    });
  });

  test('should have optimized bundle sizes', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Get resource timing data
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(entry => ({
        name: entry.name,
        transferSize: (entry as PerformanceResourceTiming).transferSize,
        duration: entry.duration,
      }));
    });
    
    // Check JavaScript bundle sizes
    const jsResources = resources.filter(r => r.name.includes('.js'));
    const totalJSSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    
    // Should be under 500KB total for JS
    expect(totalJSSize).toBeLessThan(500 * 1024);
    
    // Check CSS bundle sizes
    const cssResources = resources.filter(r => r.name.includes('.css'));
    const totalCSSSize = cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    
    // Should be under 100KB total for CSS
    expect(totalCSSSize).toBeLessThan(100 * 1024);
    
    console.log(`Total JS size: ${(totalJSSize / 1024).toFixed(2)}KB`);
    console.log(`Total CSS size: ${(totalCSSSize / 1024).toFixed(2)}KB`);
  });

  test('should implement lazy loading for images', async ({ page }) => {
    await page.goto('/products');
    
    // Check that images below the fold have lazy loading
    const lazyImages = await page.locator('img[loading="lazy"]').count();
    expect(lazyImages).toBeGreaterThan(0);
    
    // Check that images use optimized formats
    const webpImages = await page.locator('img[src*=".webp"], img[srcset*=".webp"]').count();
    expect(webpImages).toBeGreaterThan(0);
    
    // Verify intersection observer is working
    const hasIntersectionObserver = await page.evaluate(() => {
      return 'IntersectionObserver' in window;
    });
    expect(hasIntersectionObserver).toBe(true);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    // Wait for LCP to be measured
    await page.waitForTimeout(3000);
    
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const metrics = {};
        
        // Measure LCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          metrics.lcp = lastEntry.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        
        // Measure CLS
        let clsValue = 0;
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          metrics.cls = clsValue;
        }).observe({ type: 'layout-shift', buffered: true });
        
        // Get navigation timing
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          metrics.ttfb = navigation.responseStart - navigation.requestStart;
          metrics.loadTime = navigation.loadEventEnd - navigation.navigationStart;
        }
        
        setTimeout(() => resolve(metrics), 2000);
      });
    });
    
    // LCP should be under 2.5 seconds
    if (webVitals.lcp) {
      expect(webVitals.lcp).toBeLessThan(2500);
    }
    
    // CLS should be under 0.1
    if (webVitals.cls) {
      expect(webVitals.cls).toBeLessThan(0.1);
    }
    
    // TTFB should be under 600ms
    if (webVitals.ttfb) {
      expect(webVitals.ttfb).toBeLessThan(600);
    }
    
    console.log('Web Vitals:', webVitals);
  });

  test('should implement effective caching', async ({ page, context }) => {
    // First visit
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const firstLoadResources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').length;
    });
    
    // Second visit (should use cache)
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const secondLoadResources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').length;
    });
    
    // Should have fewer resources on second load due to caching
    expect(secondLoadResources).toBeLessThanOrEqual(firstLoadResources);
    
    // Check for cache headers
    const response = await page.goto('/');
    const cacheControl = response?.headers()['cache-control'];
    expect(cacheControl).toBeDefined();
  });

  test('should have optimized images', async ({ page }) => {
    await page.goto('/');
    
    // Check for Next.js Image optimization
    const optimizedImages = await page.locator('img[src*="/_next/image"]').count();
    expect(optimizedImages).toBeGreaterThan(0);
    
    // Check for proper image dimensions
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const width = await img.getAttribute('width');
      const height = await img.getAttribute('height');
      
      // Images should have explicit dimensions to prevent CLS
      if (await img.isVisible()) {
        expect(width || height).toBeTruthy();
      }
    }
  });

  test('should implement code splitting', async ({ page }) => {
    await page.goto('/');
    
    // Check for chunk files
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(entry => entry.name);
    });
    
    const chunkFiles = resources.filter(name => 
      name.includes('chunks/') || name.includes('static/js/')
    );
    
    // Should have multiple chunk files indicating code splitting
    expect(chunkFiles.length).toBeGreaterThan(1);
    
    // Navigate to different page to test dynamic imports
    await page.click('a[href*="/admin"]');
    await page.waitForLoadState('networkidle');
    
    const newResources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(entry => entry.name);
    });
    
    const newChunks = newResources.filter(name => 
      !resources.includes(name) && (name.includes('chunks/') || name.includes('static/js/'))
    );
    
    // Should load additional chunks for admin page
    expect(newChunks.length).toBeGreaterThan(0);
  });

  test('should have service worker for caching', async ({ page, context }) => {
    await page.goto('/');
    
    // Check if service worker is registered
    const serviceWorkerRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return !!registration;
      }
      return false;
    });
    
    // In production, service worker should be registered
    if (process.env.NODE_ENV === 'production') {
      expect(serviceWorkerRegistered).toBe(true);
    }
  });

  test('should preload critical resources', async ({ page }) => {
    await page.goto('/');
    
    // Check for preload links
    const preloadLinks = await page.locator('link[rel="preload"]').count();
    expect(preloadLinks).toBeGreaterThan(0);
    
    // Check for DNS prefetch
    const dnsPrefetchLinks = await page.locator('link[rel="dns-prefetch"]').count();
    expect(dnsPrefetchLinks).toBeGreaterThan(0);
    
    // Check for font preloading
    const fontPreloads = await page.locator('link[rel="preload"][as="font"]').count();
    expect(fontPreloads).toBeGreaterThan(0);
  });

  test('should have minimal render blocking resources', async ({ page }) => {
    const response = await page.goto('/');
    const content = await response?.text();
    
    // Check that CSS is not render blocking (should be minimal inline CSS)
    const externalCSS = (content?.match(/<link[^>]*rel="stylesheet"/g) || []).length;
    expect(externalCSS).toBeLessThan(3); // Should have minimal external CSS
    
    // Check for critical CSS inlining
    const inlineCSS = content?.includes('<style>') || content?.includes('critical-css');
    expect(inlineCSS).toBeTruthy();
  });

  test('should handle offline scenarios', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Simulate offline
    await context.setOffline(true);
    
    // Try to navigate to a cached page
    await page.reload();
    
    // Should show offline page or cached content
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
    
    // Restore online
    await context.setOffline(false);
  });
});

test.describe('Performance Monitoring', () => {
  test('should track performance metrics', async ({ page }) => {
    await page.goto('/');
    
    // Check if performance monitoring is active
    const hasPerformanceAPI = await page.evaluate(() => {
      return 'performance' in window && 'PerformanceObserver' in window;
    });
    
    expect(hasPerformanceAPI).toBe(true);
    
    // Check if custom performance tracking is implemented
    const hasCustomTracking = await page.evaluate(() => {
      return window.gtag || window.analytics || window.performanceService;
    });
    
    expect(hasCustomTracking).toBeTruthy();
  });
});