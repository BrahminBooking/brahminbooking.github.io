import type { Metadata } from 'next'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { PanchangExperience } from '@/features/panchang/PanchangExperience'

export const metadata: Metadata = {
  title: 'Daily Panchang',
  description: 'A location-aware daily Panchang experience with transparent source and freshness information.',
  alternates: { canonical: '/panchang/' },
  robots: { index: false, follow: true },
}

export default function PanchangPage() {
  return <div className="consumer-page"><SiteHeader /><main className="inner-page"><header className="page-intro"><p className="section-kicker">Daily context</p><h1>Understand the day,<br /><em>in your location.</em></h1><p>Panchang timings depend on place, timezone and calculation convention. We show those assumptions beside every result.</p></header><PanchangExperience /></main><SiteFooter /></div>
}
