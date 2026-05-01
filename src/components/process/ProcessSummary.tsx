import type { ProcessFlow, ProcessValidationWarning } from '../../types/process'
import { getProcessTypeCategory } from './processFormatting'

interface ProcessSummaryProps {
  flow: ProcessFlow
  warnings: ProcessValidationWarning[]
  onUpdateFlow: (updates: Partial<ProcessFlow>) => void
}

export function ProcessSummary({
  flow,
  warnings,
  onUpdateFlow,
}: ProcessSummaryProps) {
  const enabledSteps = flow.steps.filter((step) => step.enabled)
  const processSteps = flow.steps.filter((step) => getProcessTypeCategory(step.type) === '製程')
  const measurementSteps = flow.steps.filter((step) => getProcessTypeCategory(step.type) === '量測')
  const observationOrLithographySteps = flow.steps.filter((step) =>
    ['觀察', '微影'].includes(getProcessTypeCategory(step.type)),
  )
  const linkedLayerCount = new Set(
    flow.steps.flatMap((step) => step.linkedLayerIds ?? []),
  ).size

  const facts = [
    ['總步驟數', flow.steps.length],
    ['啟用步驟數', enabledSteps.length],
    ['製程步驟數', processSteps.length],
    ['量測步驟數', measurementSteps.length],
    ['觀察 / 微影步驟數', observationOrLithographySteps.length],
    ['關聯材料層數', linkedLayerCount],
    ['警告數量', warnings.length],
    ['包含金屬沉積', hasType(flow, 'metal_deposition') ? '是' : '否'],
    ['包含 Sb₂O₃ 沉積', hasType(flow, 'dielectric_deposition') ? '是' : '否'],
    ['包含退火', hasType(flow, 'diffusion_annealing') ? '是' : '否'],
    ['包含 Raman', hasType(flow, 'raman') || hasType(flow, 'low_power_raman') ? '是' : '否'],
    ['包含電性量測', hasType(flow, 'electrical_measurement') ? '是' : '否'],
    ['包含 XPS / AFM', hasType(flow, 'xps') || hasType(flow, 'afm') ? '是' : '否'],
  ]

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-slate-400">流程名稱</span>
          <input
            className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
            onChange={(event) => onUpdateFlow({ name_zh: event.target.value })}
            value={flow.name_zh}
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-400">流程描述</span>
          <input
            className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
            onChange={(event) => onUpdateFlow({ description_zh: event.target.value })}
            value={flow.description_zh}
          />
        </label>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {facts.map(([label, value]) => (
          <div
            className="rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2"
            key={label}
          >
            <div className="text-[11px] text-slate-500">{label}</div>
            <div className="mt-1 text-sm font-semibold text-slate-100">{value}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function hasType(flow: ProcessFlow, type: ProcessFlow['steps'][number]['type']) {
  return flow.steps.some((step) => step.type === type)
}
