import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { approvedPujaGuides } from '@/content/pujas'
import { T } from '@/i18n/T'
import { LocalizedGuideText } from '@/content/LocalizedGuideText'

export const metadata: Metadata = { title: 'Puja Guides', description: 'Respectful introductions and preparation notes for commonly requested Hindu pujas and samskaras.', alternates: { canonical: '/pujas/' } }

export default function PujasPage() {
  return <div className="consumer-page"><SiteHeader /><main className="inner-page"><header className="page-intro page-intro--split"><div><p className="section-kicker"><T id="library.pujaKicker" /></p><h1><T id="library.pujaTitle1" /><br /><em><T id="library.pujaTitle2" /></em></h1></div><p><T id="library.pujaIntro" /></p></header><section className="guide-grid">{approvedPujaGuides.map((guide, index) => <Link className="guide-card" key={guide.slug} href={`/pujas/${guide.slug}/`}><span className="guide-card__index">{String(index + 1).padStart(2, '0')}</span><p className="guide-card__script">{guide.sanskritName}</p><h2>{guide.name}</h2><p><LocalizedGuideText kind="puja" slug={guide.slug} field="summary" fallback={guide.summary} /></p><dl><div><dt><T id="library.duration" /></dt><dd><LocalizedGuideText kind="puja" slug={guide.slug} field="duration" fallback={guide.duration} /></dd></div><div><dt><T id="library.setting" /></dt><dd><LocalizedGuideText kind="puja" slug={guide.slug} field="setting" fallback={guide.setting} /></dd></div></dl><span className="guide-card__link"><T id="library.read" /> <b aria-hidden="true">↗</b></span></Link>)}</section><section className="inline-cta"><div><p className="section-kicker"><T id="library.ready" /></p><h2><T id="library.readyTitle" /></h2></div><Link className="consumer-button consumer-button--primary" href="/book/"><T id="home.start" /> <span aria-hidden="true">→</span></Link></section></main><SiteFooter /></div>
}
