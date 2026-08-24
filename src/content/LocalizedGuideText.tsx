'use client'

import { useSiteLocale } from '@/i18n/SiteLocaleProvider'
import { localizedFestivals, localizedPujas, type FestivalTranslation, type PujaTranslation } from './localized'

type Props = {
  kind: 'puja' | 'festival'
  slug: string
  field: keyof PujaTranslation | keyof FestivalTranslation
  fallback: string
  index?: number
}

export function LocalizedGuideText({ kind, slug, field, fallback, index }: Props) {
  const { locale } = useSiteLocale()
  if (locale === 'en') return <>{fallback}</>
  const record = kind === 'puja' ? localizedPujas[locale][slug] : localizedFestivals[locale][slug]
  const value = record?.[field as keyof typeof record]
  if (Array.isArray(value)) return <>{value[index ?? 0] ?? fallback}</>
  return <>{typeof value === 'string' ? value : fallback}</>
}
