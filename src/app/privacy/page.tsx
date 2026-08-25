import type { Metadata } from 'next'
import { PrivacyExperience } from '@/features/privacy/PrivacyExperience'

export const metadata: Metadata = {
  title: 'Privacy Notice',
  description: 'How BrahminBooking uses supply registration information.',
  alternates: { canonical: '/privacy/' },
}

export default function PrivacyPage() {
  return <PrivacyExperience />
}
