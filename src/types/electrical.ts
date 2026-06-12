export type ElectricalContactModel =
  | 'ideal_ohmic'
  | 'manual_contact_resistance'
  | 'schottky_like'
  | 'tunneling_assisted'
  | 'unknown'

export type ElectricalConfidence = 'known' | 'estimated' | 'unknown'

export type ElectricalRiskLevel = 'low' | 'medium' | 'high' | 'unknown'

export type CarrierType = 'electron' | 'hole' | 'ambipolar' | 'unknown'

export interface ElectricalScenario {
  id: string
  name_zh: string
  channelLayerId?: string
  gateLayerId?: string
  gateDielectricLayerId?: string
  sourceLayerId?: string
  drainLayerId?: string
  linkedMeasurementStepId?: string
  channelMaterialId?: string
  gateDielectricMaterialId?: string
  mobility_cm2Vs: number | null
  thresholdVoltage_V: number | null
  carrierType: CarrierType
  contactModel: ElectricalContactModel
  sourceContactResistance_ohm: number | null
  drainContactResistance_ohm: number | null
  channelLength_um: number | null
  channelWidth_um: number | null
  dielectricThickness_nm: number | null
  dielectricConstant: number | null
  breakdownField_MVcm?: number | null
  gateVoltageStart_V: number
  gateVoltageStop_V: number
  gateVoltageStep_V: number
  drainVoltageStart_V: number
  drainVoltageStop_V: number
  drainVoltageStep_V: number
  temperature_K: number
  offCurrentFloor_A: number
  confidence: ElectricalConfidence
  notes_zh?: string
  /**
   * 通道輸出模型：
   * - 'linear_resistor'：舊版 Ohmic-like 線性電阻趨勢。
   * - 'square_law'：漸變通道近似（gradual channel approximation），
   *   含線性區 / 夾止飽和區（Sze & Ng 2007, Ch. 6）。
   * 預設 'square_law'。
   */
  outputModel?: ElectricalOutputModel
  /** 是否在 Id-Vg 中加入次臨界（subthreshold）指數區，預設 true。 */
  includeSubthreshold?: boolean
  /** 次臨界理想因子 n ≥ 1，SS = n·(kT/q)·ln10（Sze & Ng 2007）。 */
  subthresholdIdealityFactor?: number | null
  /** Schottky 障礙高度 φB (eV)，contactModel = 'schottky_like' 時用於熱離子發射上限估算。 */
  schottkyBarrierHeight_eV?: number | null
  /** Schottky 二極體理想因子，預設 1。 */
  schottkyIdealityFactor?: number | null
  /** 單側接觸面積 (µm²)，用於熱離子發射電流估算。 */
  contactArea_um2?: number | null
  /** 是否將量子電容與 Cox 串聯（Luryi 1988; Ma & Jena 2015），預設 false。 */
  includeQuantumCapacitance?: boolean
  /** 通道載子有效質量 (m* 除以 m0)，用於量子電容。 */
  effectiveMass_m0?: number | null
  /** 量子電容簡併因子 g（自旋×谷），預設 2（自旋）。TMD K/K' 谷可取 4。 */
  quantumDegeneracyFactor?: number | null
}

export type ElectricalOutputModel = 'linear_resistor' | 'square_law'

export interface ElectricalPoint {
  x: number
  y: number
}

export interface ElectricalCurve {
  id: string
  label_zh: string
  xLabel_zh: string
  yLabel_zh: string
  points: ElectricalPoint[]
}

export interface ElectricalResult {
  Cox_F_per_m2: number | null
  carrierDensity_m2: number | null
  carrierDensity_cm2: number | null
  channelResistance_ohm: number | null
  totalResistance_ohm: number | null
  dielectricField_MV_per_cm: number | null
  breakdownRisk: ElectricalRiskLevel
  contactRisk: ElectricalRiskLevel
  gateControlRisk: ElectricalRiskLevel
  idVdCurve: ElectricalCurve
  idVgCurve: ElectricalCurve
  /** 量子電容 Cq (F/m²)；未啟用時為 null。 */
  quantumCapacitance_F_per_m2: number | null
  /** 串聯量子電容後的有效閘極電容 (F/m²)；未啟用時等於 Cox。 */
  effectiveGateCapacitance_F_per_m2: number | null
  /** 次臨界擺幅 SS (mV/dec)；未啟用次臨界時為 null。 */
  subthresholdSwing_mV_per_dec: number | null
  /** 夾止飽和電壓 Vd,sat = Vg,stop − Vth (V)；square_law 模型時提供。 */
  saturationVoltage_V: number | null
  /** Schottky 熱離子發射飽和電流上限 (A)；schottky_like + φB 提供時計算。 */
  thermionicSaturationCurrent_A: number | null
  warnings_zh: string[]
  assumptions_zh: string[]
}

export interface ElectricalValidationResult {
  valid: boolean
  errors_zh: string[]
  warnings_zh: string[]
  info_zh: string[]
}
