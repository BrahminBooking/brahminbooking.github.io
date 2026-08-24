import type { PanchangProvider, PanchangQuery, PanchangResult } from './types'

export class FixturePanchangProvider implements PanchangProvider {
  readonly id = 'development-fixture'

  async getDailyPanchang(query: PanchangQuery): Promise<PanchangResult> {
    const calculatedAt = new Date().toISOString()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    return {
      status: 'fixture',
      localDate: query.localDate,
      location: query.location,
      tithi: 'Shukla Dwadashi', tithiEnd: '14:18', nakshatra: 'Purva Ashadha', nakshatraEnd: '18:42',
      yoga: 'Saubhagya', yogaEnd: '20:06', karana: 'Bava', karanaEnd: '14:18', vaar: 'Somavara',
      sunrise: '06:09', sunset: '18:36', moonrise: '16:02', moonset: '03:41 next day',
      rahuKaal: '07:43–09:17', yamaganda: '10:51–12:23', gulikaKaal: '14:00–15:34',
      abhijitMuhurat: '12:00–12:50', brahmaMuhurat: '04:37–05:23', durMuhurat: '12:50–13:40',
      lunarMonth: 'Shravana (Amanta)', purnimantaMonth: 'Bhadrapada', paksha: 'Shukla Paksha',
      vikramSamvat: '2083', shakaSamvat: '1948', suryaRashi: 'Simha', chandraRashi: 'Dhanu',
      festivals: [], vrats: [],
      source: {
        name: 'BrahminBooking development fixture', calculationVersion: 'fixture-v0.1', calculatedAt, expiresAt,
        conventions: ['Illustrative values only', 'No astronomical calculation performed', 'Not approved for religious decisions'],
        editorialReviewVersion: 'unreviewed-fixture-v0',
      },
    }
  }
}

export const panchangProvider: PanchangProvider = new FixturePanchangProvider()
