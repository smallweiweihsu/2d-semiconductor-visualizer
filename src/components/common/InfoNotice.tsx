import type { ReactNode } from 'react'
import { InfoIcon, type InfoNoticeType } from './InfoIcon'

interface InfoNoticeProps {
  children: ReactNode
  type: InfoNoticeType
  title: string
}

export function InfoNotice({ children, title, type }: InfoNoticeProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/35 p-3">
      <div className="text-sm font-semibold text-slate-100">
        <InfoIcon type={type} label={title} />
      </div>
      <div className="mt-2 text-sm leading-6 text-slate-400">{children}</div>
    </div>
  )
}
