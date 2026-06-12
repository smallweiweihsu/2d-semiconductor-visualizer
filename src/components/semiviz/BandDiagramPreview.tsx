import { formatEnergy, formatPosition } from './bandDiagramFormatters'

type BandMode = 'after' | 'before'

export interface BandDiagramPreviewProps {
  mode: BandMode
}

const svgWidth = 574
const svgHeight = 802
const margin = { top: 48, right: 30, bottom: 64, left: 100 }
const plotWidth = svgWidth - margin.left - margin.right
const plotHeight = svgHeight - margin.top - margin.bottom
const xDomain = [0, 9.9] as const
const yDomain = [-6.05, -3.85] as const
const xTicks = [0, 0.4, 1, 1.4, 2.6, 3.3, 3.9, 4.5, 5.1, 5.7, 6.7, 7.3, 8.1, 8.7, 9.3, 9.9]
const yTicks = [-3.85, -4.4, -4.95, -5.5, -6.05]

export function BandDiagramPreview({ mode }: BandDiagramPreviewProps) {
  const conduction = mode === 'after'
    ? makePath([
        [0, -5.28],
        [2.9, -5.28],
        [3.08, -4.55],
        [3.28, -4.42],
        [4.3, -4.12],
        [5.4, -3.98],
        [6.7, -3.91],
        [8.2, -3.88],
        [9.9, -3.86],
      ])
    : makePath([
        [0, -4.4],
        [9.9, -4.4],
      ])
  const valence = mode === 'after'
    ? makePath([
        [0, -5.28],
        [2.9, -5.28],
        [3.08, -5.96],
        [3.35, -5.78],
        [4.2, -5.55],
        [5.4, -5.38],
        [6.8, -5.28],
        [8.4, -5.22],
        [9.9, -5.18],
      ])
    : makePath([
        [0, -5.8],
        [9.9, -5.8],
      ])
  const fermiY = yToSvg(-4.6)

  return (
    <div className="band-diagram-preview" data-testid="band-diagram-preview">
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} role="img" aria-label="energy band diagram">
        <rect
          className="band-plot-bg"
          x={margin.left}
          y={margin.top}
          width={plotWidth}
          height={plotHeight}
          rx="4"
        />
        {xTicks.map((tick) => (
          <g key={`x-${tick}`}>
            <line className="band-grid-line" x1={xToSvg(tick)} x2={xToSvg(tick)} y1={margin.top} y2={margin.top + plotHeight} />
            <text className="band-tick-label" x={xToSvg(tick)} y={margin.top + plotHeight + 18} textAnchor="middle">
              {formatPosition(tick)}
            </text>
          </g>
        ))}
        {yTicks.map((tick) => (
          <g key={`y-${tick}`}>
            <line className="band-grid-line" x1={margin.left} x2={margin.left + plotWidth} y1={yToSvg(tick)} y2={yToSvg(tick)} />
            <text className="band-tick-label" x={margin.left - 8} y={yToSvg(tick) + 4} textAnchor="end">
              {formatEnergy(tick)}
            </text>
          </g>
        ))}
        <path className="band-curve conduction" d={conduction} />
        <path className="band-curve valence" d={valence} />
        <line className="band-fermi-line" x1={xToSvg(3.08)} x2={xToSvg(9.25)} y1={fermiY} y2={fermiY} />
        <text className="band-axis-label" x={margin.left + plotWidth / 2} y={svgHeight - 18} textAnchor="middle">Position (a.u.)</text>
        <text
          className="band-axis-label"
          x="18"
          y={margin.top + plotHeight / 2}
          textAnchor="middle"
          transform={`rotate(-90 18 ${margin.top + plotHeight / 2})`}
        >
          Energy (eV)
        </text>
      </svg>
    </div>
  )
}

function makePath(points: Array<[number, number]>) {
  if (!points.length) return ''
  const [first, ...rest] = points
  return [
    `M ${xToSvg(first[0])} ${yToSvg(first[1])}`,
    ...rest.map(([x, y]) => `L ${xToSvg(x)} ${yToSvg(y)}`),
  ].join(' ')
}

function xToSvg(value: number) {
  const ratio = (value - xDomain[0]) / (xDomain[1] - xDomain[0])
  return round(margin.left + ratio * plotWidth)
}

function yToSvg(value: number) {
  const ratio = (yDomain[1] - value) / (yDomain[1] - yDomain[0])
  return round(margin.top + ratio * plotHeight)
}

function round(value: number) {
  return Math.round(value * 100) / 100
}
