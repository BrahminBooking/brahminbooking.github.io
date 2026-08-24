import type { Metadata } from 'next'
import { PrivacyExperience } from '@/features/privacy/PrivacyExperience'

export const metadata: Metadata = {
  title: 'Privacy Notice — BrahminBooking',
  description: 'How BrahminBooking uses supply registration information.',
}

export default function PrivacyPage() {
  return <PrivacyExperience />
}
