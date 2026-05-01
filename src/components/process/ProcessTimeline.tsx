import type { ProcessStep, ProcessValidationWarning } from '../../types/process'
import {
  getProcessTypeAccentClass,
  getProcessTypeCategory,
  getProcessTypeLabel,
} from './processFormatting'

interface ProcessTimelineProps {
  steps: ProcessStep[]
  selectedStepId: string | null
  warnings: ProcessValidationWarning[]
  onAddStep: () => void
  onDeleteStep: (stepId: string) => void
  onDuplicateStep: (stepId: string) => void
  onMoveStep: (stepId: string, direction: 'up' | 'down') => void
  onSelectStep: (stepId: string) => void
  onToggleStep: (stepId: string) => void
}

export function ProcessTimeline({
  steps,
  selectedStepId,
  warnings,
  onAddStep,
  onDeleteStep,
  onDuplicateStep,
  onMoveStep,
  onSelectStep,
  onToggleStep,
}: ProcessTimelineProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-slate-800 bg-slate-950/35">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">流程時間線</h3>
          <p className="text-xs text-slate-500">由上到下代表製程與量測順序。</p>
        </div>
        <button
          className="rounded-md border border-cyan-700 bg-cyan-950/40 px-3 py-2 text-xs font-medium text-cyan-100 transition hover:border-cyan-500"
          onClick={onAddStep}
          type="button"
        >
          新增製程/量測步驟
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {steps.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
            目前沒有任何製程或量測步驟。
          </div>
        ) : null}

        {steps.map((step, index) => {
          const stepWarnings = warnings.filter((warning) => warning.stepId === step.id)

          return (
            <article
              className={`rounded-lg border p-3 transition ${
                selectedStepId === step.id
                  ? 'border-cyan-500 bg-cyan-950/20'
                  : 'border-slate-800 bg-slate-950/55 hover:border-slate-700'
              }`}
              key={step.id}
            >
              <button
                className="w-full text-left"
                onClick={() => onSelectStep(step.id)}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-800 text-xs text-slate-300">
                        {index + 1}
                      </span>
                      <h4 className="truncate text-sm font-semibold text-slate-100">
                        {step.name_zh}
                      </h4>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                      {step.description_zh}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-1 text-[11px] ${getProcessTypeAccentClass(
                      step.type,
                    )}`}
                  >
                    {getProcessTypeLabel(step.type)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
                  <span className="rounded-full border border-slate-800 px-2 py-1">
                    {getProcessTypeCategory(step.type)}
                  </span>
                  <span className="rounded-full border border-slate-800 px-2 py-1">
                    {step.enabled ? '啟用' : '停用'}
                  </span>
                  <span className="rounded-full border border-slate-800 px-2 py-1">
                    關聯 {step.linkedLayerIds?.length ?? 0} 層
                  </span>
                  {stepWarnings.length > 0 ? (
                    <span className="rounded-full border border-amber-800/60 bg-amber-950/30 px-2 py-1 text-amber-200">
                      {stepWarnings.length} 則提醒
                    </span>
                  ) : null}
                </div>
              </button>

              <div className="mt-3 flex flex-wrap gap-2">
                <TimelineAction onClick={() => onMoveStep(step.id, 'up')} label="上移" />
                <TimelineAction onClick={() => onMoveStep(step.id, 'down')} label="下移" />
                <TimelineAction onClick={() => onDuplicateStep(step.id)} label="複製" />
                <TimelineAction
                  onClick={() => onToggleStep(step.id)}
                  label={step.enabled ? '停用' : '啟用'}
                />
                <TimelineAction danger onClick={() => onDeleteStep(step.id)} label="刪除" />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function TimelineAction({
  danger = false,
  label,
  onClick,
}: {
  danger?: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      className={`rounded-md border px-2.5 py-1.5 text-xs transition ${
        danger
          ? 'border-rose-800/60 text-rose-200 hover:border-rose-500'
          : 'border-slate-700 text-slate-300 hover:border-slate-500'
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}
