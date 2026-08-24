'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { localeLabels, supportedLocales, type SupportedLocale } from '@/i18n/config'
import { useSiteLocale } from '@/i18n/SiteLocaleProvider'

export function PrivacyExperience() {
  const { locale, setLocale } = useSiteLocale()
  return <PrivacyNotice locale={locale} onLocaleChange={setLocale} />
}

function PrivacyNotice({ locale, onLocaleChange }: { locale: SupportedLocale; onLocaleChange: (locale: SupportedLocale) => void }) {
  const t = useTranslations('privacy')
  const registration = useTranslations('registration')

  return (
    <main className="page-shell privacy-shell">
      <header className="site-header">
        <Link href="/" className="brand"><span className="brand-symbol" aria-hidden="true">ॐ</span><span><strong>BrahminBooking</strong><small>Verified with care</small></span></Link>
        <label className="language-select"><span>{registration('languageLabel')}</span><select value={locale} onChange={(event) => onLocaleChange(event.target.value as SupportedLocale)}>{supportedLocales.map((value) => <option key={value} value={value}>{localeLabels[value]}</option>)}</select></label>
      </header>
      <article className="privacy-card">
        <p className="eyebrow">{t('eyebrow')}</p>
        <h1>{t('title')}</h1>
        <p className="privacy-updated">{t('updated')}</p>
        <p className="privacy-intro">{t('intro')}</p>
        <section><h2>{t('collectTitle')}</h2><p>{t('collectBody')}</p></section>
        <section><h2>{t('useTitle')}</h2><p>{t('useBody')}</p></section>
        <section><h2>{t('accessTitle')}</h2><p>{t('accessBody')}</p></section>
        <Link className="button button-primary" href="/register-as-brahmin/">← {t('return')}</Link>
      </article>
    </main>
  )
}
