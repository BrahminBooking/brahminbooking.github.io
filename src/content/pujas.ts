import type { PujaGuide } from './types'

export const pujaGuides: PujaGuide[] = [
  {
    slug: 'griha-pravesh', name: 'Griha Pravesh', sanskritName: 'गृह प्रवेश',
    summary: 'A family ceremony marking entry into a new home with prayer, purification and gratitude.',
    purpose: 'Families commonly seek blessings for harmony, wellbeing and a considered beginning in the new space.',
    duration: 'Typically 2–4 hours', setting: 'At the new home', when: 'The date and muhurta should be confirmed for the family, place and tradition.',
    preparations: ['A clean, accessible puja area', 'Family gotra and sankalpa details if known', 'Water, flowers, fruit and common puja vessels', 'Building or society access arrangements'],
    confirmWithPurohit: ['Whether Vastu Shanti or Havan is included', 'The final samagri list and who arranges it', 'Regional and family-specific customs', 'Travel, duration and dakshina expectations'],
    deities: ['Family deities as applicable', 'Vastu Purusha'], regions: ['Pan-India with regional variation'], traditions: ['Confirm family sampradaya'], panchangBasis: 'Family-specific muhurta based on location and tradition; no universal date asserted.', relatedPujas: ['Ganesh Puja', 'Vastu Shanti', 'Havan'],
    reviewState: 'approved', reviewedBy: 'BrahminBooking editorial review', lastReviewedAt: '2026-08-24',
    sources: [{ label: 'Pilot editorial framework', note: 'General preparation guidance; the officiating Purohit confirms the final vidhi.' }],
  },
  {
    slug: 'satyanarayan-puja', name: 'Satyanarayan Puja', sanskritName: 'सत्यनारायण पूजा',
    summary: 'A widely observed worship of Bhagwan Vishnu, often undertaken in gratitude or around a family milestone.',
    purpose: 'The puja centres devotion, truthfulness and gratitude, and commonly includes katha and prasad.',
    duration: 'Typically 2–3 hours', setting: 'Home or temple', when: 'Often observed on a full-moon day or family-selected occasion; confirm locally.',
    preparations: ['A quiet, clean puja space', 'Family names and sankalpa details', 'Common offerings and prasad ingredients', 'Seating for participants and katha'],
    confirmWithPurohit: ['Local katha and vidhi tradition', 'Prasad preparation', 'Samagri ownership', 'Expected participant roles'],
    deities: ['Satyanarayan / Vishnu'], regions: ['Pan-India with regional variation'], traditions: ['Multiple Hindu traditions'], panchangBasis: 'Often associated with Purnima, but family occasion and local convention may differ.', relatedPujas: ['Ganesh Puja'],
    reviewState: 'approved', reviewedBy: 'BrahminBooking editorial review', lastReviewedAt: '2026-08-24',
    sources: [{ label: 'Pilot editorial framework', note: 'General orientation only; practices vary by region and sampradaya.' }],
  },
  {
    slug: 'vivah-sanskar', name: 'Vivah Sanskar', sanskritName: 'विवाह संस्कार',
    summary: 'Hindu wedding rites conducted according to family, regional and sampradaya traditions.',
    purpose: 'The ceremony solemnises a shared household and family responsibilities through sacred vows and witnessed rites.',
    duration: 'Custom; often several hours', setting: 'Home, temple or venue', when: 'A family-specific muhurta and ceremony sequence must be established with the Purohit.',
    preparations: ['Both families’ tradition and gotra details', 'Venue fire and access permissions', 'A ceremony timeline shared with vendors', 'Ritual materials confirmed well in advance'],
    confirmWithPurohit: ['Exact ceremony sequence', 'Muhurta and location timezone', 'Havan arrangements and safety', 'Language and explanations for the couple'],
    deities: ['Family deities as applicable', 'Agni'], regions: ['Pan-India with substantial regional variation'], traditions: ['Family and regional tradition'], panchangBasis: 'Requires a couple- and location-specific muhurta; static guidance cannot determine it.', relatedPujas: ['Ganesh Puja', 'Havan'],
    reviewState: 'approved', reviewedBy: 'BrahminBooking editorial review', lastReviewedAt: '2026-08-24',
    sources: [{ label: 'Pilot editorial framework', note: 'Wedding traditions vary materially; this guide is deliberately non-prescriptive.' }],
  },
  {
    slug: 'ganesh-puja', name: 'Ganesh Puja', sanskritName: 'गणेश पूजा',
    summary: 'Worship of Bhagwan Ganesha, commonly performed at the beginning of an undertaking or ceremony.',
    purpose: 'A devotional beginning seeking clarity and the removal of obstacles.',
    duration: 'Typically 1–2 hours', setting: 'Home, office or temple', when: 'Can accompany a new beginning; timing and sequence depend on context.',
    preparations: ['Clean puja surface', 'Flowers, fruit and common offerings', 'Purpose and names for sankalpa', 'Any venue restrictions'],
    confirmWithPurohit: ['Whether Havan is required', 'Tradition-specific offerings', 'Samagri list', 'Duration and language'],
    deities: ['Ganesha'], regions: ['Pan-India'], traditions: ['Multiple Hindu traditions'], panchangBasis: 'Commonly performed at beginnings; the ritual context determines timing.', relatedPujas: ['Griha Pravesh', 'Vivah Sanskar'],
    reviewState: 'approved', reviewedBy: 'BrahminBooking editorial review', lastReviewedAt: '2026-08-24',
    sources: [{ label: 'Pilot editorial framework', note: 'Preparation summary reviewed for a cautious, general consumer introduction.' }],
  },
]

export const approvedPujaGuides = pujaGuides.filter((guide) => guide.reviewState === 'approved')

export function getApprovedPuja(slug: string) {
  return approvedPujaGuides.find((guide) => guide.slug === slug)
}
