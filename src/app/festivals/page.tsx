import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { approvedFestivalGuides } from '@/content/festivals'
import { T } from '@/i18n/T'
import { LocalizedGuideText } from '@/content/LocalizedGuideText'

export const metadata: Metadata = { title: 'Festival Guides', description: 'Reviewed introductions to Hindu festivals, with clear notes where dates and observances vary.', alternates: { canonical: '/festivals/' } }

export default function FestivalsPage() {
  return <div className="consumer-page"><SiteHeader /><main className="inner-page"><header className="page-intro page-intro--split"><div><p className="section-kicker"><T id="library.festivalKicker" /></p><h1><T id="library.festivalTitle1" /><br /><em><T id="library.festivalTitle2" /></em></h1></div><p><T id="library.festivalIntro" /></p></header><section className="festival-list">{approvedFestivalGuides.map((guide, index) => <Link className="festival-row" href={`/festivals/${guide.slug}/`} key={guide.slug}><span>{String(index + 1).padStart(2, '0')}</span><div><p><LocalizedGuideText kind="festival" slug={guide.slug} field="dateLabel" fallback={guide.dateLabel} /></p><h2>{guide.name}</h2><small><LocalizedGuideText kind="festival" slug={guide.slug} field="summary" fallback={guide.summary} /></small></div><b aria-hidden="true">↗</b></Link>)}</section></main><SiteFooter /></div>
}
