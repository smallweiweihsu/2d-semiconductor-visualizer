import type { ProcessingOperation } from '../../types/measurement'
import { processingOperationLabel } from '../../utils/measurementProcessing'

interface MeasurementProcessingOperationListProps {
  operations: ProcessingOperation[]
  onChangeOperations: (operations: ProcessingOperation[]) => void
}

export function MeasurementProcessingOperationList({
  operations,
  onChangeOperations,
}: MeasurementProcessingOperationListProps) {
  function updateOperation(
    operationId: string,
    changes: Partial<ProcessingOperation>,
  ) {
    onChangeOperations(
      operations.map((operation) =>
        operation.id === operationId ? { ...operation, ...changes } : operation,
      ),
    )
  }

  function updateParameter(
    operation: ProcessingOperation,
    key: string,
    value: number | string | boolean | null,
  ) {
    updateOperation(operation.id, {
      parameters: {
        ...operation.parameters,
        [key]: value,
      },
    })
  }

  return (
    <div className="space-y-3">
      {operations.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-700 p-3 text-sm text-slate-500">
          尚未加入處理步驟。
        </div>
      ) : null}

      {operations.map((operation, index) => (
        <article
          className="rounded-lg border border-slate-800 bg-slate-950/60 p-3"
          key={operation.id}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-100">
              <input
                checked={operation.enabled}
                type="checkbox"
                onChange={(event) =>
                  updateOperation(operation.id, { enabled: event.target.checked })
                }
              />
              {index + 1}. {operation.name_zh}
            </label>

            <div className="flex gap-2">
              <button
                className="secondary-button"
                disabled={index === 0}
                type="button"
                onClick={() => {
                  const next = [...operations]
                  const temp = next[index - 1]
                  next[index - 1] = next[index]
                  next[index] = temp
                  onChangeOperations(next)
                }}
              >
                上移
              </button>
              <button
                className="secondary-button"
                disabled={index === operations.length - 1}
                type="button"
                onClick={() => {
                  const next = [...operations]
                  const temp = next[index + 1]
                  next[index + 1] = next[index]
                  next[index] = temp
                  onChangeOperations(next)
                }}
              >
                下移
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() =>
                  onChangeOperations(
                    operations.filter((item) => item.id !== operation.id),
                  )
                }
              >
                移除
              </button>
            </div>
          </div>

          {operation.type === 'subtract_constant_baseline' ? (
            <label className="mt-3 block text-sm text-slate-300">
              baseline 常數
              <input
                className="field-input mt-2"
                type="number"
                value={Number(operation.parameters.baselineValue ?? 0)}
                onChange={(event) =>
                  updateParameter(
                    operation,
                    'baselineValue',
                    Number(event.target.value),
                  )
                }
              />
            </label>
          ) : null}

          {operation.type === 'subtract_linear_baseline' ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-4">
              {(['x1', 'y1', 'x2', 'y2'] as const).map((key) => (
                <label className="text-sm text-slate-300" key={key}>
                  {key}
                  <input
                    className="field-input mt-2"
                    type="number"
                    value={Number(operation.parameters[key] ?? 0)}
                    onChange={(event) =>
                      updateParameter(operation, key, Number(event.target.value))
                    }
                  />
                </label>
              ))}
            </div>
          ) : null}

          {operation.warnings_zh?.length ? (
            <ul className="mt-3 space-y-1 text-xs leading-5 text-amber-200/80">
              {operation.warnings_zh.map((warning) => (
                <li key={warning}>- {warning}</li>
              ))}
            </ul>
          ) : null}

          <p className="mt-2 text-xs text-slate-500">
            類型：{processingOperationLabel(operation.type)}
          </p>
        </article>
      ))}
    </div>
  )
}

