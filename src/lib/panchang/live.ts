import { z } from 'zod'
import { apiRequest } from '../api/client'
import type { PanchangLocation } from './types'

const timestamp = z.string().datetime({ offset: true })
const segment = z.object({ index: z.number().int().positive(), name: z.string().min(1), active_from: timestamp, ends_at: timestamp })
const windowSchema = z.object({ start: timestamp, end: timestamp })
export const livePanchangSchema = z.object({
  civil_date: z.string(), generated_at: timestamp, expires_at: timestamp,
  source: z.literal('KRIPA'), source_url: z.literal('https://github.com/gopalmani/kripa'),
  current: z.object({ tithi: segment, nakshatra: segment, yoga: segment, karana: segment, paksha: z.enum(['Shukla', 'Krishna']) }),
  day: z.object({
    date: z.string(), timezone: z.string(), latitude: z.number(), longitude: z.number(),
    profile: z.literal('lahiri_upper_limb_v1'), calculation_version: z.literal('kripa-panchang-lahiri-v1'),
    ephemeris_version: z.string(), review_status: z.literal('astronomical_preview'),
    sunrise: timestamp, sunset: timestamp, next_sunrise: timestamp,
    moonrise: timestamp.nullable(), moonset: timestamp.nullable(), vaar: z.string(),
    rahu_kalam: windowSchema, yamaganda: windowSchema, gulika: windowSchema,
  }),
})
export type LivePanchang = z.infer<typeof livePanchangSchema>
const cache = new Map<string, LivePanchang>()
export function isFreshPanchang(value: LivePanchang, now = Date.now()) {
  return Date.parse(value.generated_at) <= now + 30_000 && now < Date.parse(value.expires_at)
    && Object.values(value.current).filter((v) => typeof v !== 'string').every((v) => Date.parse(v.active_from) <= now && now < Date.parse(v.ends_at))
}
export async function getLivePanchang(location: PanchangLocation): Promise<LivePanchang> {
  const { latitude, longitude, timezone } = location
  const key = JSON.stringify([latitude, longitude, timezone])
  const previous = cache.get(key)
  if (previous && isFreshPanchang(previous)) return previous
  const value = livePanchangSchema.parse(await apiRequest<unknown>('/v1/panchang/today', { latitude, longitude, timezone }))
  if (!isFreshPanchang(value) || value.day.latitude !== latitude || value.day.longitude !== longitude || value.day.timezone !== timezone) throw new Error('invalidPanchang')
  if (cache.size >= 32) cache.clear()
  cache.set(key, value)
  return value
}
