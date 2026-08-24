import { expect, test } from '@playwright/test'

const routes = ['/', '/panchang/', '/pujas/', '/pujas/griha-pravesh/', '/festivals/', '/festivals/diwali/', '/book/', '/booking/requested/', '/auth/', '/register-as-brahmin/']

test('all V0 routes are reachable from the static export', async ({ page }) => {
  for (const route of routes) {
    const response = await page.goto(route)
    expect(response?.ok(), route).toBe(true)
    await expect(page.locator('body')).not.toBeEmpty()
  }
})

test('guest can submit a booking request without authentication', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /Explore today.s Panchang/i }).click()
  await expect(page).toHaveURL(/\/panchang\/$/)
  await page.getByRole('link', { name: 'Pujas', exact: true }).first().click()
  await page.getByRole('link', { name: /Griha Pravesh/ }).first().click()
  await page.getByRole('link', { name: /Request a Purohit/ }).click()
  await expect(page.getByLabel('Ceremony or service')).toHaveValue('griha-pravesh')
  await page.getByLabel('My date is flexible').check()
  await page.getByLabel('City or town').fill('Bengaluru')
  await page.getByLabel('Locality or area').fill('Jayanagar')
  await page.getByLabel('Preferred ritual language').selectOption('kannada')
  await page.getByLabel('Your name').fill('Test Devotee')
  await page.getByLabel('Mobile number').fill('+91 90000 00000')
  await page.getByLabel(/I consent to BrahminBooking/).check()
  await page.getByRole('button', { name: /Request booking/ }).click()
  await expect(page).toHaveURL(/\/booking\/requested\/$/)
  await expect(page.getByText(/BB-DEMO-/)).toBeVisible()
  await expect(page.getByText(/not yet a confirmed booking/i)).toBeVisible()
})

test('mobile navigation and keyboard focus remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const mobileNav = page.getByRole('navigation', { name: 'Mobile navigation' })
  await expect(mobileNav).toBeVisible()
  await expect(mobileNav.getByRole('link', { name: 'Today' })).toBeVisible()
  await expect(mobileNav.getByRole('link', { name: 'Book', exact: true })).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(page.locator(':focus')).toBeVisible()
})

test('language choice translates the site and persists across public journeys', async ({ page }) => {
  await page.goto('/')
  const language = page.locator('.consumer-language select')

  await language.selectOption('hi')
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi')
  await expect(page.getByRole('heading', { name: /पवित्र संस्कार/ })).toBeVisible()

  await page.goto('/book/')
  await expect(page.getByRole('heading', { name: /बातचीत शुरू करें/ })).toBeVisible()
  await expect(page.getByLabel(/शहर या कस्बा/)).toBeVisible()

  await page.locator('.consumer-language select').selectOption('gu')
  await expect(page.getByRole('heading', { name: /વાતચીત શરૂ કરો/ })).toBeVisible()

  await page.locator('.consumer-language select').selectOption('kn')
  await expect(page.getByRole('heading', { name: /ಸಂಭಾಷಣೆಯನ್ನು ಆರಂಭಿಸಿ/ })).toBeVisible()

  await page.goto('/register-as-brahmin/')
  await expect(page.getByRole('heading', { name: /ಪುರೋಹಿತ \/ ಬ್ರಾಹ್ಮಣರಾಗಿ ನೋಂದಾಯಿಸಿ/ })).toBeVisible()
})

test('reduced motion keeps essential content visible without transforms', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const hero = page.locator('.editorial-hero__copy')
  await expect(hero).toBeVisible()
  expect(await hero.evaluate((element) => getComputedStyle(element).transform)).toBe('none')
})

for (const width of [360, 390, 768, 1024, 1440]) {
  test(`homepage has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 700 ? 800 : 900 })
    await page.goto('/')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(1)
    await expect(page.getByRole('link', { name: /Find a Purohit|Book a Puja/ }).first()).toBeVisible()
  })
}

test('Panchang fixtures are impossible to mistake for live guidance', async ({ page }) => {
  await page.goto('/panchang/')
  await expect(page.getByText('Development fixture', { exact: true })).toBeVisible()
  await expect(page.getByText(/Not for religious decisions/)).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
})
