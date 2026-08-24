'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function SiteFooter() {
  const t = useTranslations('site')
  return (
    <footer className="consumer-footer">
      <div className="consumer-footer__inner">
        <div><span className="footer-mark" aria-hidden="true">ॐ</span><p>{t('footer.tagline')}</p></div>
        <div className="footer-links">
          <Link href="/panchang/">{t('nav.panchang')}</Link><Link href="/pujas/">{t('footer.pujas')}</Link><Link href="/festivals/">{t('footer.festivals')}</Link><Link href="/privacy/">{t('footer.privacy')}</Link>
        </div>
        <p className="footer-note">{t('footer.note')}</p>
      </div>
    </footer>
  )
}
