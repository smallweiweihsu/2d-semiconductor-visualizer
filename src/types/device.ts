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

export type LayerPlacementPreset =
  | 'manual'
  | 'fit_selected_layer'
  | 'above_selected_layer'
  | 'below_selected_layer'
  | 'centered_on_selected_layer'
  | 'left_contact'
  | 'right_contact'
  | 'source_contact'
  | 'drain_contact'
  | 'top_gate'
  | 'top_dielectric'
  | 'local_oxide'
  | 'full_width_base'
  | 'custom'

export type LayerHorizontalAlign = 'left' | 'center' | 'right'

export type LayerVerticalMode = 'above' | 'below' | 'same_level' | 'manual'

export interface LayerPlacementReference {
  selectedLayerId?: string | null
  targetLayerId?: string | null
  referenceMode?: 'selected' | 'target' | 'none'
}

export interface LayerPlacementOptions {
  preset: LayerPlacementPreset
  referenceLayerId?: string | null
  horizontalAlign?: LayerHorizontalAlign
  verticalMode?: LayerVerticalMode
  margin_um?: number
  overlap_um?: number
  fitLength?: boolean
  fitWidth?: boolean
}

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
