'use client'

import { NextIntlClientProvider } from 'next-intl'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  browserLocale,
  defaultLocaleMessages,
  isSupportedLocale,
  loadLocaleMessages,
  LOCALE_KEY,
  localeDirections,
  type LocaleMessages,
  type SupportedLocale,
} from './config'

type LocaleContextValue = {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function SiteLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<SupportedLocale>('en')
  const [messages, setMessages] = useState<LocaleMessages>(defaultLocaleMessages)
  const localeRequest = useRef(0)

  const changeLocale = useCallback((nextLocale: SupportedLocale) => {
    const request = localeRequest.current + 1
    localeRequest.current = request
    void loadLocaleMessages(nextLocale).then((nextMessages) => {
      if (localeRequest.current !== request) return
      setMessages(nextMessages)
      setLocale(nextLocale)
    })
  }, [])

  useEffect(() => {
    const saved = window.localStorage.getItem(LOCALE_KEY)
    const preferred = isSupportedLocale(saved) ? saved : browserLocale(window.navigator.language)
    const frame = window.requestAnimationFrame(() => changeLocale(preferred))
    return () => window.cancelAnimationFrame(frame)
  }, [changeLocale])

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = localeDirections[locale]
    window.localStorage.setItem(LOCALE_KEY, locale)
  }, [locale])

  const value = useMemo(() => ({ locale, setLocale: changeLocale }), [changeLocale, locale])

  return (
    <LocaleContext.Provider value={value}>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Kolkata">
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
