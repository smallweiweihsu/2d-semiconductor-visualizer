import { useEffect, useRef, useState } from 'react'
import { formatEnergy, formatPosition } from './bandDiagramFormatters'

type BandMode = 'after' | 'before'

export interface BandDiagramPreviewProps {
  mode: BandMode
  metalPhi?: number
  chi?: number
  eg?: number
  phiBn?: number
  metalLabel?: string
  semiLabel?: string
}

const svgWidth = 880
const svgHeight = 520
const margin = { top: 38, right: 140, bottom: 50, left: 78 }
const plotWidth = svgWidth - margin.left - margin.right
const plotHeight = svgHeight - margin.top - margin.bottom
const xDomain = [0, 9.9] as const
const interfaceX = 3.0
const bulkEcMinusEf = 0.2

interface Scalars { phiM: number; chi: number; eg: number; barrier: number }

export function BandDiagramPreview({
  mode,
  metalPhi,
  chi,
  eg,
  phiBn,
  metalLabel = 'Metal',
  semiLabel = 'Semi',
}: BandDiagramPreviewProps) {
  const hasData =
    typeof metalPhi === 'number' && typeof chi === 'number' && typeof eg === 'number' && typeof phiBn === 'number'

  const target: Scalars = {
    phiM: metalPhi ?? 5,
    chi: chi ?? 4,
    eg: eg ?? 1.4,
    barrier: phiBn ?? 0.5,
  }

  const [disp, setDisp] = useState<Scalars>(target)
  const fromRef = useRef<Scalars>(target)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const from = fromRef.current
    const to = target
    const start = performance.now()
    const dur = 420
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur)
      const e = t * (2 - t) // easeOutQuad
      setDisp({
        phiM: from.phiM + (to.phiM - from.phiM) * e,
        chi: from.chi + (to.chi - from.chi) * e,
        eg: from.eg + (to.eg - from.eg) * e,
        barrier: from.barrier + (to.barrier - from.barrier) * e,
      })
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
      else fromRef.current = to
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.phiM, target.chi, target.eg, target.barrier])

  if (!hasData) {
    return <StaticPreview mode={mode} />
  }

  const phiM = disp.phiM
  const chiV = disp.chi
  const egV = disp.eg
  const barrier = disp.barrier

  const ef = -phiM
  const ecInterface = ef + barrier
  const ecBulk = ef + bulkEcMinusEf
  const depletionW = (xDomain[1] - interfaceX) * 0.4

  const semiSamples = 32
  const ecAfter: Array<[number, number]> = []
  const evAfter: Array<[number, number]> = []
  for (let i = 0; i <= semiSamples; i++) {
    const x = interfaceX + ((xDomain[1] - interfaceX) * i) / semiSamples
    const ec = ecBulk + (ecInterface - ecBulk) * Math.exp(-(x - interfaceX) / depletionW)
    ecAfter.push([x, ec])
    evAfter.push([x, ec - egV])
  }

  const ecFlat = -chiV
  const evFlat = -chiV - egV
  const efSemiFlat = -chiV - bulkEcMinusEf
  const efMetalFlat = -phiM

  const energies = [ef, ecInterface, ecBulk, ecBulk - egV, ecInterface - egV, ecFlat, evFlat, efMetalFlat, efSemiFlat]
  const yMin = Math.min(...energies) - 0.4
  const yMax = Math.max(...energies) + 0.4
  const yTicks = Array.from({ length: 5 }, (_, i) => yMax - ((yMax - yMin) * i) / 4)

  const yToSvg = (v: number) => round(margin.top + ((yMax - v) / (yMax - yMin)) * plotHeight)
  const xToSvg = (v: number) => round(margin.left + ((v - xDomain[0]) / (xDomain[1] - xDomain[0])) * plotWidth)
  const path = (pts: Array<[number, number]>) => pts.length ? `M ${pts.map(([x, y]) => `${xToSvg(x)} ${yToSvg(y)}`).join(' L ')}` : ''
  const areaPath = (top: Array<[number, number]>, bottom: Array<[number, number]>) =>
    `M ${top.map(([x, y]) => `${xToSvg(x)} ${yToSvg(y)}`).join(' L ')} L ${[...bottom].reverse().map(([x, y]) => `${xToSvg(x)} ${yToSvg(y)}`).join(' L ')} Z`

  const interfaceSvgX = xToSvg(interfaceX)
  const rightEdge = xToSvg(xDomain[1])

  return (
    <div className="band-diagram-preview" data-testid="band-diagram-preview">
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} role="img" aria-label="energy band diagram">
        <rect className="band-plot-bg" x={margin.left} y={margin.top} width={plotWidth} height={plotHeight} rx="4" />
        {yTicks.map((tick) => (
          <g key={`y-${tick.toFixed(2)}`}>
            <line className="band-grid-line" x1={margin.left} x2={margin.left + plotWidth} y1={yToSvg(tick)} y2={yToSvg(tick)} />
            <text className="band-tick-label" x={margin.left - 10} y={yToSvg(tick) + 5} textAnchor="end">{formatEnergy(tick)}</text>
          </g>
        ))}
        <rect className="band-metal-region" x={margin.left} y={margin.top} width={interfaceSvgX - margin.left} height={plotHeight} />
        <text className="band-region-label" x={(margin.left + interfaceSvgX) / 2} y={margin.top + 20} textAnchor="middle">{metalLabel}</text>
        <text className="band-region-label" x={(interfaceSvgX + margin.left + plotWidth) / 2} y={margin.top + 20} textAnchor="middle">{semiLabel}</text>

        {mode === 'after' ? (
          <>
            <path className="band-gap-fill" d={areaPath(ecAfter, evAfter)} />
            <line className="band-fermi-line" x1={margin.left} x2={margin.left + plotWidth} y1={yToSvg(ef)} y2={yToSvg(ef)} />
            <text className="band-curve-tag fermi" x={rightEdge + 6} y={yToSvg(ef) + 4}>E_F ({metalLabel})</text>
            <path className="band-curve conduction" d={path(ecAfter)} />
            <path className="band-curve valence" d={path(evAfter)} />
            <text className="band-curve-tag ec" x={rightEdge + 6} y={yToSvg(ecBulk) + 4}>{semiLabel} E_C</text>
            <text className="band-curve-tag ev" x={rightEdge + 6} y={yToSvg(ecBulk - egV) + 4}>{semiLabel} E_V</text>
            <text className="band-gap-label" x={(interfaceSvgX + rightEdge) / 2} y={yToSvg(ecBulk - egV / 2) + 4} textAnchor="middle">{semiLabel} Eg≈{egV.toFixed(2)} eV</text>
          </>
        ) : (
          <>
            <path className="band-gap-fill" d={areaPath([[interfaceX, ecFlat], [xDomain[1], ecFlat]], [[interfaceX, evFlat], [xDomain[1], evFlat]])} />
            <line className="band-fermi-line" x1={margin.left} x2={interfaceSvgX} y1={yToSvg(efMetalFlat)} y2={yToSvg(efMetalFlat)} />
            <text className="band-curve-tag fermi" x={margin.left + 6} y={yToSvg(efMetalFlat) - 6}>E_F(m)</text>
            <path className="band-curve conduction" d={path([[interfaceX, ecFlat], [xDomain[1], ecFlat]])} />
            <path className="band-curve valence" d={path([[interfaceX, evFlat], [xDomain[1], evFlat]])} />
            <line className="band-fermi-line semi" x1={interfaceSvgX} x2={margin.left + plotWidth} y1={yToSvg(efSemiFlat)} y2={yToSvg(efSemiFlat)} />
            <text className="band-curve-tag ec" x={rightEdge + 6} y={yToSvg(ecFlat) + 4}>{semiLabel} E_C</text>
            <text className="band-curve-tag ev" x={rightEdge + 6} y={yToSvg(evFlat) + 4}>{semiLabel} E_V</text>
          </>
        )}
        <line className="band-interface-line" x1={interfaceSvgX} x2={interfaceSvgX} y1={margin.top} y2={margin.top + plotHeight} />

        {Array.from({ length: 6 }, (_, i) => xDomain[0] + ((xDomain[1] - xDomain[0]) * i) / 5).map((tick) => (
          <text className="band-tick-label" key={`x-${tick.toFixed(1)}`} x={xToSvg(tick)} y={margin.top + plotHeight + 22} textAnchor="middle">{formatPosition(tick)}</text>
        ))}
        <text className="band-axis-label" x={margin.left + plotWidth / 2} y={svgHeight - 12} textAnchor="middle">Position (a.u.)</text>
        <text className="band-axis-label" x="18" y={margin.top + plotHeight / 2} textAnchor="middle" transform={`rotate(-90 18 ${margin.top + plotHeight / 2})`}>Energy (eV)</text>
      </svg>
    </div>
  )
}

function round(value: number) {
  return Math.round(value * 100) / 100
}

function StaticPreview({ mode }: { mode: BandMode }) {
  return (
    <div className="band-diagram-preview" data-testid="band-diagram-preview">
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} role="img" aria-label="energy band diagram">
        <rect className="band-plot-bg" x={margin.left} y={margin.top} width={plotWidth} height={plotHeight} rx="4" />
        <text className="band-axis-label" x={svgWidth / 2} y={svgHeight / 2} textAnchor="middle">
          {mode === 'after' ? '選擇金屬與半導體以顯示能帶' : '資料不足'}
        </text>
      </svg>
    </div>
  )
}
