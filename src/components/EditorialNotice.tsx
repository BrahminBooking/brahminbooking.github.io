'use client'

import { useTranslations } from 'next-intl'

export function EditorialNotice({ reviewedBy, reviewedAt }: { reviewedBy: string; reviewedAt: string }) {
  const t = useTranslations('site')
  return <aside className="editorial-notice"><span aria-hidden="true">✓</span><div><strong>{t('editorial.title')}</strong><p>{t('editorial.copy', { reviewedBy, reviewedAt })}</p></div></aside>
}
