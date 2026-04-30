import { materialCategoryLabels } from '../../data/materialCategories'
import type { Material } from '../../types/material'
import { ParameterBadge } from './ParameterBadge'
import { getMaterialParameterStats, getMaterialStatus } from './materialStats'

interface MaterialListProps {
  materials: Material[]
  selectedMaterialId: string
  onSelectMaterial: (materialId: string) => void
}

export function MaterialList({
  materials,
  selectedMaterialId,
  onSelectMaterial,
}: MaterialListProps) {
  return (
    <section className="flex min-h-0 flex-col rounded-lg border border-slate-800 bg-slate-950/35 p-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-slate-200">材料清單</h3>
        <span className="text-xs text-slate-500">{materials.length} 筆</span>
      </div>

      <div className="mt-3 grid min-h-0 flex-1 gap-3 overflow-y-auto pr-1">
        {materials.map((material) => {
          const stats = getMaterialParameterStats(material)
          const status = getMaterialStatus(material)
          const isSelected = material.id === selectedMaterialId

          return (
            <button
              className={`rounded-lg border p-3 text-left transition ${
                isSelected
                  ? 'border-cyan-600 bg-cyan-950/35 shadow-lg shadow-cyan-950/20'
                  : 'border-slate-800 bg-slate-900/55 hover:border-slate-700 hover:bg-slate-900'
              }`}
              key={material.id}
              onClick={() => onSelectMaterial(material.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full border border-white/20"
                    style={{ backgroundColor: material.color }}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-100">
                      {material.displayName}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {materialCategoryLabels[material.category]}
                    </div>
                  </div>
                </div>

                <ParameterBadge confidence={status.confidence} />
              </div>

              <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-400">
                {material.description_zh}
              </p>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                <span>已知 {stats.known}</span>
                <span>估計 {stats.estimated}</span>
                <span>缺少 {stats.unknown}</span>
                <span>警示 {material.warnings_zh.length}</span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
