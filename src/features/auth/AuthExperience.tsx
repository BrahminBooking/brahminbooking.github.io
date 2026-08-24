'use client'

import { FormEvent, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function AuthExperience() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (!supabase) { setState('error'); return }; setState('sending')
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/` } })
    setState(error ? 'error' : 'sent')
  }
  return <section className="auth-card"><div><p className="section-kicker">Optional account</p><h1>Keep future requests together.</h1><p>You never need an account to send a booking request. Sign in only if you want to save and claim eligible requests after verifying the same contact details.</p></div>{state === 'sent' ? <div className="auth-message" role="status"><strong>Check your email</strong><p>Use the secure sign-in link we sent. A reference number alone can never claim a private request.</p></div> : <form onSubmit={submit}><label className="booking-field"><span>Email address</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>{state === 'error' && <p className="booking-error">Sign-in is not connected yet or the link could not be sent. Your booking request is unaffected.</p>}<button className="booking-submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Email me a secure link'} <span aria-hidden="true">→</span></button></form>}</section>
}
