'use client'

import { NextIntlClientProvider } from 'next-intl'
import { useEffect, useState } from 'react'
import en from '@/messages/en.json'
import gu from '@/messages/gu.json'
import hi from '@/messages/hi.json'
import kn from '@/messages/kn.json'
import { RegistrationForm } from './RegistrationForm'

export const localeMessages = { en, hi, gu, kn } as const
export type SupportedLocale = keyof typeof localeMessages

export const localeLabels: Record<SupportedLocale, string> = {
  en: 'English',
  hi: 'हिंदी',
  gu: 'ગુજરાતી',
  kn: 'ಕನ್ನಡ',
}

export const LOCALE_KEY = 'brahminbooking-locale'

export function RegistrationExperience() {
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
      <RegistrationForm
        locale={locale}
        localeLabels={localeLabels}
        onLocaleChange={setLocale}
      />
    </NextIntlClientProvider>
  )
}
