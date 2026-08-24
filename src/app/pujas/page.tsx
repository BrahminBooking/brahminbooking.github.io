import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { approvedPujaGuides } from '@/content/pujas'

export const metadata: Metadata = { title: 'Puja Guides', description: 'Respectful introductions and preparation notes for commonly requested Hindu pujas and samskaras.', alternates: { canonical: '/pujas/' } }

export default function PujasPage() {
  return <div className="consumer-page"><SiteHeader /><main className="inner-page"><header className="page-intro page-intro--split"><div><p className="section-kicker">Puja library</p><h1>Prepare with<br /><em>understanding.</em></h1></div><p>These reviewed introductions help families ask better questions. They do not replace guidance from the Purohit who will conduct your ceremony.</p></header><section className="guide-grid">{approvedPujaGuides.map((guide, index) => <Link className="guide-card" key={guide.slug} href={`/pujas/${guide.slug}/`}><span className="guide-card__index">{String(index + 1).padStart(2, '0')}</span><p className="guide-card__script">{guide.sanskritName}</p><h2>{guide.name}</h2><p>{guide.summary}</p><dl><div><dt>Typical duration</dt><dd>{guide.duration}</dd></div><div><dt>Common setting</dt><dd>{guide.setting}</dd></div></dl><span className="guide-card__link">Read the guide <b aria-hidden="true">↗</b></span></Link>)}</section><section className="inline-cta"><div><p className="section-kicker">Ready to coordinate?</p><h2>Request the right Purohit for your family.</h2></div><Link className="consumer-button consumer-button--primary" href="/book/">Start a request <span aria-hidden="true">→</span></Link></section></main><SiteFooter /></div>
}
