export type InfoNoticeType =
  | 'warning'
  | 'assumption'
  | 'missing_parameter'
  | 'literature'
  | 'tip'

interface InfoIconProps {
  type: InfoNoticeType
  label?: string
}

export function InfoIcon({ label, type }: InfoIconProps) {
  const config = {
    warning: {
      symbol: '!',
      className: 'border-amber-600 bg-amber-950 text-amber-100',
      label: '警告',
    },
    assumption: {
      symbol: 'i',
      className: 'border-cyan-600 bg-cyan-950 text-cyan-100',
      label: '模型假設',
    },
    missing_parameter: {
      symbol: '?',
      className: 'border-rose-600 bg-rose-950 text-rose-100',
      label: '缺少參數',
    },
    literature: {
      symbol: '文',
      className: 'border-violet-600 bg-violet-950 text-violet-100',
      label: '文獻來源',
    },
    tip: {
      symbol: 'i',
      className: 'border-emerald-600 bg-emerald-950 text-emerald-100',
      label: '提醒',
    },
  }[type]

  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className={`grid h-6 w-6 place-items-center rounded-full border text-xs font-bold ${config.className}`}
      >
        {config.symbol}
      </span>
      <span>{label ?? config.label}</span>
    </span>
  )
}
