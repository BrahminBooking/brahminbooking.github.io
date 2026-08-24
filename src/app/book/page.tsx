import type { Metadata } from 'next'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { BookingForm } from '@/features/booking/BookingForm'
import { T } from '@/i18n/T'

export const metadata: Metadata = { title: 'Request a Purohit', description: 'Send a private, guest booking request for a Hindu puja, samskara or religious service.', alternates: { canonical: '/book/' } }

export default function BookPage() { return <div className="consumer-page"><SiteHeader /><main className="book-page"><header className="page-intro page-intro--split"><div><p className="section-kicker"><T id="book.pageKicker" /></p><h1><T id="book.pageTitle1" /><br /><em><T id="book.pageTitle2" /></em></h1></div><p><T id="book.pageIntro" /></p></header><BookingForm /></main><SiteFooter /></div> }
