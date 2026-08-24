import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EditorialNotice } from '@/components/EditorialNotice'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { approvedPujaGuides, getApprovedPuja } from '@/content/pujas'

export const dynamicParams = false
export function generateStaticParams() { return approvedPujaGuides.map(({ slug }) => ({ slug })) }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const guide = getApprovedPuja(slug); return guide ? { title: guide.name, description: guide.summary, alternates: { canonical: `/pujas/${slug}/` } } : {} }

export default async function PujaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const guide = getApprovedPuja(slug); if (!guide) notFound()
  return <div className="consumer-page"><SiteHeader /><main className="article-page"><Link className="back-link" href="/pujas/">← All puja guides</Link><header className="article-hero"><p className="article-script">{guide.sanskritName}</p><p className="section-kicker">Puja guide</p><h1>{guide.name}</h1><p>{guide.summary}</p><div className="article-meta"><span>{guide.duration}</span><span>{guide.setting}</span></div></header><EditorialNotice reviewedBy={guide.reviewedBy} reviewedAt={guide.lastReviewedAt} /><div className="article-layout"><article><section><h2>Why families observe it</h2><p>{guide.purpose}</p></section><section><h2>Choosing the time</h2><p>{guide.when}</p></section><section><h2>Common preparations</h2><ul>{guide.preparations.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h2>Confirm with your Purohit</h2><ul>{guide.confirmWithPurohit.map((item) => <li key={item}>{item}</li>)}</ul></section></article><aside className="article-book"><p className="section-kicker">Plan this ceremony</p><h2>We&apos;ll help coordinate the next step.</h2><p>Share your language, tradition, location and preferred date. No account is required.</p><Link className="consumer-button consumer-button--primary" href={`/book/?puja=${guide.slug}`}>Request a Purohit <span aria-hidden="true">→</span></Link></aside></div><footer className="article-sources"><h2>Editorial source note</h2>{guide.sources.map((source) => <p key={source.label}><strong>{source.label}:</strong> {source.note}</p>)}</footer></main><SiteFooter /></div>
}
