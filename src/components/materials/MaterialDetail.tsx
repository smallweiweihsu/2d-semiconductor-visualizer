import { getMaterialCategoryDefinition } from '../../data/materialCategories'
import type { Material } from '../../types/material'
import { ParameterBadge } from './ParameterBadge'
import {
  formatParameterValue,
  getMaterialParameterStats,
  parameterLabels,
  parameterOrder,
} from './materialStats'

interface MaterialDetailProps {
  material: Material
}

export function MaterialDetail({ material }: MaterialDetailProps) {
  const category = getMaterialCategoryDefinition(material.category)
  const stats = getMaterialParameterStats(material)

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span
              className="h-5 w-5 rounded-full border border-white/20"
              style={{ backgroundColor: material.color }}
            />
            <h3 className="text-2xl font-semibold text-slate-50">
              {material.displayName}
            </h3>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {category ? (
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${category.accentClass}`}
              >
                {category.label_zh}
              </span>
            ) : null}
            <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
              ID：{material.id}
            </span>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">
            {material.description_zh}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-center">
          <div>
            <div className="text-lg font-semibold text-emerald-200">
              {stats.known}
            </div>
            <div className="mt-1 text-xs text-slate-500">已知參數數量</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-amber-200">
              {stats.estimated}
            </div>
            <div className="mt-1 text-xs text-slate-500">估計參數數量</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-rose-200">
              {stats.unknown}
            </div>
            <div className="mt-1 text-xs text-slate-500">缺少參數數量</div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <InfoList title="材料註記" items={material.notes_zh} />
        <InfoList title="風險與限制" items={material.warnings_zh} tone="warning" />
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-slate-800">
        <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-3">
          <h4 className="text-sm font-medium text-slate-200">材料參數</h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
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
              {parameterOrder.map((parameterKey) => {
                const parameter = material.parameters[parameterKey]

                return (
                  <tr
                    className="border-t border-slate-800/80 text-slate-300"
                    key={parameterKey}
                  >
                    <td className="px-4 py-3 font-medium text-slate-100">
                      {parameterLabels[parameterKey]}
                    </td>
                    <td className="px-4 py-3">{formatParameterValue(parameter)}</td>
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
      </div>

      <section className="mt-5 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <h4 className="text-sm font-medium text-slate-200">擴散參數占位</h4>
        <div className="mt-3 grid gap-3 text-sm text-slate-400 md:grid-cols-3">
          <div>
            <div className="text-xs text-slate-500">D0_m2s</div>
            <div className="mt-1">{formatParameterValue(material.diffusion.D0_m2s)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Ea_eV</div>
            <div className="mt-1">{formatParameterValue(material.diffusion.Ea_eV)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">資料狀態</div>
            <div className="mt-1">
              <ParameterBadge confidence={material.diffusion.confidence} />
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          {material.diffusion.notes}
        </p>
      </section>
    </section>
  )
}

interface InfoListProps {
  title: string
  items: string[]
  tone?: 'default' | 'warning'
}

function InfoList({ title, items, tone = 'default' }: InfoListProps) {
  const toneClasses =
    tone === 'warning'
      ? 'border-amber-900/40 bg-amber-950/15 text-amber-100/90'
      : 'border-slate-800 bg-slate-900/60 text-slate-300'

  return (
    <section className={`rounded-lg border p-4 ${toneClasses}`}>
      <h4 className="text-sm font-medium">{title}</h4>
      <ul className="mt-3 space-y-2 text-xs leading-5">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
