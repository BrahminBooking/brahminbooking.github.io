'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { onIdTokenChanged, type User } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase/client'
import { apiRequest } from '@/lib/api/client'

export type Account = {
  id: string; email: string; email_verified: boolean; display_name: string
  account_status: 'active' | 'suspended'; onboarding_intent?: 'customer' | 'purohit'
  onboarding_completed_at: string | null; application_id?: string
  application_status: string; provider_status: 'none' | 'approved' | 'suspended'
  permissions: { customer: boolean; submit_booking: boolean; purohit: boolean; admin: boolean; review: boolean; review_write: boolean }
}
type Session = { user: User | null; account: Account | null; loading: boolean; error: boolean; refresh: () => Promise<void> }
const AuthContext = createContext<Session>({ user: null, account: null, loading: true, error: false, refresh: async () => {} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const generation = useRef(0)
  const sync = useCallback(async (current: User | null) => {
    const version = ++generation.current
    setUser(current); setAccount(null); setLoading(true); setError(false)
    try {
      if (current) {
        const next = await apiRequest<Account>('/v1/auth/me', undefined, await current.getIdToken())
        if (generation.current === version) setAccount(next)
      }
    } catch { if (generation.current === version) setError(true) }
    finally { if (generation.current === version) setLoading(false) }
  }, [])
  useEffect(() => {
    const requestGeneration = generation
    let stop: (() => void) | undefined
    try { stop = onIdTokenChanged(firebaseAuth(), (current) => { void sync(current) }) }
    catch { queueMicrotask(() => { void sync(null) }) }
    return () => { ++requestGeneration.current; stop?.() }
  }, [sync])
  const refresh = useCallback(async () => {
    const current = firebaseAuth().currentUser
    if (current) { await current.reload(); await current.getIdToken(true) }
    await sync(firebaseAuth().currentUser)
  }, [sync])
  return <AuthContext.Provider value={{ user, account, loading, error, refresh }}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }
