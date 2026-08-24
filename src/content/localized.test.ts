import { describe, expect, it } from 'vitest'
import { approvedFestivalGuides } from './festivals'
import { localizedFestivals, localizedPujas } from './localized'
import { approvedPujaGuides } from './pujas'

describe('localized reviewed content', () => {
  it.each(['hi', 'gu', 'kn'] as const)('%s covers every approved guide', (locale) => {
    expect(Object.keys(localizedPujas[locale]).sort()).toEqual(approvedPujaGuides.map(({ slug }) => slug).sort())
    expect(Object.keys(localizedFestivals[locale]).sort()).toEqual(approvedFestivalGuides.map(({ slug }) => slug).sort())
  })

  it.each(['hi', 'gu', 'kn'] as const)('%s preserves preparation and observance list lengths', (locale) => {
    for (const guide of approvedPujaGuides) {
      expect(localizedPujas[locale][guide.slug].preparations).toHaveLength(guide.preparations.length)
      expect(localizedPujas[locale][guide.slug].confirmWithPurohit).toHaveLength(guide.confirmWithPurohit.length)
    }
    for (const guide of approvedFestivalGuides) {
      expect(localizedFestivals[locale][guide.slug].observances).toHaveLength(guide.observances.length)
    }
  })
})
