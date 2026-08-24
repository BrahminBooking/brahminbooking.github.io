import { describe, expect, it } from 'vitest'
import { localDateForTimezone, shiftLocalDate } from './date'

describe('Panchang local dates', () => {
  it('resolves opposite local dates around UTC midnight', () => {
    const instant = new Date('2026-08-24T20:00:00Z')
    expect(localDateForTimezone(instant, 'Asia/Kolkata')).toBe('2026-08-25')
    expect(localDateForTimezone(instant, 'America/Los_Angeles')).toBe('2026-08-24')
  })
  it('navigates safely across month boundaries', () => {
    expect(shiftLocalDate('2026-08-31', 1)).toBe('2026-09-01')
    expect(shiftLocalDate('2026-03-01', -1)).toBe('2026-02-28')
  })
})
