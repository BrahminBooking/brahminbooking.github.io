'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function PanchangExperience() {
  const t = useTranslations('site')
  return (
    <section className="panchang-result panchang-empty-page" aria-live="polite">
      <span className="panchang-empty-page__symbol" aria-hidden="true">☼</span>
      <p className="section-kicker">{t('home.todayPanchang')}</p>
      <h2>{t('panchang.unavailable')}</h2>
      <p>{t('panchang.unavailableCopy')}</p>
      <Link className="consumer-button consumer-button--primary" href="/book/">{t('home.bookPurohit')} <span aria-hidden="true">→</span></Link>
    </section>
  )
}
