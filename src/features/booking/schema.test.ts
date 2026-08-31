import { describe, expect, it } from 'vitest'
import { bookingDraftSchema, bookingRequestSchema } from './schema'

const valid = { serviceSlug: 'griha-pravesh', serviceOther: '', preferredDate: '2026-09-10', dateFlexible: false, timeWindow: 'morning', city: 'Bengaluru', area: 'Jayanagar', serviceMode: 'home', language: 'kannada', tradition: '', samagriAssistance: 'all', attendeeCount: '12', fullName: 'Test Devotee', phone: '+91 90000 00000', email: '', whatsapp: true, notes: '', contactConsent: true, website: '' }

describe('booking request schema', () => {
  it('accepts the minimum guest request', () => expect(bookingRequestSchema.safeParse(valid).success).toBe(true))
  it('requires a date or flexibility', () => expect(bookingRequestSchema.safeParse({ ...valid, preferredDate: '', dateFlexible: false }).success).toBe(false))
  it('rejects a bot honeypot', () => expect(bookingRequestSchema.safeParse({ ...valid, website: 'spam' }).success).toBe(false))
  it('requires details for another service', () => expect(bookingRequestSchema.safeParse({ ...valid, serviceSlug: 'other', serviceOther: '' }).success).toBe(false))
  it('allows planning fields in a local draft', () => expect(bookingDraftSchema.safeParse({ serviceSlug: 'griha-pravesh', city: 'Bengaluru', dateFlexible: true }).success).toBe(true))
  it('does not permit contact details in a local draft', () => expect(bookingDraftSchema.safeParse({ serviceSlug: 'griha-pravesh', phone: '+91 90000 00000' }).success).toBe(false))
})
