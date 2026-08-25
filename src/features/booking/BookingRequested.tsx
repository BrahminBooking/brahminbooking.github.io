'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { RECEIPT_KEY, type BookingReceipt } from './submit'

export function BookingRequested() {
  const t = useTranslations('site')
  const [receipt, setReceipt] = useState<BookingReceipt | null>(null)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const raw = window.sessionStorage.getItem(RECEIPT_KEY)
      if (raw) { try { setReceipt(JSON.parse(raw) as BookingReceipt) } catch {} }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  if (!receipt) return <section className="requested-card requested-card--empty"><span className="requested-symbol requested-symbol--neutral" aria-hidden="true">○</span><h1>{t('requested.missing')}</h1><div className="requested-actions"><Link className="consumer-button consumer-button--primary" href="/book/">{t('nav.book')}</Link><Link className="text-link" href="/">{t('common.returnHome')}</Link></div></section>

  return <section className="requested-card">
    <span className="requested-symbol" aria-hidden="true">✓</span><p className="section-kicker">{t('requested.kicker')}</p><h1>{t('requested.title1')}<br />{t('requested.title2')}</h1>
    <p>{t('requested.reference')}</p><strong className="request-reference">{receipt.reference}</strong>{receipt.summary && <dl className="request-summary"><div><dt>{t('requested.service')}</dt><dd>{receipt.summary.service}</dd></div><div><dt>{t('requested.place')}</dt><dd>{receipt.summary.place}</dd></div><div><dt>{t('requested.date')}</dt><dd>{receipt.summary.date}</dd></div></dl>}<p>{t('requested.contact', { time: receipt.expectedResponse })}</p>
    <div className="requested-steps"><div><span>1</span><p><strong>{t('requested.review')}</strong><br />{t('requested.reviewCopy')}</p></div><div><span>2</span><p><strong>{t('requested.coordinator')}</strong><br />{t('requested.coordinatorCopy')}</p></div><div><span>3</span><p><strong>{t('requested.arrangement')}</strong><br />{t('requested.arrangementCopy')}</p></div></div>
    <div className="requested-actions"><Link className="consumer-button consumer-button--primary" href="/book/">{t('nav.book')}</Link><Link className="text-link" href="/">{t('common.returnHome')}</Link></div>
  </section>
}
