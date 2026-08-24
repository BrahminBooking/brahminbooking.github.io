'use client'

import Link from 'next/link'
import { NextIntlClientProvider, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { LOCALE_KEY, localeLabels, localeMessages, type SupportedLocale } from '@/features/purohit-registration/RegistrationExperience'

export function PrivacyExperience() {
  const [locale, setLocale] = useState<SupportedLocale>('en')

  useEffect(() => {
    const saved = window.localStorage.getItem(LOCALE_KEY)
    if (saved && saved in localeMessages) {
      const frame = window.requestAnimationFrame(() => setLocale(saved as SupportedLocale))
      return () => window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
    window.localStorage.setItem(LOCALE_KEY, locale)
  }, [locale])

  return (
    <NextIntlClientProvider locale={locale} messages={localeMessages[locale]} timeZone="Asia/Kolkata">
      <PrivacyNotice locale={locale} onLocaleChange={setLocale} />
    </NextIntlClientProvider>
  )
}

function PrivacyNotice({ locale, onLocaleChange }: { locale: SupportedLocale; onLocaleChange: (locale: SupportedLocale) => void }) {
  const t = useTranslations('privacy')
  const registration = useTranslations('registration')

  return (
    <main className="page-shell privacy-shell">
      <header className="site-header">
        <Link href="/" className="brand"><span className="brand-symbol" aria-hidden="true">ॐ</span><span><strong>BrahminBooking</strong><small>Verified with care</small></span></Link>
        <label className="language-select"><span>{registration('languageLabel')}</span><select value={locale} onChange={(event) => onLocaleChange(event.target.value as SupportedLocale)}>{(Object.keys(localeLabels) as SupportedLocale[]).map((value) => <option key={value} value={value}>{localeLabels[value]}</option>)}</select></label>
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
