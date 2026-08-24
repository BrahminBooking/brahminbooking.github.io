import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EditorialNotice } from '@/components/EditorialNotice'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { approvedPujaGuides, getApprovedPuja } from '@/content/pujas'
import { T } from '@/i18n/T'
import { LocalizedGuideText } from '@/content/LocalizedGuideText'

export const dynamicParams = false
export function generateStaticParams() { return approvedPujaGuides.map(({ slug }) => ({ slug })) }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const guide = getApprovedPuja(slug); return guide ? { title: guide.name, description: guide.summary, alternates: { canonical: `/pujas/${slug}/` } } : {} }

export default async function PujaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const guide = getApprovedPuja(slug); if (!guide) notFound()
  return <div className="consumer-page"><SiteHeader /><main className="article-page"><Link className="back-link" href="/pujas/">← <T id="library.allPujas" /></Link><header className="article-hero"><p className="article-script">{guide.sanskritName}</p><p className="section-kicker"><T id="library.pujaGuide" /></p><h1>{guide.name}</h1><p><LocalizedGuideText kind="puja" slug={guide.slug} field="summary" fallback={guide.summary} /></p><div className="article-meta"><span><LocalizedGuideText kind="puja" slug={guide.slug} field="duration" fallback={guide.duration} /></span><span><LocalizedGuideText kind="puja" slug={guide.slug} field="setting" fallback={guide.setting} /></span></div></header><EditorialNotice reviewedBy={guide.reviewedBy} reviewedAt={guide.lastReviewedAt} /><div className="article-layout"><article><section><h2><T id="library.why" /></h2><p><LocalizedGuideText kind="puja" slug={guide.slug} field="purpose" fallback={guide.purpose} /></p></section><section><h2><T id="library.time" /></h2><p><LocalizedGuideText kind="puja" slug={guide.slug} field="when" fallback={guide.when} /></p></section><section><h2><T id="library.preparations" /></h2><ul>{guide.preparations.map((item, index) => <li key={item}><LocalizedGuideText kind="puja" slug={guide.slug} field="preparations" index={index} fallback={item} /></li>)}</ul></section><section><h2><T id="library.confirm" /></h2><ul>{guide.confirmWithPurohit.map((item, index) => <li key={item}><LocalizedGuideText kind="puja" slug={guide.slug} field="confirmWithPurohit" index={index} fallback={item} /></li>)}</ul></section></article><aside className="article-book"><p className="section-kicker"><T id="library.plan" /></p><h2><T id="library.planTitle" /></h2><p><T id="library.planCopy" /></p><Link className="consumer-button consumer-button--primary" href={`/book/?puja=${guide.slug}`}><T id="common.requestPurohit" /> <span aria-hidden="true">→</span></Link></aside></div><footer className="article-sources"><h2><T id="library.sourceNote" /></h2>{guide.sources.map((source) => <p key={source.label}><strong>{source.label}:</strong> <LocalizedGuideText kind="puja" slug={guide.slug} field="sourceNote" fallback={source.note} /></p>)}</footer></main><SiteFooter /></div>
}
