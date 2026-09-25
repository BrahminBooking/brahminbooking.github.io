import { expect, test } from '@playwright/test'

test('anonymous registration remains open; account screen has Google and password options', async ({ page }) => {
  await page.goto('/register-as-brahmin/')
  await expect(page.getByLabel('Full name')).toBeVisible()
  await page.goto('/auth/')
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible()
  await expect(page.getByLabel('Password', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Register as a Purohit without signing in.' })).toHaveAttribute('href', '/register-as-brahmin/')
})

test('account screen is readable on mobile and internal review fails closed', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/auth/')
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.goto('/admin/')
  await expect(page.locator('main [role="alert"]')).toContainText('Verified staff access is required')
  await expect(page.getByRole('button', { name: 'Record decision' })).toHaveCount(0)
})
