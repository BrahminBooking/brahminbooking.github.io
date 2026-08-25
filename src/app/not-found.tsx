import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { T } from '@/i18n/T'

export const metadata: Metadata = { title: 'Page not found', description: 'The requested BrahminBooking page could not be found.', robots: { index: false, follow: true } }

export default function NotFound() {
  return <div className="consumer-page"><SiteHeader /><main className="system-page"><p className="system-page__code">404</p><h1>Page not found</h1><p>The page may have moved, or the link may be incorrect.</p><Link className="consumer-button consumer-button--primary" href="/"><T id="common.returnHome" /> <span aria-hidden="true">→</span></Link></main><SiteFooter /></div>
}
