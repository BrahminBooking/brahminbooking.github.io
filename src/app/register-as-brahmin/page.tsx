import type { Metadata } from 'next'
import { RegistrationExperience } from '@/features/purohit-registration/RegistrationExperience'

export const metadata: Metadata = {
  title: 'Register as a Purohit or Brahmin',
  description: 'Apply to join BrahminBooking’s verified Purohit and Brahmin network. No login required.',
  alternates: { canonical: '/register-as-brahmin/' },
}

export default function RegisterAsBrahminPage() {
  return <RegistrationExperience />
}
