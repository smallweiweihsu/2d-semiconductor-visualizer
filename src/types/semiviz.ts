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
  | 'custom'

export type VoltageMode = 'grounded' | 'biased' | 'floating' | 'none'

export type MaterialCategory =
  | 'metal'
  | 'two_d_semiconductor'
  | 'dielectric'
  | 'oxide'
  | 'bulk_conductor'
  | 'substrate'
  | 'custom'

export type ParameterConfidence = 'known' | 'estimated' | 'unknown'
export type ParameterBadge = ParameterConfidence | 'fallback' | 'conflict'
export type ParameterValueType = 'scalar' | 'range' | 'text' | 'unknown'
export type CarrierType = 'n' | 'p' | 'ambipolar' | 'unknown'
export type ElectricalRole =
  | 'channel'
  | 'source'
  | 'drain'
  | 'gate'
  | 'gate_dielectric'
  | 'buffer'
  | 'substrate'
  | 'passivation'
  | 'contact'
  | 'unknown'

export type ProcessType =
  | 'exfoliation'
  | 'dry_transfer'
  | 'metal_deposition'
  | 'thermal_evaporation'
  | 'ebeam_evaporation'
  | 'rie'
  | 'oxidation'
  | 'annealing'
  | 'metal_diffusion'
  | 'dielectric_deposition'
  | 'lithography'
  | 'liftoff'
  | 'raman_check'
  | 'pl_check'
  | 'afm_check'
  | 'xps_check'
  | 'electrical_measurement'

export type MeasurementType =
  | 'electrical'
  | 'raman'
  | 'pl'
  | 'xps'
  | 'afm'
  | 'sem'
  | 'tem'

export type LiteratureStatus = 'candidate' | 'reviewed' | 'accepted' | 'rejected'
export type HypothesisStatus = 'open' | 'testing' | 'confirmed' | 'rejected'

export interface LayerGeometry {
  length_um: number
  width_um: number
  thickness_nm: number
  x_um: number
  y_um: number
  z_nm?: number
}

export interface DeviceLayer {
  id: string
  name: string
  materialId: string
  role: DeviceLayerRole
  electricalRole: ElectricalRole
  stackOrder?: number
  geometry: LayerGeometry
  voltageMode: VoltageMode
  voltageLabel?: string
  voltageValue_V?: number | null
  visible: boolean
  opacity: number
  notes?: string
}

export interface DeviceStructure {
  id: string
  templateId?: string
  name: string
  description: string
  carrierType?: CarrierType
  simulationConfig?: SimulationConfig
  layers: DeviceLayer[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface SimulationConfig {
  channelLayerId?: string
  gateDielectricLayerId?: string
  sourceLayerId?: string
  drainLayerId?: string
  gateLayerId?: string
}

export interface MaterialParameter {
  key: string
  label: string
  value?: number | string | null
  unit?: string
  confidence: ParameterConfidence
  sourceIds: string[]
  notes?: string
  conditions: ParameterConditions
  valueType: ParameterValueType
  range?: ParameterRange
  selectedValue?: number | string | null
  lastReviewedAt?: string
  candidates?: ParameterCandidate[]
  note?: string
}

export interface ParameterConditions {
  temperature_K?: number
  substrate?: string
  thickness_nm?: number
  phase?: string
  measurementMethod?: string
  environment?: string
}

export interface ParameterRange {
  min?: number
  max?: number
  typical?: number
}

export interface ParameterCandidate {
  id: string
  value?: number | string | null
  unit?: string
  confidence: ParameterConfidence
  sourceId?: string
  sourceIds?: string[]
  conditions?: ParameterConditions
  notes?: string
  valueType: ParameterValueType
  range?: ParameterRange
  selected?: boolean
}

export interface Material {
  id: string
  name: string
  displayName: string
  category: MaterialCategory
  carrierType: CarrierType
  description: string
  color: string
  bandGap_eV: MaterialParameter
  electronAffinity_eV: MaterialParameter
  workFunction_eV: MaterialParameter
  dielectricConstant: MaterialParameter
  mobility_cm2Vs: MaterialParameter
  resistivity_ohm_m: MaterialParameter
  latticeConstant_A: MaterialParameter
  defaultThickness_nm: MaterialParameter
  notes: string[]
}

export interface ProcessStep {
  id: string
  order: number
  type: ProcessType
  materialId?: string
  time?: string
  temperature?: string
  gas?: string
  power?: string
  thickness?: string
  tool?: string
  notes?: string
  expectedResult?: string
  risk?: string
}

export interface ProcessFlow {
  id: string
  name: string
  description: string
  steps: ProcessStep[]
  deviceId?: string
  createdAt: string
}

export interface MeasurementData {
  id: string
  sampleName: string
  deviceName: string
  deviceId?: string
  date: string
  type: MeasurementType
  tool?: string
  operator?: string
  notes?: string
  electrical?: ElectricalMeasurementDataset
}

export interface ElectricalMeasurementDataset {
  measurementKind: 'id_vg' | 'id_vd' | 'unknown'
  sourceName: string
  columns: ElectricalMeasurementColumn[]
  points: ElectricalMeasurementPoint[]
  units: {
    voltage: 'V'
    current: 'A'
  }
}

export interface ElectricalMeasurementColumn {
  source: string
  mappedTo: ElectricalMeasurementColumnRole
  unit?: string
}

export type ElectricalMeasurementColumnRole =
  | 'ignore'
  | 'Vg'
  | 'Vd'
  | 'Id'
  | 'Ig'
  | 'time'
  | 'sweepDirection'
  | 'temperature'

export interface ElectricalMeasurementPoint {
  Vg?: number
  Vd?: number
  Id?: number
  Ig?: number
  time?: number
  sweepDirection?: string
  temperature?: number
}

export interface LiteratureSource {
  id: string
  title: string
  authors: string
  year: number
  journal?: string
  doi?: string
  url?: string
  material?: string
  parameterExtracted?: string
  reliabilityScore: number
  status: LiteratureStatus
  notes?: string
}

export interface ResearchHypothesis {
  id: string
  title: string
  description: string
  status: HypothesisStatus
  createdAt: string
}

export interface SemivizProject {
  schemaVersion: string
  activeDeviceId: string
  devices: DeviceStructure[]
  materials: Material[]
  processes: ProcessFlow[]
  measurements: MeasurementData[]
  references: LiteratureSource[]
  hypotheses: ResearchHypothesis[]
}
