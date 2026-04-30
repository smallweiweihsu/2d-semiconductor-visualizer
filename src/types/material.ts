export type MaterialCategory =
  | 'metal'
  | 'two_d_semiconductor'
  | 'dielectric'
  | 'oxide'
  | 'bulk_conductor'
  | 'substrate'
  | 'custom'

export type ParameterConfidence = 'known' | 'estimated' | 'unknown'

export interface MaterialParameter {
  value: number | string | null
  unit?: string
  confidence: ParameterConfidence
  note?: string
  source?: string
}

export interface DiffusionParameter {
  D0_m2s: MaterialParameter
  Ea_eV: MaterialParameter
  confidence: ParameterConfidence
  notes: string
}

export interface MaterialParameters {
  workFunction_eV: MaterialParameter
  bandGap_eV: MaterialParameter
  electronAffinity_eV: MaterialParameter
  dielectricConstant: MaterialParameter
  mobility_cm2Vs: MaterialParameter
  resistivity_ohm_m: MaterialParameter
  latticeConstant_A: MaterialParameter
  defaultThickness_nm: MaterialParameter
  breakdownField_MVcm: MaterialParameter
  meltingPoint_C: MaterialParameter
}

export type MaterialParameterKey = keyof MaterialParameters

export interface Material {
  id: string
  name: string
  displayName: string
  category: MaterialCategory
  description_zh: string
  color: string
  parameters: MaterialParameters
  diffusion: DiffusionParameter
  notes_zh: string[]
  warnings_zh: string[]
}
