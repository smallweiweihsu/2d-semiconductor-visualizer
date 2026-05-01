import type { DiffusionResult, DiffusionScenario } from '../../types/diffusion'
import { formatNumber } from './diffusionFormatting'

interface DiffusionProfilePlotProps {
  result: DiffusionResult
  scenario: DiffusionScenario
}

export function DiffusionProfilePlot({
  result,
  scenario,
}: DiffusionProfilePlotProps) {
  if (result.profile.length === 0) {
    return (
      <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
        <h3 className="text-sm font-semibold text-slate-100">1D 濃度曲線</h3>
        <div className="mt-4 grid min-h-56 place-items-center rounded-lg border border-dashed border-slate-700 text-sm text-slate-500">
          缺少 D0 或 Ea，無法產生定量濃度曲線。
        </div>
      </section>
    )
  }

  const width = 640
  const height = 260
  const padding = 38
  const maxDepth = Math.max(...result.profile.map((point) => point.depth_nm), 1)
  const points = result.profile
    .map((point) => {
      const x = padding + (point.depth_nm / maxDepth) * (width - padding * 1.5)
      const y =
        height -
        padding -
        point.normalizedConcentration * (height - padding * 1.7)

      return `${x},${y}`
    })
    .join(' ')
  const diffusionX =
    result.diffusionLength_nm === null
      ? null
      : padding +
        (Math.min(result.diffusionLength_nm, maxDepth) / maxDepth) *
          (width - padding * 1.5)
  const mixingX =
    scenario.initialMixingDepth_nm > 0
      ? padding +
        (Math.min(scenario.initialMixingDepth_nm, maxDepth) / maxDepth) *
          (width - padding * 1.5)
      : null

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">1D 濃度曲線</h3>
          <p className="mt-1 text-xs text-slate-500">
            x 軸為深度 nm，y 軸為正規化濃度。
          </p>
        </div>
        <span className="text-xs text-slate-500">
          最大深度 {formatNumber(maxDepth, 1)} nm
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
        <svg
          className="h-auto w-full"
          role="img"
          viewBox={`0 0 ${width} ${height}`}
        >
          <rect fill="#020617" height={height} width={width} />
          {mixingX ? (
            <rect
              fill="rgba(251,191,36,0.16)"
              height={height - padding * 1.7}
              width={Math.max(0, mixingX - padding)}
              x={padding}
              y={padding * 0.7}
            />
          ) : null}
          <line
            stroke="#475569"
            x1={padding}
            x2={width - padding * 0.5}
            y1={height - padding}
            y2={height - padding}
          />
          <line
            stroke="#475569"
            x1={padding}
            x2={padding}
            y1={padding * 0.7}
            y2={height - padding}
          />
          <polyline
            fill="none"
            points={points}
            stroke="#22d3ee"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
          {diffusionX ? (
            <line
              stroke="#f97316"
              strokeDasharray="6 5"
              strokeWidth="2"
              x1={diffusionX}
              x2={diffusionX}
              y1={padding * 0.7}
              y2={height - padding}
            />
          ) : null}
          <text fill="#94a3b8" fontSize="12" x={padding} y={height - 10}>
            深度 nm
          </text>
          <text fill="#94a3b8" fontSize="12" x={8} y={padding}>
            濃度
          </text>
          {diffusionX ? (
            <text fill="#fed7aa" fontSize="12" x={diffusionX + 6} y={padding + 10}>
              擴散長度
            </text>
          ) : null}
          {mixingX ? (
            <text fill="#fde68a" fontSize="12" x={padding + 8} y={padding + 28}>
              初始混入深度
            </text>
          ) : null}
        </svg>
      </div>
    </section>
  )
}
