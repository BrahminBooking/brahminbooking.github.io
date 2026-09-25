import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Account } from './AuthProvider'
import { AuthExperience } from './AuthExperience'

const mocks = vi.hoisted(() => ({ session: {} as Record<string, unknown>, request: vi.fn(), refresh: vi.fn(), push: vi.fn() }))
vi.mock('./AuthProvider', () => ({ useAuth: () => mocks.session }))
vi.mock('@/i18n/SiteLocaleProvider', () => ({ useSiteLocale: () => ({ locale: 'en' }) }))
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock('@/lib/api/client', () => ({ apiRequest: mocks.request }))
vi.mock('@/lib/firebase/client', () => ({ firebaseAuth: () => ({ currentUser: { getIdToken: async () => 'test-token' } }), safeNext: () => '/auth/' }))

const account: Account = {
  id: 'internal-user', email: 'synthetic@example.test', email_verified: true, display_name: 'Synthetic', account_status: 'active',
  onboarding_completed_at: '2026-09-26T00:00:00Z', application_status: 'not_applied', provider_status: 'none',
  permissions: { customer: true, submit_booking: true, purohit: false, admin: false, review: false, review_write: false },
}
afterEach(cleanup)
beforeEach(() => {
  vi.clearAllMocks()
  mocks.request.mockResolvedValue(account)
  mocks.session = { user: { uid: 'firebase-user', email: account.email, providerData: [{ providerId: 'google.com' }] }, account, loading: false, error: false, refresh: mocks.refresh }
})

describe('role-aware account UI', () => {
  it('keeps anonymous registration available from sign-in', () => {
    mocks.session.user = null; mocks.session.account = null
    render(<AuthExperience />)
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Register as a Purohit without signing in.' })).toHaveAttribute('href', expect.stringMatching(/^\/register-as-brahmin\/?$/))
  })
  it('does not expose booking or provider actions without trusted permissions', () => {
    mocks.session.account = { ...account, email_verified: false, permissions: { ...account.permissions, submit_booking: false } }
    render(<AuthExperience />)
    expect(screen.getByRole('button', { name: 'Verify email' })).toBeVisible()
    expect(screen.queryByRole('link', { name: 'book.submit' })).not.toBeInTheDocument()
    expect(screen.queryByText(/Switch mode/)).not.toBeInTheDocument()
  })
  it('retains the authenticated session and offers recovery after API failure', () => {
    mocks.session.account = null; mocks.session.error = true
    render(<AuthExperience />)
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeVisible()
    expect(screen.queryByRole('link', { name: 'book.submit' })).not.toBeInTheDocument()
  })
  it('persists onboarding intent without claiming provider approval', async () => {
    mocks.session.account = { ...account, onboarding_completed_at: null }
    render(<AuthExperience />)
    await userEvent.click(screen.getByRole('button', { name: 'Purohit' }))
    expect(mocks.request).toHaveBeenCalledWith('/v1/account/onboarding', { intent: 'purohit' }, 'test-token')
    expect(mocks.refresh).toHaveBeenCalledOnce()
    expect(screen.queryByText(/Switch mode/)).not.toBeInTheDocument()
  })
  it('keeps customer booking available when provider access is suspended', () => {
    mocks.session.account = { ...account, provider_status: 'suspended' }
    render(<AuthExperience />)
    expect(screen.getByRole('link', { name: 'book.submit' })).toHaveAttribute('href', expect.stringMatching(/^\/book\/?$/))
    expect(screen.queryByText(/Switch mode/)).not.toBeInTheDocument()
    expect(mocks.request).not.toHaveBeenCalled()
  })
})
