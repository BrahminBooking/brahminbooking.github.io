import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

let instance: Auth | null = null

// Public web configuration only. Admin credentials never enter this build.
export function firebaseAuth(): Auth {
  if (instance) return instance
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  if (!projectId || !apiKey || !authDomain || !appId) throw new Error('serviceUnavailable')
  if (projectId !== 'brahminbooking-staging' && projectId !== 'brahminbooking') throw new Error('serviceUnavailable')
  const app = getApps().length ? getApp() : initializeApp({ projectId, apiKey, authDomain, appId })
  instance = getAuth(app)
  return instance
}

export function safeNext(value: string | null): string {
  return value && ['/book/', '/auth/', '/register-as-brahmin/'].includes(value) ? value : '/auth/'
}
