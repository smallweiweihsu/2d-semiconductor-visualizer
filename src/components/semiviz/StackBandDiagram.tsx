import type { DeviceLayer, Material, MaterialParameter } from '../../types/semiviz'
import { sortLayersForStack } from '../../visualization/viewportGeometry'

interface StackBandDiagramProps {
  layers: DeviceLayer[]
  materials: Material[]
}

const W = 880
const H = 520
const M = { top: 40, right: 24, bottom: 64, left: 70 }
const PW = W - M.left - M.right
const PH = H - M.top - M.bottom

function num(p?: MaterialParameter): number | undefined {
  if (!p || p.value == null) return undefined
  const n = typeof p.value === 'number' ? p.value : parseFloat(String(p.value))
  return Number.isFinite(n) ? n : undefined
}

export function StackBandDiagram({ layers, materials }: StackBandDiagramProps) {
  const stack = sortLayersForStack(layers.filter((l) => l.visible))
  const cols = stack.map((layer) => {
    const m = materials.find((mat) => mat.id === layer.materialId)
    const isMetal = m?.category === 'metal' || m?.category === 'bulk_conductor'
    const phi = num(m?.workFunction_eV)
    const chi = num(m?.electronAffinity_eV)
    const eg = num(m?.bandGap_eV)
    return { layer, m, isMetal, phi, chi, eg }
  })

  const energies: number[] = [0]
  cols.forEach((c) => {
    if (c.isMetal && c.phi !== undefined) energies.push(-c.phi)
    if (c.chi !== undefined) energies.push(-c.chi)
    if (c.chi !== undefined && c.eg !== undefined) energies.push(-(c.chi + c.eg))
  })
  const yMax = 0.2
  const yMin = Math.min(...energies, -6) - 0.5
  const yTicks = Array.from({ length: 5 }, (_, i) => yMax - ((yMax - yMin) * i) / 4)

  const yToSvg = (v: number) => M.top + ((yMax - v) / (yMax - yMin)) * PH
  const colW = PW / Math.max(cols.length, 1)

  return (
    <div className="band-diagram-preview" data-testid="stack-band-diagram">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="multi-layer band alignment">
        <rect className="band-plot-bg" x={M.left} y={M.top} width={PW} height={PH} rx="4" />
        {yTicks.map((t) => (
          <g key={t.toFixed(2)}>
            <line className="band-grid-line" x1={M.left} x2={M.left + PW} y1={yToSvg(t)} y2={yToSvg(t)} />
            <text className="band-tick-label" x={M.left - 10} y={yToSvg(t) + 5} textAnchor="end">{t.toFixed(1)}</text>
          </g>
        ))}
        {/* 真空能階 */}
        <line className="band-vac-line" x1={M.left} x2={M.left + PW} y1={yToSvg(0)} y2={yToSvg(0)} />
        <text className="band-curve-tag" x={M.left + PW - 4} y={yToSvg(0) - 6} textAnchor="end" fill="#94a3b8">E_vac</text>

        {cols.map((c, i) => {
          const x0 = M.left + i * colW
          const xc = x0 + colW / 2
          const pad = colW * 0.12
          const lx = x0 + pad
          const rx = x0 + colW - pad
          return (
            <g key={c.layer.id}>
              {i > 0 ? <line x1={x0} x2={x0} y1={M.top} y2={M.top + PH} className="band-col-sep" /> : null}
              {c.isMetal && c.phi !== undefined ? (
                <>
                  <rect x={lx} y={yToSvg(-c.phi)} width={rx - lx} height={M.top + PH - yToSvg(-c.phi)} className="band-metal-fill" />
                  <line x1={lx} x2={rx} y1={yToSvg(-c.phi)} y2={yToSvg(-c.phi)} className="band-fermi-line" />
                  <text x={xc} y={yToSvg(-c.phi) - 6} textAnchor="middle" className="band-stack-val">EF {(-c.phi).toFixed(2)}</text>
                </>
              ) : null}
              {!c.isMetal && c.chi !== undefined ? (
                <>
                  {c.eg !== undefined ? (
                    <rect x={lx} y={yToSvg(-c.chi)} width={rx - lx} height={yToSvg(-(c.chi + c.eg)) - yToSvg(-c.chi)} className="band-gap-fill" />
                  ) : null}
                  <line x1={lx} x2={rx} y1={yToSvg(-c.chi)} y2={yToSvg(-c.chi)} className="band-curve conduction" />
                  <text x={xc} y={yToSvg(-c.chi) - 5} textAnchor="middle" className="band-stack-val ec">EC {(-c.chi).toFixed(2)}</text>
                  {c.eg !== undefined ? (
                    <>
                      <line x1={lx} x2={rx} y1={yToSvg(-(c.chi + c.eg))} y2={yToSvg(-(c.chi + c.eg))} className="band-curve valence" />
                      <text x={xc} y={yToSvg(-(c.chi + c.eg)) + 14} textAnchor="middle" className="band-stack-val ev">EV {(-(c.chi + c.eg)).toFixed(2)}</text>
                    </>
                  ) : null}
                </>
              ) : null}
              {(c.isMetal && c.phi === undefined) || (!c.isMetal && c.chi === undefined) ? (
                <text x={xc} y={M.top + PH / 2} textAnchor="middle" className="band-stack-na">參數未知</text>
              ) : null}
              <text x={xc} y={M.top + PH + 22} textAnchor="middle" className="band-stack-label">{c.m?.displayName ?? c.layer.materialId}</text>
              <text x={xc} y={M.top + PH + 38} textAnchor="middle" className="band-stack-sub">{c.layer.role}</text>
            </g>
          )
        })}
        <text className="band-axis-label" x={18} y={M.top + PH / 2} textAnchor="middle" transform={`rotate(-90 18 ${M.top + PH / 2})`}>Energy vs vacuum (eV)</text>
      </svg>
    </div>
  )
}
