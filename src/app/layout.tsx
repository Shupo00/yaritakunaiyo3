import './globals.css'
import NavBar from '@/components/ui/NavBar'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export const metadata = {
  title: 'やりたくないよ！',
  description: '行動とやりたくない理由を可視化する',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen">
        <header className="sticky top-0 z-50 border-b border-neutral-800/60 bg-neutral-950/60 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
          <div className="mx-auto max-w-4xl">
            <NavBar />
          </div>
        </header>
        <main className="mx-auto max-w-4xl p-4">{children}</main>
      </body>
    </html>
  )
}

