'use client'

import { localeLabels, type SupportedLocale } from '@/i18n/config'
import { useSiteLocale } from '@/i18n/SiteLocaleProvider'
import { RegistrationForm } from './RegistrationForm'

export { LOCALE_KEY, localeLabels, type SupportedLocale } from '@/i18n/config'

export function RegistrationExperience() {
  const { locale, setLocale } = useSiteLocale()

  return (
    <RegistrationForm
      locale={locale}
      localeLabels={localeLabels}
      onLocaleChange={(nextLocale: SupportedLocale) => setLocale(nextLocale)}
    />
  )
}
