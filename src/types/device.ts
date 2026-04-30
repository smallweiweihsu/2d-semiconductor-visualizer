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
  name: string
  description_zh: string
  layers: DeviceLayer[]
  createdAt?: string
  updatedAt?: string
}

export type DeviceValidationSeverity = 'info' | 'warning' | 'error'

export interface DeviceValidationWarning {
  id: string
  severity: DeviceValidationSeverity
  layerId?: string
  message_zh: string
}
