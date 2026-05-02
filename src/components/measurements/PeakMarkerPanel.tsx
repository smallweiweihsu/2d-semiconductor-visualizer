import { useMemo, useState } from 'react'
import type {
  MeasurementDataset,
  PeakMarker,
  ProcessedMeasurementDataset,
} from '../../types/measurement'
import { getNumericSeries, suggestLocalMaxima } from '../../utils/measurementProcessing'
import { PeakMarkerList } from './PeakMarkerList'

interface PeakMarkerPanelProps {
  dataset?: MeasurementDataset
  peakMarkers: PeakMarker[]
  processedDataset?: ProcessedMeasurementDataset
  xColumnId?: string
  yColumnId?: string
  onChangePeakMarkers: (markers: PeakMarker[]) => void
}

export function PeakMarkerPanel({
  dataset,
  peakMarkers,
  processedDataset,
  xColumnId,
  yColumnId,
  onChangePeakMarkers,
}: PeakMarkerPanelProps) {
  const [manualX, setManualX] = useState('')
  const [manualLabel, setManualLabel] = useState('unknown peak')
  const [manualAssignment, setManualAssignment] = useState('')
  const [thresholdRatio, setThresholdRatio] = useState(0.2)
  const [minSeparation, setMinSeparation] = useState(10)
  const [maxPeaks, setMaxPeaks] = useState(5)
  const markerSourceRows = processedDataset?.rows ?? dataset?.rows ?? []
  const sourceId = dataset?.id
  const currentMarkers = useMemo(
    () =>
      peakMarkers.filter(
        (marker) =>
          marker.datasetId === sourceId &&
          (!processedDataset || marker.processedDatasetId === processedDataset.id),
      ),
    [peakMarkers, processedDataset, sourceId],
  )

  if (!dataset || !xColumnId || !yColumnId) {
    return (
      <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4 text-sm text-slate-400">
        選擇資料集與 x/y 欄位後，可新增 peak 標記。
      </section>
    )
  }

  const currentDataset = dataset

  const series = getNumericSeries({ rows: markerSourceRows }, xColumnId, yColumnId)

  function yAtNearestX(xValue: number) {
    if (series.x.length === 0) {
      return 0
    }

    const nearestIndex = series.x.reduce(
      (bestIndex, currentX, index) =>
        Math.abs(currentX - xValue) < Math.abs(series.x[bestIndex] - xValue)
          ? index
          : bestIndex,
      0,
    )

    return series.y[nearestIndex] ?? 0
  }

  function addManualMarker() {
    const xValue = Number(manualX)

    if (!Number.isFinite(xValue)) {
      return
    }

    onChangePeakMarkers([
      ...peakMarkers,
      {
        id: `peak-${crypto.randomUUID()}`,
        datasetId: currentDataset.id,
        processedDatasetId: processedDataset?.id,
        xValue,
        yValue: yAtNearestX(xValue),
        label_zh: manualLabel || defaultPeakLabel(currentDataset.measurementType),
        peakType: 'manual',
        assignment_zh: manualAssignment,
        confidence: 'manual',
        notes_zh: '手動標記，尚未進行 peak fitting。',
      },
    ])
  }

  function addSuggestedMarkers() {
    const suggestions = suggestLocalMaxima(
      { x: series.x, y: series.y },
      {
        thresholdRatio,
        minSeparation,
        maxPeaks,
        datasetId: currentDataset.id,
        processedDatasetId: processedDataset?.id,
      },
    )

    onChangePeakMarkers([...peakMarkers, ...suggestions])
  }

  function replaceCurrentMarkers(nextMarkers: PeakMarker[]) {
    const otherMarkers = peakMarkers.filter(
      (marker) =>
        !(
          marker.datasetId === currentDataset.id &&
          (!processedDataset || marker.processedDatasetId === processedDataset.id)
        ),
    )

    onChangePeakMarkers([...otherMarkers, ...nextMarkers])
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
      <div>
        <h3 className="text-base font-semibold text-slate-100">Peak 標記</h3>
        <p className="mt-1 text-sm leading-6 text-slate-400">
          Peak 標記不是 fitting 結果，僅為視覺輔助；自動建議只使用簡單 local maximum 規則。
        </p>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3">
          <h4 className="text-sm font-semibold text-slate-200">手動標記 peak</h4>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <label className="text-sm text-slate-300">
              x 值
              <input
                className="field-input mt-2"
                type="number"
                value={manualX}
                onChange={(event) => setManualX(event.target.value)}
              />
            </label>
            <label className="text-sm text-slate-300">
              標籤
              <input
                className="field-input mt-2"
                value={manualLabel}
                onChange={(event) => setManualLabel(event.target.value)}
              />
            </label>
            <label className="text-sm text-slate-300">
              assignment
              <input
                className="field-input mt-2"
                value={manualAssignment}
                onChange={(event) => setManualAssignment(event.target.value)}
              />
            </label>
          </div>
          <button
            className="action-button mt-3"
            type="button"
            onClick={addManualMarker}
          >
            新增 peak 標記
          </button>
        </div>

        <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3">
          <h4 className="text-sm font-semibold text-slate-200">自動建議 peak</h4>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <label className="text-sm text-slate-300">
              threshold
              <input
                className="field-input mt-2"
                max="1"
                min="0"
                step="0.05"
                type="number"
                value={thresholdRatio}
                onChange={(event) => setThresholdRatio(Number(event.target.value))}
              />
            </label>
            <label className="text-sm text-slate-300">
              最小間距
              <input
                className="field-input mt-2"
                type="number"
                value={minSeparation}
                onChange={(event) => setMinSeparation(Number(event.target.value))}
              />
            </label>
            <label className="text-sm text-slate-300">
              最多數量
              <input
                className="field-input mt-2"
                min="1"
                type="number"
                value={maxPeaks}
                onChange={(event) => setMaxPeaks(Number(event.target.value))}
              />
            </label>
          </div>
          <button
            className="action-button mt-3"
            type="button"
            onClick={addSuggestedMarkers}
          >
            建議 peak 位置
          </button>
        </div>
      </div>

      <div className="mt-4">
        <PeakMarkerList
          markers={currentMarkers}
          onChangeMarkers={replaceCurrentMarkers}
        />
      </div>
    </section>
  )
}

function defaultPeakLabel(measurementType: MeasurementDataset['measurementType']) {
  if (measurementType === 'pl') {
    return 'PL peak'
  }

  if (measurementType === 'raman') {
    return 'unknown peak'
  }

  return '標記點'
}
