import { materialCategoryLabels } from '../../data/materialCategories'
import { materials } from '../../data/materials'
import type { Material } from '../../types/material'
import type { DeviceStructure, DeviceValidationWarning } from '../../types/device'
import { formatThickness } from './deviceFormatting'

interface DeviceSummaryProps {
  structure: DeviceStructure
  warnings: DeviceValidationWarning[]
  onUpdateStructure: (updates: Partial<DeviceStructure>) => void
}

export function DeviceSummary({
  structure,
  warnings,
  onUpdateStructure,
}: DeviceSummaryProps) {
  const materialIds = new Set(structure.layers.map((layer) => layer.materialId))
  const semiconductorCount = structure.layers.filter(
    (layer) => layer.role === 'semiconductor',
  ).length
  const metalContactCount = structure.layers.filter((layer) =>
    ['source', 'drain', 'gate', 'contact', 'floating'].includes(layer.role),
  ).length
  const dielectricCount = structure.layers.filter((layer) =>
    ['dielectric', 'oxide', 'passivation'].includes(layer.role),
  ).length
  const totalThickness = structure.layers.reduce(
    (total, layer) => total + Math.max(layer.geometry.thickness_nm, 0),
    0,
  )
  const hasRole = (role: string) =>
    structure.layers.some((layer) => layer.role === role)

  const dominantMaterials = [...materialIds]
    .map((materialId) => materials.find((material) => material.id === materialId))
    .filter((material): material is Material => Boolean(material))
    .map((material) => `${material.displayName}（${materialCategoryLabels[material.category]}）`)

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
      <h3 className="text-sm font-medium text-slate-200">元件摘要</h3>

      <div className="mt-3 space-y-3">
        <label className="block text-xs text-slate-400">
          元件名稱
          <input
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) => onUpdateStructure({ name: event.target.value })}
            value={structure.name}
          />
        </label>

        <label className="block text-xs text-slate-400">
          設計描述
          <textarea
            className="mt-1 min-h-20 w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm leading-6 text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) =>
              onUpdateStructure({ description_zh: event.target.value })
            }
            placeholder="用來描述這個元件設計的目的或實驗條件。"
            value={structure.description_zh}
          />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-400">
        <SummaryItem label="層數" value={structure.layers.length} />
        <SummaryItem label="使用材料數" value={materialIds.size} />
        <SummaryItem label="總厚度" value={formatThickness(totalThickness)} />
        <SummaryItem label="半導體層數" value={semiconductorCount} />
        <SummaryItem label="金屬 / 接觸層數" value={metalContactCount} />
        <SummaryItem label="介電 / 氧化層數" value={dielectricCount} />
        <SummaryItem label="是否有源極" value={hasRole('source') ? '是' : '否'} />
        <SummaryItem label="是否有汲極" value={hasRole('drain') ? '是' : '否'} />
        <SummaryItem label="是否有閘極" value={hasRole('gate') ? '是' : '否'} />
        <SummaryItem label="警告數量" value={warnings.length} />
      </div>

      <div className="mt-4 rounded-md border border-slate-800 bg-slate-900/60 p-3">
        <div className="text-xs font-medium text-slate-300">目前材料</div>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {dominantMaterials.length > 0
            ? dominantMaterials.join('、')
            : '尚未選擇材料'}
        </p>
      </div>
    </section>
  )
}

interface SummaryItemProps {
  label: string
  value: number | string
}

function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-900/60 p-3">
      <div className="text-sm font-semibold text-slate-100">{value}</div>
      <div className="mt-1 text-slate-500">{label}</div>
    </div>
  )
}
