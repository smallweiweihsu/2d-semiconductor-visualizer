import type { ProcessParameter, ProcessParameterValue } from '../../types/process'

interface ProcessParameterEditorProps {
  parameter: ProcessParameter
  onUpdateParameter: (parameter: ProcessParameter) => void
}

export function ProcessParameterEditor({
  parameter,
  onUpdateParameter,
}: ProcessParameterEditorProps) {
  function updateValue(value: ProcessParameterValue) {
    onUpdateParameter({
      ...parameter,
      value,
      confidence: value === null || value === '' ? 'unknown' : parameter.confidence ?? 'estimated',
    })
  }

  return (
    <label className="block rounded-md border border-slate-800 bg-slate-950/35 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-200">
          {parameter.label_zh}
          {parameter.required ? <span className="text-amber-300"> *</span> : null}
        </span>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {parameter.unit ? <span>{parameter.unit}</span> : null}
          {parameter.confidence ? <ConfidenceBadge confidence={parameter.confidence} /> : null}
        </div>
      </div>

      <div className="mt-2">{renderInput(parameter, updateValue)}</div>

      {parameter.note_zh ? (
        <p className="mt-2 text-xs leading-5 text-slate-500">{parameter.note_zh}</p>
      ) : null}
    </label>
  )
}

function renderInput(
  parameter: ProcessParameter,
  updateValue: (value: ProcessParameterValue) => void,
) {
  const baseClass =
    'w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-500'

  if (parameter.type === 'textarea') {
    return (
      <textarea
        className={`${baseClass} min-h-20 resize-y`}
        onChange={(event) => updateValue(event.target.value)}
        value={formatProcessValueForInput(parameter.value)}
      />
    )
  }

  if (parameter.type === 'select') {
    return (
      <select
        className={baseClass}
        onChange={(event) => updateValue(event.target.value)}
        value={formatProcessValueForInput(parameter.value)}
      >
        <option value="">未選擇</option>
        {(parameter.options ?? []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    )
  }

  if (parameter.type === 'boolean') {
    return (
      <button
        className={`rounded-md border px-3 py-2 text-sm transition ${
          parameter.value
            ? 'border-cyan-600 bg-cyan-950/50 text-cyan-100'
            : 'border-slate-700 bg-slate-950/70 text-slate-400'
        }`}
        onClick={() => updateValue(!parameter.value)}
        type="button"
      >
        {parameter.value ? '是' : '否'}
      </button>
    )
  }

  if (parameter.type === 'number') {
    return (
      <input
        className={baseClass}
        onChange={(event) =>
          updateValue(event.target.value === '' ? null : Number(event.target.value))
        }
        type="number"
        value={parameter.value === null ? '' : Number(parameter.value)}
      />
    )
  }

  return (
    <input
      className={baseClass}
      onChange={(event) => updateValue(event.target.value)}
      type="text"
      value={formatProcessValueForInput(parameter.value)}
    />
  )
}

function formatProcessValueForInput(value: ProcessParameterValue) {
  if (value === null || typeof value === 'boolean') {
    return ''
  }

  return String(value)
}

function ConfidenceBadge({
  confidence,
}: {
  confidence: NonNullable<ProcessParameter['confidence']>
}) {
  const label =
    confidence === 'known'
      ? '已知'
      : confidence === 'estimated'
        ? '估計值'
        : '需要文獻參數'
  const className =
    confidence === 'known'
      ? 'border-emerald-700/60 bg-emerald-950/30 text-emerald-100'
      : confidence === 'estimated'
        ? 'border-amber-700/60 bg-amber-950/30 text-amber-100'
        : 'border-slate-700 bg-slate-900 text-slate-300'

  return (
    <span className={`rounded-full border px-2 py-0.5 ${className}`}>
      {label}
    </span>
  )
}
