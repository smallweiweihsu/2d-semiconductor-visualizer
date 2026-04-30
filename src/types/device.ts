export type UnitLength = 'nm' | 'um' | 'mm'

export type DeviceLayerRole =
  | 'source'
  | 'drain'
  | 'gate'
  | 'semiconductor'
  | 'dielectric'
  | 'oxide'
  | 'substrate'
  | 'bulk'
  | 'passivation'
  | 'contact'
  | 'floating'
  | 'custom'

export type VoltageMode = 'grounded' | 'biased' | 'floating' | 'none'

export interface LayerGeometry {
  length_um: number
  width_um: number
  thickness_nm: number
  x_um: number
  y_um: number
  z_nm?: number
  rotation_deg?: number
}

export interface DeviceLayer {
  id: string
  name: string
  materialId: string
  role: DeviceLayerRole
  geometry: LayerGeometry
  voltageMode: VoltageMode
  voltageLabel?: string
  voltageValue_V?: number | null
  visible: boolean
  opacity: number
  notes_zh?: string
  warnings_zh?: string[]
}

export interface DeviceStructure {
  id: string
  templateId?: string
  name: string
  description_zh: string
  layers: DeviceLayer[]
  createdAt?: string
  updatedAt?: string
}

export type DeviceTemplateCategory =
  | 'generic'
  | 'user_research'
  | 'fet'
  | 'two_terminal'
  | 'top_gate'
  | 'bottom_source'
  | 'custom'

export interface DeviceTemplate {
  id: string
  name_zh: string
  shortName_zh: string
  description_zh: string
  purpose_zh: string
  layers: DeviceLayer[]
  categories: DeviceTemplateCategory[]
  tags_zh: string[]
  warnings_zh: string[]
  assumptions_zh: string[]
  recommendedUse_zh?: string[]
}

export type DeviceValidationSeverity = 'info' | 'warning' | 'error'

export interface DeviceValidationWarning {
  id: string
  severity: DeviceValidationSeverity
  layerId?: string
  message_zh: string
}
