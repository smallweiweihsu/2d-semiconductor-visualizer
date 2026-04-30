import type { ParameterConfidence } from '../../types/material'

interface ParameterBadgeProps {
  confidence: ParameterConfidence
}

const confidenceLabels: Record<ParameterConfidence, string> = {
  known: '已知',
  estimated: '估計值',
  unknown: '需要文獻參數',
}

const confidenceStyles: Record<ParameterConfidence, string> = {
  known: 'border-emerald-700/60 bg-emerald-950/35 text-emerald-100',
  estimated: 'border-amber-700/60 bg-amber-950/35 text-amber-100',
  unknown: 'border-rose-700/60 bg-rose-950/35 text-rose-100',
}

export function ParameterBadge({ confidence }: ParameterBadgeProps) {
  return (
    <span
      className={`inline-flex w-fit rounded-full border px-2 py-1 text-xs font-medium ${confidenceStyles[confidence]}`}
    >
      {confidenceLabels[confidence]}
    </span>
  )
}
