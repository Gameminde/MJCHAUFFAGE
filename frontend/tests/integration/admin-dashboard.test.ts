import { test, expect } from '@playwright/test';

test.describe('MJ CHAUFFAGE Admin Dashboard', () => {
  test('should load admin login page', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/login');

    // Check login form elements
    await expect(page.locator('text=Administration MJ CHAUFFAGE')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Check test credentials are displayed
    await expect(page.locator('text=admin@mjchauffage.com')).toBeVisible();
    await expect(page.locator('text=admin123')).toBeVisible();
  });

  test('should redirect unauthenticated users from admin dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/dashboard');

    // Should redirect to login page
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('should access admin dashboard after login', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/login');

    // Fill login form with test credentials
    await page.fill('input[type="email"]', 'admin@mjchauffage.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for navigation and check if redirected to dashboard
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });

    // Check dashboard elements
    await expect(page.locator('text=Dashboard Overview')).toBeVisible();
    await expect(page.locator('text=Total Orders')).toBeVisible();
    await expect(page.locator('text=Total Revenue')).toBeVisible();
  });

  test('should navigate between admin sections', async ({ page }) => {
    // First login
    await page.goto('http://localhost:3000/admin/login');
    await page.fill('input[type="email"]', 'admin@mjchauffage.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/dashboard/);

    // Test navigation to products
    const productsLink = page.locator('button').filter({ hasText: 'Products' });
    if (await productsLink.isVisible()) {
      await productsLink.click();
      await expect(page).toHaveURL(/\/admin\/products/);
    }

    // Test navigation to orders
    const ordersLink = page.locator('button').filter({ hasText: 'Orders' });
    if (await ordersLink.isVisible()) {
      await ordersLink.click();
      await expect(page).toHaveURL(/\/admin\/orders/);
    }
  });

  test('should logout from admin dashboard', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/admin/login');
    await page.fill('input[type="email"]', 'admin@mjchauffage.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/dashboard/);

    // Click logout
    const logoutButton = page.locator('button').filter({ hasText: 'Logout' });
    await logoutButton.click();

    // Should redirect to login page
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
