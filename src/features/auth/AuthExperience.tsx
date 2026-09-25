'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { GoogleAuthProvider, createUserWithEmailAndPassword, linkWithPopup, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { firebaseAuth, safeNext } from '@/lib/firebase/client'
import { apiRequest } from '@/lib/api/client'
import { signOut } from '@/lib/api/session'
import { useSiteLocale } from '@/i18n/SiteLocaleProvider'
import { useAuth } from './AuthProvider'
import { authCopy } from './copy'
import { authNotices } from './notices'

type Pending = { id: string; application_number: string; status: string }

export function AuthExperience() {
  const { user } = useAuth()
  return <AccountExperience key={user ? user.uid + user.email : 'anonymous'} />
}
function AccountExperience() {
  const router = useRouter()
  const { locale } = useSiteLocale()
  const c = authCopy(locale)
  const [gate, anonymous, verification] = authNotices[locale]
  const t = useTranslations('site')
  const { user, account, loading, error, refresh } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signup, setSignup] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)
  const [pending, setPending] = useState<Pending[] | null>(null)
  const [mode, setMode] = useState<'customer' | 'purohit'>('customer')
  const action = async (work: () => Promise<unknown>, success = '') => {
    if (busy) return
    setBusy(true); setMessage(''); setFailed(false)
    try { await work(); setMessage(success) }
    catch (failure) {
      setFailed(true)
      const code = failure && typeof failure === 'object' && 'code' in failure ? failure.code : ''
      setMessage(code === 'auth/account-exists-with-different-credential' || code === 'auth/credential-already-in-use'
        ? c.signin + ' → ' + c.link : c.error)
    } finally { setBusy(false) }
  }
  const settings = () => ({ url: window.location.origin + '/auth/', handleCodeInApp: false })
  const token = async () => {
    const current = firebaseAuth().currentUser
    if (!current) throw new Error('unauthorized')
    return current.getIdToken()
  }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    void action(async () => {
      const auth = firebaseAuth()
      auth.languageCode = locale
      if (signup) {
        const result = await createUserWithEmailAndPassword(auth, email.trim(), password)
        await sendEmailVerification(result.user, settings())
      } else { await signInWithEmailAndPassword(auth, email.trim(), password) }
      setPassword('')
    }, signup ? c.sent : '')
  }
  const onboard = (intent: 'customer' | 'purohit') => action(async () => {
    await apiRequest('/v1/account/onboarding', { intent }, await token())
    await refresh()
  })
  return <section className="auth-card auth-account" aria-busy={busy || loading}>
    <div><p className="section-kicker">BrahminBooking</p><h1>{user ? c.account : c.signin + ' / ' + c.signup}</h1><p>{gate}</p></div>
    {message && <p role={failed ? 'alert' : 'status'} className={failed ? 'booking-error' : 'auth-message'}>{message}</p>}
    {loading ? <p role="status">{c.loading}</p> : !user ? <>
      <button className="booking-submit" disabled={busy} onClick={() => void action(() => signInWithPopup(firebaseAuth(), new GoogleAuthProvider()))}>{c.google}</button>
      <form onSubmit={submit}>
        <label className="booking-field"><span>{t('book.email')}</span><input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="booking-field"><span>{c.password}</span><input required type="password" minLength={signup ? 8 : 1} autoComplete={signup ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button className="booking-submit" disabled={busy}>{signup ? c.signup : c.signin}</button>
      </form>
      <button disabled={busy} onClick={() => setSignup(!signup)}>{signup ? c.signin : c.signup}</button>
      <button disabled={busy || !email.trim()} onClick={() => void action(() => sendPasswordResetEmail(firebaseAuth(), email.trim(), settings()), c.sent)}>{c.reset}</button>
    </> : <>
      <p>{user.email}</p>
      {error && <div role="alert"><p>{c.error}</p><button disabled={busy} onClick={() => void action(refresh)}>{c.refresh}</button></div>}
      {account && !account.email_verified && <div className="auth-message"><p>{verification}</p>
        <button disabled={busy} onClick={() => void action(() => sendEmailVerification(user, settings()), c.sent)}>{c.verify}</button>
        <button disabled={busy} onClick={() => void action(refresh)}>{c.refresh}</button></div>}
      {account && !account.onboarding_completed_at && <div className="auth-choices"><h2>{c.customer} / {c.purohit}</h2>
        <button disabled={busy} onClick={() => void onboard('customer')}>{c.customer}</button>
        <button disabled={busy} onClick={() => void onboard('purohit')}>{c.purohit}</button>
        <p>{verification}</p></div>}
      {account?.onboarding_completed_at && <>
        <h2>{mode === 'purohit' && account.permissions.purohit ? c.purohit : c.customer}</h2>
        {account.permissions.submit_booking && <Link className="booking-submit" href="/book/">{t('book.submit')}</Link>}
        {account.email_verified && <button disabled={busy} onClick={() => {
          const next = safeNext(new URLSearchParams(window.location.search).get('next'))
          if (next !== '/auth/') router.push(next)
          else void action(refresh)
        }}>{c.refresh} →</button>}
        <p>{c.purohit}: <code>{account.application_status}</code> · <code>{account.provider_status}</code></p>
        <p>{verification}</p>
        <button disabled={busy} onClick={() => void action(async () => {
          await apiRequest('/v1/account/purohit/draft', {}, await token())
          router.push('/register-as-brahmin/')
        })}>{t('nav.join')}</button>
        {account.email_verified && <button disabled={busy} onClick={() => void action(async () => {
          setPending(await apiRequest<Pending[]>('/v1/account/purohit/pending', undefined, await token()))
        })}>{c.find}</button>}
        {pending?.length === 0 && <p>{c.empty}</p>}
        {pending?.map((profile) => <div key={profile.id}><p>{profile.application_number} — <code>{profile.status}</code></p><button disabled={busy} onClick={() => void action(async () => {
          await apiRequest('/v1/account/purohit/claim', { id: profile.id }, await token()); setPending(null); await refresh()
        }, verification)}>{c.claim}</button></div>)}
        {account.permissions.purohit && <button onClick={() => setMode(mode === 'customer' ? 'purohit' : 'customer')}>{c.mode}: {mode === 'customer' ? c.purohit : c.customer}</button>}
        {account.permissions.review && <Link href="/admin/">{c.review}</Link>}
        {!user.providerData.some((provider) => provider.providerId === 'google.com') && <button disabled={busy} onClick={() => void action(async () => { await linkWithPopup(user, new GoogleAuthProvider()); await refresh() })}>{c.link}</button>}
      </>}
      <button disabled={busy} onClick={() => void action(signOut)}>{c.signout}</button>
    </>}
    <Link href="/register-as-brahmin/">{anonymous}</Link>
  </section>
}
