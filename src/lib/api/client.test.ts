import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.resetModules() })

describe('Go API transport', () => {
  it('uses the configured API and omits browser credentials', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.example.test/')
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ reference: 'BB-TEST' }) })
    vi.stubGlobal('fetch', fetcher)
    const { apiRequest } = await import('./client')
    await expect(apiRequest('/v1/booking-requests', { idempotencyKey: 'same-key' })).resolves.toEqual({ reference: 'BB-TEST' })
    expect(fetcher).toHaveBeenCalledWith('https://api.example.test/v1/booking-requests', expect.objectContaining({ credentials: 'omit', method: 'POST', body: '{"idempotencyKey":"same-key"}' }))
  })
  it('does not retry a failed write against another service', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.example.test')
    const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({ error: 'service_unavailable' }) })
    vi.stubGlobal('fetch', fetcher)
    const { apiRequest } = await import('./client')
    await expect(apiRequest('/v1/booking-requests', {})).rejects.toThrow('serviceUnavailable')
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})
