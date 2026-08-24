import type { Metadata } from 'next'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { BookingForm } from '@/features/booking/BookingForm'

export const metadata: Metadata = { title: 'Request a Purohit', description: 'Send a private, guest booking request for a Hindu puja, samskara or religious service.', alternates: { canonical: '/book/' } }

export default function BookPage() { return <div className="consumer-page"><SiteHeader /><main className="book-page"><header className="page-intro page-intro--split"><div><p className="section-kicker">Guest request</p><h1>Begin the<br /><em>conversation.</em></h1></div><p>Tell us the essentials. A person from the BrahminBooking team will review the request and coordinate availability. Nothing is confirmed or charged today.</p></header><BookingForm /></main><SiteFooter /></div> }
