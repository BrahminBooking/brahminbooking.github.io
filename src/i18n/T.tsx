'use client'

import { useTranslations } from 'next-intl'

export function T({ id, values }: { id: string; values?: Record<string, string | number | Date> }) {
  const t = useTranslations('site')
  return <>{t(id, values)}</>
}
