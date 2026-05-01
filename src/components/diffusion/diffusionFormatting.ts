import { materialCategoryLabels } from '../../data/materialCategories'
import { materials } from '../../data/materials'
import type {
  DiffusionConfidence,
  DiffusionDimensionality,
  DiffusionRiskLevel,
} from '../../types/diffusion'

export const dimensionalityLabels: Record<DiffusionDimensionality, string> = {
  one_d: '一維擴散',
  two_d: '二維擴散',
  three_d: '三維擴散',
}

export const confidenceLabels: Record<DiffusionConfidence, string> = {
  known: '已知',
  estimated: '估計值',
  unknown: '未知 / 需要文獻參數',
}

export const riskLabels: Record<DiffusionRiskLevel, string> = {
  low: '低',
  medium: '中',
  high: '高',
  unknown: '無法判定',
}

export function formatScientific(value: number | null, digits = 3) {
  if (value === null || !Number.isFinite(value)) {
    return '無法計算'
  }

  return value.toExponential(digits)
}

export function formatNumber(value: number | null, digits = 2) {
  if (value === null || !Number.isFinite(value)) {
    return '無法計算'
  }

  return value.toLocaleString('zh-TW', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  })
}

export function getRiskClass(risk: DiffusionRiskLevel) {
  if (risk === 'high') {
    return 'border-rose-700/70 bg-rose-950/40 text-rose-100'
  }

  if (risk === 'medium') {
    return 'border-amber-700/70 bg-amber-950/40 text-amber-100'
  }

  if (risk === 'low') {
    return 'border-emerald-700/70 bg-emerald-950/35 text-emerald-100'
  }

  return 'border-slate-700 bg-slate-950/60 text-slate-300'
}

export function getMaterialLabel(materialId: string) {
  const material = materials.find((item) => item.id === materialId)

  if (!material) {
    return '未知材料'
  }

  return `${material.displayName}（${materialCategoryLabels[material.category]}）`
}
