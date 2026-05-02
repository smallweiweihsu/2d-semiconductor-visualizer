import type {
  LiteratureReviewStatus,
  MaterialLiteratureTodo,
  ParameterRecommendation,
} from '../../types/literature'
import {
  formatParameterRecommendationStatus,
  formatReviewStatus,
  formatTodoStatus,
} from './literatureFormatting'

interface LiteratureReviewWorkflowProps {
  currentStatus:
    | LiteratureReviewStatus
    | MaterialLiteratureTodo['status']
    | ParameterRecommendation['status']
  mode: 'source' | 'todo' | 'recommendation'
  onChangeStatus: (status: string) => void
}

const sourceStatuses: LiteratureReviewStatus[] = [
  'candidate',
  'reviewed',
  'verified',
  'rejected',
]
const todoStatuses: MaterialLiteratureTodo['status'][] = [
  'todo',
  'in_progress',
  'candidate_found',
  'reviewed',
  'verified',
]
const recommendationStatuses: ParameterRecommendation['status'][] = [
  'draft',
  'reviewed',
  'ready_to_promote',
  'rejected',
]

export function LiteratureReviewWorkflow({
  currentStatus,
  mode,
  onChangeStatus,
}: LiteratureReviewWorkflowProps) {
  const statuses =
    mode === 'source'
      ? sourceStatuses
      : mode === 'todo'
        ? todoStatuses
        : recommendationStatuses

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <button
          className={`rounded-md border px-2.5 py-1.5 text-xs transition ${
            currentStatus === status
              ? 'border-cyan-600 bg-cyan-950/45 text-cyan-100'
              : 'border-slate-700 bg-slate-950/40 text-slate-300 hover:border-slate-600'
          }`}
          key={status}
          onClick={() => onChangeStatus(status)}
          type="button"
        >
          {formatStatus(status, mode)}
        </button>
      ))}
    </div>
  )
}

function formatStatus(
  status: string,
  mode: LiteratureReviewWorkflowProps['mode'],
) {
  if (mode === 'source') {
    return formatReviewStatus(status as LiteratureReviewStatus)
  }

  if (mode === 'todo') {
    return formatTodoStatus(status as MaterialLiteratureTodo['status'])
  }

  return formatParameterRecommendationStatus(
    status as ParameterRecommendation['status'],
  )
}
