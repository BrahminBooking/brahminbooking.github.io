'use client'

import Link from 'next/link'
import { track } from '@/lib/analytics'

const navigation = [
  { href: '/#today', label: 'Today' },
  { href: '/panchang/', label: 'Panchang' },
  { href: '/pujas/', label: 'Pujas' },
  { href: '/#temples', label: 'Temples' },
  { href: '/#how-it-works', label: 'How it works' },
]

export function SiteHeader() {
  return (
    <header className="consumer-header">
      <div className="consumer-header__inner">
        <Link className="wordmark" href="/" aria-label="BrahminBooking home">
          <span className="wordmark__seal" aria-hidden="true">ॐ</span>
          <span className="wordmark__copy"><strong>BrahminBooking</strong><small>Trusted Hindu services</small></span>
        </Link>
        <nav className="consumer-nav" aria-label="Primary navigation">
          {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>
        <div className="consumer-header__actions">
          <Link className="provider-link" href="/register-as-brahmin/" onClick={() => track('provider_registration_cta_clicked', { route: '/register-as-brahmin/' })}>Join as Purohit</Link>
          <Link className="provider-link sign-in-link" href="/auth/">Sign in</Link>
          <Link className="nav-book" href="/book/">Book a Puja <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <Link href="/#today">Today</Link><Link href="/book/">Book</Link><Link href="/pujas/">Pujas</Link><Link href="/auth/">Account</Link><Link href="/register-as-brahmin/" onClick={() => track('provider_registration_cta_clicked', { route: '/register-as-brahmin/' })}>Join as Purohit</Link>
      </nav>
    </header>
  )
}
