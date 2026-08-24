import type { FestivalGuide } from './types'

export const festivalGuides: FestivalGuide[] = [
  {
    slug: 'ganesh-chaturthi', name: 'Ganesh Chaturthi', sanskritName: 'गणेश चतुर्थी', dateLabel: 'Date varies by location and calendar convention',
    summary: 'A celebration of Bhagwan Ganesha marked by worship, community gathering and devotional offerings.',
    significance: 'The observance honours wisdom, auspicious beginnings and the removal of obstacles.',
    observances: ['Ganesh sthapana and puja', 'Offerings such as modak according to family practice', 'Aarti and community participation', 'Visarjan according to the chosen observance period'],
    regionalNote: 'Duration, tithi interpretation and visarjan practice vary. Confirm the local date and vidhi with a trusted calendar source and Purohit.',
    regions: ['Observed widely; especially prominent in Maharashtra and parts of western/southern India'], traditions: ['Regional and family traditions'], panchangBasis: 'Bhadrapada Shukla Chaturthi under the applicable regional calendar.', relatedPujas: ['Ganesh Puja'], timingsGuidance: 'Use a reviewed local Panchang for the chosen location and tradition.',
    reviewState: 'approved', reviewedBy: 'BrahminBooking editorial review', lastReviewedAt: '2026-08-24',
    sources: [{ label: 'Pilot editorial framework', note: 'General cultural orientation; no date is asserted by this static guide.' }],
  },
  {
    slug: 'navaratri', name: 'Navaratri', sanskritName: 'नवरात्रि', dateLabel: 'Nine-night observance; dates vary by tradition and location',
    summary: 'Nine nights of devotion to the Divine Feminine, expressed through distinct regional and family traditions.',
    significance: 'Navaratri honours forms of Devi and is observed through prayer, fasting, music, dance and community worship.',
    observances: ['Daily worship or recitation', 'Fasting according to health and family custom', 'Garba, dandiya or regional community traditions', 'Kanya pujan or other family observances where customary'],
    regionalNote: 'Sharad and Chaitra Navaratri, daily deity associations, fasting practice and culminating observances vary considerably.',
    regions: ['Pan-India with distinct regional forms'], traditions: ['Shakta and other regional/family traditions'], panchangBasis: 'Typically follows a nine-night lunar-calendar observance; the specific Navaratri and day boundaries must be established locally.', relatedPujas: ['Devi Puja', 'Havan'], timingsGuidance: 'Confirm ghatasthapana and daily observance timings locally.',
    reviewState: 'approved', reviewedBy: 'BrahminBooking editorial review', lastReviewedAt: '2026-08-24',
    sources: [{ label: 'Pilot editorial framework', note: 'Intentionally broad to respect regional and sampradaya differences.' }],
  },
  {
    slug: 'diwali', name: 'Deepavali', sanskritName: 'दीपावली', dateLabel: 'Multi-day festival; dates and principal day vary regionally',
    summary: 'A festival of light observed through worship, family gathering, generosity and renewal.',
    significance: 'Meanings and associated narratives differ across regions and traditions, with light representing knowledge and hope.',
    observances: ['Cleaning and preparing the home', 'Lighting diyas safely', 'Family or temple worship', 'Sharing food and gifts'],
    regionalNote: 'The sequence, deities worshipped and calendar day used are not uniform across India. Confirm local practice.',
    regions: ['Pan-India and global Hindu communities'], traditions: ['Multiple regional, family and sampradaya traditions'], panchangBasis: 'A multi-day observance around Kartika Amavasya in many calendars, with regional differences.', relatedPujas: ['Lakshmi Puja', 'Ganesh Puja'], timingsGuidance: 'Confirm the applicable principal day and puja window for the location.',
    reviewState: 'approved', reviewedBy: 'BrahminBooking editorial review', lastReviewedAt: '2026-08-24',
    sources: [{ label: 'Pilot editorial framework', note: 'A non-exhaustive, plural description for discovery.' }],
  },
]

export const approvedFestivalGuides = festivalGuides.filter((guide) => guide.reviewState === 'approved')

export function getApprovedFestival(slug: string) {
  return approvedFestivalGuides.find((guide) => guide.slug === slug)
}
