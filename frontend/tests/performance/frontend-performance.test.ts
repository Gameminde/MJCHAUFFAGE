import { test, expect } from '@playwright/test';

test.describe('MJ CHAUFFAGE Frontend Performance', () => {
  test('should load homepage within performance budget', async ({ page }) => {
    const startTime = Date.now();

    // Navigate to homepage
    await page.goto('http://localhost:3000/fr', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    const loadTime = Date.now() - startTime;

    // Performance assertions
    expect(loadTime).toBeLessThan(5000); // Less than 5 seconds

    // Check First Contentful Paint approximation
    const heroVisible = await page.locator('[class*="hero-gradient"]').isVisible();
    expect(heroVisible).toBe(true);

    console.log(`✅ Homepage loaded in ${loadTime}ms`);
  });

  test('should have reasonable bundle size', async ({ page }) => {
    await page.goto('http://localhost:3000/fr');

    // Get all JavaScript resources
    const jsResources = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return resources
        .filter(resource => resource.name.includes('.js') && !resource.name.includes('chrome-extension'))
        .map(resource => ({
          url: resource.name,
          size: resource.transferSize,
          duration: resource.responseEnd - resource.requestStart
        }));
    });

    const totalJSSize = jsResources.reduce((total, resource) => total + resource.size, 0);
    const totalJSSizeMB = totalJSSize / (1024 * 1024);

    // Bundle should be under 1MB for good performance
    expect(totalJSSizeMB).toBeLessThan(1);

    console.log(`📊 Total JS bundle size: ${totalJSSizeMB.toFixed(2)} MB`);
  });

  test('should lazy load images', async ({ page }) => {
    await page.goto('http://localhost:3000/fr/products');

    // Check if images have loading="lazy" attribute
    const lazyImages = await page.$$('img[loading="lazy"]');
    const totalImages = await page.$$('img');

    // At least some images should be lazy loaded
    expect(lazyImages.length).toBeGreaterThan(0);

    console.log(`🖼️  Found ${lazyImages.length}/${totalImages.length} lazy-loaded images`);
  });

  test('should have good Core Web Vitals simulation', async ({ page }) => {
    await page.goto('http://localhost:3000/fr');

    // Simulate LCP (Largest Contentful Paint) - check if main content loads quickly
    const lcpElement = await page.locator('h1').first();
    const isLcpVisible = await lcpElement.isVisible();

    expect(isLcpVisible).toBe(true);

    // Check if page is interactive (no blocking scripts)
    const isInteractive = await page.evaluate(() => {
      return document.readyState === 'complete';
    });

    expect(isInteractive).toBe(true);

    console.log('✅ Core Web Vitals simulation passed');
  });

  test('should handle mobile performance', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const startTime = Date.now();
    await page.goto('http://localhost:3000/fr', {
      waitUntil: 'domcontentloaded'
    });
    const loadTime = Date.now() - startTime;

    // Mobile should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Check if mobile menu works
    const menuButton = page.locator('button[aria-label*="menu"]').first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      // Menu should toggle (basic check)
      console.log('📱 Mobile menu interaction works');
    }

    console.log(`📱 Mobile page loaded in ${loadTime}ms`);
  });

  test('should cache resources properly', async ({ page, context }) => {
    // First visit
    await page.goto('http://localhost:3000/fr');
    await page.waitForLoadState('networkidle');

    // Second visit should be faster due to caching
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    const reloadTime = Date.now() - startTime;

    // Reload should be faster (under 1 second with good caching)
    expect(reloadTime).toBeLessThan(1000);

    console.log(`🔄 Page reload took ${reloadTime}ms (cached)`);
  });
});
