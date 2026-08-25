'use client'

import { useSiteLocale } from '@/i18n/SiteLocaleProvider'
import { useMessages } from 'next-intl'
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
  const messages = useMessages() as unknown as {
    content?: {
      pujas?: Record<string, Record<string, string | string[]>>
      festivals?: Record<string, Record<string, string | string[]>>
    }
  }
  if (locale === 'en') return <>{fallback}</>
  const isManuallyReviewedLocale = locale === 'hi' || locale === 'gu' || locale === 'kn'
  const record: Record<string, string | string[]> | undefined = isManuallyReviewedLocale
    ? kind === 'puja' ? localizedPujas[locale][slug] : localizedFestivals[locale][slug]
    : kind === 'puja' ? messages.content?.pujas?.[slug] : messages.content?.festivals?.[slug]
  const value = record?.[field]
  if (Array.isArray(value)) return <>{value[index ?? 0] ?? fallback}</>
  return <>{typeof value === 'string' ? value : fallback}</>
}
