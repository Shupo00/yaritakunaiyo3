"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function UserMenu() {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setEmail(data.session?.user.email ?? null)
    })
    const { data: authListener } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user.email ?? null)
    })
    return () => {
      mounted = false
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  if (!email) {
    return (
      <Link href="/auth" className="text-neutral-300 hover:text-white">ログイン</Link>
    )
  }

  return (
    <div className="flex items-center gap-3 text-sm text-neutral-300">
      <span className="hidden sm:inline">{email}</span>
      <button
        onClick={() => supabase.auth.signOut()}
        className="rounded border border-neutral-700 px-2 py-1 hover:bg-neutral-800"
      >ログアウト</button>
    </div>
  )
}
