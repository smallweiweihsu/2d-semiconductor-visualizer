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
  /**
   * 氧化成長律：
   * - 'linear'：x = rate · t（舊版預設）。
   * - 'deal_grove'：線性-拋物線律 x² + A·x = B·(t+τ)（Deal & Grove 1965）。
   * - 'cabrera_mott'：低溫薄膜反對數律 1/x = a − b·ln(t/t₀)，自限性薄氧化層
   *   （Cabrera & Mott 1949），適合金屬（如 Sb）常溫自然氧化判讀。
   */
  growthLaw?: OxidationGrowthLaw
  /** Deal-Grove 線性-拋物線常數 A (nm)。B/A 為線性速率常數。 */
  dealGroveA_nm?: number | null
  /** Deal-Grove 拋物線速率常數 B (nm²/s)。 */
  dealGroveB_nm2_per_s?: number | null
  /** Deal-Grove 初始厚度等效時間 τ (s)，預設 0。 */
  dealGroveTau_s?: number | null
  /** Cabrera-Mott 反對數律截距 a (1/nm)。 */
  cabreraMottA_inv_nm?: number | null
  /** Cabrera-Mott 反對數律斜率 b (1/nm per ln(t/t₀))。 */
  cabreraMottB_inv_nm?: number | null
  /** Cabrera-Mott 參考時間 t₀ (s)，預設 1。 */
  cabreraMottT0_s?: number | null
  /** Cabrera-Mott 自限厚度上限 (nm)，估算結果不超過此值。 */
  cabreraMottLimitThickness_nm?: number | null
}

export type OxidationGrowthLaw = 'linear' | 'deal_grove' | 'cabrera_mott'

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
