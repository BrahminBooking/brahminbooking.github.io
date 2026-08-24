import { describe, expect, it } from 'vitest'
import { fallbackLocation } from '../location/locations'
import { FixturePanchangProvider } from './fixture-provider'

describe('fixture Panchang provider', () => {
  it('preserves query context and cannot masquerade as live data', async () => {
    const result = await new FixturePanchangProvider().getDailyPanchang({ localDate: '2026-08-24', location: fallbackLocation, locale: 'en' })
    expect(result.status).toBe('fixture')
    expect(result.location.timezone).toBe('Asia/Kolkata')
    expect(result.source.conventions.join(' ')).toMatch(/Not approved/)
  })
})
