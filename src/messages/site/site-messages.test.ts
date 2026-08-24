import { describe, expect, it } from 'vitest'
import en from './en.json'
import gu from './gu.json'
import hi from './hi.json'
import kn from './kn.json'

function paths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix]
  return Object.entries(value).flatMap(([key, child]) => paths(child, prefix ? `${prefix}.${key}` : key))
}

const canonicalPaths = paths(en).sort()

describe('site translation catalogues', () => {
  it.each([['Hindi', hi], ['Gujarati', gu], ['Kannada', kn]])('%s contains every English key', (_name, messages) => {
    expect(paths(messages).sort()).toEqual(canonicalPaths)
  })

  it.each([['English', en], ['Hindi', hi], ['Gujarati', gu], ['Kannada', kn]])('%s has no empty messages', (_name, messages) => {
    const leaves = paths(messages)
    for (const path of leaves) {
      const value = path.split('.').reduce<unknown>((current, key) => (current as Record<string, unknown>)[key], messages)
      expect(String(value).trim(), path).not.toBe('')
    }
  })
})
