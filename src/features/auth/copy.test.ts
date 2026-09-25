import { describe, expect, it } from 'vitest'
import { supportedLocales } from '@/i18n/locales'
import { authCopy } from './copy'
import { authNotices } from './notices'
import { safeNext } from '@/lib/firebase/client'

describe('auth catalogue and redirects', () => {
  it.each(supportedLocales)('%s has every reviewed label and privacy notice', (locale) => {
    const labels = authCopy(locale)
    expect(Object.keys(labels)).toEqual(Object.keys(authCopy('en')))
    for (const value of [...Object.values(labels), ...authNotices[locale]]) expect(value.trim().length).toBeGreaterThan(0)
  })
  it.each(['https://attacker.test/', '//attacker.test/', '/admin/', '/book/?email=private', '/\\attacker', 'javascript:alert(1)', null])('rejects unsafe next destination %s', (value) => {
    expect(safeNext(value)).toBe('/auth/')
  })
  it('allows only explicit public journey continuations', () => {
    expect(safeNext('/book/')).toBe('/book/')
    expect(safeNext('/register-as-brahmin/')).toBe('/register-as-brahmin/')
  })
})
