import { describe, expect, it } from 'vitest'
import { approvedFestivalGuides } from './festivals'
import { approvedPujaGuides } from './pujas'

describe('public editorial content', () => {
  it('publishes only approved records with review and sources', () => {
    for (const entry of [...approvedFestivalGuides, ...approvedPujaGuides]) {
      expect(entry.reviewState).toBe('approved')
      expect(entry.reviewedBy).toBeTruthy()
      expect(entry.lastReviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(entry.sources.length).toBeGreaterThan(0)
      expect(entry.regions.length).toBeGreaterThan(0)
      expect(entry.traditions.length).toBeGreaterThan(0)
      expect(entry.panchangBasis).toBeTruthy()
    }
  })
})
