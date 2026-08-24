import { describe, expect, it } from 'vitest'
import { panchangFreshness } from './freshness'
import { FixturePanchangProvider } from './fixture-provider'
import { fallbackLocation } from '../location/locations'

describe('Panchang freshness', () => {
  it('never describes fixture data as fresh', async () => {
    const result = await new FixturePanchangProvider().getDailyPanchang({ localDate: '2026-08-24', location: fallbackLocation, locale: 'en' })
    expect(panchangFreshness(result)).toBe('fixture')
  })
})
