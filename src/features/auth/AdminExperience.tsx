'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { apiRequest } from '@/lib/api/client'
import { accessToken } from '@/lib/api/session'

type Application = { id: string; application_number: string; status: string; provider_status: string }
const states = ['initial_review', 'contacted', 'reference_verification', 'document_verification', 'approved', 'profile_setup', 'active', 'needs_changes', 'on_hold', 'rejected', 'suspended', 'archived']

export function AdminExperience() {
  const { account, loading } = useAuth()
  const [rows, setRows] = useState<Application[] | null>(null)
  const [selected, setSelected] = useState('')
  const [status, setStatus] = useState('initial_review')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [details, setDetails] = useState<Record<string, unknown> | null>(null)
  const load = async () => {
    const token = await accessToken()
    if (!token) throw new Error('unauthorized')
    setRows(await apiRequest<Application[]>('/v1/admin/applications', undefined, token))
  }
  const run = async (work: () => Promise<void>) => {
    setBusy(true); setMessage('')
    try { await work() } catch { setMessage('Action not completed. Check your permission, the review sequence, and the required reason. Refresh before retrying.') }
    finally { setBusy(false) }
  }
  if (loading) return <p role="status">Loading permissions…</p>
  if (!account?.permissions.review) return <p role="alert">Verified staff access is required. Sign in using your approved staff account.</p>
  return <section className="auth-card"><h1>Application review</h1>
    <p>Provider approval is separate from email verification. Every change records its reason and status history. The server enforces the review sequence.</p>
    <button disabled={busy} onClick={() => void run(load)}>Load / refresh applications</button>
    {message && <p role="status">{message}</p>}
    {rows?.length === 0 && <p>No applications to review.</p>}
    {rows && <label className="booking-field">Application<select value={selected} onChange={(e) => setSelected(e.target.value)}><option value="">Select an application</option>{rows.map((row) => <option key={row.id} value={row.id}>{row.application_number} — {row.status}</option>)}</select></label>}
    {selected && <button disabled={busy} onClick={() => void run(async () => {
      const token = await accessToken(); if (!token) throw new Error('unauthorized')
      const records = await apiRequest<Record<string, unknown>[]>(`/v1/records/applications/${selected}`, undefined, token)
      const fields = ['application_number','applicant_full_name','email','phone_display','city','district','state','status']
      setDetails(Object.fromEntries(fields.map((key) => [key, records[0]?.[key] ?? ''])))
    })}>Read selected application</button>}
    {details && <dl>{Object.entries(details).map(([key, value]) => <div key={key}><dt>{key.replaceAll('_', ' ')}</dt><dd>{String(value)}</dd></div>)}</dl>}
    {selected && account.permissions.review_write && <form onSubmit={(event) => { event.preventDefault(); void run(async () => {
      const token = await accessToken(); if (!token) throw new Error('unauthorized')
      await apiRequest(`/v1/admin/applications/${selected}/status`, { status, reason }, token)
      setReason(''); await load(); setMessage('Status updated; audit and history recorded.')
    }) }}><label className="booking-field">Next status<select value={status} onChange={(e) => setStatus(e.target.value)}>{states.map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}</select></label>
      <label className="booking-field">Review reason<textarea required maxLength={2000} value={reason} onChange={(e) => setReason(e.target.value)} /></label>
      <p>Do not put Aadhaar numbers or sensitive documents in the reason.</p><button className="booking-submit" disabled={busy}>Record decision</button></form>}
  </section>
}
