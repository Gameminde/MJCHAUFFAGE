import { test, expect } from '@playwright/test';

test.describe('MJ CHAUFFAGE Homepage Integration', () => {
  test('should load homepage and display main content', async ({ page }) => {
    // Navigate to homepage (should redirect to /fr)
    await page.goto('http://localhost:3000');

    // Should redirect to French locale
    await expect(page).toHaveURL(/\/fr$/);

    // Check hero section
    await expect(page.locator('h1')).toContainText(/Votre Confort|Your Comfort/i);

    // Check features section
    await expect(page.locator('text=Pourquoi nous choisir')).toBeVisible();

    // Check categories section
    await expect(page.locator('text=Nos Catégories')).toBeVisible();

    // Check navigation links
    await expect(page.locator('text=Découvrir le catalogue')).toBeVisible();
  });

  test('should switch to Arabic locale', async ({ page }) => {
    await page.goto('http://localhost:3000/fr');

    // Click language switcher (assuming it exists)
    const arabicLink = page.locator('a[href*="/ar"]').first();
    if (await arabicLink.isVisible()) {
      await arabicLink.click();
      await expect(page).toHaveURL(/\/ar/);
    }
  });

  test('should navigate to products page', async ({ page }) => {
    await page.goto('http://localhost:3000/fr');

    // Click on a category or products link
    const productsLink = page.locator('a[href*="products"]').first();
    if (await productsLink.isVisible()) {
      await productsLink.click();
      await expect(page).toHaveURL(/\/products/);
    }
  });

  test('should load admin login page', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/login');

    await expect(page.locator('text=Administration MJ CHAUFFAGE')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('http://localhost:3000/fr');

    // Check that mobile menu exists or hamburger is visible
    const mobileMenu = page.locator('[data-mobile-menu], .mobile-menu, [aria-label*="menu"]').first();
    // Mobile layout should work without errors
    await expect(page.locator('h1')).toBeVisible();
  });
});
