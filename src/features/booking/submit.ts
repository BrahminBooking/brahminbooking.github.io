import { supabase } from '@/lib/supabase/client'
import type { BookingRequestValues } from './schema'

const IDEMPOTENCY_KEY = 'brahminbooking:booking-idempotency:v1'
export const RECEIPT_KEY = 'brahminbooking:booking-receipt:v1'

export type BookingReceipt = { reference: string; expectedResponse: string; summary?: { service: string; place: string; date: string } }

function idempotencyKey() {
  const existing = window.sessionStorage.getItem(IDEMPOTENCY_KEY)
  if (existing) return existing
  const next = crypto.randomUUID(); window.sessionStorage.setItem(IDEMPOTENCY_KEY, next); return next
}

export async function submitBookingRequest(values: BookingRequestValues): Promise<BookingReceipt> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    await new Promise((resolve) => window.setTimeout(resolve, 350))
    return { reference: `BB-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, expectedResponse: 'within one working day' }
  }
  if (!supabase) throw new Error('serviceUnavailable')
  const { data, error } = await supabase.functions.invoke('submit-booking-request', { body: { idempotencyKey: idempotencyKey(), payload: values } })
  if (error || !data?.reference) throw new Error('submissionFailed')
  window.sessionStorage.removeItem(IDEMPOTENCY_KEY)
  return { reference: data.reference, expectedResponse: data.expectedResponse ?? 'within one working day' }
}

export function saveReceipt(receipt: BookingReceipt) { window.sessionStorage.setItem(RECEIPT_KEY, JSON.stringify(receipt)) }
