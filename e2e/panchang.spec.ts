import { expect, test } from '@playwright/test'

test('live preview displays provenance and refreshes at a tithi boundary', async ({ page }) => {
  const now = new Date('2026-09-24T08:00:00Z')
  await page.clock.install({ time: now })
  let calls = 0
  await page.route('**/mock-api/v1/panchang/today', async (route) => {
    calls++
    const base = now.getTime() + (calls > 1 ? 60_000 : 0)
    const stamp = (offset: number) => new Date(base + offset).toISOString()
    const limb = { index: calls > 1 ? 14 : 13, name: calls > 1 ? 'Shukla Chaturdashi' : 'Shukla Trayodashi', active_from: stamp(-60_000), ends_at: stamp(60_000) }
    await route.fulfill({ json: {
      civil_date: '2026-09-24', generated_at: stamp(0), expires_at: stamp(60_000), source: 'KRIPA', source_url: 'https://github.com/gopalmani/kripa',
      current: { tithi: limb, nakshatra: { ...limb, name: 'Shatabhisha' }, yoga: { ...limb, name: 'Dhriti' }, karana: { ...limb, name: 'Taitila' }, paksha: 'Shukla' },
      day: { date: '2026-09-24', timezone: 'Asia/Kolkata', latitude: 12.9716, longitude: 77.5946, profile: 'lahiri_upper_limb_v1', calculation_version: 'kripa-panchang-lahiri-v1', ephemeris_version: '2.10.03', review_status: 'astronomical_preview', sunrise: stamp(-5 * 3600_000), sunset: stamp(6 * 3600_000), next_sunrise: stamp(19 * 3600_000), moonrise: null, moonset: null, vaar: 'Guruvara', rahu_kalam: { start: stamp(0), end: stamp(60_000) }, yamaganda: { start: stamp(0), end: stamp(60_000) }, gulika: { start: stamp(0), end: stamp(60_000) } },
    } })
  })
  await page.setViewportSize({ width: 320, height: 740 })
  await page.goto('/panchang/')
  await page.getByLabel('Choose a city').selectOption('bengaluru')
  await expect(page.getByText('Shukla Trayodashi', { exact: false })).toBeVisible()
  await expect(page.getByText(/Religious review pending/)).toBeVisible()
  await expect(page.getByRole('link', { name: /Source: KRIPA/ })).toHaveAttribute('href', 'https://github.com/gopalmani/kripa')
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false)
  await page.clock.fastForward(61_000)
  await expect(page.getByText('Shukla Chaturdashi', { exact: false })).toBeVisible()
  await expect(page.getByText('Shukla Trayodashi', { exact: false })).toHaveCount(0)
  expect(calls).toBe(2)
})

test('Panchang asks for a city and preserves the guest booking journey on provider failure', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await page.goto('/panchang/')
  await expect(page.getByLabel('Choose a city')).toHaveValue('')
  await page.getByLabel('Choose a city').selectOption('bengaluru')
  await expect(page.getByRole('heading', { name: 'Panchang is unavailable' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Book a Purohit/ }).last()).toHaveAttribute('href', '/book/')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  expect(overflow).toBe(false)
})
