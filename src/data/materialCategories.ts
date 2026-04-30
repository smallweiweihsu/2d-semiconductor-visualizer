import type { MaterialCategory } from '../types/material'

export interface MaterialCategoryDefinition {
  id: MaterialCategory
  label_zh: string
  description_zh: string
  accentClass: string
}

export const materialCategories: MaterialCategoryDefinition[] = [
  {
    id: 'metal',
    label_zh: '金屬',
    description_zh: '接觸電極、閘極與導電薄膜材料。',
    accentClass: 'border-yellow-700/60 bg-yellow-950/25 text-yellow-100',
  },
  {
    id: 'two_d_semiconductor',
    label_zh: '二維半導體',
    description_zh: '二維通道、異質結構與封裝層材料。',
    accentClass: 'border-cyan-700/60 bg-cyan-950/25 text-cyan-100',
  },
  {
    id: 'dielectric',
    label_zh: '介電層',
    description_zh: '閘極介電層、封裝層與絕緣間隔材料。',
    accentClass: 'border-violet-700/60 bg-violet-950/25 text-violet-100',
  },
  {
    id: 'oxide',
    label_zh: '氧化物',
    description_zh: '本徵氧化層、製程氧化物與可變化學計量氧化物。',
    accentClass: 'border-orange-700/60 bg-orange-950/25 text-orange-100',
  },
  {
    id: 'bulk_conductor',
    label_zh: '塊材導體',
    description_zh: '底部導體、塊材平台與垂直導電材料。',
    accentClass: 'border-emerald-700/60 bg-emerald-950/25 text-emerald-100',
  },
  {
    id: 'substrate',
    label_zh: '基板',
    description_zh: '支撐材料、背閘基板與製程承載平台。',
    accentClass: 'border-slate-600 bg-slate-800/70 text-slate-100',
  },
  {
    id: 'custom',
    label_zh: '自訂材料',
    description_zh: '使用者自行輸入或待查文獻材料。',
    accentClass: 'border-pink-700/60 bg-pink-950/25 text-pink-100',
  },
]

export const materialCategoryLabels = materialCategories.reduce<
  Record<MaterialCategory, string>
>((labels, category) => {
  labels[category.id] = category.label_zh
  return labels
}, {} as Record<MaterialCategory, string>)

export function getMaterialCategoryDefinition(category: MaterialCategory) {
  return materialCategories.find((item) => item.id === category)
}
