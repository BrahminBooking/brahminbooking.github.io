'use client'
import { useSiteLocale } from '@/i18n/SiteLocaleProvider'
import { authNotices } from './notices'
export function BookingNotice() { const { locale } = useSiteLocale(); return <p>{authNotices[locale][0]}</p> }
