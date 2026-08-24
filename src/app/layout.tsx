import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BrahminBooking — Trusted Purohit Network',
  description: 'Register with BrahminBooking’s verified network of Purohits, Brahmins and temples.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
