import { createClient } from 'npm:@supabase/supabase-js@2.112.3'
import { z } from 'npm:zod@4.4.3'

const supportedLanguages = ['hindi', 'sanskrit', 'english', 'gujarati', 'kannada', 'marathi', 'telugu', 'tamil', 'bengali', 'other'] as const
const traditions = ['smarta', 'vaishnava', 'shaiva', 'shakta', 'swaminarayan', 'madhva', 'ramanandi', 'other'] as const
const pujas = ['ganesh-puja', 'satyanarayan-puja', 'griha-pravesh', 'rudrabhishek', 'lakshmi-puja', 'navagraha-puja', 'havan-homa', 'vastu-puja'] as const
const samskaras = ['vivaha', 'upanayana', 'namakarana', 'annaprashana', 'mundan', 'antyeshti', 'shraddha'] as const

const optionalText = (max: number) => z.string().trim().max(max).optional().default('')
const optionalNumber = (min: number, max: number) => z.number().int().min(min).max(max).optional()

const payloadSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  displayName: optionalText(120),
  phone: z.string().trim().regex(/^\+?[0-9][0-9\s-]{8,16}$/),
  whatsapp: z.string().trim().regex(/^$|^\+?[0-9][0-9\s-]{8,16}$/).optional().default(''),
  email: z.union([z.email(), z.literal('')]).optional().default(''),
  preferredContact: z.enum(['phone', 'whatsapp']),
  preferredTime: optionalText(100),
  birthYear: optionalNumber(1920, new Date().getUTCFullYear() - 18),
  aadhaarAvailable: z.enum(['yes', 'no', 'prefer-not']),
  aadhaarLastFour: z.string().regex(/^$|^[0-9]{4}$/).optional().default(''),
  city: z.string().trim().min(2).max(100),
  district: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  country: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().regex(/^[0-9A-Za-z -]{4,10}$/),
  serviceAreas: z.string().trim().min(2).max(500),
  travelRadiusKm: z.number().int().min(0).max(1000),
  spokenLanguages: z.array(z.enum(supportedLanguages)).min(1).max(10),
  ritualLanguages: z.array(z.enum(supportedLanguages)).min(1).max(10),
  tradition: z.enum(traditions),
  traditionOther: optionalText(100),
  guruName: optionalText(160),
  affiliation: optionalText(240),
  experienceYears: z.number().int().min(0).max(80),
  background: z.string().trim().min(20).max(2000),
  pujas: z.array(z.enum(pujas)).max(8),
  samskaras: z.array(z.enum(samskaras)).max(7),
  otherServices: optionalText(500),
  serviceModes: z.array(z.enum(['home', 'temple', 'remote'])).min(1).max(3),
  samagriCapability: z.enum(['all', 'some', 'none']),
  samagriNotes: optionalText(500),
  dakshinaMin: optionalNumber(0, 10_000_000),
  dakshinaMax: optionalNumber(0, 10_000_000),
  chargeNotes: optionalText(500),
  referenceName: optionalText(120),
  referenceRelationship: optionalText(120),
  referencePhone: z.string().trim().regex(/^$|^\+?[0-9][0-9\s-]{8,16}$/).optional().default(''),
  referenceInstitution: optionalText(160),
  referralCode: optionalText(40),
  discoverySource: optionalText(160),
  truthConsent: z.literal(true),
  contactConsent: z.literal(true),
  privacyConsent: z.literal(true),
  publicProfilePermission: z.boolean(),
  website: z.literal('').optional().default(''),
}).strict().superRefine((data, context) => {
  if (data.aadhaarAvailable !== 'yes' && data.aadhaarLastFour) context.addIssue({ code: 'custom', path: ['aadhaarLastFour'], message: 'not allowed' })
  if (data.tradition === 'other' && !data.traditionOther) context.addIssue({ code: 'custom', path: ['traditionOther'], message: 'required' })
  if (!data.pujas.length && !data.samskaras.length && !data.otherServices) context.addIssue({ code: 'custom', path: ['pujas'], message: 'service required' })
  if (data.dakshinaMin !== undefined && data.dakshinaMax !== undefined && data.dakshinaMax < data.dakshinaMin) context.addIssue({ code: 'custom', path: ['dakshinaMax'], message: 'invalid range' })
  if (Boolean(data.referenceName) !== Boolean(data.referencePhone)) context.addIssue({ code: 'custom', path: ['referencePhone'], message: 'reference name and phone must be paired' })
})

const requestSchema = z.object({
  applicationType: z.literal('purohit'),
  submissionLocale: z.enum(['en', 'as', 'bn', 'brx', 'doi', 'gu', 'hi', 'kn', 'ks', 'kok', 'mai', 'ml', 'mni', 'mr', 'ne', 'or', 'pa', 'sa', 'sat', 'sd', 'ta', 'te']),
  idempotencyKey: z.uuid(),
  payload: payloadSchema,
}).strict()

const defaultOrigins = ['https://brahminbooking.github.io', 'http://localhost:3000', 'http://127.0.0.1:3000']

function normalizeOrigin(value: string) {
  return value.trim().replace(/\/$/, '')
}

function response(origin: string | null, body: unknown, status = 200) {
  const headers = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Vary', 'Origin')
  }
  return new Response(JSON.stringify(body), { status, headers })
}

async function fingerprint(value: string) {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin')
  const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? defaultOrigins.join(',')).split(',').map(normalizeOrigin).filter(Boolean)
  const normalizedRequestOrigin = origin ? normalizeOrigin(origin) : null
  const allowedOrigin = normalizedRequestOrigin && allowedOrigins.includes(normalizedRequestOrigin) ? normalizedRequestOrigin : null

  if (origin && !allowedOrigin) return response(null, { error: 'origin_not_allowed' }, 403)

  if (request.method === 'OPTIONS') {
    const headers = new Headers({
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin, Access-Control-Request-Headers',
    })
    if (allowedOrigin) headers.set('Access-Control-Allow-Origin', allowedOrigin)
    return new Response(null, { status: 204, headers })
  }

  if (request.method !== 'POST') return response(allowedOrigin, { error: 'method_not_allowed' }, 405)

  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > 100_000) return response(allowedOrigin, { error: 'payload_too_large' }, 413)

  try {
    const parsed = requestSchema.safeParse(await request.json())
    if (!parsed.success) return response(allowedOrigin, { error: 'invalid_submission' }, 400)

    const url = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const rateSalt = Deno.env.get('RATE_LIMIT_SALT')
    if (!url || !serviceKey || !rateSalt) return response(allowedOrigin, { error: 'service_unavailable' }, 503)

    const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const phone = parsed.data.payload.phone.replace(/[^0-9]/g, '')
    const requestFingerprint = await fingerprint(`${rateSalt}|${forwardedFor}|${phone}`)
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count, error: countError } = await supabase
      .from('public_registration_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('request_fingerprint', requestFingerprint)
      .gte('created_at', oneHourAgo)
    if (countError) throw countError
    if ((count ?? 0) >= 5) return response(allowedOrigin, { error: 'too_many_attempts' }, 429)

    await supabase.from('public_registration_attempts').insert({ request_fingerprint: requestFingerprint, accepted: false })

    const { data, error } = await supabase.rpc('create_purohit_application', {
      p_payload: parsed.data.payload,
      p_submission_locale: parsed.data.submissionLocale,
      p_idempotency_key: parsed.data.idempotencyKey,
      p_request_fingerprint: requestFingerprint,
    })
    if (error) throw error

    const receipt = Array.isArray(data) ? data[0] : data
    if (!receipt?.application_number) throw new Error('missing receipt')

    await supabase
      .from('public_registration_attempts')
      .update({ accepted: true })
      .eq('request_fingerprint', requestFingerprint)
      .gte('created_at', oneHourAgo)

    return response(allowedOrigin, { applicationNumber: receipt.application_number }, 201)
  } catch (error) {
    console.error('submit-application failed', error instanceof Error ? error.message : 'unknown error')
    return response(allowedOrigin, { error: 'submission_failed' }, 500)
  }
})
