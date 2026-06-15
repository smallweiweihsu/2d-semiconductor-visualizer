// 對數座標多曲線圖：用於 |Id|/|Ig| 等跨數量級電流，支援多條疊圖（變溫/條件比較）。
export interface LogSeries {
  label: string
  color: string
  points: Array<{ x: number; y: number }> // y 為原始電流（可正可負，取 |y| 後取 log）
  dashed?: boolean
}

interface LogChartProps {
  series: LogSeries[]
  xLabel?: string
  yLabel?: string
}

const W = 760
const H = 420
const M = { top: 30, right: 24, bottom: 48, left: 64 }
const PW = W - M.left - M.right
const PH = H - M.top - M.bottom

export function LogChart({ series, xLabel = 'V (V)', yLabel = '|I| (A)' }: LogChartProps) {
  const allPts = series.flatMap((s) => s.points)
  const xs = allPts.map((p) => p.x)
  const ys = allPts.map((p) => Math.abs(p.y)).filter((v) => v > 0)
  if (!xs.length || !ys.length) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="log chart">
        <rect className="band-plot-bg" x={M.left} y={M.top} width={PW} height={PH} rx="4" />
        <text className="band-axis-label" x={W / 2} y={H / 2} textAnchor="middle">無可繪製資料</text>
      </svg>
    )
  }
  const xMin = Math.min(...xs)
  const xMax = Math.max(...xs)
  const logYmin = Math.floor(Math.log10(Math.min(...ys)))
  const logYmax = Math.ceil(Math.log10(Math.max(...ys)))
  const decades: number[] = []
  for (let d = logYmin; d <= logYmax; d++) decades.push(d)

  const xToSvg = (x: number) => M.left + (xMax === xMin ? 0.5 : (x - xMin) / (xMax - xMin)) * PW
  const yToSvg = (y: number) => {
    const ly = Math.log10(Math.max(Math.abs(y), Math.pow(10, logYmin)))
    return M.top + (logYmax === logYmin ? 0.5 : (logYmax - ly) / (logYmax - logYmin)) * PH
  }
  const linePath = (pts: Array<{ x: number; y: number }>) => {
    const valid = pts.filter((p) => Math.abs(p.y) > 0)
    if (!valid.length) return ''
    return 'M ' + valid.map((p) => `${xToSvg(p.x).toFixed(1)} ${yToSvg(p.y).toFixed(1)}`).join(' L ')
  }
  const xTicks = Array.from({ length: 6 }, (_, i) => xMin + ((xMax - xMin) * i) / 5)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="log chart">
      <rect className="band-plot-bg" x={M.left} y={M.top} width={PW} height={PH} rx="4" />
      {decades.map((d) => (
        <g key={d}>
          <line className="band-grid-line" x1={M.left} x2={M.left + PW} y1={yToSvg(Math.pow(10, d))} y2={yToSvg(Math.pow(10, d))} />
          <text className="band-tick-label" x={M.left - 8} y={yToSvg(Math.pow(10, d)) + 4} textAnchor="end">{`1e${d}`}</text>
        </g>
      ))}
      {xTicks.map((t, i) => (
        <text className="band-tick-label" key={i} x={xToSvg(t)} y={M.top + PH + 20} textAnchor="middle">{t.toFixed(1)}</text>
      ))}
      {series.map((s) => (
        <path key={s.label} d={linePath(s.points)} fill="none" stroke={s.color} strokeWidth={1.8} strokeDasharray={s.dashed ? '5 4' : undefined} />
      ))}
      <text className="band-axis-label" x={M.left + PW / 2} y={H - 10} textAnchor="middle">{xLabel}</text>
      <text className="band-axis-label" x={16} y={M.top + PH / 2} textAnchor="middle" transform={`rotate(-90 16 ${M.top + PH / 2})`}>{yLabel}</text>
      {/* legend */}
      {series.map((s, i) => (
        <g key={`lg-${s.label}`} transform={`translate(${M.left + 8 + i * 130}, ${M.top + 6})`}>
          <line x1={0} x2={16} y1={0} y2={0} stroke={s.color} strokeWidth={2} strokeDasharray={s.dashed ? '5 4' : undefined} />
          <text className="band-stack-sub" x={20} y={4}>{s.label}</text>
        </g>
      ))}
    </svg>
  )
}
