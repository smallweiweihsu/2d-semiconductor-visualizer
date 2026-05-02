import type {
  LiteratureAgreementStatus,
  LiteratureReviewStatus,
} from '../../types/literature'
import { formatAgreementStatus, formatReviewStatus } from './literatureFormatting'

interface LiteratureStatusBadgeProps {
  agreementStatus?: LiteratureAgreementStatus
  reviewStatus?: LiteratureReviewStatus
}

export function LiteratureStatusBadge({
  agreementStatus,
  reviewStatus,
}: LiteratureStatusBadgeProps) {
  if (reviewStatus) {
    const classes: Record<LiteratureReviewStatus, string> = {
      candidate: 'border-amber-800 bg-amber-950/30 text-amber-100',
      reviewed: 'border-cyan-800 bg-cyan-950/30 text-cyan-100',
      verified: 'border-emerald-800 bg-emerald-950/30 text-emerald-100',
      rejected: 'border-rose-800 bg-rose-950/30 text-rose-100',
    }

    return (
      <span className={`rounded-full border px-2.5 py-1 text-xs ${classes[reviewStatus]}`}>
        {formatReviewStatus(reviewStatus)}
      </span>
    )
  }

  if (agreementStatus) {
    const classes: Record<LiteratureAgreementStatus, string> = {
      supports: 'border-emerald-800 bg-emerald-950/30 text-emerald-100',
      contradicts: 'border-rose-800 bg-rose-950/30 text-rose-100',
      condition_dependent: 'border-amber-800 bg-amber-950/30 text-amber-100',
      not_applicable: 'border-slate-700 bg-slate-900 text-slate-400',
      unclear: 'border-violet-800 bg-violet-950/30 text-violet-100',
    }

    return (
      <span className={`rounded-full border px-2.5 py-1 text-xs ${classes[agreementStatus]}`}>
        {formatAgreementStatus(agreementStatus)}
      </span>
    )
  }

  return null
}
