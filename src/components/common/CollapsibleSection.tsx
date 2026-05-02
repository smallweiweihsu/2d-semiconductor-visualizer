import { useState, type ReactNode } from 'react'

interface CollapsibleSectionProps {
  children: ReactNode
  defaultOpen?: boolean
  summary?: ReactNode
  title: ReactNode
}

export function CollapsibleSection({
  children,
  defaultOpen = false,
  summary,
  title,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/35">
      <button
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="min-w-0 text-sm font-semibold text-slate-100">
          {title}
        </span>
        <span className="shrink-0 text-xs text-slate-500">
          {isOpen ? '收合' : '展開'}
        </span>
      </button>
      {!isOpen && summary ? (
        <div className="border-t border-slate-800 px-4 py-3 text-xs leading-5 text-slate-500">
          {summary}
        </div>
      ) : null}
      {isOpen ? (
        <div className="border-t border-slate-800 px-4 py-3">{children}</div>
      ) : null}
    </section>
  )
}
