'use client'

import { FormEvent, useState } from 'react'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase/client'

export function AuthExperience() {
  const t = useTranslations('site')
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (!supabase) { setState('error'); return }; setState('sending')
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/` } })
    setState(error ? 'error' : 'sent')
  }
  return <section className="auth-card"><div><p className="section-kicker">{t('auth.kicker')}</p><h1>{t('auth.title')}</h1><p>{t('auth.intro')}</p></div>{state === 'sent' ? <div className="auth-message" role="status"><strong>{t('auth.check')}</strong><p>{t('auth.checkCopy')}</p></div> : <form onSubmit={submit}><label className="booking-field"><span>{t('auth.email')}</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>{state === 'error' && <p className="booking-error">{t('auth.error')}</p>}<button className="booking-submit" disabled={state === 'sending'}>{state === 'sending' ? t('auth.sending') : t('auth.submit')} <span aria-hidden="true">→</span></button></form>}</section>
}
