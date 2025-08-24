"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)
  const [authed, setAuthed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setAuthed(!!data.session)
      setChecking(false)
    })
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session)
    })
    return () => {
      mounted = false
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!checking && !authed) {
      const next = encodeURIComponent(pathname || '/')
      router.replace(`/auth?next=${next}`)
    }
  }, [checking, authed, pathname, router])

  if (checking) {
    return <div className="text-neutral-400">認証確認中…</div>
  }

  if (!authed) {
    return (
      <div className="rounded border border-neutral-800 bg-[var(--card)] p-4 text-sm text-neutral-300">
        このページを利用するにはログインが必要です。<Link href="/auth" className="ml-2 text-poison-500">ログインへ</Link>
      </div>
    )
  }
  return <>{children}</>
}
