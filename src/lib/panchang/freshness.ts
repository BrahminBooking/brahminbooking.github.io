import type { PanchangResult } from './types'

export function panchangFreshness(result: PanchangResult, now = new Date()): 'fixture' | 'fresh' | 'stale' {
  if (result.status === 'fixture') return 'fixture'
  return new Date(result.source.expiresAt).getTime() > now.getTime() ? 'fresh' : 'stale'
}
