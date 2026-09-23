import { apiRequest } from './client'

const key = 'brahminbooking:api-session:v1'
type Session = { access_token: string; refresh_token: string; expires_at: number }
let refreshing: Promise<string | null> | null = null

export async function captureSessionFragment() {
  const fragment = new URLSearchParams(window.location.hash.slice(1))
  const token = fragment.get('access_token')
  if (!token) return
  const refresh = fragment.get('refresh_token')
  const lifetime = Number(fragment.get('expires_in'))
  window.history.replaceState(null, '', window.location.pathname)
  if (!refresh || !Number.isFinite(lifetime) || lifetime <= 0) throw new Error('invalidSession')
  await apiRequest('/v1/auth/me', undefined, token)
  window.sessionStorage.setItem(key, JSON.stringify({ access_token: token, refresh_token: refresh, expires_at: Date.now() + lifetime * 1000 } satisfies Session))
}

// Auth stays optional. Session lifetime is tab-scoped and refresh-token rotation
// goes through the backend; simultaneous callers share one refresh operation.
export async function accessToken(): Promise<string | null> {
  const raw = window.sessionStorage.getItem(key)
  if (!raw) return null
  let session: Session
  try { session = JSON.parse(raw) as Session } catch { window.sessionStorage.removeItem(key); return null }
  if (session.expires_at > Date.now() + 60_000) return session.access_token
  if (refreshing) return refreshing
  refreshing = apiRequest<{ access_token: string; refresh_token: string; expires_in: number }>('/v1/auth/refresh', { refresh_token: session.refresh_token }).then((result) => {
    window.sessionStorage.setItem(key, JSON.stringify({ access_token: result.access_token, refresh_token: result.refresh_token, expires_at: Date.now() + result.expires_in * 1000 } satisfies Session))
    return result.access_token
  }).catch(() => { window.sessionStorage.removeItem(key); return null }).finally(() => { refreshing = null })
  return refreshing
}

export async function signOut() {
  const token = await accessToken()
  try { if (token) await apiRequest('/v1/auth/logout', {}, token) } finally { window.sessionStorage.removeItem(key) }
}
