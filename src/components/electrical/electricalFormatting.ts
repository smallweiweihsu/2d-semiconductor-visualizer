import { getMaterialCategoryDefinition } from '../../data/materialCategories'
import { materials } from '../../data/materials'
import type {
  CarrierType,
  ElectricalConfidence,
  ElectricalContactModel,
  ElectricalRiskLevel,
} from '../../types/electrical'

export const contactModelLabels: Record<ElectricalContactModel, string> = {
  ideal_ohmic: 'Ohmic-like 近似',
  manual_contact_resistance: '手動接觸電阻',
  schottky_like: 'Schottky-like 警示',
  tunneling_assisted: '穿隧輔助近似',
  unknown: '未知',
}

export const carrierTypeLabels: Record<CarrierType, string> = {
  electron: '電子',
  hole: '電洞',
  ambipolar: '雙極性',
  unknown: '未知',
}

export const electricalConfidenceLabels: Record<ElectricalConfidence, string> = {
  known: '已知',
  estimated: '估計值',
  unknown: '未知 / 需要校準',
}

export const electricalRiskLabels: Record<ElectricalRiskLevel, string> = {
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

export function formatResistance(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '無法計算'
  }

  if (value >= 1e6) {
    return `${formatNumber(value / 1e6, 2)} MΩ`
  }

  if (value >= 1e3) {
    return `${formatNumber(value / 1e3, 2)} kΩ`
  }

  return `${formatNumber(value, 2)} Ω`
}

export function formatCurrent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '無法計算'
  }

  return `${value.toExponential(2)} A`
}

export function getRiskClass(risk: ElectricalRiskLevel) {
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

export function parseNumericMaterialValue(value: number | string | null) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const match = value.match(/[0-9]+(?:\.[0-9]+)?(?:e[-+]?\d+)?/i)
    return match ? Number(match[0]) : null
  }

  return null
}
