import { useMemo, useState } from 'react'
import type { MeasurementDataset, MeasurementSeries } from '../../types/measurement'
import { createSeriesFromDataset } from '../../utils/measurementImport'
import {
  formatAxisType,
  formatNumber,
  getBeforeAfterTagLabel,
} from './measurementFormatting'

interface MeasurementPlotProps {
  datasets: MeasurementDataset[]
  selectedDataset?: MeasurementDataset
}

const plotColors = ['#22d3ee', '#f59e0b', '#a78bfa', '#34d399', '#fb7185']

export function MeasurementPlot({
  datasets,
  selectedDataset,
}: MeasurementPlotProps) {
  const numericColumns =
    selectedDataset?.columns.filter((column) =>
      selectedDataset.rows.some((row) => typeof row.values[column.id] === 'number'),
    ) ?? []
  const [xColumnId, setXColumnId] = useState('')
  const [yColumnId, setYColumnId] = useState('')
  const [useAbsCurrent, setUseAbsCurrent] = useState(false)
  const [useLogY, setUseLogY] = useState(false)
  const effectiveX = xColumnId || numericColumns[0]?.id || ''
  const effectiveY = yColumnId || numericColumns[1]?.id || numericColumns[0]?.id || ''
  const selectedType = selectedDataset?.measurementType
  const overlayDatasets = useMemo(
    () =>
      selectedType
        ? datasets.filter((dataset) => dataset.measurementType === selectedType)
        : [],
    [datasets, selectedType],
  )
  const series = overlayDatasets
    .map((dataset) => {
      const xColumn =
        dataset.columns.find(
          (column) =>
            column.mappedType ===
            selectedDataset?.columns.find((item) => item.id === effectiveX)
              ?.mappedType,
        ) ?? dataset.columns[0]
      const yColumn =
        dataset.columns.find(
          (column) =>
            column.mappedType ===
            selectedDataset?.columns.find((item) => item.id === effectiveY)
              ?.mappedType,
        ) ?? dataset.columns[1]

      if (!xColumn || !yColumn) {
        return null
      }

      return createSeriesFromDataset(dataset, xColumn.id, yColumn.id)
    })
    .filter((item): item is MeasurementSeries => Boolean(item))
  const transformed = series.map((item) => ({
    ...item,
    y: item.y.map((value) => {
      const currentValue = useAbsCurrent ? Math.abs(value) : value
      return useLogY ? Math.log10(Math.max(Math.abs(currentValue), 1e-18)) : currentValue
    }),
  }))
  const allX = transformed.flatMap((item) => item.x)
  const allY = transformed.flatMap((item) => item.y)
  const xMin = Math.min(...allX)
  const xMax = Math.max(...allX)
  const yMin = Math.min(...allY)
  const yMax = Math.max(...allY)
  const hasPlot = transformed.length > 0 && allX.length > 0 && allY.length > 0

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-100">快速繪圖</h3>
          <p className="mt-1 text-sm text-slate-400">
            此圖僅為快速視覺化，未進行背景扣除、儀器校正或峰值 fitting。
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <label className="text-xs text-slate-400">
            X
            <select
              className="field-input mt-1 min-w-36"
              value={effectiveX}
              onChange={(event) => setXColumnId(event.target.value)}
            >
              {numericColumns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.originalName}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-400">
            Y
            <select
              className="field-input mt-1 min-w-36"
              value={effectiveY}
              onChange={(event) => setYColumnId(event.target.value)}
            >
              {numericColumns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.originalName}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300">
        <label className="flex items-center gap-2">
          <input
            checked={useAbsCurrent}
            type="checkbox"
            onChange={(event) => setUseAbsCurrent(event.target.checked)}
          />
          使用 abs(I)
        </label>
        <label className="flex items-center gap-2">
          <input
            checked={useLogY}
            type="checkbox"
            onChange={(event) => setUseLogY(event.target.checked)}
          />
          Y 軸 log10
        </label>
      </div>

      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-3">
        {!hasPlot ? (
          <div className="flex h-72 items-center justify-center text-sm text-slate-500">
            請先選擇含有至少兩個數值欄位的資料集。
          </div>
        ) : (
          <svg className="h-80 w-full" role="img" viewBox="0 0 720 320">
            <rect fill="#020617" height="320" rx="8" width="720" />
            {[0, 1, 2, 3, 4].map((tick) => {
              const x = 56 + tick * 152
              const y = 28 + tick * 58
              return (
                <g key={tick}>
                  <line
                    stroke="#1e293b"
                    strokeWidth="1"
                    x1={x}
                    x2={x}
                    y1="28"
                    y2="260"
                  />
                  <line
                    stroke="#1e293b"
                    strokeWidth="1"
                    x1="56"
                    x2="664"
                    y1={y}
                    y2={y}
                  />
                </g>
              )
            })}
            <line stroke="#475569" x1="56" x2="664" y1="260" y2="260" />
            <line stroke="#475569" x1="56" x2="56" y1="28" y2="260" />
            {transformed.map((item, index) => (
              <polyline
                fill="none"
                key={item.id}
                points={item.x
                  .map((x, pointIndex) => {
                    const y = item.y[pointIndex] ?? 0
                    return `${scale(x, xMin, xMax, 56, 664)},${scale(
                      y,
                      yMin,
                      yMax,
                      260,
                      28,
                    )}`
                  })
                  .join(' ')}
                stroke={plotColors[index % plotColors.length]}
                strokeWidth="2"
              />
            ))}
            <text fill="#94a3b8" fontSize="11" x="56" y="292">
              {selectedDataset?.columns.find((column) => column.id === effectiveX)
                ? formatAxisType(
                    selectedDataset.columns.find(
                      (column) => column.id === effectiveX,
                    )!.mappedType,
                  )
                : 'X'}
            </text>
            <text fill="#94a3b8" fontSize="11" x="10" y="24">
              {useLogY ? 'log10(Y)' : 'Y'}
            </text>
            <text fill="#64748b" fontSize="10" x="56" y="278">
              {formatNumber(xMin)}
            </text>
            <text fill="#64748b" fontSize="10" textAnchor="end" x="664" y="278">
              {formatNumber(xMax)}
            </text>
            <text fill="#64748b" fontSize="10" x="8" y="260">
              {formatNumber(yMin)}
            </text>
            <text fill="#64748b" fontSize="10" x="8" y="34">
              {formatNumber(yMax)}
            </text>
          </svg>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
        {overlayDatasets.map((dataset, index) => (
          <span className="flex items-center gap-2" key={dataset.id}>
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: plotColors[index % plotColors.length] }}
            />
            {dataset.name_zh} / {getBeforeAfterTagLabel(dataset.metadata.beforeAfterTag)}
          </span>
        ))}
      </div>
    </section>
  )
}

function scale(
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number,
) {
  if (!Number.isFinite(value) || fromMax === fromMin) {
    return (toMin + toMax) / 2
  }

  return toMin + ((value - fromMin) / (fromMax - fromMin)) * (toMax - toMin)
}
