import { useMemo, useState, type ReactNode } from 'react'
import { InfoIcon, type InfoNoticeType } from './InfoIcon'

interface AcknowledgableNoticeProps {
  children: ReactNode
  defaultOpen?: boolean
  id: string
  title: string
  type: InfoNoticeType
}

export function AcknowledgableNotice({
  children,
  defaultOpen = false,
  id,
  title,
  type,
}: AcknowledgableNoticeProps) {
  const storageKey = `acknowledgedNotice:${id}`
  const initialAcknowledged = useMemo(
    () => window.localStorage.getItem(storageKey) === 'true',
    [storageKey],
  )
  const [isAcknowledged, setIsAcknowledged] = useState(initialAcknowledged)
  const [isOpen, setIsOpen] = useState(defaultOpen && !initialAcknowledged)

  function toggleAcknowledged() {
    setIsAcknowledged((current) => {
      const next = !current
      window.localStorage.setItem(storageKey, String(next))
      if (next) {
        setIsOpen(false)
      }
      return next
    })
  }

  return (
    <section
      className={`rounded-lg border p-3 transition ${
        isAcknowledged
          ? 'border-slate-800 bg-slate-950/20 opacity-70'
          : 'border-amber-900/40 bg-amber-950/15'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          aria-expanded={isOpen}
          className="min-w-0 text-left text-sm font-medium text-slate-100"
          type="button"
          onClick={() => setIsOpen((current) => !current)}
        >
          <InfoIcon type={type} label={title} />
        </button>
        <div className="flex gap-2">
          <button
            className="secondary-button"
            type="button"
            onClick={() => setIsOpen((current) => !current)}
          >
            {isOpen ? '收合' : '查看'}
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={toggleAcknowledged}
          >
            {isAcknowledged ? '標示未讀' : '已讀'}
          </button>
        </div>
      </div>
      {isOpen ? (
        <div className="mt-3 text-sm leading-6 text-slate-300">{children}</div>
      ) : null}
    </section>
  )
}
