import { materials } from '../../data/materials'
import { deviceRoleLabels } from '../../data/deviceRoles'
import { materialCategoryLabels } from '../../data/materialCategories'
import type { DeviceLayer, DeviceLayerRole, VoltageMode } from '../../types/device'

export const voltageModeLabels: Record<VoltageMode, string> = {
  none: '無',
  grounded: '接地',
  biased: '外加偏壓',
  floating: '浮接',
}

export function getMaterialById(materialId: string) {
  return materials.find((material) => material.id === materialId)
}

export function getMaterialDisplayName(materialId: string) {
  return getMaterialById(materialId)?.displayName ?? '未知材料'
}

export function getMaterialCategoryLabel(materialId: string) {
  const material = getMaterialById(materialId)

  return material ? materialCategoryLabels[material.category] : '未知分類'
}

export function getLayerRoleLabel(role: DeviceLayerRole) {
  return deviceRoleLabels[role]
}

export function formatThickness(thickness_nm: number) {
  if (!Number.isFinite(thickness_nm)) {
    return '未知厚度'
  }

  if (thickness_nm >= 1000) {
    return `${(thickness_nm / 1000).toLocaleString('zh-TW', {
      maximumFractionDigits: 2,
    })} µm`
  }

  return `${thickness_nm.toLocaleString('zh-TW', {
    maximumFractionDigits: 2,
  })} nm`
}

export function formatVoltage(layer: DeviceLayer) {
  if (layer.voltageMode === 'none') {
    return ''
  }

  const label = layer.voltageLabel ? `${layer.voltageLabel}` : voltageModeLabels[layer.voltageMode]
  const value =
    typeof layer.voltageValue_V === 'number'
      ? ` ${layer.voltageValue_V.toLocaleString('zh-TW', {
          maximumFractionDigits: 3,
        })} V`
      : ''

  return `${label}${value}`
}

export function parseNumberInput(value: string, fallback = 0) {
  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : fallback
}
