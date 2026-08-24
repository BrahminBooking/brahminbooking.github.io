import { describe, expect, it } from 'vitest'
import en from './en.json'
import gu from './gu.json'
import hi from './hi.json'
import kn from './kn.json'

function paths(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [prefix]
  return Object.entries(value).flatMap(([key, child]) => paths(child, prefix ? `${prefix}.${key}` : key))
}

describe('registration message catalogues', () => {
  const canonicalPaths = paths(en).sort()

  it.each([
    ['Hindi', hi],
    ['Gujarati', gu],
    ['Kannada', kn],
  ])('%s contains every canonical translation key', (_name, messages) => {
    expect(paths(messages).sort()).toEqual(canonicalPaths)
  })

  it('does not contain empty source messages', () => {
    expect(canonicalPaths).not.toContain('')
  })
})
