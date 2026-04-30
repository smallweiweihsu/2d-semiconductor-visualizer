import type { MaterialCategory } from '../types/material'
import type { DeviceLayerRole } from '../types/device'

export interface DeviceRoleDefinition {
  id: DeviceLayerRole
  label_zh: string
  description_zh: string
  suggestedCategories: MaterialCategory[]
}

export const deviceRoles: DeviceRoleDefinition[] = [
  {
    id: 'source',
    label_zh: '源極',
    description_zh: '提供載子注入的源端接觸。',
    suggestedCategories: ['metal', 'bulk_conductor'],
  },
  {
    id: 'drain',
    label_zh: '汲極',
    description_zh: '收集載子的汲端接觸。',
    suggestedCategories: ['metal', 'bulk_conductor'],
  },
  {
    id: 'gate',
    label_zh: '閘極',
    description_zh: '控制通道載子濃度的閘極或背閘。',
    suggestedCategories: ['metal', 'bulk_conductor'],
  },
  {
    id: 'semiconductor',
    label_zh: '半導體通道',
    description_zh: '主要電流通道或二維半導體材料層。',
    suggestedCategories: ['two_d_semiconductor'],
  },
  {
    id: 'dielectric',
    label_zh: '介電層',
    description_zh: '閘極與通道之間或封裝用途的絕緣層。',
    suggestedCategories: ['dielectric', 'oxide'],
  },
  {
    id: 'oxide',
    label_zh: '氧化層',
    description_zh: '本徵氧化物、製程氧化物或局部氧化層。',
    suggestedCategories: ['oxide', 'dielectric'],
  },
  {
    id: 'substrate',
    label_zh: '基板',
    description_zh: '支撐元件結構的底部基板。',
    suggestedCategories: ['substrate', 'dielectric', 'bulk_conductor'],
  },
  {
    id: 'bulk',
    label_zh: '塊材',
    description_zh: '作為底部平台、源極或厚材料層的塊材。',
    suggestedCategories: ['bulk_conductor', 'substrate'],
  },
  {
    id: 'passivation',
    label_zh: '鈍化層',
    description_zh: '保護、封裝或降低表面反應的鈍化層。',
    suggestedCategories: ['dielectric', 'oxide'],
  },
  {
    id: 'contact',
    label_zh: '接觸金屬',
    description_zh: '一般金屬接觸或中介金屬層。',
    suggestedCategories: ['metal'],
  },
  {
    id: 'floating',
    label_zh: '浮接區域',
    description_zh: '沒有明確接地或外加偏壓的導電區域。',
    suggestedCategories: ['metal', 'bulk_conductor', 'two_d_semiconductor'],
  },
  {
    id: 'custom',
    label_zh: '自訂角色',
    description_zh: '尚未分類或實驗性用途的材料層。',
    suggestedCategories: [
      'metal',
      'two_d_semiconductor',
      'dielectric',
      'oxide',
      'bulk_conductor',
      'substrate',
      'custom',
    ],
  },
]

export const deviceRoleLabels = deviceRoles.reduce<
  Record<DeviceLayerRole, string>
>((labels, role) => {
  labels[role.id] = role.label_zh
  return labels
}, {} as Record<DeviceLayerRole, string>)

export function getDeviceRoleDefinition(role: DeviceLayerRole) {
  return deviceRoles.find((item) => item.id === role)
}
