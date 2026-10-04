import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — copy .env.example to .env and fill them in.',
  )
}

/**
 * Publishable-key client. Every table is world-readable and admin-writable via
 * RLS, so the same client serves the public site and the admin editors — the
 * signed-in session is what unlocks writes.
 */
export const supabase = createClient(url, anonKey)

/** For the raw Storage upload in the admin, which needs progress events the client doesn't expose. */
export { url as supabaseUrl, anonKey as supabaseAnonKey }
