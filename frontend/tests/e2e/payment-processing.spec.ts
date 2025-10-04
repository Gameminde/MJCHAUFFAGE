import { test, expect } from '@playwright/test';
import { testUser, testOrder } from './fixtures/test-data';

test.describe('Payment Processing and Order Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start from homepage and add items to cart
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to products and add to cart
    await page.click('[data-testid="products-link"]');
    await page.waitForSelector('[data-testid="product-card"]');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('[data-testid="add-to-cart-button"]');
    
    // Go to checkout
    await page.click('[data-testid="cart-button"]');
    await page.click('[data-testid="checkout-button"]');
  });

  test('Stripe payment processing - successful payment', async ({ page }) => {
    // Fill customer information
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="firstName-input"]', testUser.firstName);
    await page.fill('[data-testid="lastName-input"]', testUser.lastName);
    await page.fill('[data-testid="phone-input"]', testUser.phone);
    await page.fill('[data-testid="address-input"]', testOrder.shippingAddress.street);
    await page.fill('[data-testid="city-input"]', testOrder.shippingAddress.city);
    await page.fill('[data-testid="postalCode-input"]', testOrder.shippingAddress.postalCode);
    
    // Select Stripe payment method
    await page.click('[data-testid="payment-stripe"]');
    
    // Wait for Stripe Elements to load
    await page.waitForSelector('[data-testid="stripe-card-element"]');
    
    // Fill Stripe test card details
    const cardElement = page.frameLocator('[data-testid="stripe-card-element"] iframe').locator('[name="cardnumber"]');
    await cardElement.fill('4242424242424242'); // Stripe test card
    
    const expiryElement = page.frameLocator('[data-testid="stripe-card-element"] iframe').locator('[name="exp-date"]');
    await expiryElement.fill('12/25');
    
    const cvcElement = page.frameLocator('[data-testid="stripe-card-element"] iframe').locator('[name="cvc"]');
    await cvcElement.fill('123');
    
    // Place order
    await page.click('[data-testid="place-order-button"]');
    
    // Wait for payment processing
    await expect(page.locator('[data-testid="payment-processing"]')).toBeVisible();
    
    // Verify successful payment and order confirmation
    await expect(page).toHaveURL(/.*\/order-confirmation/, { timeout: 30000 });
    await expect(page.locator('[data-testid="order-success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-confirmation"]')).toBeVisible();
    
    // Verify order details are correct
    await expect(page.locator('[data-testid="order-total"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-address"]')).toContainText(testOrder.shippingAddress.city);
    await expect(page.locator('[data-testid="payment-method"]')).toContainText('Stripe');
  });

  test('Stripe payment processing - declined card', async ({ page }) => {
    // Fill customer information
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="firstName-input"]', testUser.firstName);
    await page.fill('[data-testid="lastName-input"]', testUser.lastName);
    await page.fill('[data-testid="phone-input"]', testUser.phone);
    await page.fill('[data-testid="address-input"]', testOrder.shippingAddress.street);
    await page.fill('[data-testid="city-input"]', testOrder.shippingAddress.city);
    
    // Select Stripe payment method
    await page.click('[data-testid="payment-stripe"]');
    await page.waitForSelector('[data-testid="stripe-card-element"]');
    
    // Fill declined test card details
    const cardElement = page.frameLocator('[data-testid="stripe-card-element"] iframe').locator('[name="cardnumber"]');
    await cardElement.fill('4000000000000002'); // Stripe declined test card
    
    const expiryElement = page.frameLocator('[data-testid="stripe-card-element"] iframe').locator('[name="exp-date"]');
    await expiryElement.fill('12/25');
    
    const cvcElement = page.frameLocator('[data-testid="stripe-card-element"] iframe').locator('[name="cvc"]');
    await cvcElement.fill('123');
    
    // Attempt to place order
    await page.click('[data-testid="place-order-button"]');
    
    // Verify payment error handling
    await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-error"]')).toContainText(/declined|failed/i);
    
    // Verify user stays on checkout page
    await expect(page).toHaveURL(/.*\/checkout/);
    
    // Verify cart items are still preserved
    await expect(page.locator('[data-testid="order-summary"]')).toBeVisible();
  });

  test('Stripe payment processing - insufficient funds', async ({ page }) => {
    // Fill customer information
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="firstName-input"]', testUser.firstName);
    await page.fill('[data-testid="lastName-input"]', testUser.lastName);
    await page.fill('[data-testid="phone-input"]', testUser.phone);
    await page.fill('[data-testid="address-input"]', testOrder.shippingAddress.street);
    await page.fill('[data-testid="city-input"]', testOrder.shippingAddress.city);
    
    // Select Stripe payment method
    await page.click('[data-testid="payment-stripe"]');
    await page.waitForSelector('[data-testid="stripe-card-element"]');
    
    // Fill insufficient funds test card
    const cardElement = page.frameLocator('[data-testid="stripe-card-element"] iframe').locator('[name="cardnumber"]');
    await cardElement.fill('4000000000009995'); // Stripe insufficient funds test card
    
    const expiryElement = page.frameLocator('[data-testid="stripe-card-element"] iframe').locator('[name="exp-date"]');
    await expiryElement.fill('12/25');
    
    const cvcElement = page.frameLocator('[data-testid="stripe-card-element"] iframe').locator('[name="cvc"]');
    await cvcElement.fill('123');
    
    // Attempt to place order
    await page.click('[data-testid="place-order-button"]');
    
    // Verify specific error message
    await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-error"]')).toContainText(/insufficient funds/i);
  });

  test('Cash on delivery payment method', async ({ page }) => {
    // Fill customer information
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="firstName-input"]', testUser.firstName);
    await page.fill('[data-testid="lastName-input"]', testUser.lastName);
    await page.fill('[data-testid="phone-input"]', testUser.phone);
    await page.fill('[data-testid="address-input"]', testOrder.shippingAddress.street);
    await page.fill('[data-testid="city-input"]', testOrder.shippingAddress.city);
    await page.fill('[data-testid="postalCode-input"]', testOrder.shippingAddress.postalCode);
    
    // Select cash on delivery
    await page.click('[data-testid="payment-cod"]');
    
    // Verify COD fee is displayed
    await expect(page.locator('[data-testid="cod-fee"]')).toBeVisible();
    
    // Place order
    await page.click('[data-testid="place-order-button"]');
    
    // Verify order confirmation
    await expect(page).toHaveURL(/.*\/order-confirmation/);
    await expect(page.locator('[data-testid="order-success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-method"]')).toContainText('Cash on Delivery');
    await expect(page.locator('[data-testid="cod-instructions"]')).toBeVisible();
  });

  test('Bank transfer payment method', async ({ page }) => {
    // Fill customer information
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="firstName-input"]', testUser.firstName);
    await page.fill('[data-testid="lastName-input"]', testUser.lastName);
    await page.fill('[data-testid="phone-input"]', testUser.phone);
    await page.fill('[data-testid="address-input"]', testOrder.shippingAddress.street);
    await page.fill('[data-testid="city-input"]', testOrder.shippingAddress.city);
    
    // Select bank transfer
    await page.click('[data-testid="payment-bank-transfer"]');
    
    // Verify bank details are displayed
    await expect(page.locator('[data-testid="bank-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="bank-account-number"]')).toBeVisible();
    
    // Place order
    await page.click('[data-testid="place-order-button"]');
    
    // Verify order confirmation with bank transfer instructions
    await expect(page).toHaveURL(/.*\/order-confirmation/);
    await expect(page.locator('[data-testid="bank-transfer-instructions"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-reference"]')).toBeVisible();
  });

  test('Order management workflow', async ({ page, context }) => {
    // Complete a successful order first
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="firstName-input"]', testUser.firstName);
    await page.fill('[data-testid="lastName-input"]', testUser.lastName);
    await page.fill('[data-testid="phone-input"]', testUser.phone);
    await page.fill('[data-testid="address-input"]', testOrder.shippingAddress.street);
    await page.fill('[data-testid="city-input"]', testOrder.shippingAddress.city);
    
    await page.click('[data-testid="payment-cod"]');
    await page.click('[data-testid="place-order-button"]');
    
    const orderNumber = await page.locator('[data-testid="order-number"]').textContent();
    
    // Login to admin to manage the order
    const adminPage = await context.newPage();
    await adminPage.goto('/admin/login');
    await adminPage.fill('[data-testid="admin-email"]', 'admin@mjchauffage.com');
    await adminPage.fill('[data-testid="admin-password"]', 'AdminPassword123!');
    await adminPage.click('[data-testid="admin-login-submit"]');
    
    // Navigate to orders
    await adminPage.click('[data-testid="orders-menu"]');
    await adminPage.waitForSelector('[data-testid="orders-table"]');
    
    // Find and process the order
    await expect(adminPage.locator(`[data-testid="order-row"]:has-text("${orderNumber}")`)).toBeVisible();
    
    // Update order status to processing
    await adminPage.click(`[data-testid="order-row"]:has-text("${orderNumber}") [data-testid="edit-order"]`);
    await adminPage.selectOption('[data-testid="order-status"]', 'processing');
    await adminPage.click('[data-testid="save-order-button"]');
    
    // Verify status update
    await expect(adminPage.locator('[data-testid="order-updated-success"]')).toBeVisible();
    
    // Update to shipped
    await adminPage.selectOption('[data-testid="order-status"]', 'shipped');
    await adminPage.fill('[data-testid="tracking-number"]', 'TRACK123456789');
    await adminPage.click('[data-testid="save-order-button"]');
    
    // Verify tracking information
    await expect(adminPage.locator('[data-testid="tracking-info"]')).toBeVisible();
    
    // Mark as delivered
    await adminPage.selectOption('[data-testid="order-status"]', 'delivered');
    await adminPage.click('[data-testid="save-order-button"]');
    
    await adminPage.close();
  });

  test('Inventory management during checkout', async ({ page }) => {
    // Go to a specific product with limited stock
    await page.goto('/products');
    await page.click('[data-testid="product-card"]:first-child');
    
    // Check current stock level
    const stockText = await page.locator('[data-testid="stock-quantity"]').textContent();
    const currentStock = parseInt(stockText?.replace(/\D/g, '') || '0');
    
    // Add maximum quantity to cart
    if (currentStock > 1) {
      await page.fill('[data-testid="quantity-input"]', Math.min(currentStock, 5).toString());
    }
    
    await page.click('[data-testid="add-to-cart-button"]');
    await page.click('[data-testid="cart-button"]');
    await page.click('[data-testid="checkout-button"]');
    
    // Fill checkout form
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="firstName-input"]', testUser.firstName);
    await page.fill('[data-testid="lastName-input"]', testUser.lastName);
    await page.fill('[data-testid="phone-input"]', testUser.phone);
    await page.fill('[data-testid="address-input"]', testOrder.shippingAddress.street);
    await page.fill('[data-testid="city-input"]', testOrder.shippingAddress.city);
    
    await page.click('[data-testid="payment-cod"]');
    
    // Complete order
    await page.click('[data-testid="place-order-button"]');
    
    // Verify order success
    await expect(page).toHaveURL(/.*\/order-confirmation/);
    
    // Go back to product page and verify stock was decremented
    await page.goto('/products');
    await page.click('[data-testid="product-card"]:first-child');
    
    const newStockText = await page.locator('[data-testid="stock-quantity"]').textContent();
    const newStock = parseInt(newStockText?.replace(/\D/g, '') || '0');
    
    // Stock should be reduced
    expect(newStock).toBeLessThan(currentStock);
  });

  test('Multiple payment methods comparison', async ({ page }) => {
    // Fill customer information once
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="firstName-input"]', testUser.firstName);
    await page.fill('[data-testid="lastName-input"]', testUser.lastName);
    await page.fill('[data-testid="phone-input"]', testUser.phone);
    await page.fill('[data-testid="address-input"]', testOrder.shippingAddress.street);
    await page.fill('[data-testid="city-input"]', testOrder.shippingAddress.city);
    
    // Test each payment method availability
    await expect(page.locator('[data-testid="payment-stripe"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-cod"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-bank-transfer"]')).toBeVisible();
    
    // Test payment method switching
    await page.click('[data-testid="payment-stripe"]');
    await expect(page.locator('[data-testid="stripe-card-element"]')).toBeVisible();
    
    await page.click('[data-testid="payment-cod"]');
    await expect(page.locator('[data-testid="cod-fee"]')).toBeVisible();
    await expect(page.locator('[data-testid="stripe-card-element"]')).not.toBeVisible();
    
    await page.click('[data-testid="payment-bank-transfer"]');
    await expect(page.locator('[data-testid="bank-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="cod-fee"]')).not.toBeVisible();
    
    // Verify total calculation changes with payment method
    const codTotal = await page.locator('[data-testid="order-total"]').textContent();
    
    await page.click('[data-testid="payment-stripe"]');
    const stripeTotal = await page.locator('[data-testid="order-total"]').textContent();
    
    // COD should have additional fee
    expect(codTotal).not.toBe(stripeTotal);
  });

  test('Order confirmation email and notifications', async ({ page }) => {
    // Complete order
    await page.fill('[data-testid="email-input"]', 'test-notifications@example.com');
    await page.fill('[data-testid="firstName-input"]', testUser.firstName);
    await page.fill('[data-testid="lastName-input"]', testUser.lastName);
    await page.fill('[data-testid="phone-input"]', testUser.phone);
    await page.fill('[data-testid="address-input"]', testOrder.shippingAddress.street);
    await page.fill('[data-testid="city-input"]', testOrder.shippingAddress.city);
    
    await page.click('[data-testid="payment-cod"]');
    await page.click('[data-testid="place-order-button"]');
    
    // Verify order confirmation page shows email notification sent
    await expect(page.locator('[data-testid="email-confirmation"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-confirmation"]')).toContainText('test-notifications@example.com');
    
    // Verify SMS notification option (if phone provided)
    await expect(page.locator('[data-testid="sms-confirmation"]')).toBeVisible();
    
    // Test order tracking link
    const trackingLink = page.locator('[data-testid="order-tracking-link"]');
    await expect(trackingLink).toBeVisible();
    
    await trackingLink.click();
    await expect(page).toHaveURL(/.*\/order-tracking/);
    await expect(page.locator('[data-testid="order-status"]')).toBeVisible();
  });
});