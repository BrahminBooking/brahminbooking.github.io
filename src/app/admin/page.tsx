import type { Metadata } from 'next'
import { SiteHeader } from '@/components/SiteHeader'
import { AdminExperience } from '@/features/auth/AdminExperience'

export const metadata: Metadata = { title: 'Internal review', robots: { index: false, follow: false } }
export default function AdminPage() { return <div className="consumer-page"><SiteHeader /><main className="auth-page"><AdminExperience /></main></div> }
