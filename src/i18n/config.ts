import en from '@/messages/en.json'
import contentEn from '@/messages/content-en.json'
import siteEn from '@/messages/site/en.json'
import { type SupportedLocale } from './locales'

export { browserLocale, isSupportedLocale, localeDirections, localeLabels, localeTags, supportedLocales, type SupportedLocale } from './locales'

export const LOCALE_KEY = 'brahminbooking-locale'

export const defaultLocaleMessages = { ...en, ...siteEn, ...contentEn }
export type LocaleMessages = typeof defaultLocaleMessages

type JsonModule = { default: Record<string, unknown> }

function mergeModules(modules: JsonModule[]): LocaleMessages {
  return Object.assign({}, ...modules.map((module) => module.default)) as LocaleMessages
}

const localeLoaders: Record<SupportedLocale, () => Promise<LocaleMessages>> = {
  en: async () => defaultLocaleMessages,
  as: async () => mergeModules(await Promise.all([import('@/messages/as.json'), import('@/messages/site/as.json'), import('@/messages/content/as.json')])),
  bn: async () => mergeModules(await Promise.all([import('@/messages/bn.json'), import('@/messages/site/bn.json'), import('@/messages/content/bn.json')])),
  brx: async () => mergeModules(await Promise.all([import('@/messages/brx.json'), import('@/messages/site/brx.json'), import('@/messages/content/brx.json')])),
  doi: async () => mergeModules(await Promise.all([import('@/messages/doi.json'), import('@/messages/site/doi.json'), import('@/messages/content/doi.json')])),
  gu: async () => mergeModules(await Promise.all([import('@/messages/gu.json'), import('@/messages/site/gu.json')])),
  hi: async () => mergeModules(await Promise.all([import('@/messages/hi.json'), import('@/messages/site/hi.json')])),
  kn: async () => mergeModules(await Promise.all([import('@/messages/kn.json'), import('@/messages/site/kn.json')])),
  ks: async () => mergeModules(await Promise.all([import('@/messages/ks.json'), import('@/messages/site/ks.json'), import('@/messages/content/ks.json')])),
  kok: async () => mergeModules(await Promise.all([import('@/messages/kok.json'), import('@/messages/site/kok.json'), import('@/messages/content/kok.json')])),
  mai: async () => mergeModules(await Promise.all([import('@/messages/mai.json'), import('@/messages/site/mai.json'), import('@/messages/content/mai.json')])),
  ml: async () => mergeModules(await Promise.all([import('@/messages/ml.json'), import('@/messages/site/ml.json'), import('@/messages/content/ml.json')])),
  mni: async () => mergeModules(await Promise.all([import('@/messages/mni.json'), import('@/messages/site/mni.json'), import('@/messages/content/mni.json')])),
  mr: async () => mergeModules(await Promise.all([import('@/messages/mr.json'), import('@/messages/site/mr.json'), import('@/messages/content/mr.json')])),
  ne: async () => mergeModules(await Promise.all([import('@/messages/ne.json'), import('@/messages/site/ne.json'), import('@/messages/content/ne.json')])),
  or: async () => mergeModules(await Promise.all([import('@/messages/or.json'), import('@/messages/site/or.json'), import('@/messages/content/or.json')])),
  pa: async () => mergeModules(await Promise.all([import('@/messages/pa.json'), import('@/messages/site/pa.json'), import('@/messages/content/pa.json')])),
  sa: async () => mergeModules(await Promise.all([import('@/messages/sa.json'), import('@/messages/site/sa.json'), import('@/messages/content/sa.json')])),
  sat: async () => mergeModules(await Promise.all([import('@/messages/sat.json'), import('@/messages/site/sat.json'), import('@/messages/content/sat.json')])),
  sd: async () => mergeModules(await Promise.all([import('@/messages/sd.json'), import('@/messages/site/sd.json'), import('@/messages/content/sd.json')])),
  ta: async () => mergeModules(await Promise.all([import('@/messages/ta.json'), import('@/messages/site/ta.json'), import('@/messages/content/ta.json')])),
  te: async () => mergeModules(await Promise.all([import('@/messages/te.json'), import('@/messages/site/te.json'), import('@/messages/content/te.json')])),
}

export async function loadLocaleMessages(locale: SupportedLocale): Promise<LocaleMessages> {
  return localeLoaders[locale]()
}
