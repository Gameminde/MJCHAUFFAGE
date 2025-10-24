import { test, expect } from '@playwright/test';
import { testUser, testProduct, testOrder } from './fixtures/test-data';

test.describe('Complete User Journey E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start from homepage
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('Complete purchase journey - Guest user', async ({ page }) => {
    // 1. Browse products
    await page.click('[data-testid="products-link"]');
    await expect(page).toHaveURL(/.*\/products/);
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]');
    
    // 2. View product details
    await page.click('[data-testid="product-card"]:first-child');
    await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
    
    // 3. Add to cart
    await page.click('[data-testid="add-to-cart-button"]');
    await expect(page.locator('[data-testid="cart-notification"]')).toBeVisible();
    
    // Verify cart count updated
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
    
    // 4. View cart
    await page.click('[data-testid="cart-button"]');
    await expect(page).toHaveURL(/.*\/cart/);
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
    
    // 5. Proceed to checkout
    await page.click('[data-testid="checkout-button"]');
    await expect(page).toHaveURL(/.*\/checkout/);
    
    // 6. Fill checkout form (guest)
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="firstName-input"]', testUser.firstName);
    await page.fill('[data-testid="lastName-input"]', testUser.lastName);
    await page.fill('[data-testid="phone-input"]', testUser.phone);
    await page.fill('[data-testid="address-input"]', testOrder.shippingAddress.street);
    await page.fill('[data-testid="city-input"]', testOrder.shippingAddress.city);
    await page.fill('[data-testid="postalCode-input"]', testOrder.shippingAddress.postalCode);
    
    // 7. Select payment method
    await page.click('[data-testid="payment-stripe"]');
    
    // 8. Place order (mock payment)
    await page.click('[data-testid="place-order-button"]');
    
    // 9. Verify order confirmation
    await expect(page).toHaveURL(/.*\/order-confirmation/);
    await expect(page.locator('[data-testid="order-success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
  });

  test('Complete purchase journey - Registered user', async ({ page }) => {
    // 1. Register new user
    await page.click('[data-testid="login-button"]');
    await page.click('[data-testid="register-tab"]');
    
    await page.fill('[data-testid="register-email"]', `test-${Date.now()}@example.com`);
    await page.fill('[data-testid="register-password"]', testUser.password);
    await page.fill('[data-testid="register-firstName"]', testUser.firstName);
    await page.fill('[data-testid="register-lastName"]', testUser.lastName);
    await page.fill('[data-testid="register-phone"]', testUser.phone);
    
    await page.click('[data-testid="register-submit"]');
    
    // Verify login success
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    // 2. Browse and add products to cart
    await page.goto('/products');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('[data-testid="add-to-cart-button"]');
    
    // 3. Add to wishlist
    await page.click('[data-testid="add-to-wishlist-button"]');
    await expect(page.locator('[data-testid="wishlist-notification"]')).toBeVisible();
    
    // 4. Proceed to checkout (faster with saved info)
    await page.click('[data-testid="cart-button"]');
    await page.click('[data-testid="checkout-button"]');
    
    // Verify user info is pre-filled
    await expect(page.locator('[data-testid="email-input"]')).toHaveValue(/.+@.+/);
    
    // 5. Complete purchase
    await page.click('[data-testid="place-order-button"]');
    await expect(page).toHaveURL(/.*\/order-confirmation/);
  });

  test('Product search and filtering', async ({ page }) => {
    await page.goto('/products');
    
    // 1. Test search functionality
    await page.fill('[data-testid="search-input"]', 'heating');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify search results
    await page.waitForSelector('[data-testid="product-card"]');
    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
    
    // 2. Test category filtering
    await page.click('[data-testid="category-filter"]');
    await page.click('[data-testid="category-heating-systems"]');
    
    // Verify filtered results
    await page.waitForSelector('[data-testid="product-card"]');
    
    // 3. Test price filtering
    await page.fill('[data-testid="min-price-input"]', '10000');
    await page.fill('[data-testid="max-price-input"]', '50000');
    await page.click('[data-testid="apply-filters-button"]');
    
    // Verify price-filtered results
    await page.waitForSelector('[data-testid="product-card"]');
    
    // 4. Test sorting
    await page.selectOption('[data-testid="sort-select"]', 'price-asc');
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Verify sorting applied
    const firstPrice = await page.locator('[data-testid="product-card"]:first-child [data-testid="product-price"]').textContent();
    const lastPrice = await page.locator('[data-testid="product-card"]:last-child [data-testid="product-price"]').textContent();
    
    // Basic price comparison (assuming prices are in format "X DZD")
    const firstPriceNum = parseInt(firstPrice?.replace(/[^\d]/g, '') || '0');
    const lastPriceNum = parseInt(lastPrice?.replace(/[^\d]/g, '') || '0');
    expect(firstPriceNum).toBeLessThanOrEqual(lastPriceNum);
  });

  test('Service appointment booking', async ({ page }) => {
    // 1. Navigate to services
    await page.click('[data-testid="services-link"]');
    await expect(page).toHaveURL(/.*\/services/);
    
    // 2. Select a service
    await page.click('[data-testid="service-card"]:first-child');
    await expect(page.locator('[data-testid="service-title"]')).toBeVisible();
    
    // 3. Book appointment
    await page.click('[data-testid="book-appointment-button"]');
    
    // Fill appointment form
    await page.fill('[data-testid="customer-name"]', 'Test Customer');
    await page.fill('[data-testid="customer-email"]', 'customer@test.com');
    await page.fill('[data-testid="customer-phone"]', '+213555123456');
    await page.fill('[data-testid="customer-address"]', '123 Test Address');
    
    // Select date and time
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateString = futureDate.toISOString().split('T')[0];
    
    await page.fill('[data-testid="appointment-date"]', dateString);
    await page.selectOption('[data-testid="appointment-time"]', '10:00');
    
    // Submit appointment
    await page.click('[data-testid="submit-appointment"]');
    
    // Verify confirmation
    await expect(page.locator('[data-testid="appointment-confirmation"]')).toBeVisible();
    await expect(page.locator('[data-testid="appointment-number"]')).toBeVisible();
  });

  test('User account management', async ({ page }) => {
    // Login first
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="login-email"]', testUser.email);
    await page.fill('[data-testid="login-password"]', testUser.password);
    await page.click('[data-testid="login-submit"]');
    
    // Navigate to account
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="account-link"]');
    await expect(page).toHaveURL(/.*\/account/);
    
    // 1. Update profile
    await page.click('[data-testid="edit-profile-button"]');
    await page.fill('[data-testid="profile-firstName"]', 'Updated Name');
    await page.click('[data-testid="save-profile-button"]');
    
    await expect(page.locator('[data-testid="profile-success"]')).toBeVisible();
    
    // 2. View order history
    await page.click('[data-testid="orders-tab"]');
    await expect(page.locator('[data-testid="orders-list"]')).toBeVisible();
    
    // 3. View wishlist
    await page.click('[data-testid="wishlist-tab"]');
    await expect(page.locator('[data-testid="wishlist-items"]')).toBeVisible();
    
    // 4. Update address
    await page.click('[data-testid="addresses-tab"]');
    await page.click('[data-testid="add-address-button"]');
    
    await page.fill('[data-testid="address-street"]', '456 New Street');
    await page.fill('[data-testid="address-city"]', 'Algiers');
    await page.fill('[data-testid="address-postalCode"]', '16000');
    await page.click('[data-testid="save-address-button"]');
    
    await expect(page.locator('[data-testid="address-success"]')).toBeVisible();
  });

  test('Mobile responsive experience', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // 1. Test mobile navigation
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    await page.click('[data-testid="mobile-products-link"]');
    await expect(page).toHaveURL(/.*\/products/);
    
    // 2. Test mobile product browsing
    await page.waitForSelector('[data-testid="product-card"]');
    await page.click('[data-testid="product-card"]:first-child');
    
    // 3. Test mobile cart functionality
    await page.click('[data-testid="add-to-cart-button"]');
    await page.click('[data-testid="mobile-cart-button"]');
    
    // 4. Test mobile checkout
    await page.click('[data-testid="checkout-button"]');
    await expect(page.locator('[data-testid="checkout-form"]')).toBeVisible();
    
    // Verify mobile-optimized form layout
    await expect(page.locator('[data-testid="checkout-form"]')).toHaveCSS('display', 'flex');
  });
});