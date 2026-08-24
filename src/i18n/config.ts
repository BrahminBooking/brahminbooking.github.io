import en from '@/messages/en.json'
import gu from '@/messages/gu.json'
import hi from '@/messages/hi.json'
import kn from '@/messages/kn.json'
import siteEn from '@/messages/site/en.json'
import siteGu from '@/messages/site/gu.json'
import siteHi from '@/messages/site/hi.json'
import siteKn from '@/messages/site/kn.json'

export const localeMessages = {
  en: { ...en, ...siteEn }, hi: { ...hi, ...siteHi }, gu: { ...gu, ...siteGu }, kn: { ...kn, ...siteKn },
} as const
export type SupportedLocale = keyof typeof localeMessages

export const supportedLocales = Object.keys(localeMessages) as SupportedLocale[]

export const localeLabels: Record<SupportedLocale, string> = {
  en: 'English',
  hi: 'हिंदी',
  gu: 'ગુજરાતી',
  kn: 'ಕನ್ನಡ',
}

export const localeTags: Record<SupportedLocale, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
}

export const LOCALE_KEY = 'brahminbooking-locale'

export function isSupportedLocale(value: string | null | undefined): value is SupportedLocale {
  return Boolean(value && value in localeMessages)
}

export function browserLocale(value: string | null | undefined): SupportedLocale {
  const language = value?.toLowerCase().split('-')[0]
  return isSupportedLocale(language) ? language : 'en'
}
