"use client"
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import UserMenu from '@/components/UserMenu'

function cx(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(' ') }

function NavLink({ href, label, icon, size = 'md' }: { href: string; label: string; icon?: React.ReactNode; size?: 'sm'|'md' }) {
  const pathname = usePathname()
  const active = pathname === href
  return (
    <Link
      href={href}
      className={cx(
        'inline-flex items-center gap-1 rounded-md text-sm transition',
        size === 'sm' ? 'px-2 py-1' : 'px-3 py-2',
        'border border-transparent hover:border-neutral-700 hover:bg-neutral-900/50',
        active && 'bg-neutral-900/70 border-neutral-700 text-white shadow-glow'
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}

export default function NavBar() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [menuRef])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null))
    const { data: authListener } = supabase.auth.onAuthStateChange((_e, session) => setEmail(session?.user.email ?? null))
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      authListener?.subscription?.unsubscribe()
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  async function onLogout() {
    await supabase.auth.signOut()
    setOpen(false)
    router.replace('/')
  }

  return (
    <nav className="flex items-center justify-between p-3 text-sm flex-nowrap w-full">
      <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
        <Link href="/" className="block truncate font-semibold text-transparent bg-clip-text bg-gradient-to-r from-poison-500 to-red-500 drop-shadow text-base sm:text-lg whitespace-nowrap max-w-[55vw]">
          やりたくないよ！
        </Link>
        <div className="hidden sm:flex items-center gap-2 text-neutral-300">
          <NavLink href="/add" label="追加" icon={<PlusIcon />} />
          <NavLink href="/stats" label="統計" icon={<ChartIcon />} />
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-auto">
        <div className="sm:hidden">
          <button aria-label="メニュー" onClick={()=>setOpen(v=>!v)} className="rounded-md border border-neutral-700 bg-neutral-900/70 p-2 text-neutral-200">
            <BurgerIcon />
          </button>
        </div>
        <div className="hidden sm:block">
          <UserMenu />
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" />
          <div ref={menuRef} className="absolute right-3 top-3 w-56 rounded-lg border border-neutral-800 bg-[var(--card)]/90 p-2 shadow-card backdrop-blur-md">
            <div className="px-2 py-1 text-xs text-neutral-400">メニュー</div>
            <div className="flex flex-col gap-1 p-1">
              <Link href="/add" onClick={()=>setOpen(false)} className="rounded-md px-3 py-2 text-neutral-200 hover:bg-neutral-800/80 inline-flex items-center gap-2">
                <PlusIcon /> 追加
              </Link>
              <Link href="/stats" onClick={()=>setOpen(false)} className="rounded-md px-3 py-2 text-neutral-200 hover:bg-neutral-800/80 inline-flex items-center gap-2">
                <ChartIcon /> 統計
              </Link>
              {email ? (
                <button onClick={onLogout} className="rounded-md px-3 py-2 text-left text-neutral-200 hover:bg-neutral-800/80 inline-flex items-center gap-2">
                  <LogoutIcon /> ログアウト
                </button>
              ) : (
                <Link href="/auth" onClick={()=>setOpen(false)} className="rounded-md px-3 py-2 text-neutral-200 hover:bg-neutral-800/80 inline-flex items-center gap-2">
                  <LoginIcon /> ログイン
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-80">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-80">
      <path d="M3 3v18h18" />
      <path d="M7 15l4-4 3 3 5-6" />
    </svg>
  )
}

function BurgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-90">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-80">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  )
}

function LoginIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-80">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="M10 17l-5-5 5-5" />
      <path d="M15 12H5" />
    </svg>
  )
}
