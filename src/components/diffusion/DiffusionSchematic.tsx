import type { DiffusionResult, DiffusionScenario } from '../../types/diffusion'
import { formatNumber, getMaterialLabel } from './diffusionFormatting'

interface DiffusionSchematicProps {
  result: DiffusionResult
  scenario: DiffusionScenario
}

export function DiffusionSchematic({
  result,
  scenario,
}: DiffusionSchematicProps) {
  const affectedPercent =
    result.affectedDepth_nm === null
      ? 18
      : Math.max(12, Math.min(75, result.affectedDepth_nm * 4))
  const mixingPercent = Math.max(
    0,
    Math.min(60, scenario.initialMixingDepth_nm * 4),
  )

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
      <h3 className="text-sm font-semibold text-slate-100">擴散前後示意</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        此圖為示意，不代表實際 TEM / XPS / AFM 形貌。
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SchematicCard
          affectedPercent={mixingPercent}
          gradient={false}
          hostLabel={getMaterialLabel(scenario.hostMaterialId)}
          metalLabel={scenario.diffusingSpecies}
          title="沉積後初始界面"
          valueLabel={`初始混入深度 ${formatNumber(scenario.initialMixingDepth_nm, 2)} nm`}
        />
        <SchematicCard
          affectedPercent={affectedPercent}
          gradient
          hostLabel={getMaterialLabel(scenario.hostMaterialId)}
          metalLabel={scenario.diffusingSpecies}
          title="退火後擴散區"
          valueLabel={`估計擴散長度 ${formatNumber(result.diffusionLength_nm, 3)} nm`}
        />
      </div>
    </section>
  )
}

function SchematicCard({
  affectedPercent,
  gradient,
  hostLabel,
  metalLabel,
  title,
  valueLabel,
}: {
  affectedPercent: number
  gradient: boolean
  hostLabel: string
  metalLabel: string
  title: string
  valueLabel: string
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-medium text-slate-200">{title}</h4>
        <span className="text-xs text-slate-500">{valueLabel}</span>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-800">
        <div className="grid h-16 place-items-center bg-slate-700/70 text-xs font-semibold text-slate-100">
          {metalLabel}
        </div>
        <div className="relative h-36 bg-cyan-950/35">
          <div className="absolute inset-x-0 top-0 h-px bg-cyan-200/50" />
          <div
            className="absolute inset-x-0 top-0"
            style={{
              height: `${affectedPercent}%`,
              background: gradient
                ? 'linear-gradient(180deg, rgba(34,211,238,0.58), rgba(34,211,238,0.02))'
                : 'rgba(251,191,36,0.22)',
            }}
          />
          <div className="absolute inset-0 grid place-items-center px-3 text-center text-xs text-cyan-100">
            {hostLabel}
          </div>
        </div>
      </div>
    </div>
  )
}
