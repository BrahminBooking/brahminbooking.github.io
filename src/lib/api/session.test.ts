import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ ready: vi.fn(), getIdToken: vi.fn(), signOut: vi.fn(), current: true }))
vi.mock('@/lib/firebase/client', () => ({ firebaseAuth: () => ({ authStateReady: mocks.ready, currentUser: mocks.current ? { getIdToken: mocks.getIdToken } : null }) }))
vi.mock('firebase/auth', () => ({ signOut: mocks.signOut }))
beforeEach(() => { vi.clearAllMocks(); mocks.current = true; mocks.ready.mockResolvedValue(undefined); mocks.getIdToken.mockResolvedValue('firebase-token') })
afterEach(() => vi.unstubAllGlobals())
describe('Firebase API session', () => {
  it('waits for restored auth before requesting a refreshed Firebase ID token', async () => {
    const { accessToken } = await import('./session')
    expect(await accessToken()).toBe('firebase-token')
    expect(mocks.ready).toHaveBeenCalledOnce()
    expect(mocks.getIdToken).toHaveBeenCalledOnce()
  })
  it('does not accept legacy fragment or storage tokens', async () => {
    mocks.current = false
    vi.stubGlobal('window', { location: { hash: '#access_token=legacy' } })
    const { accessToken } = await import('./session')
    expect(await accessToken()).toBeNull()
  })
  it('fails closed when refresh fails', async () => {
    mocks.getIdToken.mockRejectedValueOnce(new Error('revoked'))
    const { accessToken } = await import('./session')
    await expect(accessToken()).rejects.toThrow('revoked')
  })
  it('signs out Firebase and removes obsolete session storage', async () => {
    const removeItem = vi.fn()
    vi.stubGlobal('window', { sessionStorage: { removeItem } })
    const { signOut } = await import('./session')
    await signOut()
    expect(mocks.signOut).toHaveBeenCalledOnce()
    expect(removeItem).toHaveBeenCalledWith('brahminbooking:api-session:v1')
  })
})
