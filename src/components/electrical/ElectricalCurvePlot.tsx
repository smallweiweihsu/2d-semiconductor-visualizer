import { useMemo, useState } from 'react'
import type { ElectricalCurve } from '../../types/electrical'

interface ElectricalCurvePlotProps {
  curve: ElectricalCurve
}

export function ElectricalCurvePlot({ curve }: ElectricalCurvePlotProps) {
  const [scaleMode, setScaleMode] = useState<'linear' | 'semilog'>('linear')
  const plottedPoints = useMemo(() => {
    if (scaleMode === 'linear') {
      return curve.points
    }

    return curve.points.map((point) => ({
      x: point.x,
      y: Math.log10(Math.max(Math.abs(point.y), 1e-18)),
    }))
  }, [curve.points, scaleMode])

  if (curve.points.length === 0) {
    return (
      <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
        <h3 className="text-sm font-semibold text-slate-100">{curve.label_zh}</h3>
        <div className="mt-4 flex h-64 items-center justify-center rounded-md border border-dashed border-slate-700 bg-slate-950/50 px-4 text-center text-sm text-slate-500">
          缺少必要參數，無法產生曲線。
        </div>
      </section>
    )
  }

  const xValues = plottedPoints.map((point) => point.x)
  const yValues = plottedPoints.map((point) => point.y)
  const minX = Math.min(...xValues)
  const maxX = Math.max(...xValues)
  const minY = Math.min(...yValues)
  const maxY = Math.max(...yValues)
  const width = 520
  const height = 260
  const padding = 42
  const plotWidth = width - padding * 2
  const plotHeight = height - padding * 2
  const mapX = (value: number) =>
    padding + ((value - minX) / Math.max(maxX - minX, 1e-12)) * plotWidth
  const mapY = (value: number) =>
    height - padding - ((value - minY) / Math.max(maxY - minY, 1e-18)) * plotHeight
  const path = plottedPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${mapX(point.x)} ${mapY(point.y)}`)
    .join(' ')

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">{curve.label_zh}</h3>
          <p className="mt-1 text-xs text-slate-500">
            曲線為簡化模型產生，非實際量測資料。
          </p>
        </div>
        <div className="flex rounded-md border border-slate-700 bg-slate-950/70 p-1 text-xs">
          <button
            className={`rounded px-2 py-1 ${
              scaleMode === 'linear' ? 'bg-cyan-950 text-cyan-100' : 'text-slate-400'
            }`}
            onClick={() => setScaleMode('linear')}
            type="button"
          >
            線性
          </button>
          <button
            className={`rounded px-2 py-1 ${
              scaleMode === 'semilog' ? 'bg-cyan-950 text-cyan-100' : 'text-slate-400'
            }`}
            onClick={() => setScaleMode('semilog')}
            type="button"
          >
            半對數
          </button>
        </div>
      </div>

      <svg
        className="mt-4 h-72 w-full rounded-md border border-slate-800 bg-slate-950/70"
        role="img"
        viewBox={`0 0 ${width} ${height}`}
      >
        <line
          stroke="#334155"
          strokeWidth="1"
          x1={padding}
          x2={padding}
          y1={padding}
          y2={height - padding}
        />
        <line
          stroke="#334155"
          strokeWidth="1"
          x1={padding}
          x2={width - padding}
          y1={height - padding}
          y2={height - padding}
        />
        <path d={path} fill="none" stroke="#22d3ee" strokeLinecap="round" strokeWidth="2.5" />
        <text fill="#94a3b8" fontSize="12" x={width / 2 - 24} y={height - 10}>
          {curve.xLabel_zh}
        </text>
        <text fill="#94a3b8" fontSize="12" x={8} y={24}>
          {scaleMode === 'semilog' ? 'log10(|Id|)' : curve.yLabel_zh}
        </text>
        <text fill="#64748b" fontSize="11" x={padding} y={height - padding + 18}>
          {formatTick(minX)}
        </text>
        <text fill="#64748b" fontSize="11" textAnchor="end" x={width - padding} y={height - padding + 18}>
          {formatTick(maxX)}
        </text>
        <text fill="#64748b" fontSize="11" x={padding + 4} y={padding - 8}>
          {formatTick(scaleMode === 'semilog' ? Math.pow(10, maxY) : maxY)}
        </text>
      </svg>
    </section>
  )
}

function formatTick(value: number) {
  if (Math.abs(value) >= 1000 || (Math.abs(value) > 0 && Math.abs(value) < 0.001)) {
    return value.toExponential(1)
  }

  return new Intl.NumberFormat('zh-TW', {
    maximumFractionDigits: 3,
  }).format(value)
}
