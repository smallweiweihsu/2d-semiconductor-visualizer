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
}

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
  warnings_zh: string[]
  assumptions_zh: string[]
}

export interface ElectricalValidationResult {
  valid: boolean
  errors_zh: string[]
  warnings_zh: string[]
  info_zh: string[]
}
