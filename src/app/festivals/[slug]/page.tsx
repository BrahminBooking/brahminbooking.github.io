import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EditorialNotice } from '@/components/EditorialNotice'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { approvedFestivalGuides, getApprovedFestival } from '@/content/festivals'
import { T } from '@/i18n/T'
import { LocalizedGuideText } from '@/content/LocalizedGuideText'

export const dynamicParams = false
export function generateStaticParams() { return approvedFestivalGuides.map(({ slug }) => ({ slug })) }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const guide = getApprovedFestival(slug); return guide ? { title: guide.name, description: guide.summary, alternates: { canonical: `/festivals/${slug}/` } } : {} }

export default async function FestivalDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const guide = getApprovedFestival(slug); if (!guide) notFound()
  return <div className="consumer-page"><SiteHeader /><main className="article-page"><Link className="back-link" href="/festivals/">← <T id="library.allFestivals" /></Link><header className="article-hero"><p className="section-kicker"><T id="library.festivalGuide" /></p><h1>{guide.name}</h1><p><LocalizedGuideText kind="festival" slug={guide.slug} field="summary" fallback={guide.summary} /></p><div className="article-meta"><span><LocalizedGuideText kind="festival" slug={guide.slug} field="dateLabel" fallback={guide.dateLabel} /></span></div></header><EditorialNotice reviewedBy={guide.reviewedBy} reviewedAt={guide.lastReviewedAt} /><div className="article-layout"><article><section><h2><T id="library.significance" /></h2><p><LocalizedGuideText kind="festival" slug={guide.slug} field="significance" fallback={guide.significance} /></p></section><section><h2><T id="library.observances" /></h2><ul>{guide.observances.map((item, index) => <li key={item}><LocalizedGuideText kind="festival" slug={guide.slug} field="observances" index={index} fallback={item} /></li>)}</ul></section><section><h2><T id="library.variation" /></h2><p><LocalizedGuideText kind="festival" slug={guide.slug} field="regionalNote" fallback={guide.regionalNote} /></p></section></article><aside className="article-book"><p className="section-kicker"><T id="library.dateNote" /></p><h2><T id="library.dateTitle" /></h2><p><T id="library.dateCopy" /></p><Link className="consumer-button consumer-button--primary" href="/panchang/"><T id="library.openPanchang" /> <span aria-hidden="true">→</span></Link></aside></div><footer className="article-sources"><h2><T id="library.sourceNote" /></h2>{guide.sources.map((source) => <p key={source.label}><strong>{source.label}:</strong> <LocalizedGuideText kind="festival" slug={guide.slug} field="sourceNote" fallback={source.note} /></p>)}</footer></main><SiteFooter /></div>
}
