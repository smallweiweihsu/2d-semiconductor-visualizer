import { materialCategories } from '../../data/materialCategories'
import type { MaterialCategory } from '../../types/material'

export type MaterialCategoryFilterId = MaterialCategory | 'all'

interface MaterialCategoryFilterProps {
  selectedCategory: MaterialCategoryFilterId
  onSelectCategory: (category: MaterialCategoryFilterId) => void
}

export function MaterialCategoryFilter({
  selectedCategory,
  onSelectCategory,
}: MaterialCategoryFilterProps) {
  const filterOptions = [
    {
      id: 'all' as const,
      label_zh: '全部',
      description_zh: '顯示所有材料',
    },
    ...materialCategories,
  ]

  return (
    <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
      {filterOptions.map((category) => {
        const isSelected = selectedCategory === category.id

        return (
          <button
            className={`shrink-0 rounded-md border px-2.5 py-1.5 text-xs transition ${
              isSelected
                ? 'border-cyan-600 bg-cyan-950/50 text-cyan-100'
                : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            title={category.description_zh}
            type="button"
          >
            {category.label_zh}
          </button>
        )
      })}
    </div>
  )
}
