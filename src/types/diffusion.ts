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
  /**
   * 擴散源模型（Fick 第二定律解析解，Crank 1975）：
   * - 'instantaneous'：瞬時有限源 → 高斯剖面 exp(−x²/4Dt)（舊版預設）。
   * - 'constant_source'：定濃度表面源 → erfc 剖面 erfc(x/2√(Dt))，
   *   適合長時間供給不斷的退火擴散（如金屬層持續供應）。
   */
  sourceModel?: DiffusionSourceModel
}

export type DiffusionSourceModel = 'instantaneous' | 'constant_source'

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
