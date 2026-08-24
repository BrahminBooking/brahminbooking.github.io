'use client'

import { useEffect, useState } from 'react'
import { localeTags } from '@/i18n/config'
import { useSiteLocale } from '@/i18n/SiteLocaleProvider'
import { useTranslations } from 'next-intl'

export function CurrentDate() {
  const { locale } = useSiteLocale()
  const t = useTranslations('site')
  const [label, setLabel] = useState(t('panchang.localDate'))
  useEffect(() => {
    const timer = window.setTimeout(() => setLabel(new Intl.DateTimeFormat(localeTags[locale], { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }).format(new Date())), 0)
    return () => window.clearTimeout(timer)
  }, [locale])
  return <time>{label}</time>
}
