import { test, expect } from '@playwright/test';
import { analyticsEvents, testUser } from './fixtures/test-data';
import { TestHelpers } from './helpers/test-helpers';

test.describe('Analytics Data Collection and Reporting E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing analytics data
    await TestHelpers.gotoAndReady(page, '/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('Page view tracking and session management', async ({ page }) => {
    // 1. Track homepage visit
    await TestHelpers.gotoAndReady(page, '/');
    
    // Verify analytics script loaded
    await expect(page.locator('[data-testid="analytics-loaded"]')).toBeVisible();
    
    // Check session started
    const sessionId = await page.evaluate(() => sessionStorage.getItem('analytics_session_id'));
    expect(sessionId).toBeTruthy();
    
    // 2. Navigate to different pages and track views
    await page.getByRole('link', { name: 'Produits' }).click();
    await page.waitForLoadState('domcontentloaded');
    
    await page.getByRole('link', { name: 'Services' }).click();
    await page.waitForLoadState('domcontentloaded');
    
    await page.getByRole('link', { name: 'À propos' }).click();
    await page.waitForLoadState('domcontentloaded');
    
    // 3. Verify page views were tracked
    const pageViews = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('analytics_page_views') || '[]');
    });
    
    expect(pageViews.length).toBeGreaterThanOrEqual(4); // Home + 3 pages
    
    // 4. Check session duration tracking
    await page.waitForTimeout(3000); // Stay on page for 3 seconds
    
    const sessionData = await page.evaluate(() => {
      return JSON.parse(sessionStorage.getItem('analytics_session_data') || '{}');
    });
    
    expect(sessionData.duration).toBeGreaterThan(0);
  });

  test('E-commerce event tracking', async ({ page }) => {
    // 1. Track product view events
    await TestHelpers.gotoAndReady(page, '/products', { readySelectors: ['[data-testid="product-card"]', 'main'] });
    
    // Click on first product
    await page.click('[data-testid="product-card"]:first-child');
    await page.waitForLoadState('domcontentloaded');
    
    // Verify product view event
    const productViewEvents = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('analytics_ecommerce_events') || '[]')
        .filter((event: any) => event.event_type === 'view_item');
    });
    
    expect(productViewEvents.length).toBeGreaterThan(0);
    expect(productViewEvents[0]).toHaveProperty('product_id');
    expect(productViewEvents[0]).toHaveProperty('value');
    
    // 2. Track add to cart event
    await page.click('[data-testid="add-to-cart-button"]');
    await page.waitForSelector('[data-testid="cart-notification"]');
    
    const addToCartEvents = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('analytics_ecommerce_events') || '[]')
        .filter((event: any) => event.event_type === 'add_to_cart');
    });
    
    expect(addToCartEvents.length).toBeGreaterThan(0);
    expect(addToCartEvents[0]).toHaveProperty('quantity');
    expect(addToCartEvents[0].quantity).toBe(1);
    
    // 3. Track cart view event
    await page.getByRole('button', { name: 'Ouvrir le panier' }).click();
    await page.waitForTimeout(200);
    
    const cartViewEvents = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('analytics_ecommerce_events') || '[]')
        .filter((event: any) => event.event_type === 'view_cart');
    });
    
    expect(cartViewEvents.length).toBeGreaterThan(0);
    
    // 4. Track checkout initiation
    await page.getByRole('link', { name: 'Commander' }).click();
    await page.waitForLoadState('domcontentloaded');
    
    const checkoutEvents = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('analytics_ecommerce_events') || '[]')
        .filter((event: any) => event.event_type === 'begin_checkout');
    });
    
    expect(checkoutEvents.length).toBeGreaterThan(0);
    
    // 5. Complete purchase and track conversion
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="firstName-input"]', testUser.firstName);
    await page.fill('[data-testid="lastName-input"]', testUser.lastName);
    await page.fill('[data-testid="phone-input"]', testUser.phone);
    await page.fill('[data-testid="address-input"]', '123 Test Street');
    await page.fill('[data-testid="city-input"]', 'Algiers');
    
    await page.click('[data-testid="payment-cod"]');
    await page.click('[data-testid="place-order-button"]');
    
    await expect(page).toHaveURL(/.*\/order-confirmation/);
    
    // Verify purchase event
    const purchaseEvents = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('analytics_ecommerce_events') || '[]')
        .filter((event: any) => event.event_type === 'purchase');
    });
    
    expect(purchaseEvents.length).toBeGreaterThan(0);
    expect(purchaseEvents[0]).toHaveProperty('value');
    expect(purchaseEvents[0]).toHaveProperty('currency');
    expect(purchaseEvents[0].currency).toBe('DZD');
  });

  test('Traffic source attribution tracking', async ({ page }) => {
    // 1. Test direct traffic (no referrer)
    await TestHelpers.gotoAndReady(page, '/');
    
    let trafficSource = await page.evaluate(() => {
      return JSON.parse(sessionStorage.getItem('analytics_traffic_source') || '{}');
    });
    
    expect(trafficSource.source).toBe('direct');
    expect(trafficSource.medium).toBe('none');
    
    // 2. Test referral traffic
    await page.goto('https://google.com');
    await TestHelpers.gotoAndReady(page, '/');
    
    trafficSource = await page.evaluate(() => {
      return JSON.parse(sessionStorage.getItem('analytics_traffic_source') || '{}');
    });
    
    expect(trafficSource.source).toBe('google.com');
    expect(trafficSource.medium).toBe('referral');
    
    // 3. Test UTM parameter tracking
    await TestHelpers.gotoAndReady(page, '/?utm_source=facebook&utm_medium=social&utm_campaign=summer_sale&utm_term=heating&utm_content=banner');
    
    trafficSource = await page.evaluate(() => {
      return JSON.parse(sessionStorage.getItem('analytics_traffic_source') || '{}');
    });
    
    expect(trafficSource.utm_source).toBe('facebook');
    expect(trafficSource.utm_medium).toBe('social');
    expect(trafficSource.utm_campaign).toBe('summer_sale');
    expect(trafficSource.utm_term).toBe('heating');
    expect(trafficSource.utm_content).toBe('banner');
    
    // 4. Test organic search simulation
    await page.goto('/', {
      waitUntil: 'domcontentloaded',
      extraHTTPHeaders: {
        'Referer': 'https://www.google.com/search?q=mj+chauffage'
      }
    });
    await page.waitForLoadState('domcontentloaded');
    
    trafficSource = await page.evaluate(() => {
      return JSON.parse(sessionStorage.getItem('analytics_traffic_source') || '{}');
    });
    
    expect(trafficSource.source).toBe('google');
    expect(trafficSource.medium).toBe('organic');
  });

  test('User behavior and engagement tracking', async ({ page }) => {
    await TestHelpers.gotoAndReady(page, '/');
    
    // 1. Track scroll depth
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await page.waitForTimeout(1000);
    
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);
    
    const scrollEvents = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('analytics_scroll_events') || '[]');
    });
    
    expect(scrollEvents.length).toBeGreaterThan(0);
    expect(scrollEvents.some((event: any) => event.depth >= 50)).toBeTruthy();
    
    // 2. Track time on page
    await page.waitForTimeout(5000); // Stay on page for 5 seconds
    
    const timeOnPage = await page.evaluate(() => {
      return JSON.parse(sessionStorage.getItem('analytics_page_time') || '{}');
    });
    
    expect(timeOnPage.duration).toBeGreaterThan(4000); // At least 4 seconds
    
    // 3. Track click events on important elements
    await page.getByRole('link', { name: 'Produits' }).click();
    await page.waitForLoadState('domcontentloaded');
    await page.getByRole('link', { name: 'Services' }).click();
    await page.waitForLoadState('domcontentloaded');
    
    const clickEvents = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('analytics_click_events') || '[]');
    });
    
    expect(clickEvents.length).toBeGreaterThan(0);
    expect(clickEvents.some((event: any) => event.element_type === 'navigation')).toBeTruthy();
    
    // 4. Track form interactions
    await TestHelpers.gotoAndReady(page, '/contact');
    await page.fill('[data-testid="contact-name"]', 'Test User');
    await page.fill('[data-testid="contact-email"]', 'test@example.com');
    
    const formEvents = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('analytics_form_events') || '[]');
    });
    
    expect(formEvents.some((event: any) => event.event_type === 'form_start')).toBeTruthy();
  });

  test('Search and filter analytics', async ({ page }) => {
    await TestHelpers.gotoAndReady(page, '/products', { readySelectors: ['[data-testid="product-card"]', 'main'] });
    
    // 1. Track search queries
    await page.fill('[data-testid="search-input"]', 'heating system');
    await page.press('[data-testid="search-input"]', 'Enter');
    await page.waitForLoadState('networkidle');
    
    const searchEvents = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('analytics_search_events') || '[]');
    });
    
    expect(searchEvents.length).toBeGreaterThan(0);
    expect(searchEvents[0].query).toBe('heating system');
    expect(searchEvents[0]).toHaveProperty('results_count');
    
    // 2. Track filter usage
    await page.click('[data-testid="category-filter"]');
    await page.click('[data-testid="category-heating-systems"]');
    
    const filterEvents = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('analytics_filter_events') || '[]');
    });
    
    expect(filterEvents.length).toBeGreaterThan(0);
    expect(filterEvents[0].filter_type).toBe('category');
    expect(filterEvents[0].filter_value).toBe('heating-systems');
    
    // 3. Track sort usage
    await page.selectOption('[data-testid="sort-select"]', 'price-asc');
    
    const sortEvents = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('analytics_sort_events') || '[]');
    });
    
    expect(sortEvents.length).toBeGreaterThan(0);
    expect(sortEvents[0].sort_type).toBe('price-asc');
    
    // 4. Track no results scenarios
    await page.fill('[data-testid="search-input"]', 'nonexistent product xyz123');
    await page.press('[data-testid="search-input"]', 'Enter');
    await page.waitForLoadState('networkidle');
    
    const noResultsEvents = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('analytics_search_events') || '[]')
        .filter((event: any) => event.results_count === 0);
    });
    
    expect(noResultsEvents.length).toBeGreaterThan(0);
  });

  test('Analytics dashboard data verification', async ({ page, context }) => {
    // Generate some analytics data first
    await TestHelpers.gotoAndReady(page, '/');
    await page.getByRole('link', { name: 'Produits' }).click();
    await page.waitForLoadState('domcontentloaded');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('[data-testid="add-to-cart-button"]');
    
    // Login to admin dashboard
    const adminPage = await context.newPage();
    const adminHelpers = new TestHelpers(adminPage);
    await adminHelpers.loginAsAdmin();
    
    // Navigate to analytics dashboard
    await adminPage.click('[data-testid="analytics-menu"]');
    await adminPage.waitForSelector('[data-testid="analytics-dashboard"]');
    
    // 1. Verify real-time metrics
    await expect(adminPage.locator('[data-testid="realtime-visitors"]')).toBeVisible();
    await expect(adminPage.locator('[data-testid="realtime-pageviews"]')).toBeVisible();
    
    const visitorCount = await adminPage.locator('[data-testid="visitor-count"]').textContent();
    expect(parseInt(visitorCount || '0')).toBeGreaterThan(0);
    
    // 2. Verify traffic sources chart
    await expect(adminPage.locator('[data-testid="traffic-sources-chart"]')).toBeVisible();
    await expect(adminPage.locator('[data-testid="direct-traffic"]')).toBeVisible();
    
    // 3. Verify conversion metrics
    await expect(adminPage.locator('[data-testid="conversion-rate"]')).toBeVisible();
    await expect(adminPage.locator('[data-testid="cart-abandonment-rate"]')).toBeVisible();
    
    // 4. Verify popular products section
    await expect(adminPage.locator('[data-testid="popular-products"]')).toBeVisible();
    await expect(adminPage.locator('[data-testid="product-views-chart"]')).toBeVisible();
    
    // 5. Test date range filtering
    await adminPage.selectOption('[data-testid="date-range-select"]', 'last-7-days');
    await adminPage.waitForSelector('[data-testid="analytics-loading"]', { state: 'hidden' });
    
    // Verify data updated
    await expect(adminPage.locator('[data-testid="date-range-label"]')).toContainText('Last 7 days');
    
    // 6. Test export functionality
    await adminPage.click('[data-testid="export-analytics-button"]');
    await adminPage.selectOption('[data-testid="export-format"]', 'csv');
    await adminPage.click('[data-testid="confirm-export"]');
    
    await expect(adminPage.locator('[data-testid="export-success"]')).toBeVisible();
    
    await adminPage.close();
  });

  test('Error tracking and monitoring', async ({ page }) => {
    // 1. Test JavaScript error tracking
    await TestHelpers.gotoAndReady(page, '/');
    
    // Trigger a JavaScript error
    await page.evaluate(() => {
      // @ts-ignore
      window.nonExistentFunction();
    });
    
    await page.waitForTimeout(1000);
    
    const errorEvents = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('analytics_error_events') || '[]');
    });
    
    expect(errorEvents.length).toBeGreaterThan(0);
    expect(errorEvents[0]).toHaveProperty('error_message');
    expect(errorEvents[0]).toHaveProperty('stack_trace');
    
    // 2. Test API error tracking
    await page.route('/api/products', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    await TestHelpers.gotoAndReady(page, '/products', { readySelectors: ['[data-testid="product-card"]', 'main'] });
    await page.waitForTimeout(2000);
    
    const apiErrorEvents = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('analytics_api_errors') || '[]');
    });
    
    expect(apiErrorEvents.length).toBeGreaterThan(0);
    expect(apiErrorEvents[0].status_code).toBe(500);
    
    // 3. Test 404 error tracking
    await TestHelpers.gotoAndReady(page, '/non-existent-page');
    await page.waitForTimeout(1000);
    
    const notFoundEvents = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('analytics_404_events') || '[]');
    });
    
    expect(notFoundEvents.length).toBeGreaterThan(0);
    expect(notFoundEvents[0].page_path).toBe('/non-existent-page');
  });

  test('Performance metrics tracking', async ({ page }) => {
    await TestHelpers.gotoAndReady(page, '/');
    
    // Wait for performance metrics to be collected
    await page.waitForTimeout(3000);
    
    const performanceMetrics = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('analytics_performance') || '{}');
    });
    
    // 1. Verify Core Web Vitals tracking
    expect(performanceMetrics).toHaveProperty('lcp'); // Largest Contentful Paint
    expect(performanceMetrics).toHaveProperty('fid'); // First Input Delay
    expect(performanceMetrics).toHaveProperty('cls'); // Cumulative Layout Shift
    
    // 2. Verify page load metrics
    expect(performanceMetrics).toHaveProperty('page_load_time');
    expect(performanceMetrics).toHaveProperty('dom_content_loaded');
    expect(performanceMetrics).toHaveProperty('first_paint');
    
    // 3. Verify resource timing
    expect(performanceMetrics).toHaveProperty('resource_timings');
    expect(Array.isArray(performanceMetrics.resource_timings)).toBeTruthy();
    
    // 4. Test performance alerts for slow pages
    if (performanceMetrics.page_load_time > 3000) {
      const slowPageEvents = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('analytics_slow_pages') || '[]');
      });
      
      expect(slowPageEvents.length).toBeGreaterThan(0);
    }
  });

  test('Custom event tracking', async ({ page }) => {
    await TestHelpers.gotoAndReady(page, '/');
    
    // 1. Track custom business events
    await page.evaluate(() => {
      // Simulate custom event tracking
      window.analytics?.track('newsletter_signup', {
        email: 'test@example.com',
        source: 'homepage_banner'
      });
    });
    
    await page.evaluate(() => {
      window.analytics?.track('quote_request', {
        service_type: 'installation',
        estimated_value: 25000
      });
    });
    
    const customEvents = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('analytics_custom_events') || '[]');
    });
    
    expect(customEvents.length).toBeGreaterThan(0);
    expect(customEvents.some((event: any) => event.event_name === 'newsletter_signup')).toBeTruthy();
    expect(customEvents.some((event: any) => event.event_name === 'quote_request')).toBeTruthy();
    
    // 2. Track user preferences
    await page.click('[data-testid="language-selector"]');
    await page.click('[data-testid="language-fr"]');
    
    const preferenceEvents = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('analytics_preference_events') || '[]');
    });
    
    expect(preferenceEvents.some((event: any) => event.preference_type === 'language')).toBeTruthy();
  });
});