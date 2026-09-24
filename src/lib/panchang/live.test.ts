import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getLivePanchang, isFreshPanchang } from './live'
import { knownLocations } from '../location/locations'
import { apiRequest } from '../api/client'

vi.mock('../api/client', () => ({ apiRequest: vi.fn() }))
function snapshot() {
  const now = Date.now()
  const stamp = (offset: number) => new Date(now + offset).toISOString()
  const segment = { index: 1, name: 'Pratipada', active_from: stamp(-60_000), ends_at: stamp(60_000) }
  return {
    civil_date: '2026-09-24', generated_at: stamp(0), expires_at: stamp(60_000), source: 'KRIPA' as const, source_url: 'https://github.com/gopalmani/kripa' as const,
    current: { tithi: segment, nakshatra: segment, yoga: segment, karana: segment, paksha: 'Shukla' as const },
    day: { ...knownLocations[0], date: '2026-09-24', profile: 'lahiri_upper_limb_v1' as const, calculation_version: 'kripa-panchang-lahiri-v1' as const, ephemeris_version: '2.10.03', review_status: 'astronomical_preview' as const, sunrise: stamp(-60_000), sunset: stamp(120_000), next_sunrise: stamp(240_000), moonrise: null, moonset: null, vaar: 'Guruvara', rahu_kalam: { start: stamp(0), end: stamp(60_000) }, yamaganda: { start: stamp(0), end: stamp(60_000) }, gulika: { start: stamp(0), end: stamp(60_000) } },
  }
}
describe('live Panchang cache', () => {
  beforeEach(() => { vi.mocked(apiRequest).mockReset() })
  it('expires exactly at a transition and rejects future snapshots', () => {
    const value = snapshot()
    expect(isFreshPanchang(value, Date.parse(value.expires_at) - 1)).toBe(true)
    expect(isFreshPanchang(value, Date.parse(value.expires_at))).toBe(false)
    expect(isFreshPanchang(value, Date.parse(value.generated_at) - 60_000)).toBe(false)
  })
  it('reuses fresh snapshots without fetching again', async () => {
    vi.mocked(apiRequest).mockResolvedValue(snapshot())
    await getLivePanchang(knownLocations[0])
    await getLivePanchang(knownLocations[0])
    expect(apiRequest).toHaveBeenCalledTimes(1)
  })
  it('rejects another location and unreviewed contract changes', async () => {
    vi.mocked(apiRequest).mockResolvedValue(snapshot())
    await expect(getLivePanchang(knownLocations[1])).rejects.toThrow('invalidPanchang')
    vi.mocked(apiRequest).mockResolvedValue({ ...snapshot(), source: 'Fixture' })
    await expect(getLivePanchang(knownLocations[1])).rejects.toThrow()
  })
})
