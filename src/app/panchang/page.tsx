import type { Metadata } from 'next'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { PanchangExperience } from '@/features/panchang/PanchangExperience'
import { T } from '@/i18n/T'

export const metadata: Metadata = {
  title: 'Daily Panchang',
  description: 'A location-aware daily Panchang experience with transparent source and freshness information.',
  alternates: { canonical: '/panchang/' },
  robots: { index: false, follow: true },
}

export default function PanchangPage() {
  return <div className="consumer-page"><SiteHeader /><main className="inner-page"><header className="page-intro"><p className="section-kicker"><T id="panchang.pageKicker" /></p><h1><T id="panchang.pageTitle1" /><br /><em><T id="panchang.pageTitle2" /></em></h1><p><T id="panchang.pageIntro" /></p></header><PanchangExperience /></main><SiteFooter /></div>
}
