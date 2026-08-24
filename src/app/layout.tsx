import type { Metadata } from 'next'
import { AnalyticsObserver } from '@/components/AnalyticsObserver'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://brahminbooking.github.io'),
  title: {
    default: 'BrahminBooking — Pujas, Panchang & Trusted Purohits',
    template: '%s · BrahminBooking',
  },
  description: 'Understand the day, explore Hindu pujas and festivals, and request a trusted Purohit for your family.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'BrahminBooking',
    title: 'BrahminBooking — Tradition, carefully coordinated',
    description: 'Panchang, puja guidance and trusted Purohit requests in one thoughtful place.',
    url: '/',
    images: [{ url: '/og-brahminbooking.png', width: 1200, height: 630, alt: 'BrahminBooking — tradition, carefully coordinated' }],
  },
  twitter: { card: 'summary_large_image', images: ['/og-brahminbooking.png'] },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AnalyticsObserver />{children}</body></html>
}
