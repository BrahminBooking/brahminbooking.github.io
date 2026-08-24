import { describe, expect, it } from 'vitest'
import { sanitizeAnalyticsProperties } from './analytics'

describe('analytics privacy', () => {
  it('keeps only coarse allowlisted properties', () => {
    expect(sanitizeAnalyticsProperties({ route: '/book/', service_category: 'griha-pravesh', phone: '9999999999', notes: 'private', latitude: 12.9, arbitrary: 'x' })).toEqual({ route: '/book/', service_category: 'griha-pravesh' })
  })
})
