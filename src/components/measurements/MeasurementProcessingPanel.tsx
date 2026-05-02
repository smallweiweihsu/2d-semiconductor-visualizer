import { useEffect, useMemo, useState } from 'react'
import type {
  MeasurementDataset,
  ProcessedMeasurementDataset,
  ProcessingOperation,
} from '../../types/measurement'
import { createProcessedMeasurementDataset } from '../../utils/measurementProcessing'
import { MeasurementProcessingControls } from './MeasurementProcessingControls'
import { MeasurementProcessingOperationList } from './MeasurementProcessingOperationList'

interface MeasurementProcessingPanelProps {
  dataset?: MeasurementDataset
  onCreateProcessedDataset: (dataset: ProcessedMeasurementDataset) => void
  processedDatasets: ProcessedMeasurementDataset[]
  selectedProcessedDatasetId?: string
  onSelectProcessedDataset: (datasetId?: string) => void
  onColumnSelectionChange: (selection: { xColumnId: string; yColumnId: string }) => void
}

export function MeasurementProcessingPanel({
  dataset,
  onColumnSelectionChange,
  onCreateProcessedDataset,
  onSelectProcessedDataset,
  processedDatasets,
  selectedProcessedDatasetId,
}: MeasurementProcessingPanelProps) {
  const numericColumns =
    dataset?.columns.filter((column) =>
      dataset.rows.some((row) => typeof row.values[column.id] === 'number'),
    ) ?? []
  const [xColumnId, setXColumnId] = useState('')
  const [yColumnId, setYColumnId] = useState('')
  const [operations, setOperations] = useState<ProcessingOperation[]>([])
  const effectiveX = xColumnId || numericColumns[0]?.id || ''
  const effectiveY = yColumnId || numericColumns[1]?.id || numericColumns[0]?.id || ''
  const relatedProcessed = useMemo(
    () =>
      dataset
        ? processedDatasets.filter((item) => item.sourceDatasetId === dataset.id)
        : [],
    [dataset, processedDatasets],
  )

  useEffect(() => {
    if (effectiveX && effectiveY) {
      onColumnSelectionChange({ xColumnId: effectiveX, yColumnId: effectiveY })
    }
  }, [effectiveX, effectiveY, onColumnSelectionChange])

  function updateColumnSelection(nextX: string, nextY: string) {
    setXColumnId(nextX)
    setYColumnId(nextY)
    onColumnSelectionChange({ xColumnId: nextX, yColumnId: nextY })
  }

  function createProcessed() {
    if (!dataset || !effectiveX || !effectiveY) {
      return
    }

    const processed = createProcessedMeasurementDataset({
      dataset,
      operations,
      xColumnId: effectiveX,
      yColumnId: effectiveY,
    })

    onCreateProcessedDataset(processed)
    onSelectProcessedDataset(processed.id)
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-100">資料處理</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            對目前資料集建立非破壞式處理流程。原始資料會保留，處理後資料只作為視覺化與比較使用。
          </p>
        </div>
        <button
          className="action-button"
          disabled={!dataset || operations.length === 0}
          type="button"
          onClick={createProcessed}
        >
          產生處理後資料
        </button>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <label className="text-sm font-medium text-slate-300">
          Source dataset
          <input
            className="field-input mt-2 text-slate-500"
            readOnly
            value={dataset?.name_zh ?? '尚未選擇'}
          />
        </label>
        <label className="text-sm font-medium text-slate-300">
          X column
          <select
            className="field-input mt-2"
            value={effectiveX}
            onChange={(event) =>
              updateColumnSelection(event.target.value, effectiveY)
            }
          >
            {numericColumns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.originalName}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-300">
          Y column
          <select
            className="field-input mt-2"
            value={effectiveY}
            onChange={(event) =>
              updateColumnSelection(effectiveX, event.target.value)
            }
          >
            {numericColumns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.originalName}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4">
        <MeasurementProcessingControls
          dataset={dataset}
          onAddOperation={(operation) => setOperations([...operations, operation])}
        />
      </div>

      <div className="mt-4">
        <MeasurementProcessingOperationList
          operations={operations}
          onChangeOperations={setOperations}
        />
      </div>

      {relatedProcessed.length > 0 ? (
        <div className="mt-4 rounded-md border border-slate-800 bg-slate-950/60 p-3">
          <h4 className="text-sm font-semibold text-slate-200">處理後資料集</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              className={!selectedProcessedDatasetId ? 'tab-button-active' : 'tab-button'}
              type="button"
              onClick={() => onSelectProcessedDataset(undefined)}
            >
              只看原始資料
            </button>
            {relatedProcessed.map((item) => (
              <button
                className={
                  selectedProcessedDatasetId === item.id
                    ? 'tab-button-active'
                    : 'tab-button'
                }
                key={item.id}
                type="button"
                onClick={() => onSelectProcessedDataset(item.id)}
              >
                {item.name_zh}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
