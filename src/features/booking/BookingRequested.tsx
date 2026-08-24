'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { RECEIPT_KEY, type BookingReceipt } from './submit'

export function BookingRequested() {
  const [receipt, setReceipt] = useState<BookingReceipt | null>(null)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const raw = window.sessionStorage.getItem(RECEIPT_KEY)
      if (raw) { try { setReceipt(JSON.parse(raw) as BookingReceipt) } catch {} }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  return <section className="requested-card">
    <span className="requested-symbol" aria-hidden="true">✓</span><p className="section-kicker">Request received</p><h1>Thank you.<br />We&apos;ll take it from here.</h1>
    {receipt ? <><p>Your private reference</p><strong className="request-reference">{receipt.reference}</strong>{receipt.summary && <dl className="request-summary"><div><dt>Service</dt><dd>{receipt.summary.service}</dd></div><div><dt>Place</dt><dd>{receipt.summary.place}</dd></div><div><dt>Date</dt><dd>{receipt.summary.date}</dd></div></dl>}<p>Our team expects to make first contact {receipt.expectedResponse}. This is not yet a confirmed booking.</p></> : <p>Your request receipt is stored only in the browser session that submitted it. If you have already closed that session, please use the reference shared by the team.</p>}
    <div className="requested-steps"><div><span>1</span><p><strong>Human review</strong><br />We check the details and any missing context.</p></div><div><span>2</span><p><strong>Coordinator contact</strong><br />We speak with you before suggesting the next step.</p></div><div><span>3</span><p><strong>Arrangement</strong><br />Service, date and expectations are confirmed directly.</p></div></div>
    <div className="requested-actions"><Link className="consumer-button consumer-button--primary" href="/auth/">Create an account to track your booking</Link><Link className="text-link" href="/">Return home</Link></div>
    <p className="optional-account-copy">Your request is already submitted. Creating an account is optional and lets you receive updates, manage details and view future bookings.</p>
  </section>
}
