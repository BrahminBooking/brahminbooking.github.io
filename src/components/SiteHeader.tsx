'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
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
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

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
          <Link className="nav-book" href="/book/">{t('nav.book')} <span aria-hidden="true">↗</span></Link>
          <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label="Menu" onClick={() => setMenuOpen((value) => !value)}>
            <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
          </button>
        </div>
      </div>
      <nav id="mobile-menu" className={`mobile-nav${menuOpen ? ' is-open' : ''}`} aria-label="Mobile navigation">
        {navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{t(`nav.${item.key}`)}</Link>)}
        <Link href="/register-as-brahmin/" onClick={() => { setMenuOpen(false); track('provider_registration_cta_clicked', { route: '/register-as-brahmin/' }) }}>{t('nav.join')}</Link>
        <Link className="mobile-nav__book" href="/book/" onClick={() => setMenuOpen(false)}>{t('nav.book')}</Link>
      </nav>
    </header>
  )
}
