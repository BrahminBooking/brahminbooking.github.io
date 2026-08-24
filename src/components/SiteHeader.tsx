'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { track } from '@/lib/analytics'
import { localeLabels, supportedLocales, type SupportedLocale } from '@/i18n/config'
import { useSiteLocale } from '@/i18n/SiteLocaleProvider'

const navigation = [
  { href: '/#today', key: 'today' },
  { href: '/panchang/', key: 'panchang' },
  { href: '/pujas/', key: 'pujas' },
  { href: '/#temples', key: 'temples' },
  { href: '/#how-it-works', key: 'how' },
]

export function SiteHeader() {
  const { locale, setLocale } = useSiteLocale()
  const t = useTranslations('site')

  return (
    <header className="consumer-header">
      <div className="consumer-header__inner">
        <Link className="wordmark" href="/" aria-label="BrahminBooking home">
          <span className="wordmark__seal" aria-hidden="true">ॐ</span>
          <span className="wordmark__copy"><strong>BrahminBooking</strong><small>{t('brandTagline')}</small></span>
        </Link>
        <nav className="consumer-nav" aria-label="Primary navigation">
          {navigation.map((item) => <Link key={item.href} href={item.href}>{t(`nav.${item.key}`)}</Link>)}
        </nav>
        <div className="consumer-header__actions">
          <label className="consumer-language">
            <span className="sr-only">{t('language')}</span>
            <select aria-label={t('language')} value={locale} onChange={(event) => setLocale(event.target.value as SupportedLocale)}>
              {supportedLocales.map((value) => <option key={value} value={value}>{localeLabels[value]}</option>)}
            </select>
          </label>
          <Link className="provider-link" href="/register-as-brahmin/" onClick={() => track('provider_registration_cta_clicked', { route: '/register-as-brahmin/' })}>{t('nav.join')}</Link>
          <Link className="provider-link sign-in-link" href="/auth/">{t('nav.signIn')}</Link>
          <Link className="nav-book" href="/book/">{t('nav.book')} <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <Link href="/#today">{t('nav.today')}</Link><Link href="/book/">{t('nav.bookShort')}</Link><Link href="/pujas/">{t('nav.pujas')}</Link><Link href="/auth/">{t('nav.account')}</Link><Link href="/register-as-brahmin/" onClick={() => track('provider_registration_cta_clicked', { route: '/register-as-brahmin/' })}>{t('nav.join')}</Link>
      </nav>
    </header>
  )
}
