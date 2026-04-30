import type { DeviceValidationWarning } from '../../types/device'
import { countWarningsBySeverity } from './deviceValidation'

interface DeviceValidationPanelProps {
  warnings: DeviceValidationWarning[]
}

const severityLabels = {
  info: '提示',
  warning: '警告',
  error: '錯誤',
}

const severityClasses = {
  info: 'border-sky-800/60 bg-sky-950/25 text-sky-100',
  warning: 'border-amber-800/60 bg-amber-950/25 text-amber-100',
  error: 'border-rose-800/60 bg-rose-950/25 text-rose-100',
}

export function DeviceValidationPanel({ warnings }: DeviceValidationPanelProps) {
  const counts = countWarningsBySeverity(warnings)

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-slate-200">結構檢查</h3>
        <div className="flex gap-2 text-xs text-slate-500">
          <span>錯誤 {counts.error}</span>
          <span>警告 {counts.warning}</span>
          <span>提示 {counts.info}</span>
        </div>
      </div>

      {warnings.length === 0 ? (
        <p className="mt-3 text-sm text-emerald-200">
          目前沒有偵測到明顯設定問題。
        </p>
      ) : (
        <div className="mt-3 max-h-52 space-y-2 overflow-y-auto pr-1">
          {warnings.map((warning) => (
            <div
              className={`rounded-md border px-3 py-2 text-xs leading-5 ${severityClasses[warning.severity]}`}
              key={warning.id}
            >
              <span className="font-medium">
                {severityLabels[warning.severity]}：
              </span>
              {warning.message_zh}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
