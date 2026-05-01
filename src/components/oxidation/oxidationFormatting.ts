import { getMaterialCategoryDefinition } from '../../data/materialCategories'
import { materials } from '../../data/materials'
import type {
  OxidationConfidence,
  OxidationMethod,
  OxidationRiskLevel,
  RamanVisibilityLevel,
} from '../../types/oxidation'

export const oxidationMethodLabels: Record<OxidationMethod, string> = {
  o2_rie: 'O₂ RIE',
  uv_ozone: 'UV ozone',
  thermal_oxidation: '熱氧化',
  ambient_exposure: '環境暴露',
  plasma_oxidation: '電漿氧化',
  custom: '自訂方法',
}

export const oxidationConfidenceLabels: Record<OxidationConfidence, string> = {
  known: '已知',
  estimated: '估計值',
  unknown: '未知 / 需要文獻參數',
}

export const ramanVisibilityLabels: Record<RamanVisibilityLevel, string> = {
  likely_visible: '可能仍可見',
  weak_possible: '可能變弱',
  unlikely_visible: '可能不明顯',
  unknown: '無法判定',
}

export const oxidationRiskLabels: Record<OxidationRiskLevel, string> = {
  low: '低',
  medium: '中',
  high: '高',
  unknown: '無法判定',
}

export function getMaterialLabel(materialId?: string) {
  const material = materials.find((item) => item.id === materialId)

  if (!material) {
    return materialId || '尚未選擇'
  }

  const category = getMaterialCategoryDefinition(material.category)?.label_zh

  return category
    ? `${material.displayName}（${category}）`
    : material.displayName
}

export function formatNumber(value: number | null | undefined, digits = 3) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '無法計算'
  }

  if (Math.abs(value) >= 1000 || (Math.abs(value) > 0 && Math.abs(value) < 0.001)) {
    return value.toExponential(2)
  }

  return new Intl.NumberFormat('zh-TW', {
    maximumFractionDigits: digits,
  }).format(value)
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '無法計算'
  }

  return `${formatNumber(value * 100, 1)}%`
}

export function getRiskClass(risk: OxidationRiskLevel) {
  if (risk === 'high') {
    return 'border-rose-500/50 bg-rose-950/40 text-rose-100'
  }

  if (risk === 'medium') {
    return 'border-amber-500/50 bg-amber-950/35 text-amber-100'
  }

  if (risk === 'low') {
    return 'border-emerald-500/50 bg-emerald-950/35 text-emerald-100'
  }

  return 'border-slate-700 bg-slate-950/50 text-slate-300'
}
