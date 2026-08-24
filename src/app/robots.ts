import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/panchang/', '/booking/requested/', '/auth/'] }, sitemap: 'https://brahminbooking.github.io/sitemap.xml' }
}
