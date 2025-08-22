"use client"
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

async function getSupabase() {
  const mod = await import('@/lib/supabaseClient')
  return mod.supabase
}

export default function AuthPage() {
  const [mode, setMode] = useState<'signin'|'signup'|'magic'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const sp = useSearchParams()
  const next = sp.get('next') || '/'

  useEffect(() => {
    getSupabase().then((supabase) => {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) router.replace(next)
      })
    })
  }, [next, router])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const supabase = await getSupabase()
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setMessage('ログインしました')
        router.replace(next)
      } else if (mode === 'signup') {
        if (password !== password2) {
          throw new Error('パスワードが一致しません')
        }
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('登録しました。メールを確認してください。')
      } else {
        const { error } = await supabase.auth.signInWithOtp({ email })
        if (error) throw error
        setMessage('Magic Link を送信しました。メールを確認してください。')
      }
    } catch (err: any) {
      setMessage(err.message ?? 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">認証</h1>
      <div className="flex gap-2 text-sm">
        <button className={`rounded border px-2 py-1 ${mode==='signin'?'border-poison-500':'border-neutral-700'}`} onClick={()=>setMode('signin')}>ログイン</button>
        <button className={`rounded border px-2 py-1 ${mode==='signup'?'border-poison-500':'border-neutral-700'}`} onClick={()=>setMode('signup')}>新規登録</button>
        <button className={`rounded border px-2 py-1 ${mode==='magic'?'border-poison-500':'border-neutral-700'}`} onClick={()=>setMode('magic')}>Magic Link</button>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded border border-neutral-800 bg-[var(--card)] p-4">
        <label className="block text-sm">メール
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                 className="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 p-2 outline-none" required />
        </label>
        {mode !== 'magic' && (
          <label className="block text-sm">パスワード
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                   className="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 p-2 outline-none" required />
          </label>
        )}
        {mode === 'signup' && (
          <label className="block text-sm">パスワード（確認）
            <input type="password" value={password2} onChange={e=>setPassword2(e.target.value)}
                   className="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 p-2 outline-none" required />
          </label>
        )}
        <button disabled={loading || (mode==='signup' && password !== password2)} className="rounded bg-poison-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {loading ? '送信中…' : '送信'}
        </button>
        {message && <p className="text-sm text-neutral-300">{message}</p>}
      </form>
    </section>
  )
}

