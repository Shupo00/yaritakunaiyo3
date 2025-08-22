"use client"
import { useEffect } from 'react'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxWidthClass?: string
}

export default function Modal({ open, onClose, title, children, maxWidthClass = 'max-w-2xl' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div aria-modal className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-0 overflow-auto">
        <div className={`mx-auto ${maxWidthClass} p-4`}> 
          <div className="card">
            <div className="flex items-center justify-between border-b border-neutral-800/60 px-4 py-3">
              <h2 className="text-sm font-semibold text-neutral-100">{title}</h2>
              <button onClick={onClose} aria-label="閉じる" className="rounded px-2 py-1 text-neutral-300 hover:bg-neutral-800">✕</button>
            </div>
            <div className="p-4">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

