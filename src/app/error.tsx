'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('site')
  return <div className="consumer-page"><SiteHeader /><main className="system-page" role="alert"><p className="system-page__code">!</p><h1>Something went wrong</h1><p>We could not open this page. Your information has not been submitted twice.</p><div className="system-page__actions"><button className="consumer-button consumer-button--primary" type="button" onClick={reset}>{t('panchang.retry')}</button><Link className="text-link" href="/">{t('common.returnHome')}</Link></div></main><SiteFooter /></div>
}
