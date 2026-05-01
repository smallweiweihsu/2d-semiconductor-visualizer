import type { ProcessValidationWarning } from '../../types/process'
import { getSeverityClass } from './processFormatting'

interface ProcessValidationPanelProps {
  warnings: ProcessValidationWarning[]
}

export function ProcessValidationPanel({ warnings }: ProcessValidationPanelProps) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-100">流程提醒</h3>
        <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-400">
          {warnings.length} 則
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {warnings.length === 0 ? (
          <p className="text-sm text-slate-500">目前沒有流程提醒。</p>
        ) : null}

        {warnings.map((warning) => (
          <div
            className={`rounded-md border px-3 py-2 text-xs leading-5 ${getSeverityClass(
              warning.severity,
            )}`}
            key={warning.id}
          >
            <span className="font-semibold">
              {warning.severity === 'error'
                ? '錯誤'
                : warning.severity === 'warning'
                  ? '警告'
                  : '提醒'}
              ：
            </span>
            {warning.message_zh}
          </div>
        ))}
      </div>
    </section>
  )
}
