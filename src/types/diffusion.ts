export type DiffusionDimensionality = 'one_d' | 'two_d' | 'three_d'

export type DiffusionConfidence = 'known' | 'estimated' | 'unknown'

export type DiffusionRiskLevel = 'low' | 'medium' | 'high' | 'unknown'

export interface DiffusionScenario {
  id: string
  name_zh: string
  diffusingSpecies: string
  hostMaterialId: string
  targetLayerId?: string
  linkedProcessStepId?: string
  temperature_C: number | null
  time_s: number | null
  D0_m2s: number | null
  Ea_eV: number | null
  dimensionality: DiffusionDimensionality
  interfaceBarrierFactor: number
  grainBoundaryMultiplier: number
  defectMultiplier: number
  initialMixingDepth_nm: number
  confidence: DiffusionConfidence
  notes_zh?: string
}

export interface DiffusionProfilePoint {
  depth_nm: number
  normalizedConcentration: number
}

export interface DiffusionResult {
  temperature_K: number | null
  D_m2s: number | null
  effectiveD_m2s: number | null
  diffusionLength_m: number | null
  diffusionLength_nm: number | null
  affectedDepth_nm: number | null
  affectedDepthToLayerThicknessRatio: number | null
  riskLevel: DiffusionRiskLevel
  profile: DiffusionProfilePoint[]
  warnings_zh: string[]
  assumptions_zh: string[]
}

export interface DiffusionValidationResult {
  valid: boolean
  errors_zh: string[]
  warnings_zh: string[]
  info_zh: string[]
}
