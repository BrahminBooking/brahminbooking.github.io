import { describe, expect, it } from 'vitest'
import { browserLocation, fallbackLocation, knownLocations } from './locations'

describe('location resolution primitives', () => {
  it('provides an honest, changeable fallback', () => {
    expect(fallbackLocation.source).toBe('fallback')
    expect(knownLocations.some((item) => item.id === fallbackLocation.id)).toBe(true)
  })
  it('keeps browser coordinates session-scoped in the model', () => {
    const location = browserLocation(12.97, 77.59)
    expect(location.source).toBe('browser')
    expect(location.id).toBe('current-location')
  })
})
