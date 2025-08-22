import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Create client only in the browser to avoid build/prerender crashes
const isBrowser = typeof window !== 'undefined'
let client: SupabaseClient | null = null

if (isBrowser) {
  if (!supabaseUrl || !supabaseAnonKey) {
    // eslint-disable-next-line no-console
    console.error('環境変数が不足しています。NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。')
  } else {
    client = createClient(supabaseUrl, supabaseAnonKey)
  }
}

// Export a safe placeholder on the server; client code should run only in use client components
export const supabase = (client ?? ({} as unknown as SupabaseClient))
