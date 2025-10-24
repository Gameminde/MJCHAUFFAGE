import { test, expect } from '@playwright/test'

const apiBasePattern = '**/api/v1'

test.describe('Authentification', () => {
  test('Redirige un utilisateur non authentifié vers /login', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL('**/login')
    await expect(page.getByText('Connexion')).toBeVisible()
  })

  test('Connexion réussie redirige vers le Dashboard et affiche l’utilisateur', async ({ page }) => {
    // Mock API responses
    await page.route(`${apiBasePattern}/auth/login`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: '1', email: 'admin@mjchauffage.com', role: 'ADMIN' },
          tokens: { accessToken: 'token123', refreshToken: 'refresh123' },
        }),
      })
    })

    await page.route(`${apiBasePattern}/auth/me`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id: '1', email: 'admin@mjchauffage.com', role: 'ADMIN' } }),
      })
    })

    await page.goto('/login')
    await page.fill('#email', 'admin@mjchauffage.com')
    await page.fill('#password', 'password123')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/dashboard')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText('admin@mjchauffage.com')).toBeVisible()
  })

  test('Déconnexion redirige vers /login et nettoie les cookies', async ({ page, context }) => {
    // Préparer un utilisateur authentifié via cookies
    await context.addCookies([
      { name: 'accessToken', value: 'token123', domain: 'localhost', path: '/' },
      { name: 'refreshToken', value: 'refresh123', domain: 'localhost', path: '/' },
    ])

    // Mock du current user et du logout
    await page.route(`${apiBasePattern}/auth/me`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id: '1', email: 'admin@mjchauffage.com', role: 'ADMIN' } }),
      })
    })

    await page.route(`${apiBasePattern}/auth/logout`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    })

    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText('admin@mjchauffage.com')).toBeVisible()

    // Click sur le bouton de déconnexion dans la Sidebar
    await page.getByText('Déconnexion').click()
    await page.waitForURL('**/login')
    await expect(page.getByText('Connexion')).toBeVisible()

    const cookies = await context.cookies()
    const hasAccess = cookies.some((c) => c.name === 'accessToken')
    expect(hasAccess).toBeFalsy()
  })
})