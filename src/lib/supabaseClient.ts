import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Avoid throwing during Next.js build (SSR/edge compile). Validate only in browser runtime.
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

if (typeof window !== 'undefined') {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Surface a clear runtime error in the browser if env vars are missing.
    // eslint-disable-next-line no-console
    console.error('環境変数が不足しています。NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。')
  }
}
