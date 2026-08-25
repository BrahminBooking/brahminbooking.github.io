import { createClient } from 'npm:@supabase/supabase-js@2.112.3'
import { z } from 'npm:zod@4.4.3'

const payloadSchema = z.object({
  serviceSlug: z.string().trim().min(1).max(80),
  serviceOther: z.string().trim().max(120).optional().default(''),
  preferredDate: z.union([z.iso.date(), z.literal('')]).optional().default(''),
  dateFlexible: z.boolean(),
  timeWindow: z.enum(['morning', 'afternoon', 'evening', 'flexible']),
  city: z.string().trim().min(2).max(100), area: z.string().trim().min(2).max(160),
  serviceMode: z.enum(['home', 'temple', 'remote', 'unsure']),
  language: z.string().trim().min(1).max(40), tradition: z.string().trim().max(120).optional().default(''),
  samagriAssistance: z.enum(['all', 'some', 'none', 'unsure']),
  attendeeCount: z.string().trim().regex(/^$|^[0-9]{1,4}$/).optional().default(''),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\+?[0-9\s()-]{8,18}$/),
  email: z.union([z.literal(''), z.email()]).optional().default(''),
  whatsapp: z.boolean(), notes: z.string().trim().max(800).optional().default(''),
  contactConsent: z.literal(true), website: z.literal('').optional().default(''),
}).strict().superRefine((value, context) => {
  if (!value.preferredDate && !value.dateFlexible) context.addIssue({ code: 'custom', path: ['preferredDate'], message: 'date_required' })
  if (value.serviceSlug === 'other' && !value.serviceOther) context.addIssue({ code: 'custom', path: ['serviceOther'], message: 'service_required' })
})

const requestSchema = z.object({ idempotencyKey: z.uuid(), payload: payloadSchema }).strict()
const defaultOrigins = ['https://brahminbooking.github.io', 'http://localhost:3000', 'http://127.0.0.1:3000']

function normalizeOrigin(value: string) { return value.trim().replace(/\/$/, '') }

function response(origin: string | null, body: unknown, status = 200) {
  const headers = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
  if (origin) { headers.set('Access-Control-Allow-Origin', origin); headers.set('Vary', 'Origin') }
  return new Response(JSON.stringify(body), { status, headers })
}

async function fingerprint(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin')
  const origins = (Deno.env.get('ALLOWED_ORIGINS') ?? defaultOrigins.join(',')).split(',').map(normalizeOrigin).filter(Boolean)
  const normalizedRequestOrigin = origin ? normalizeOrigin(origin) : null
  const allowedOrigin = normalizedRequestOrigin && origins.includes(normalizedRequestOrigin) ? normalizedRequestOrigin : null
  if (origin && !allowedOrigin) return response(null, { error: 'origin_not_allowed' }, 403)
  if (request.method === 'OPTIONS') {
    const headers = new Headers({ 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Max-Age': '86400', 'Vary': 'Origin, Access-Control-Request-Headers' })
    if (allowedOrigin) headers.set('Access-Control-Allow-Origin', allowedOrigin)
    return new Response(null, { status: 204, headers })
  }
  if (request.method !== 'POST') return response(allowedOrigin, { error: 'method_not_allowed' }, 405)
  if (Number(request.headers.get('content-length') ?? 0) > 50_000) return response(allowedOrigin, { error: 'payload_too_large' }, 413)

  try {
    const parsed = requestSchema.safeParse(await request.json())
    if (!parsed.success) return response(allowedOrigin, { error: 'invalid_submission' }, 400)
    const url = Deno.env.get('SUPABASE_URL'), serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'), salt = Deno.env.get('RATE_LIMIT_SALT')
    if (!url || !serviceKey || !salt) return response(allowedOrigin, { error: 'service_unavailable' }, 503)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const phone = parsed.data.payload.phone.replace(/[^0-9]/g, '')
    const requestFingerprint = await fingerprint(`${salt}|consumer-booking|${ip}|${phone}`)
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count, error: countError } = await supabase.from('public_booking_attempts').select('id', { count: 'exact', head: true }).eq('request_fingerprint', requestFingerprint).gte('created_at', since)
    if (countError) throw countError
    if ((count ?? 0) >= 5) return response(allowedOrigin, { error: 'too_many_attempts' }, 429)
    await supabase.from('public_booking_attempts').insert({ request_fingerprint: requestFingerprint, accepted: false })
    const { data, error } = await supabase.rpc('create_consumer_booking_request', { p_payload: parsed.data.payload, p_idempotency_key: parsed.data.idempotencyKey, p_request_fingerprint: requestFingerprint })
    if (error) throw error
    const receipt = Array.isArray(data) ? data[0] : data
    if (!receipt?.public_reference) throw new Error('missing receipt')
    await supabase.from('public_booking_attempts').update({ accepted: true }).eq('request_fingerprint', requestFingerprint).gte('created_at', since)
    return response(allowedOrigin, { reference: receipt.public_reference, expectedResponse: 'within one working day' }, 201)
  } catch (error) {
    console.error('submit-booking-request failed', error instanceof Error ? error.message : 'unknown error')
    return response(allowedOrigin, { error: 'submission_failed' }, 500)
  }
})
