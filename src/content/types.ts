export type ReviewState = 'draft' | 'under_review' | 'approved' | 'archived'

export type EditorialSource = {
  label: string
  note: string
}

export type PujaGuide = {
  slug: string
  name: string
  sanskritName?: string
  summary: string
  purpose: string
  duration: string
  setting: string
  when: string
  preparations: string[]
  confirmWithPurohit: string[]
  deities: string[]
  regions: string[]
  traditions: string[]
  panchangBasis: string
  relatedPujas: string[]
  reviewState: ReviewState
  reviewedBy: string
  lastReviewedAt: string
  sources: EditorialSource[]
}

export type FestivalGuide = {
  slug: string
  name: string
  dateLabel: string
  sanskritName: string
  summary: string
  significance: string
  observances: string[]
  regionalNote: string
  regions: string[]
  traditions: string[]
  panchangBasis: string
  relatedPujas: string[]
  timingsGuidance: string
  reviewState: ReviewState
  reviewedBy: string
  lastReviewedAt: string
  sources: EditorialSource[]
}
