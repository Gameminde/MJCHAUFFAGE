import { Page, expect } from '@playwright/test';
import { testUser, testAdmin } from '../fixtures/test-data';

/**
 * Helper functions for E2E tests
 */

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to a URL and wait for a stable ready state.
   * Avoids flaky networkidle by waiting for DOMContentLoaded and key selectors.
   */
  static async gotoAndReady(page: Page, url: string, options?: { readySelectors?: string[]; waitUntil?: 'domcontentloaded' | 'load'; timeout?: number }) {
    const waitUntil = options?.waitUntil ?? 'domcontentloaded';
    const timeout = options?.timeout ?? 10000;
    const readySelectors = options?.readySelectors ?? ['main', 'header', 'body'];

    await page.goto(url, { waitUntil });
    // Wait for at least one of the ready selectors to appear
    for (const selector of readySelectors) {
      try {
        await page.waitForSelector(selector, { timeout });
        break;
      } catch {
        // try next selector
      }
    }
    // Give the page a brief settle time to avoid layout shift issues
    await page.waitForTimeout(150);
  }

  /**
   * Login as a regular user
   */
  async loginAsUser(email: string = testUser.email, password: string = testUser.password) {
    await this.page.click('[data-testid="login-button"]');
    await this.page.fill('[data-testid="login-email"]', email);
    await this.page.fill('[data-testid="login-password"]', password);
    await this.page.click('[data-testid="login-submit"]');
    
    // Verify login success
    await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible();
  }

  /**
   * Login as admin user
   */
  async loginAsAdmin(email: string = testAdmin.email, password: string = testAdmin.password) {
    await TestHelpers.gotoAndReady(this.page, '/admin/login');

    // Fill using accessible labels from the admin login page
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Mot de passe').fill(password);

    // Click the submit button by its accessible name
    await this.page.getByRole('button', { name: /Se connecter|Connexion\.+/ }).click();

    // Verify admin dashboard access via URL and heading
    await expect(this.page).toHaveURL(/.*\/admin/);
    await expect(this.page.getByRole('heading', { name: 'MJ Admin Dashboard' })).toBeVisible();
  }

  /**
   * Add product to cart
   */
  async addProductToCart(productIndex: number = 0, quantity: number = 1) {
    await this.page.goto('/products');
    await this.page.waitForSelector('[data-testid="product-card"]');
    
    if (productIndex > 0) {
      await this.page.click(`[data-testid="product-card"]:nth-child(${productIndex + 1})`);
    } else {
      await this.page.click('[data-testid="product-card"]:first-child');
    }
    
    if (quantity > 1) {
      await this.page.fill('[data-testid="quantity-input"]', quantity.toString());
    }
    
    await this.page.click('[data-testid="add-to-cart-button"]');
    await expect(this.page.locator('[data-testid="cart-notification"]')).toBeVisible();
  }

  /**
   * Complete checkout process
   */
  async completeCheckout(paymentMethod: 'stripe' | 'cod' | 'bank-transfer' = 'cod') {
    await this.page.getByRole('button', { name: 'Ouvrir le panier' }).click();
    await this.page.getByRole('link', { name: 'Commander' }).click();
    
    // Fill customer information
    await this.page.fill('[data-testid="email-input"]', testUser.email);
    await this.page.fill('[data-testid="firstName-input"]', testUser.firstName);
    await this.page.fill('[data-testid="lastName-input"]', testUser.lastName);
    await this.page.fill('[data-testid="phone-input"]', testUser.phone);
    await this.page.fill('[data-testid="address-input"]', testUser.address.street);
    await this.page.fill('[data-testid="city-input"]', testUser.address.city);
    await this.page.fill('[data-testid="postalCode-input"]', testUser.address.postalCode);
    
    // Select payment method
    await this.page.click(`[data-testid="payment-${paymentMethod}"]`);
    
    if (paymentMethod === 'stripe') {
      await this.fillStripeTestCard();
    }
    
    // Place order
    await this.page.click('[data-testid="place-order-button"]');
    
    // Verify order confirmation
    await expect(this.page).toHaveURL(/.*\/order-confirmation/);
    await expect(this.page.locator('[data-testid="order-success-message"]')).toBeVisible();
    
    return await this.page.locator('[data-testid="order-number"]').textContent();
  }

  /**
   * Fill Stripe test card details
   */
  async fillStripeTestCard(cardNumber: string = '4242424242424242') {
    await this.page.waitForSelector('[data-testid="stripe-card-element"]');
    
    const cardElement = this.page.frameLocator('[data-testid="stripe-card-element"] iframe').locator('[name="cardnumber"]');
    await cardElement.fill(cardNumber);
    
    const expiryElement = this.page.frameLocator('[data-testid="stripe-card-element"] iframe').locator('[name="exp-date"]');
    await expiryElement.fill('12/25');
    
    const cvcElement = this.page.frameLocator('[data-testid="stripe-card-element"] iframe').locator('[name="cvc"]');
    await cvcElement.fill('123');
  }

  /**
   * Wait for analytics events to be tracked
   */
  async waitForAnalyticsEvent(eventType: string, timeout: number = 5000) {
    await this.page.waitForFunction(
      (type) => {
        const events = JSON.parse(localStorage.getItem('analytics_ecommerce_events') || '[]');
        return events.some((event: any) => event.event_type === type);
      },
      eventType,
      { timeout }
    );
  }

  /**
   * Get analytics data from localStorage
   */
  async getAnalyticsData(key: string) {
    return await this.page.evaluate((storageKey) => {
      return JSON.parse(localStorage.getItem(storageKey) || '[]');
    }, key);
  }

  /**
   * Clear analytics data
   */
  async clearAnalyticsData() {
    await this.page.evaluate(() => {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('analytics_'));
      keys.forEach(key => localStorage.removeItem(key));
      
      const sessionKeys = Object.keys(sessionStorage).filter(key => key.startsWith('analytics_'));
      sessionKeys.forEach(key => sessionStorage.removeItem(key));
    });
  }

  /**
   * Simulate mobile viewport
   */
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  /**
   * Simulate tablet viewport
   */
  async setTabletViewport() {
    await this.page.setViewportSize({ width: 768, height: 1024 });
  }

  /**
   * Simulate desktop viewport
   */
  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('[data-testid="page-loaded"]', { timeout: 10000 });
  }

  /**
   * Take screenshot with timestamp
   */
  async takeTimestampedScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({ 
      path: `tests/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  /**
   * Verify page performance metrics
   */
  async verifyPagePerformance(maxLoadTime: number = 3000) {
    const performanceMetrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });

    expect(performanceMetrics.loadTime).toBeLessThan(maxLoadTime);
    return performanceMetrics;
  }

  /**
   * Check for console errors
   */
  async checkConsoleErrors() {
    const errors: string[] = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    return errors;
  }

  /**
   * Verify accessibility
   */
  async verifyAccessibility() {
    // Check for basic accessibility attributes
    const missingAltImages = await this.page.locator('img:not([alt])').count();
    expect(missingAltImages).toBe(0);

    const missingLabels = await this.page.locator('input:not([aria-label]):not([aria-labelledby]):not([id])').count();
    expect(missingLabels).toBe(0);

    // Check for proper heading hierarchy
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
  }

  /**
   * Test form validation
   */
  async testFormValidation(formSelector: string, requiredFields: string[]) {
    // Try to submit empty form
    await this.page.click(`${formSelector} [type="submit"]`);
    
    // Check that validation errors appear
    for (const field of requiredFields) {
      await expect(this.page.locator(`[data-testid="${field}-error"]`)).toBeVisible();
    }
  }

  /**
   * Simulate network conditions
   */
  async simulateSlowNetwork() {
    await this.page.route('**/*', route => {
      setTimeout(() => route.continue(), 1000); // Add 1 second delay
    });
  }

  /**
   * Simulate offline condition
   */
  async simulateOffline() {
    await this.page.context().setOffline(true);
  }

  /**
   * Restore online condition
   */
  async restoreOnline() {
    await this.page.context().setOffline(false);
  }
}

/**
 * Database helpers for testing
 */
export class DatabaseHelpers {
  /**
   * Create test product
   */
  static async createTestProduct(page: Page, productData: any) {
    return await page.evaluate(async (data) => {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    }, productData);
  }

  /**
   * Create test user
   */
  static async createTestUser(page: Page, userData: any) {
    return await page.evaluate(async (data) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    }, userData);
  }

  /**
   * Clean up test data
   */
  static async cleanupTestData(page: Page) {
    await page.evaluate(async () => {
      // Clean up test products
      await fetch('/api/admin/test-cleanup', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
    });
  }
}

/**
 * Analytics helpers
 */
export class AnalyticsHelpers {
  /**
   * Verify analytics event was sent
   */
  static async verifyEventSent(page: Page, eventType: string, properties?: any) {
    const events = await page.evaluate((type) => {
      return JSON.parse(localStorage.getItem('analytics_ecommerce_events') || '[]')
        .filter((event: any) => event.event_type === type);
    }, eventType);

    expect(events.length).toBeGreaterThan(0);
    
    if (properties) {
      const event = events[events.length - 1]; // Get latest event
      Object.keys(properties).forEach(key => {
        expect(event[key]).toBe(properties[key]);
      });
    }

    return events;
  }

  /**
   * Get session analytics data
   */
  static async getSessionData(page: Page) {
    return await page.evaluate(() => {
      return {
        sessionId: sessionStorage.getItem('analytics_session_id'),
        sessionData: JSON.parse(sessionStorage.getItem('analytics_session_data') || '{}'),
        trafficSource: JSON.parse(sessionStorage.getItem('analytics_traffic_source') || '{}')
      };
    });
  }
}