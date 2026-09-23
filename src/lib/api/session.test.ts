import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const request = vi.hoisted(() => vi.fn())
vi.mock('./client', () => ({ apiRequest: request }))
const key = 'brahminbooking:api-session:v1'
let storage: Map<string, string>
let replaceState: ReturnType<typeof vi.fn>

beforeEach(() => {
  request.mockReset()
  storage = new Map()
  replaceState = vi.fn()
  vi.stubGlobal('window', {
    location: { hash: '#access_token=access&refresh_token=refresh&expires_in=3600', pathname: '/sign-in/' },
    history: { replaceState },
    sessionStorage: {
      getItem: (name: string) => storage.get(name) ?? null,
      setItem: (name: string, value: string) => storage.set(name, value),
      removeItem: (name: string) => storage.delete(name),
    },
  })
})
afterEach(() => { vi.unstubAllGlobals(); vi.resetModules() })

describe('optional API session', () => {
  it('removes callback secrets before verifying and storing a session', async () => {
    request.mockImplementation(async () => {
      expect(replaceState).toHaveBeenCalledWith(null, '', '/sign-in/')
      expect(storage.has(key)).toBe(false)
      return { id: 'user' }
    })
    const { captureSessionFragment } = await import('./session')
    await captureSessionFragment()
    expect(request).toHaveBeenCalledWith('/v1/auth/me', undefined, 'access')
    expect(JSON.parse(storage.get(key)!)).toMatchObject({ access_token: 'access', refresh_token: 'refresh' })
  })
  it('does not persist rejected callback tokens', async () => {
    request.mockRejectedValue(new Error('unauthorized'))
    const { captureSessionFragment } = await import('./session')
    await expect(captureSessionFragment()).rejects.toThrow('unauthorized')
    expect(storage.size).toBe(0)
    expect(replaceState).toHaveBeenCalledOnce()
  })
  it('serializes refresh rotation and clears local state on logout', async () => {
    storage.set(key, JSON.stringify({ access_token: 'old', refresh_token: 'refresh', expires_at: 1 }))
    request.mockResolvedValue({ access_token: 'new', refresh_token: 'rotated', expires_in: 3600 })
    const { accessToken, signOut } = await import('./session')
    expect(await Promise.all([accessToken(), accessToken()])).toEqual(['new', 'new'])
    expect(request).toHaveBeenCalledTimes(1)
    await signOut()
    expect(request).toHaveBeenLastCalledWith('/v1/auth/logout', {}, 'new')
    expect(storage.size).toBe(0)
  })
  it('clears an expired session if refresh fails', async () => {
    storage.set(key, JSON.stringify({ access_token: 'old', refresh_token: 'refresh', expires_at: 1 }))
    request.mockRejectedValue(new Error('unauthorized'))
    const { accessToken } = await import('./session')
    await expect(accessToken()).resolves.toBeNull()
    expect(storage.size).toBe(0)
  })
})
