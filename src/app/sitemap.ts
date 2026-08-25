import type { MetadataRoute } from 'next'
import { approvedFestivalGuides } from '@/content/festivals'
import { approvedPujaGuides } from '@/content/pujas'

export const dynamic = 'force-static'

const origin = 'https://brahminbooking.github.io'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['/', '/pujas/', '/festivals/', '/book/', '/register-as-brahmin/', '/privacy/', ...approvedPujaGuides.map(({ slug }) => `/pujas/${slug}/`), ...approvedFestivalGuides.map(({ slug }) => `/festivals/${slug}/`)]
  return routes.map((route) => ({ url: `${origin}${route}`, lastModified: new Date('2026-08-25'), changeFrequency: route === '/' ? 'weekly' : 'monthly', priority: route === '/' ? 1 : route === '/book/' || route === '/register-as-brahmin/' ? .9 : .7 }))
}
