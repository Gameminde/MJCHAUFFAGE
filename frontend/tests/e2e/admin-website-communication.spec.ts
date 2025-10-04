import { test, expect } from '@playwright/test';
import { testAdmin, testProduct, testService } from './fixtures/test-data';

test.describe('Admin-Website Communication E2E Tests', () => {
  test.beforeEach(async ({ page, context }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('[data-testid="admin-email"]', testAdmin.email);
    await page.fill('[data-testid="admin-password"]', testAdmin.password);
    await page.click('[data-testid="admin-login-submit"]');
    
    // Verify admin dashboard access
    await expect(page).toHaveURL(/.*\/admin/);
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
  });

  test('Product management sync between admin and website', async ({ page, context }) => {
    // Open website in new tab to monitor changes
    const websitePage = await context.newPage();
    await websitePage.goto('/products');
    await websitePage.waitForLoadState('networkidle');
    
    // 1. Add new product in admin
    await page.click('[data-testid="products-menu"]');
    await page.click('[data-testid="add-product-button"]');
    
    const uniqueProductName = `Test Product ${Date.now()}`;
    await page.fill('[data-testid="product-name"]', uniqueProductName);
    await page.fill('[data-testid="product-description"]', testProduct.description);
    await page.fill('[data-testid="product-price"]', testProduct.price.toString());
    await page.selectOption('[data-testid="product-category"]', testProduct.category);
    await page.fill('[data-testid="product-brand"]', testProduct.brand);
    await page.fill('[data-testid="product-model"]', testProduct.model);
    await page.fill('[data-testid="product-quantity"]', testProduct.quantity.toString());
    
    // Upload product image
    await page.setInputFiles('[data-testid="product-image-upload"]', 'tests/e2e/fixtures/test-image.jpg');
    
    await page.click('[data-testid="save-product-button"]');
    await expect(page.locator('[data-testid="product-success"]')).toBeVisible();
    
    // 2. Verify product appears on website immediately
    await websitePage.reload();
    await websitePage.waitForLoadState('networkidle');
    
    // Search for the new product
    await websitePage.fill('[data-testid="search-input"]', uniqueProductName);
    await websitePage.press('[data-testid="search-input"]', 'Enter');
    
    await expect(websitePage.locator(`[data-testid="product-card"]:has-text("${uniqueProductName}")`)).toBeVisible();
    
    // 3. Update product in admin
    await page.click(`[data-testid="edit-product"]:has-text("${uniqueProductName}")`);
    const updatedPrice = testProduct.price + 1000;
    await page.fill('[data-testid="product-price"]', updatedPrice.toString());
    await page.click('[data-testid="save-product-button"]');
    
    // 4. Verify price update on website
    await websitePage.reload();
    await websitePage.fill('[data-testid="search-input"]', uniqueProductName);
    await websitePage.press('[data-testid="search-input"]', 'Enter');
    
    await expect(websitePage.locator(`[data-testid="product-price"]:has-text("${updatedPrice}")`)).toBeVisible();
    
    // 5. Disable product in admin
    await page.click(`[data-testid="edit-product"]:has-text("${uniqueProductName}")`);
    await page.uncheck('[data-testid="product-active"]');
    await page.click('[data-testid="save-product-button"]');
    
    // 6. Verify product is hidden on website
    await websitePage.reload();
    await websitePage.fill('[data-testid="search-input"]', uniqueProductName);
    await websitePage.press('[data-testid="search-input"]', 'Enter');
    
    await expect(websitePage.locator(`[data-testid="product-card"]:has-text("${uniqueProductName}")`)).not.toBeVisible();
    
    await websitePage.close();
  });

  test('Inventory management real-time sync', async ({ page, context }) => {
    const websitePage = await context.newPage();
    
    // 1. Find a product with inventory
    await page.click('[data-testid="products-menu"]');
    await page.waitForSelector('[data-testid="product-row"]');
    
    const productName = await page.locator('[data-testid="product-row"]:first-child [data-testid="product-name"]').textContent();
    const currentStock = await page.locator('[data-testid="product-row"]:first-child [data-testid="product-stock"]').textContent();
    
    // 2. Go to product page on website
    await websitePage.goto('/products');
    await websitePage.fill('[data-testid="search-input"]', productName || '');
    await websitePage.press('[data-testid="search-input"]', 'Enter');
    await websitePage.click(`[data-testid="product-card"]:has-text("${productName}")`);
    
    // Verify current stock display
    await expect(websitePage.locator('[data-testid="stock-status"]')).toBeVisible();
    
    // 3. Update inventory in admin
    await page.click(`[data-testid="edit-product"]:has-text("${productName}")`);
    const newStock = parseInt(currentStock?.replace(/\D/g, '') || '0') - 5;
    await page.fill('[data-testid="product-quantity"]', newStock.toString());
    await page.click('[data-testid="save-product-button"]');
    
    // 4. Verify stock update on website (should update via WebSocket)
    await websitePage.waitForTimeout(2000); // Wait for real-time update
    await expect(websitePage.locator(`[data-testid="stock-quantity"]:has-text("${newStock}")`)).toBeVisible();
    
    // 5. Set stock to 0 (out of stock)
    await page.click(`[data-testid="edit-product"]:has-text("${productName}")`);
    await page.fill('[data-testid="product-quantity"]', '0');
    await page.click('[data-testid="save-product-button"]');
    
    // 6. Verify out of stock status on website
    await websitePage.waitForTimeout(2000);
    await expect(websitePage.locator('[data-testid="out-of-stock"]')).toBeVisible();
    await expect(websitePage.locator('[data-testid="add-to-cart-button"]')).toBeDisabled();
    
    await websitePage.close();
  });

  test('Order management and status updates', async ({ page, context }) => {
    // 1. Create a test order first (simulate customer order)
    const websitePage = await context.newPage();
    await websitePage.goto('/products');
    await websitePage.click('[data-testid="product-card"]:first-child');
    await websitePage.click('[data-testid="add-to-cart-button"]');
    await websitePage.click('[data-testid="cart-button"]');
    await websitePage.click('[data-testid="checkout-button"]');
    
    // Fill checkout form
    await websitePage.fill('[data-testid="email-input"]', 'test@example.com');
    await websitePage.fill('[data-testid="firstName-input"]', 'Test');
    await websitePage.fill('[data-testid="lastName-input"]', 'Customer');
    await websitePage.fill('[data-testid="phone-input"]', '+213555123456');
    await websitePage.fill('[data-testid="address-input"]', '123 Test Street');
    await websitePage.fill('[data-testid="city-input"]', 'Algiers');
    
    await websitePage.click('[data-testid="place-order-button"]');
    
    // Get order number
    const orderNumber = await websitePage.locator('[data-testid="order-number"]').textContent();
    
    // 2. Go to admin orders management
    await page.click('[data-testid="orders-menu"]');
    await page.waitForSelector('[data-testid="orders-table"]');
    
    // Find the new order
    await expect(page.locator(`[data-testid="order-row"]:has-text("${orderNumber}")`)).toBeVisible();
    
    // 3. Update order status
    await page.click(`[data-testid="order-row"]:has-text("${orderNumber}") [data-testid="edit-order"]`);
    await page.selectOption('[data-testid="order-status"]', 'processing');
    await page.click('[data-testid="save-order-button"]');
    
    // 4. Verify status update notification (if customer is logged in)
    // This would typically send email/SMS notifications
    await expect(page.locator('[data-testid="order-updated-success"]')).toBeVisible();
    
    // 5. Update to shipped status
    await page.selectOption('[data-testid="order-status"]', 'shipped');
    await page.fill('[data-testid="tracking-number"]', 'TRACK123456');
    await page.click('[data-testid="save-order-button"]');
    
    // 6. Verify tracking information is available
    await expect(page.locator('[data-testid="tracking-info"]')).toBeVisible();
    
    await websitePage.close();
  });

  test('Service appointment management sync', async ({ page, context }) => {
    const websitePage = await context.newPage();
    
    // 1. Book appointment on website
    await websitePage.goto('/services');
    await websitePage.click('[data-testid="service-card"]:first-child');
    await websitePage.click('[data-testid="book-appointment-button"]');
    
    const customerName = `Test Customer ${Date.now()}`;
    await websitePage.fill('[data-testid="customer-name"]', customerName);
    await websitePage.fill('[data-testid="customer-email"]', 'customer@test.com');
    await websitePage.fill('[data-testid="customer-phone"]', '+213555123456');
    await websitePage.fill('[data-testid="customer-address"]', '123 Test Address');
    
    // Select future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateString = futureDate.toISOString().split('T')[0];
    
    await websitePage.fill('[data-testid="appointment-date"]', dateString);
    await websitePage.selectOption('[data-testid="appointment-time"]', '10:00');
    
    await websitePage.click('[data-testid="submit-appointment"]');
    
    const appointmentNumber = await websitePage.locator('[data-testid="appointment-number"]').textContent();
    
    // 2. Check appointment appears in admin
    await page.click('[data-testid="appointments-menu"]');
    await page.waitForSelector('[data-testid="appointments-table"]');
    
    await expect(page.locator(`[data-testid="appointment-row"]:has-text("${customerName}")`)).toBeVisible();
    
    // 3. Confirm appointment in admin
    await page.click(`[data-testid="appointment-row"]:has-text("${customerName}") [data-testid="confirm-appointment"]`);
    await page.click('[data-testid="confirm-button"]');
    
    // 4. Verify confirmation status
    await expect(page.locator(`[data-testid="appointment-status"]:has-text("confirmed")`)).toBeVisible();
    
    // 5. Reschedule appointment
    await page.click(`[data-testid="appointment-row"]:has-text("${customerName}") [data-testid="reschedule-appointment"]`);
    
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 10);
    const newDateString = newDate.toISOString().split('T')[0];
    
    await page.fill('[data-testid="new-appointment-date"]', newDateString);
    await page.selectOption('[data-testid="new-appointment-time"]', '14:00');
    await page.click('[data-testid="save-reschedule"]');
    
    // 6. Verify reschedule notification sent
    await expect(page.locator('[data-testid="reschedule-success"]')).toBeVisible();
    
    await websitePage.close();
  });

  test('Content management sync', async ({ page, context }) => {
    const websitePage = await context.newPage();
    
    // 1. Update homepage content in admin
    await page.click('[data-testid="content-menu"]');
    await page.click('[data-testid="homepage-settings"]');
    
    const newHeroTitle = `Welcome to MJ CHAUFFAGE ${Date.now()}`;
    await page.fill('[data-testid="hero-title"]', newHeroTitle);
    await page.fill('[data-testid="hero-subtitle"]', 'Updated subtitle for testing');
    
    await page.click('[data-testid="save-content-button"]');
    await expect(page.locator('[data-testid="content-saved"]')).toBeVisible();
    
    // 2. Verify changes on website homepage
    await websitePage.goto('/');
    await websitePage.waitForLoadState('networkidle');
    
    await expect(websitePage.locator(`[data-testid="hero-title"]:has-text("${newHeroTitle}")`)).toBeVisible();
    
    // 3. Update promotional banner
    await page.click('[data-testid="promotions-tab"]');
    await page.click('[data-testid="add-promotion-button"]');
    
    const promoText = `Special Offer ${Date.now()}`;
    await page.fill('[data-testid="promotion-text"]', promoText);
    await page.fill('[data-testid="promotion-discount"]', '20');
    await page.check('[data-testid="promotion-active"]');
    
    await page.click('[data-testid="save-promotion-button"]');
    
    // 4. Verify promotion appears on website
    await websitePage.reload();
    await expect(websitePage.locator(`[data-testid="promotion-banner"]:has-text("${promoText}")`)).toBeVisible();
    
    // 5. Disable promotion
    await page.uncheck('[data-testid="promotion-active"]');
    await page.click('[data-testid="save-promotion-button"]');
    
    // 6. Verify promotion is hidden on website
    await websitePage.reload();
    await expect(websitePage.locator(`[data-testid="promotion-banner"]:has-text("${promoText}")`)).not.toBeVisible();
    
    await websitePage.close();
  });

  test('Real-time notifications and updates', async ({ page, context }) => {
    // Test WebSocket connections and real-time updates
    const websitePage = await context.newPage();
    
    // 1. Monitor admin dashboard for real-time metrics
    await page.click('[data-testid="dashboard-menu"]');
    await expect(page.locator('[data-testid="realtime-visitors"]')).toBeVisible();
    
    const initialVisitorCount = await page.locator('[data-testid="visitor-count"]').textContent();
    
    // 2. Simulate website activity
    await websitePage.goto('/');
    await websitePage.goto('/products');
    await websitePage.click('[data-testid="product-card"]:first-child');
    
    // 3. Verify visitor count updated in admin (real-time)
    await page.waitForTimeout(3000); // Wait for WebSocket update
    const updatedVisitorCount = await page.locator('[data-testid="visitor-count"]').textContent();
    
    // Visitor count should have changed
    expect(updatedVisitorCount).not.toBe(initialVisitorCount);
    
    // 4. Test order notifications
    await websitePage.click('[data-testid="add-to-cart-button"]');
    await websitePage.click('[data-testid="cart-button"]');
    await websitePage.click('[data-testid="checkout-button"]');
    
    // Complete checkout
    await websitePage.fill('[data-testid="email-input"]', 'realtime@test.com');
    await websitePage.fill('[data-testid="firstName-input"]', 'Realtime');
    await websitePage.fill('[data-testid="lastName-input"]', 'Test');
    await websitePage.fill('[data-testid="phone-input"]', '+213555123456');
    await websitePage.fill('[data-testid="address-input"]', '123 Test Street');
    await websitePage.fill('[data-testid="city-input"]', 'Algiers');
    
    await websitePage.click('[data-testid="place-order-button"]');
    
    // 5. Verify new order notification in admin
    await expect(page.locator('[data-testid="new-order-notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="orders-count"]')).toContainText(/\d+/);
    
    await websitePage.close();
  });

  test('Cache invalidation and data consistency', async ({ page, context }) => {
    const websitePage = await context.newPage();
    
    // 1. Load product page on website (should cache data)
    await websitePage.goto('/products');
    await websitePage.waitForLoadState('networkidle');
    
    const productCard = websitePage.locator('[data-testid="product-card"]:first-child');
    const originalPrice = await productCard.locator('[data-testid="product-price"]').textContent();
    
    // 2. Update product price in admin
    await page.click('[data-testid="products-menu"]');
    await page.click('[data-testid="product-row"]:first-child [data-testid="edit-product"]');
    
    const newPrice = '99999';
    await page.fill('[data-testid="product-price"]', newPrice);
    await page.click('[data-testid="save-product-button"]');
    
    // 3. Verify cache is invalidated and new price shows immediately
    await websitePage.reload();
    await websitePage.waitForLoadState('networkidle');
    
    await expect(websitePage.locator(`[data-testid="product-price"]:has-text("${newPrice}")`)).toBeVisible();
    
    // 4. Test category cache invalidation
    await page.click('[data-testid="categories-menu"]');
    await page.click('[data-testid="add-category-button"]');
    
    const newCategoryName = `Test Category ${Date.now()}`;
    await page.fill('[data-testid="category-name"]', newCategoryName);
    await page.click('[data-testid="save-category-button"]');
    
    // 5. Verify new category appears in website navigation
    await websitePage.reload();
    await expect(websitePage.locator(`[data-testid="category-nav"]:has-text("${newCategoryName}")`)).toBeVisible();
    
    await websitePage.close();
  });
});