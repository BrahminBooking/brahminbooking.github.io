import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// A migrated build must not initialize the legacy SDK or make Auth/DB calls
// directly to Supabase. All such calls go through the Go API.
export const isSupabaseConfigured = !process.env.NEXT_PUBLIC_API_BASE_URL && Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
