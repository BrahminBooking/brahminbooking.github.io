export const supportedLocales = [
  'en', 'as', 'bn', 'brx', 'doi', 'gu', 'hi', 'kn', 'ks', 'kok', 'mai', 'ml',
  'mni', 'mr', 'ne', 'or', 'pa', 'sa', 'sat', 'sd', 'ta', 'te', 'ur',
] as const

export type SupportedLocale = (typeof supportedLocales)[number]

export const localeLabels: Record<SupportedLocale, string> = {
  en: 'English', as: 'অসমীয়া', bn: 'বাংলা', brx: 'बड़ो', doi: 'डोगरी', gu: 'ગુજરાતી',
  hi: 'हिंदी', kn: 'ಕನ್ನಡ', ks: 'کٲشُر', kok: 'कोंकणी', mai: 'मैथिली', ml: 'മലയാളം',
  mni: 'মৈতৈলোন্', mr: 'मराठी', ne: 'नेपाली', or: 'ଓଡ଼ିଆ', pa: 'ਪੰਜਾਬੀ', sa: 'संस्कृतम्',
  sat: 'ᱥᱟᱱᱛᱟᱲᱤ', sd: 'سنڌي', ta: 'தமிழ்', te: 'తెలుగు', ur: 'اردو',
}

export const localeTags: Record<SupportedLocale, string> = {
  en: 'en-IN', as: 'as-IN', bn: 'bn-IN', brx: 'brx-IN', doi: 'doi-IN', gu: 'gu-IN',
  hi: 'hi-IN', kn: 'kn-IN', ks: 'ks-IN', kok: 'kok-IN', mai: 'mai-IN', ml: 'ml-IN',
  mni: 'mni-IN', mr: 'mr-IN', ne: 'ne-IN', or: 'or-IN', pa: 'pa-IN', sa: 'sa-IN',
  sat: 'sat-IN', sd: 'sd-IN', ta: 'ta-IN', te: 'te-IN', ur: 'ur-IN',
}

export const localeDirections: Record<SupportedLocale, 'ltr' | 'rtl'> = {
  en: 'ltr', as: 'ltr', bn: 'ltr', brx: 'ltr', doi: 'ltr', gu: 'ltr', hi: 'ltr',
  kn: 'ltr', ks: 'rtl', kok: 'ltr', mai: 'ltr', ml: 'ltr', mni: 'ltr', mr: 'ltr',
  ne: 'ltr', or: 'ltr', pa: 'ltr', sa: 'ltr', sat: 'ltr', sd: 'rtl', ta: 'ltr',
  te: 'ltr', ur: 'rtl',
}

const browserLocaleAliases: Record<string, SupportedLocale> = {
  asm: 'as', ben: 'bn', guj: 'gu', hin: 'hi', kan: 'kn', kas: 'ks', gom: 'kok',
  mal: 'ml', mar: 'mr', npi: 'ne', ory: 'or', pan: 'pa', san: 'sa', snd: 'sd',
  tam: 'ta', tel: 'te', urd: 'ur',
}

export function isSupportedLocale(value: string | null | undefined): value is SupportedLocale {
  return Boolean(value && supportedLocales.includes(value as SupportedLocale))
}

export function browserLocale(value: string | null | undefined): SupportedLocale {
  const language = value?.toLowerCase().split('-')[0]
  if (isSupportedLocale(language)) return language
  return language ? browserLocaleAliases[language] ?? 'en' : 'en'
}
