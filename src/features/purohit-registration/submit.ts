import { supabase } from '@/lib/supabase/client'
import type { PurohitRegistrationValues } from './schema'

const IDEMPOTENCY_KEY = 'brahminbooking-registration-idempotency'

export interface SubmissionReceipt {
  applicationNumber: string
}

function getIdempotencyKey() {
  const existing = window.sessionStorage.getItem(IDEMPOTENCY_KEY)
  if (existing) return existing
  const value = crypto.randomUUID()
  window.sessionStorage.setItem(IDEMPOTENCY_KEY, value)
  return value
}

export async function submitPurohitRegistration(
  values: PurohitRegistrationValues,
  locale: string,
): Promise<SubmissionReceipt> {
  if (!supabase) throw new Error('serviceUnavailable')

  const { data, error } = await supabase.functions.invoke('submit-application', {
    body: {
      applicationType: 'purohit',
      submissionLocale: locale,
      idempotencyKey: getIdempotencyKey(),
      payload: values,
    },
  })

  if (error) throw new Error('submissionFailed')
  if (!data?.applicationNumber) throw new Error('invalidReceipt')

  window.sessionStorage.removeItem(IDEMPOTENCY_KEY)
  window.localStorage.removeItem('brahminbooking-purohit-draft')
  return { applicationNumber: data.applicationNumber }
}
