export type PanchangLocation = {
  id: string
  label: string
  region: string
  latitude: number
  longitude: number
  timezone: string
  source: 'manual' | 'browser' | 'fallback'
}

export type PanchangQuery = {
  localDate: string
  location: PanchangLocation
  locale: string
  tradition?: string
}

export type PanchangResult = {
  status: 'ready' | 'stale' | 'fixture'
  localDate: string
  location: PanchangLocation
  tithi: string
  tithiEnd: string
  nakshatra: string
  nakshatraEnd: string
  yoga: string
  yogaEnd: string
  karana: string
  karanaEnd: string
  vaar: string
  sunrise: string
  sunset: string
  moonrise: string
  moonset: string
  rahuKaal: string
  yamaganda: string
  gulikaKaal: string
  abhijitMuhurat: string
  brahmaMuhurat: string
  durMuhurat: string
  lunarMonth: string
  purnimantaMonth: string
  paksha: string
  vikramSamvat: string
  shakaSamvat: string
  suryaRashi: string
  chandraRashi: string
  festivals: string[]
  vrats: string[]
  source: {
    name: string
    calculationVersion: string
    url?: string
    calculatedAt: string
    expiresAt: string
    conventions: string[]
    editorialReviewVersion: string
  }
}

export interface PanchangProvider {
  readonly id: string
  getDailyPanchang(query: PanchangQuery): Promise<PanchangResult>
}
