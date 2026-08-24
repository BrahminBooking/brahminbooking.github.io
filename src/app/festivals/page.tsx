import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { approvedFestivalGuides } from '@/content/festivals'

export const metadata: Metadata = { title: 'Festival Guides', description: 'Reviewed introductions to Hindu festivals, with clear notes where dates and observances vary.', alternates: { canonical: '/festivals/' } }

export default function FestivalsPage() {
  return <div className="consumer-page"><SiteHeader /><main className="inner-page"><header className="page-intro page-intro--split"><div><p className="section-kicker">Festival library</p><h1>Many traditions.<br /><em>One thoughtful place.</em></h1></div><p>Festival dates and observances can vary by region, sampradaya and calendar convention. Each guide makes that variation visible.</p></header><section className="festival-list">{approvedFestivalGuides.map((guide, index) => <Link className="festival-row" href={`/festivals/${guide.slug}/`} key={guide.slug}><span>{String(index + 1).padStart(2, '0')}</span><div><p>{guide.dateLabel}</p><h2>{guide.name}</h2><small>{guide.summary}</small></div><b aria-hidden="true">↗</b></Link>)}</section></main><SiteFooter /></div>
}
