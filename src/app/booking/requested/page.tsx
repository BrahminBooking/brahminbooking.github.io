import type { Metadata } from 'next'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { BookingRequested } from '@/features/booking/BookingRequested'

export const metadata: Metadata = { title: 'Booking request received', description: 'Private confirmation for a BrahminBooking guest request.', robots: { index: false, follow: false } }
export default function BookingRequestedPage() { return <div className="consumer-page"><SiteHeader /><main className="requested-page"><BookingRequested /></main><SiteFooter /></div> }
