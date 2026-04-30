import { useMemo, useState } from 'react'
import { materials } from '../../data/materials'
import type { MaterialCategory } from '../../types/material'
import { MaterialCategoryFilter } from './MaterialCategoryFilter'
import type { MaterialCategoryFilterId } from './MaterialCategoryFilter'
import { MaterialDetail } from './MaterialDetail'
import { MaterialList } from './MaterialList'

export function MaterialDatabase() {
  const [selectedCategory, setSelectedCategory] =
    useState<MaterialCategoryFilterId>('all')
  const [selectedMaterialId, setSelectedMaterialId] = useState('wse2')

  const filteredMaterials = useMemo(() => {
    if (selectedCategory === 'all') {
      return materials
    }

    return materials.filter(
      (material) => material.category === selectedCategory,
    )
  }, [selectedCategory])

  const selectedMaterial =
    filteredMaterials.find((material) => material.id === selectedMaterialId) ??
    filteredMaterials[0] ??
    materials[0]

  function handleSelectCategory(category: MaterialCategoryFilterId) {
    setSelectedCategory(category)

    const nextMaterial =
      category === 'all'
        ? materials[0]
        : materials.find((material) => material.category === category)

    if (nextMaterial) {
      setSelectedMaterialId(nextMaterial.id)
    }
  }

  const categoryCounts = materials.reduce(
    (counts, material) => {
      counts[material.category] += 1
      return counts
    },
    {
      metal: 0,
      two_d_semiconductor: 0,
      dielectric: 0,
      oxide: 0,
      bulk_conductor: 0,
      substrate: 0,
      custom: 0,
    } satisfies Record<MaterialCategory, number>,
  )

  return (
    <section className="flex min-h-[36rem] flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/30">
      <header className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-50">材料資料庫</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
            管理二維半導體元件中常用的金屬、二維半導體、介電層、氧化物與塊材導體參數。此資料庫目前用於視覺化與近似分析，尚未校準為完整文獻資料庫。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 sm:grid-cols-4">
          <SummaryTile label="材料總數" value={materials.length} />
          <SummaryTile label="金屬" value={categoryCounts.metal} />
          <SummaryTile
            label="二維半導體"
            value={categoryCounts.two_d_semiconductor}
          />
          <SummaryTile label="氧化/介電" value={categoryCounts.oxide + categoryCounts.dielectric} />
        </div>
      </header>

      <aside className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-4 text-sm leading-6 text-amber-100/90">
        目前材料參數包含已知值、估計值與未知值。若參數標示為「需要文獻參數」，代表後續物理計算不能直接視為定量結果。
      </aside>

      <MaterialCategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      <div className="grid gap-4 2xl:grid-cols-[360px_minmax(0,1fr)]">
        <MaterialList
          materials={filteredMaterials}
          selectedMaterialId={selectedMaterial.id}
          onSelectMaterial={setSelectedMaterialId}
        />
        <MaterialDetail material={selectedMaterial} />
      </div>
    </section>
  )
}

interface SummaryTileProps {
  label: string
  value: number
}

function SummaryTile({ label, value }: SummaryTileProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/45 px-3 py-2">
      <div className="text-lg font-semibold text-slate-100">{value}</div>
      <div className="mt-1 whitespace-nowrap text-slate-500">{label}</div>
    </div>
  )
}
