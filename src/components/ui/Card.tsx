import { PropsWithChildren } from 'react'

type CardProps = PropsWithChildren<{ className?: string; title?: string; description?: string }>

export default function Card({ className = '', title, description, children }: CardProps) {
  return (
    <section className={`card ${className}`}>
      {(title || description) && (
        <header className="border-b border-neutral-800/50 px-4 py-3">
          {title && <h2 className="text-sm font-semibold text-neutral-100">{title}</h2>}
          {description && <p className="mt-1 text-xs text-neutral-400">{description}</p>}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  )
}

