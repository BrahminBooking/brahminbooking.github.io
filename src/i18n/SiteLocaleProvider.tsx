'use client'

import { NextIntlClientProvider } from 'next-intl'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  browserLocale,
  isSupportedLocale,
  LOCALE_KEY,
  localeMessages,
  type SupportedLocale,
} from './config'

type LocaleContextValue = {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function SiteLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<SupportedLocale>('en')

  useEffect(() => {
    const saved = window.localStorage.getItem(LOCALE_KEY)
    const preferred = isSupportedLocale(saved) ? saved : browserLocale(window.navigator.language)
    const frame = window.requestAnimationFrame(() => setLocale(preferred))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = 'ltr'
    window.localStorage.setItem(LOCALE_KEY, locale)
  }, [locale])

  const value = useMemo(() => ({ locale, setLocale }), [locale])

  return (
    <LocaleContext.Provider value={value}>
      <NextIntlClientProvider locale={locale} messages={localeMessages[locale]} timeZone="Asia/Kolkata">
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  )
}

export function useSiteLocale() {
  const value = useContext(LocaleContext)
  if (!value) throw new Error('useSiteLocale must be used inside SiteLocaleProvider')
  return value
}
