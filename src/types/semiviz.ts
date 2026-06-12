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
  layers: DeviceLayer[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface MaterialParameter {
  value: number | string | null
  unit?: string
  confidence: ParameterConfidence
  note?: string
}

export interface Material {
  id: string
  name: string
  displayName: string
  category: MaterialCategory
  description: string
  color: string
  bandGap_eV: MaterialParameter
  electronAffinity_eV: MaterialParameter
  workFunction_eV: MaterialParameter
  dielectricConstant: MaterialParameter
  mobility_cm2Vs: MaterialParameter
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
  date: string
  type: MeasurementType
  tool?: string
  operator?: string
  notes?: string
}

export interface LiteratureSource {
  id: string
  title: string
  authors: string
  year: number
  doi?: string
  material?: string
  parameterExtracted?: string
  reliabilityScore: number
  status: LiteratureStatus
}

export interface ResearchHypothesis {
  id: string
  title: string
  description: string
  status: HypothesisStatus
  createdAt: string
}

export interface SemivizProject {
  devices: DeviceStructure[]
  materials: Material[]
  processes: ProcessFlow[]
  measurements: MeasurementData[]
  references: LiteratureSource[]
  hypotheses: ResearchHypothesis[]
}
