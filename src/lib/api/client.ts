// A build selects one writer. Never fall back to Supabase after a Go API error:
// doing so could submit the same request into two independent databases.
export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '')

export class ApiError extends Error {
  constructor(readonly status: number, readonly code: string) { super(code) }
}

export async function apiRequest<T>(path: string, body?: unknown, token?: string): Promise<T> {
  if (!apiBaseUrl) throw new Error('serviceUnavailable')
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
    credentials: 'omit',
    cache: 'no-store',
  })
  if (!response.ok) {
    const result: unknown = await response.json().catch(() => null)
    const code = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string' ? result.error : 'submissionFailed'
    throw new ApiError(response.status, response.status === 503 ? 'serviceUnavailable' : code)
  }
  return response.json() as Promise<T>
}
