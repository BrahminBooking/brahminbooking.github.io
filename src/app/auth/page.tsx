import type { Metadata } from 'next'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { AuthExperience } from '@/features/auth/AuthExperience'

export const metadata: Metadata = { title: 'Optional sign in', description: 'Optionally sign in to save and claim eligible BrahminBooking requests.', robots: { index: false, follow: false } }
export default function AuthPage() { return <div className="consumer-page"><SiteHeader /><main className="auth-page"><AuthExperience /></main><SiteFooter /></div> }
