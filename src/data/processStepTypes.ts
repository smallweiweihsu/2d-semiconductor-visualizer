import type { ProcessStepType } from '../types/process'

export type ProcessStepCategory = '製程' | '量測' | '觀察' | '微影' | '自訂'

export interface ProcessStepTypeDefinition {
  id: ProcessStepType
  label_zh: string
  description_zh: string
  category_zh: ProcessStepCategory
  accentClass: string
}

export const processStepTypes: ProcessStepTypeDefinition[] = [
  {
    id: 'metal_deposition',
    label_zh: '金屬沉積',
    description_zh:
      '記錄蒸鍍、濺鍍或其他金屬沉積條件，例如金屬種類、厚度、速率與基板溫度。',
    category_zh: '製程',
    accentClass: 'border-cyan-700/50 bg-cyan-950/30 text-cyan-100',
  },
  {
    id: 'dielectric_deposition',
    label_zh: '介電層 / Sb₂O₃ 沉積',
    description_zh: '記錄 Sb₂O₃、HfO₂、Al₂O₃ 或其他介電層沉積條件。',
    category_zh: '製程',
    accentClass: 'border-blue-700/50 bg-blue-950/30 text-blue-100',
  },
  {
    id: 'oxidation',
    label_zh: '氧化處理',
    description_zh: '記錄 WSe₂ 氧化、Sb 表面氧化或其他氧化處理條件。',
    category_zh: '製程',
    accentClass: 'border-orange-700/50 bg-orange-950/30 text-orange-100',
  },
  {
    id: 'diffusion_annealing',
    label_zh: '擴散退火',
    description_zh: '記錄退火溫度、時間、氣氛與可能的金屬/氧/缺陷擴散。',
    category_zh: '製程',
    accentClass: 'border-amber-700/50 bg-amber-950/30 text-amber-100',
  },
  {
    id: 'rie',
    label_zh: 'RIE 處理',
    description_zh: '記錄反應式離子蝕刻條件，例如氣體、功率、時間與壓力。',
    category_zh: '製程',
    accentClass: 'border-rose-700/50 bg-rose-950/30 text-rose-100',
  },
  {
    id: 'sem',
    label_zh: 'SEM 觀察',
    description_zh: '記錄 SEM 影像條件與觀察重點。',
    category_zh: '觀察',
    accentClass: 'border-slate-600 bg-slate-900/70 text-slate-200',
  },
  {
    id: 'ebeam_lithography',
    label_zh: 'E-beam lithography',
    description_zh: '記錄電子束微影條件，例如劑量、顯影、圖案與對位。',
    category_zh: '微影',
    accentClass: 'border-violet-700/50 bg-violet-950/30 text-violet-100',
  },
  {
    id: 'electrical_measurement',
    label_zh: '電性量測',
    description_zh: '記錄 I-V、Id-Vg、接觸電阻與常溫電性量測條件。',
    category_zh: '量測',
    accentClass: 'border-emerald-700/50 bg-emerald-950/30 text-emerald-100',
  },
  {
    id: 'low_temperature_electrical_measurement',
    label_zh: '低溫電性量測',
    description_zh: '記錄降溫電性量測條件，例如溫度範圍、掃描參數與偏壓。',
    category_zh: '量測',
    accentClass: 'border-teal-700/50 bg-teal-950/30 text-teal-100',
  },
  {
    id: 'raman',
    label_zh: 'Raman',
    description_zh: '記錄 Raman 量測條件，例如雷射波長、功率、積分時間與量測區域。',
    category_zh: '量測',
    accentClass: 'border-fuchsia-700/50 bg-fuchsia-950/30 text-fuchsia-100',
  },
  {
    id: 'low_power_raman',
    label_zh: '低功率 Raman',
    description_zh: '記錄低功率 Raman 條件，用於降低雷射造成材料損傷的風險。',
    category_zh: '量測',
    accentClass: 'border-pink-700/50 bg-pink-950/30 text-pink-100',
  },
  {
    id: 'pl',
    label_zh: 'PL',
    description_zh: '記錄光致發光量測條件與材料發光響應。',
    category_zh: '量測',
    accentClass: 'border-indigo-700/50 bg-indigo-950/30 text-indigo-100',
  },
  {
    id: 'afm',
    label_zh: 'AFM',
    description_zh: '記錄 AFM 厚度、粗糙度與形貌量測條件。',
    category_zh: '量測',
    accentClass: 'border-lime-700/50 bg-lime-950/30 text-lime-100',
  },
  {
    id: 'xps',
    label_zh: 'XPS',
    description_zh: '記錄元素組成、氧化態、深度分析與表面化學量測條件。',
    category_zh: '量測',
    accentClass: 'border-sky-700/50 bg-sky-950/30 text-sky-100',
  },
  {
    id: 'custom',
    label_zh: '自訂步驟',
    description_zh: '使用者自訂製程或量測步驟。',
    category_zh: '自訂',
    accentClass: 'border-slate-700 bg-slate-950/50 text-slate-300',
  },
]

export const processStepTypeLabels = processStepTypes.reduce<
  Record<ProcessStepType, string>
>((labels, item) => {
  labels[item.id] = item.label_zh
  return labels
}, {} as Record<ProcessStepType, string>)

export function getProcessStepTypeDefinition(type: ProcessStepType) {
  return processStepTypes.find((item) => item.id === type)
}
