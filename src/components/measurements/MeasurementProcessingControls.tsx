import type { MeasurementDataset, ProcessingOperation } from '../../types/measurement'
import { createProcessingOperation } from '../../utils/measurementProcessing'

interface MeasurementProcessingControlsProps {
  dataset?: MeasurementDataset
  onAddOperation: (operation: ProcessingOperation) => void
}

const commonOperations: Array<ProcessingOperation['type']> = [
  'abs_y',
  'invert_y',
  'normalize_max',
  'normalize_min_max',
  'normalize_area',
  'subtract_constant_baseline',
  'subtract_linear_baseline',
]

export function MeasurementProcessingControls({
  dataset,
  onAddOperation,
}: MeasurementProcessingControlsProps) {
  const isElectrical =
    dataset?.measurementType === 'electrical_iv' ||
    dataset?.measurementType === 'electrical_transfer'
  const isOptical =
    dataset?.measurementType === 'raman' || dataset?.measurementType === 'pl'

  return (
    <div className="space-y-3">
      {isElectrical ? (
        <HelperCard title="電流正負號處理">
          abs(I) 常用於 log plot 或比較電流大小，但是否適合取決於接線方向、掃描方向與物理問題。請保留原始電流。
        </HelperCard>
      ) : null}

      {isOptical ? (
        <HelperCard title="光譜正規化">
          正規化會改變相對強度判讀；若要比較絕對強度，需確認雷射功率、積分時間、光路與量測位置一致。
        </HelperCard>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {commonOperations.map((type) => {
          const operation = createProcessingOperation(type)
          return (
            <button
              className="secondary-button"
              key={type}
              type="button"
              onClick={() => onAddOperation(operation)}
            >
              {operation.name_zh}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function HelperCard({
  children,
  title,
}: {
  children: string
  title: string
}) {
  return (
    <div className="rounded-md border border-cyan-900/50 bg-cyan-950/20 p-3">
      <h4 className="text-sm font-semibold text-cyan-100">{title}</h4>
      <p className="mt-1 text-sm leading-6 text-cyan-100/80">{children}</p>
    </div>
  )
}

