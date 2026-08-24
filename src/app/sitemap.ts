import type { MetadataRoute } from 'next'
import { approvedFestivalGuides } from '@/content/festivals'
import { approvedPujaGuides } from '@/content/pujas'

export const dynamic = 'force-static'

const origin = 'https://brahminbooking.github.io'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['/pujas/', '/festivals/', '/book/', '/register-as-brahmin/', ...approvedPujaGuides.map(({ slug }) => `/pujas/${slug}/`), ...approvedFestivalGuides.map(({ slug }) => `/festivals/${slug}/`)]
  return routes.map((route) => ({ url: `${origin}${route}`, lastModified: new Date('2026-08-24'), changeFrequency: 'monthly', priority: .7 }))
}
