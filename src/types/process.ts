import type { ParameterConfidence } from './material'

export type ProcessStepType =
  | 'metal_deposition'
  | 'dielectric_deposition'
  | 'oxidation'
  | 'diffusion_annealing'
  | 'rie'
  | 'sem'
  | 'ebeam_lithography'
  | 'electrical_measurement'
  | 'low_temperature_electrical_measurement'
  | 'raman'
  | 'low_power_raman'
  | 'pl'
  | 'afm'
  | 'xps'
  | 'custom'

export interface ProcessParameter {
  id: string
  label_zh: string
  value: number | string | boolean | null
  unit?: string
  confidence: ParameterConfidence
  note_zh?: string
}

export interface ProcessStep {
  id: string
  type: ProcessStepType
  name_zh: string
  description_zh: string
  parameters: ProcessParameter[]
  assumptions_zh: string[]
  warnings_zh: string[]
}
