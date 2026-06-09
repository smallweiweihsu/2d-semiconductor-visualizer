export type OxidationMethod =
  | 'o2_rie'
  | 'uv_ozone'
  | 'thermal_oxidation'
  | 'ambient_exposure'
  | 'plasma_oxidation'
  | 'custom'

export type OxidationTargetMaterial =
  | 'wse2'
  | 'ws2'
  | 'mos2'
  | 'sb'
  | 'generic_2d_material'
  | 'custom'

export type OxidationProduct =
  | 'sb2o3'
  | 'moo3'
  | 'wo3'
  | 'native_oxide'
  | 'custom'

export type OxidationConfidence = 'known' | 'estimated' | 'unknown'

export type RamanVisibilityLevel =
  | 'likely_visible'
  | 'weak_possible'
  | 'unlikely_visible'
  | 'unknown'

export type OxidationRiskLevel = 'low' | 'medium' | 'high' | 'unknown'

export interface OxidationScenario {
  id: string
  name_zh: string
  targetMaterialId: string
  targetLayerId?: string
  productMaterialId?: string
  linkedProcessStepId?: string
  method: OxidationMethod
  processTime_s: number | null
  temperature_C: number | null
  power_W: number | null
  oxygenConcentration_percent: number | null
  humidity_percent: number | null
  initialThickness_nm: number | null
  initialLayerCount: number | null
  oxidationRate_nm_per_s: number | null
  nonuniformityFactor: number
  laserPenetrationDepth_nm: number | null
  ramanProbeDepth_nm: number | null
  damageFactor: number
  confidence: OxidationConfidence
  notes_zh?: string
}

export interface OxidationResult {
  estimatedOxidizedThickness_nm: number | null
  estimatedRemainingThickness_nm: number | null
  oxidationFraction: number | null
  remainingFraction: number | null
  ramanVisibility: RamanVisibilityLevel
  damageRisk: OxidationRiskLevel
  nonuniformityRisk: OxidationRiskLevel
  explanations_zh: string[]
  warnings_zh: string[]
  assumptions_zh: string[]
}

export interface OxidationValidationResult {
  valid: boolean
  errors_zh: string[]
  warnings_zh: string[]
  info_zh: string[]
}
