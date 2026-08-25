import type { Metadata } from 'next'
import { AnalyticsObserver } from '@/components/AnalyticsObserver'
import { SiteLocaleProvider } from '@/i18n/SiteLocaleProvider'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://brahminbooking.github.io'),
  title: {
    default: 'BrahminBooking — Pujas, Panchang & Trusted Purohits',
    template: '%s · BrahminBooking',
  },
  description: 'Understand the day, explore Hindu pujas and festivals, and request a trusted Purohit for your family.',
  alternates: { canonical: '/' },
  applicationName: 'BrahminBooking',
  category: 'religion',
  keywords: ['Purohit booking', 'Pandit booking', 'Hindu puja', 'Hindu samskara', 'Panchang', 'temple services'],
  authors: [{ name: 'BrahminBooking' }],
  creator: 'BrahminBooking',
  publisher: 'BrahminBooking',
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: 'website',
    siteName: 'BrahminBooking',
    title: 'BrahminBooking — Tradition, carefully coordinated',
    description: 'Panchang, puja guidance and trusted Purohit requests in one thoughtful place.',
    url: '/',
    images: [{ url: '/og-brahminbooking.jpg', width: 1200, height: 630, alt: 'BrahminBooking — tradition, carefully coordinated' }],
  },
  twitter: { card: 'summary_large_image', title: 'BrahminBooking — Tradition, carefully coordinated', description: 'Panchang, puja guidance and trusted Purohit requests in one thoughtful place.', images: ['/og-brahminbooking.jpg'] },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteLocaleProvider><AnalyticsObserver />{children}</SiteLocaleProvider></body></html>
}
