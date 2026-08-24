export type AnalyticsEvent =
  | 'booking_request_started'
  | 'booking_step_completed'
  | 'booking_request_submitted'
  | 'location_changed'
  | 'panchang_opened'
  | 'festival_opened'
  | 'puja_opened'
  | 'optional_account_cta_shown'
  | 'account_created_after_booking'
  | 'provider_registration_cta_clicked'

const allowedKeys = new Set(['route', 'action', 'content_slug', 'service_category', 'location_method', 'device_class'])
const prohibitedPattern = /(name|phone|email|address|notes|query|latitude|longitude|coordinate|payload|contact)/i

export function sanitizeAnalyticsProperties(properties: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(properties).filter(([key, value]) => allowedKeys.has(key) && !prohibitedPattern.test(key) && ['string', 'number', 'boolean'].includes(typeof value)))
}

export function track(event: AnalyticsEvent, properties: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('brahminbooking:analytics', { detail: { event, properties: sanitizeAnalyticsProperties(properties) } }))
}
