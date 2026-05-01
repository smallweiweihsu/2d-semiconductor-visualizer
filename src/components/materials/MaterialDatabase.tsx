import { useMemo, useState } from 'react'
import { materialCategoryLabels } from '../../data/materialCategories'
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
  const [searchQuery, setSearchQuery] = useState('')

  const filteredMaterials = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('zh-TW')
    const categoryFilteredMaterials =
      selectedCategory === 'all'
        ? materials
        : materials.filter((material) => material.category === selectedCategory)

    if (!normalizedQuery) {
      return categoryFilteredMaterials
    }

    return categoryFilteredMaterials.filter((material) => {
      const searchableText = [
        material.name,
        material.displayName,
        materialCategoryLabels[material.category],
        material.description_zh,
      ]
        .join(' ')
        .toLocaleLowerCase('zh-TW')

      return searchableText.includes(normalizedQuery)
    })
  }, [searchQuery, selectedCategory])

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
    <section className="flex min-h-[calc(100vh-12rem)] min-w-0 flex-col gap-3 overflow-hidden rounded-lg border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/30">
      <header className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-50">材料資料庫</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
            管理二維半導體元件中常用的金屬、二維半導體、介電層、氧化物與塊材導體參數。此資料庫目前用於視覺化與近似分析，尚未校準為完整文獻資料庫。
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
          <SummaryPill label="材料總數" value={materials.length} />
          <SummaryPill label="金屬" value={categoryCounts.metal} />
          <SummaryPill label="二維半導體" value={categoryCounts.two_d_semiconductor} />
          <SummaryPill label="氧化/介電" value={categoryCounts.oxide + categoryCounts.dielectric} />
        </div>
      </header>

      <aside className="rounded-md border-l-2 border-amber-500/60 bg-amber-950/15 px-3 py-2 text-xs leading-5 text-amber-100/90">
        目前材料參數包含已知值、估計值與未知值。若參數標示為「需要文獻參數」，代表後續物理計算不能直接視為定量結果。
      </aside>

      <div className="grid gap-3 xl:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] xl:items-center">
        <label className="block text-xs text-slate-400">
          搜尋材料
          <input
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="搜尋材料，例如 WSe₂、Pd、Sb₂O₃、In"
            value={searchQuery}
          />
        </label>

        <MaterialCategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
      </div>

      <div className="grid min-h-0 flex-1 gap-4 overflow-hidden xl:grid-cols-[340px_minmax(0,1fr)]">
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

interface SummaryPillProps {
  label: string
  value: number
}

function SummaryPill({ label, value }: SummaryPillProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/45 px-3 py-1.5">
      <span className="font-semibold text-slate-100">{value}</span>
      <span className="whitespace-nowrap text-slate-500">{label}</span>
    </span>
  )
}
