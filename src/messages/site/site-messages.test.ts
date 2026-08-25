import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { localeLabels, supportedLocales } from '../../i18n/locales'
import en from './en.json'

function leaves(value: unknown, prefix = ''): Record<string, string> {
  if (typeof value === 'string') return { [prefix]: value }
  if (Array.isArray(value)) return Object.assign({}, ...value.map((child, index) => leaves(child, `${prefix}.${index}`)))
  if (!value || typeof value !== 'object') return { [prefix]: String(value) }
  return Object.assign({}, ...Object.entries(value).map(([key, child]) => leaves(child, prefix ? `${prefix}.${key}` : key)))
}

function readCatalogue(locale: string) {
  return JSON.parse(readFileSync(path.join(process.cwd(), 'src/messages/site', `${locale}.json`), 'utf8')) as unknown
}

function placeholders(value: string) {
  return [...value.matchAll(/\{[^}]+\}/g)].map(([placeholder]) => placeholder).sort()
}

describe('site translation catalogues', () => {
  const canonicalLeaves = leaves(en)
  const translatedLocales = supportedLocales.filter((locale) => locale !== 'en')

  it.each(translatedLocales)('%s contains every English key', (locale) => {
    expect(Object.keys(leaves(readCatalogue(locale))).sort()).toEqual(Object.keys(canonicalLeaves).sort())
  })

  it.each(translatedLocales)('%s preserves placeholders and has no empty messages', (locale) => {
    const translatedLeaves = leaves(readCatalogue(locale))
    for (const [path, source] of Object.entries(canonicalLeaves)) {
      expect(translatedLeaves[path]?.trim(), `${localeLabels[locale]}: ${path}`).not.toBe('')
      expect(translatedLeaves[path], `${localeLabels[locale]}: ${path}`).not.toMatch(/\.{6,}|\\lambda|\\frac/)
      expect(placeholders(translatedLeaves[path]), `${localeLabels[locale]}: ${path}`).toEqual(placeholders(source))
    }
  })
})
