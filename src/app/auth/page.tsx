import type { Metadata } from 'next'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { AuthExperience } from '@/features/auth/AuthExperience'

export const metadata: Metadata = { title: 'Sign in or create an account', description: 'Manage your BrahminBooking account, verify your email and claim your Purohit profile.', robots: { index: false, follow: false } }
export default function AuthPage() { return <div className="consumer-page"><SiteHeader /><main className="auth-page"><AuthExperience /></main><SiteFooter /></div> }
