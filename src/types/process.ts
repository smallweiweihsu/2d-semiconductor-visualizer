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

export type ProcessParameterValue = string | number | boolean | null

export type ProcessParameterType =
  | 'text'
  | 'number'
  | 'select'
  | 'boolean'
  | 'textarea'

export interface ProcessParameter {
  id: string
  label_zh: string
  type: ProcessParameterType
  value: ProcessParameterValue
  unit?: string
  options?: string[]
  confidence?: ParameterConfidence
  note_zh?: string
  required?: boolean
}

export interface ProcessStep {
  id: string
  type: ProcessStepType
  name_zh: string
  description_zh: string
  parameters: ProcessParameter[]
  linkedLayerIds?: string[]
  assumptions_zh: string[]
  warnings_zh: string[]
  notes_zh?: string
  enabled: boolean
}

export interface ProcessFlow {
  id: string
  name_zh: string
  description_zh: string
  steps: ProcessStep[]
  createdAt?: string
  updatedAt?: string
}

export type ProcessValidationSeverity = 'info' | 'warning' | 'error'

export interface ProcessValidationWarning {
  id: string
  severity: ProcessValidationSeverity
  stepId?: string
  message_zh: string
}
