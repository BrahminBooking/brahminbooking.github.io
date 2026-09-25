import { signOut as firebaseSignOut } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase/client'

export async function accessToken(): Promise<string | null> {
  const auth = firebaseAuth()
  await auth.authStateReady()
  return auth.currentUser ? auth.currentUser.getIdToken() : null
}

export async function signOut() {
  await firebaseSignOut(firebaseAuth())
  window.sessionStorage.removeItem('brahminbooking:api-session:v1')
}
