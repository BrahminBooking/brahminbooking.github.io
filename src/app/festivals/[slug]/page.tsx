import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EditorialNotice } from '@/components/EditorialNotice'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { approvedFestivalGuides, getApprovedFestival } from '@/content/festivals'

export const dynamicParams = false
export function generateStaticParams() { return approvedFestivalGuides.map(({ slug }) => ({ slug })) }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const guide = getApprovedFestival(slug); return guide ? { title: guide.name, description: guide.summary, alternates: { canonical: `/festivals/${slug}/` } } : {} }

export default async function FestivalDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const guide = getApprovedFestival(slug); if (!guide) notFound()
  return <div className="consumer-page"><SiteHeader /><main className="article-page"><Link className="back-link" href="/festivals/">← All festival guides</Link><header className="article-hero"><p className="section-kicker">Festival guide</p><h1>{guide.name}</h1><p>{guide.summary}</p><div className="article-meta"><span>{guide.dateLabel}</span></div></header><EditorialNotice reviewedBy={guide.reviewedBy} reviewedAt={guide.lastReviewedAt} /><div className="article-layout"><article><section><h2>Significance</h2><p>{guide.significance}</p></section><section><h2>Common observances</h2><ul>{guide.observances.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h2>Regional and calendar variation</h2><p>{guide.regionalNote}</p></section></article><aside className="article-book"><p className="section-kicker">A note on dates</p><h2>Confirm for your place and tradition.</h2><p>Use a trusted local Panchang or ask your Purohit before making religious arrangements.</p><Link className="consumer-button consumer-button--primary" href="/panchang/">Open Panchang <span aria-hidden="true">→</span></Link></aside></div><footer className="article-sources"><h2>Editorial source note</h2>{guide.sources.map((source) => <p key={source.label}><strong>{source.label}:</strong> {source.note}</p>)}</footer></main><SiteFooter /></div>
}
