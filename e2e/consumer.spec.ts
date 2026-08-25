import { expect, test } from '@playwright/test'

const routes = ['/', '/panchang/', '/pujas/', '/pujas/griha-pravesh/', '/festivals/', '/festivals/diwali/', '/book/', '/booking/requested/', '/register-as-brahmin/', '/privacy/']

test('all V0 routes are reachable from the static export', async ({ page }) => {
  for (const route of routes) {
    const response = await page.goto(route)
    expect(response?.ok(), route).toBe(true)
    await expect(page.locator('body')).not.toBeEmpty()
  }
})

test('guest can submit a booking request without authentication', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /View full Panchang/i }).click()
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
  await expect(mobileNav).not.toBeVisible()
  await page.getByRole('button', { name: 'Menu' }).click()
  await expect(mobileNav).toBeVisible()
  await expect(mobileNav.getByRole('link', { name: 'Today' })).toBeVisible()
  await expect(mobileNav.getByRole('link', { name: 'Book a Purohit', exact: true })).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(page.locator(':focus')).toBeVisible()
})

test('place search works in booking and registration without restricting free-form entries', async ({ page }) => {
  await page.goto('/book/')
  const bookingCity = page.getByLabel('City or town')
  const bookingList = await bookingCity.getAttribute('list')
  expect(bookingList).toBeTruthy()
  await expect(page.locator(`#${bookingList} option[value="Bengaluru"]`)).toHaveCount(1)
  await bookingCity.fill('A village outside the catalogue')
  await expect(bookingCity).toHaveValue('A village outside the catalogue')

  await page.goto('/register-as-brahmin/')
  await page.getByLabel('Full name').fill('Acharya Test Sharma')
  await page.getByLabel('Mobile number').fill('+91 90000 00000')
  await page.getByRole('button', { name: 'Continue' }).click()
  const registrationCity = page.getByLabel('City / town / village')
  await registrationCity.fill('Bengaluru')
  await expect(page.locator('input[name="district"]')).toHaveValue('Bengaluru Urban')
  await expect(page.locator('input[name="state"]')).toHaveValue('Karnataka')
})

test('language choice translates the site and persists across public journeys', async ({ page }) => {
  await page.goto('/')
  const language = page.locator('.consumer-language select')

  await language.selectOption('hi')
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi')
  await expect(page.getByRole('heading', { name: /आज से शुभ आरंभ करें/ })).toBeVisible()

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

test('all enabled Indian languages are selectable and RTL locales set document direction', async ({ page }) => {
  await page.goto('/')
  const language = page.locator('.consumer-language select')
  await expect(language.locator('option')).toHaveCount(22)

  await language.selectOption('sd')
  await expect(page.locator('html')).toHaveAttribute('lang', 'sd')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')

  await language.selectOption('bn')
  await expect(page.locator('html')).toHaveAttribute('lang', 'bn')
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
})

test('reduced motion keeps essential content visible without transforms', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const hero = page.locator('.panchang-hero__copy')
  await expect(hero).toBeVisible()
  expect(await hero.evaluate((element) => getComputedStyle(element).transform)).toBe('none')
})

for (const width of [360, 390, 768, 1024, 1440]) {
  test(`homepage has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 700 ? 800 : 900 })
    await page.goto('/')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(1)
    await expect(page.getByRole('link', { name: /Book a Purohit|Book a Puja/ }).first()).toBeVisible()
  })
}

test('homepage Panchang empty state and booking CTA are usable', async ({ page }) => {
  await page.goto('/')
  const primaryCta = page.getByRole('link', { name: 'Book a Purohit', exact: true }).first()
  await expect(primaryCta).toHaveAttribute('href', '/book/')

  await expect(page.getByRole('heading', { name: 'Panchang is unavailable' })).toBeVisible()
  await expect(page.getByText(/never replace a failed result with fabricated data/)).toBeVisible()
})

test('Panchang never exposes fixture guidance in production UI', async ({ page }) => {
  await page.goto('/panchang/')
  await expect(page.getByRole('heading', { name: 'Panchang is unavailable' })).toBeVisible()
  await expect(page.getByText('Development fixture', { exact: true })).toHaveCount(0)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
})

test('the static export includes the production 404 page used by GitHub Pages', async ({ page }) => {
  const response = await page.goto('/404.html')
  expect(response?.ok()).toBe(true)
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
})

for (const route of ['/', '/book/', '/register-as-brahmin/', '/pujas/', '/festivals/', '/panchang/']) {
  test(`${route} has no mobile overflow`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto(route)
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
  })
}
