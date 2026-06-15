import { useState } from 'react'
import type { MeasurementData } from '../../types/semiviz'

const KB_eV = 8.617333e-5 // eV/K

function temperatureK(m: MeasurementData): number | undefined {
  const t = `${m.sampleName} ${m.notes ?? ''}`.match(/(\d{1,3})\s*[kK]\b/)
  return t ? Number(t[1]) : undefined
}

function currentMetric(m: MeasurementData, mode: 'on' | 'off'): number | undefined {
  const abs = (m.electrical?.points ?? []).map((p) => Math.abs(p.Id ?? 0)).filter((v) => v > 0)
  if (!abs.length) return undefined
  return mode === 'on' ? Math.max(...abs) : Math.min(...abs)
}

const W = 620
const H = 360
const M = { top: 24, right: 24, bottom: 48, left: 64 }
const PW = W - M.left - M.right
const PH = H - M.top - M.bottom

export function ArrheniusPanel({ measurements }: { measurements: MeasurementData[] }) {
  const [mode, setMode] = useState<'on' | 'off'>('on')

  const data = measurements
    .map((m) => ({ t: temperatureK(m), i: currentMetric(m, mode), name: m.sampleName }))
    .filter((d): d is { t: number; i: number; name: string } => typeof d.t === 'number' && typeof d.i === 'number' && d.i > 0)
    .map((d) => ({ ...d, invT: 1 / d.t, lnI: Math.log(d.i) }))
    .sort((a, b) => a.invT - b.invT)

  if (data.length < 2) {
    return (
      <div>
        <p className="import-hint">需要至少 2 筆「有溫度」的電性量測（檔名含 100k/80K 等）才能做 Arrhenius 分析。目前可用：{data.length} 筆。</p>
      </div>
    )
  }

  // 線性回歸 lnI = a + b·(1/T)
  const n = data.length
  const sx = data.reduce((s, d) => s + d.invT, 0)
  const sy = data.reduce((s, d) => s + d.lnI, 0)
  const sxy = data.reduce((s, d) => s + d.invT * d.lnI, 0)
  const sxx = data.reduce((s, d) => s + d.invT * d.invT, 0)
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx)
  const intercept = (sy - slope * sx) / n
  const meanY = sy / n
  const ssTot = data.reduce((s, d) => s + (d.lnI - meanY) ** 2, 0)
  const ssRes = data.reduce((s, d) => s + (d.lnI - (intercept + slope * d.invT)) ** 2, 0)
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 1
  const ea_eV = -slope * KB_eV

  const xs = data.map((d) => d.invT * 1000) // 1000/T
  const ys = data.map((d) => d.lnI)
  const xMin = Math.min(...xs)
  const xMax = Math.max(...xs)
  const yMin = Math.min(...ys)
  const yMax = Math.max(...ys)
  const padY = (yMax - yMin) * 0.1 || 1
  const xToSvg = (x: number) => M.left + (xMax === xMin ? 0.5 : (x - xMin) / (xMax - xMin)) * PW
  const yToSvg = (y: number) => M.top + (1 - (y - (yMin - padY)) / ((yMax + padY) - (yMin - padY))) * PH
  // fit line endpoints (in 1000/T space): lnI = intercept + slope*(invT) = intercept + slope*(x/1000)
  const lineY = (x1000: number) => intercept + slope * (x1000 / 1000)

  return (
    <div className="arrhenius">
      <div className="arrhenius-head">
        <label className="curve-select">電流取點
          <select value={mode} onChange={(e) => setMode(e.target.value as 'on' | 'off')}>
            <option value="on">on 電流 (max|Id|)</option>
            <option value="off">off 電流 (min|Id|)</option>
          </select>
        </label>
        <div className="arrhenius-result">
          <span>活化能 Ea</span>
          <strong>{ea_eV >= 0 ? ea_eV.toFixed(3) : ea_eV.toFixed(3)} eV</strong>
          <small>R² = {r2.toFixed(3)}</small>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Arrhenius plot">
        <rect className="band-plot-bg" x={M.left} y={M.top} width={PW} height={PH} rx="4" />
        <line className="band-grid-line" x1={M.left} x2={M.left + PW} y1={M.top + PH} y2={M.top + PH} />
        <line className="band-grid-line" x1={M.left} x2={M.left} y1={M.top} y2={M.top + PH} />
        {/* fit line */}
        <line x1={xToSvg(xMin)} y1={yToSvg(lineY(xMin))} x2={xToSvg(xMax)} y2={yToSvg(lineY(xMax))} stroke="#fbbf24" strokeWidth={2} strokeDasharray="5 4" />
        {/* points */}
        {data.map((d) => (
          <g key={d.name}>
            <circle cx={xToSvg(d.invT * 1000)} cy={yToSvg(d.lnI)} r={4} fill="#22d3ee" />
            <text className="band-stack-sub" x={xToSvg(d.invT * 1000) + 6} y={yToSvg(d.lnI) - 6}>{d.t}K</text>
          </g>
        ))}
        <text className="band-tick-label" x={M.left} y={M.top + PH + 18}>{xMin.toFixed(2)}</text>
        <text className="band-tick-label" x={M.left + PW} y={M.top + PH + 18} textAnchor="end">{xMax.toFixed(2)}</text>
        <text className="band-axis-label" x={M.left + PW / 2} y={H - 10} textAnchor="middle">1000/T (1/K)</text>
        <text className="band-axis-label" x={16} y={M.top + PH / 2} textAnchor="middle" transform={`rotate(-90 16 ${M.top + PH / 2})`}>ln |I|</text>
      </svg>
      <p className="import-hint">模型 I = I₀·exp(−Ea/kBT)；Ea 由 ln|I| 對 1/T 線性斜率求得（半定量，需確認量測在熱活化主導區間）。</p>
    </div>
  )
}
