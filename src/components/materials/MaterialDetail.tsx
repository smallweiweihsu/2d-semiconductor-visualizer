import { getMaterialCategoryDefinition } from '../../data/materialCategories'
import type { Material, MaterialParameterKey } from '../../types/material'
import { ParameterBadge } from './ParameterBadge'
import {
  formatParameterValue,
  getMaterialParameterStats,
  parameterLabels,
} from './materialStats'

interface MaterialDetailProps {
  material: Material
}

const parameterGroups: Array<{
  title: string
  keys: MaterialParameterKey[]
}> = [
  {
    title: '核心電子參數',
    keys: ['workFunction_eV', 'bandGap_eV', 'electronAffinity_eV', 'dielectricConstant'],
  },
  {
    title: '輸運與電性',
    keys: ['mobility_cm2Vs', 'resistivity_ohm_m', 'breakdownField_MVcm'],
  },
  {
    title: '結構與熱參數',
    keys: ['latticeConstant_A', 'defaultThickness_nm', 'meltingPoint_C'],
  },
]

export function MaterialDetail({ material }: MaterialDetailProps) {
  const category = getMaterialCategoryDefinition(material.category)
  const stats = getMaterialParameterStats(material)

  return (
    <section className="h-full min-h-[34rem] overflow-y-auto rounded-lg border border-slate-800/80 bg-slate-950/25 p-4 xl:min-h-0">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span
              className="h-5 w-5 shrink-0 rounded-full border border-white/20"
              style={{ backgroundColor: material.color }}
            />
            <div className="min-w-0">
              <h3 className="truncate text-2xl font-semibold text-slate-50">
                {material.displayName}
              </h3>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {category ? (
                  <span
                    className={`rounded-full border px-2.5 py-1 font-medium ${category.accentClass}`}
                  >
                    {category.label_zh}
                  </span>
                ) : null}
                <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-400">
                  ID：{material.id}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            {material.description_zh}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <StatPill label="已知" tone="known" value={stats.known} />
          <StatPill label="估計" tone="estimated" value={stats.estimated} />
          <StatPill label="缺少" tone="unknown" value={stats.unknown} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-slate-800/80 pt-4 lg:grid-cols-2">
        <InfoList title="材料註記" items={material.notes_zh} />
        <InfoList title="風險與限制" items={material.warnings_zh} tone="warning" />
      </div>

      <div className="mt-4 grid gap-3">
        {parameterGroups.map((group) => (
          <ParameterGroup
            groupTitle={group.title}
            keys={group.keys}
            key={group.title}
            material={material}
          />
        ))}

        <section className="rounded-md border border-slate-800/80 bg-slate-900/35">
          <div className="border-b border-slate-800/80 px-4 py-3">
            <h4 className="text-sm font-medium text-slate-200">擴散參數</h4>
          </div>
          <div className="grid gap-4 p-4 text-sm text-slate-400 md:grid-cols-3">
            <div>
              <div className="text-xs text-slate-500">D0_m2s</div>
              <div className="mt-1">
                {formatParameterValue(material.diffusion.D0_m2s)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Ea_eV</div>
              <div className="mt-1">
                {formatParameterValue(material.diffusion.Ea_eV)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">資料狀態</div>
              <div className="mt-1">
                <ParameterBadge confidence={material.diffusion.confidence} />
              </div>
            </div>
          </div>
          <p className="border-t border-slate-800/80 px-4 py-3 text-xs leading-5 text-slate-500">
            {material.diffusion.notes}
          </p>
        </section>
      </div>
    </section>
  )
}

interface StatPillProps {
  label: string
  value: number
  tone: 'known' | 'estimated' | 'unknown'
}

function StatPill({ label, value, tone }: StatPillProps) {
  const toneClasses = {
    known: 'border-emerald-800 bg-emerald-950/25 text-emerald-100',
    estimated: 'border-amber-800 bg-amber-950/25 text-amber-100',
    unknown: 'border-rose-800 bg-rose-950/25 text-rose-100',
  }

  return (
    <span className={`rounded-full border px-3 py-1.5 ${toneClasses[tone]}`}>
      {label} {value}
    </span>
  )
}

interface ParameterGroupProps {
  groupTitle: string
  keys: MaterialParameterKey[]
  material: Material
}

function ParameterGroup({ groupTitle, keys, material }: ParameterGroupProps) {
  return (
    <section className="overflow-hidden rounded-md border border-slate-800/80 bg-slate-900/35">
      <div className="border-b border-slate-800/80 px-4 py-3">
        <h4 className="text-sm font-medium text-slate-200">{groupTitle}</h4>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-slate-950/70 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">參數</th>
              <th className="px-4 py-3 font-medium">數值</th>
              <th className="px-4 py-3 font-medium">單位</th>
              <th className="px-4 py-3 font-medium">信心標示</th>
              <th className="px-4 py-3 font-medium">註記</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((parameterKey) => {
              const parameter = material.parameters[parameterKey]

              return (
                <tr
                  className="border-t border-slate-800/70 align-top text-slate-300"
                  key={parameterKey}
                >
                  <td className="px-4 py-3 font-medium text-slate-100">
                    {parameterLabels[parameterKey]}
                  </td>
                  <td className="px-4 py-3">
                    {formatParameterValue(parameter)}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {parameter.unit ?? '無單位'}
                  </td>
                  <td className="px-4 py-3">
                    <ParameterBadge confidence={parameter.confidence} />
                  </td>
                  <td className="max-w-md px-4 py-3 text-xs leading-5 text-slate-500">
                    {parameter.note ?? '無補充註記'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

interface InfoListProps {
  title: string
  items: string[]
  tone?: 'default' | 'warning'
}

function InfoList({ title, items, tone = 'default' }: InfoListProps) {
  const bulletClass = tone === 'warning' ? 'bg-amber-300' : 'bg-slate-400'

  return (
    <section>
      <h4 className="text-sm font-medium text-slate-200">{title}</h4>
      <ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-500">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${bulletClass}`} />
            <span className={tone === 'warning' ? 'text-amber-100/85' : undefined}>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
