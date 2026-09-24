'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LivePanchang } from './LivePanchang'

export function PanchangExperience() {
  const t = useTranslations('site')
  return (
    <section className="panchang-result">
      <LivePanchang />
      <Link className="consumer-button consumer-button--primary" href="/book/">{t('home.bookPurohit')} <span aria-hidden="true">→</span></Link>
    </section>
  )
}
