import type {
  Material,
  MaterialParameter,
  ParameterCandidate,
  ParameterConditions,
  ParameterConfidence,
  ParameterRange,
  ParameterValueType,
  SemivizProject,
} from '../types/semiviz'

export interface ResolvedMaterialParameter {
  value?: number
  unit?: string
  confidence: ParameterConfidence | 'conflict'
  sourceIds: string[]
  notes?: string
  conditions: ParameterConditions
  valueType: ParameterValueType
  selectedCandidateId?: string
  conflict: boolean
  missingReason?: string
}

export const materialParameterLabels: Record<string, string> = {
  mobility_cm2Vs: 'mobility',
  bandGap_eV: 'band gap',
  electronAffinity_eV: 'electron affinity',
  dielectricConstant: 'dielectric constant',
  workFunction_eV: 'work function',
  resistivity_ohm_m: 'resistivity',
  latticeConstant_A: 'lattice constant',
  defaultThickness_nm: 'default thickness',
}

export function normalizeMaterialParameter(input: unknown, key: string): MaterialParameter {
  const fallback = unknownParameter(key)

  if (!input || typeof input !== 'object') {
    return fallback
  }

  const record = input as Record<string, unknown>
  const oldValue = record.value
  const normalizedRange = normalizeRange(record.range)
  const legacyRange = typeof oldValue === 'string' ? parseRangeString(oldValue) : undefined
  const valueType = normalizeValueType(record.valueType, oldValue, normalizedRange ?? legacyRange)
  const confidence = normalizeConfidence(record.confidence)
  const candidates = Array.isArray(record.candidates)
    ? record.candidates.map((candidate, index) => normalizeCandidate(candidate, `${key}-candidate-${index + 1}`))
    : []

  return {
    key: typeof record.key === 'string' ? record.key : key,
    label: typeof record.label === 'string' ? record.label : materialParameterLabels[key] ?? key,
    value: valueType === 'range' && legacyRange ? null : normalizeValue(oldValue),
    unit: typeof record.unit === 'string' ? record.unit : fallback.unit,
    confidence,
    sourceIds: normalizeSourceIds(record.sourceIds),
    notes: typeof record.notes === 'string' ? record.notes : typeof record.note === 'string' ? record.note : '',
    note: typeof record.note === 'string' ? record.note : undefined,
    conditions: normalizeConditions(record.conditions),
    valueType,
    range: normalizedRange ?? legacyRange,
    selectedValue: normalizeValue(record.selectedValue),
    lastReviewedAt: typeof record.lastReviewedAt === 'string' ? record.lastReviewedAt : undefined,
    candidates,
  }
}

export function resolveMaterialParameter(parameter: MaterialParameter): ResolvedMaterialParameter {
  const conflict = detectParameterConflict(parameter)
  const selectedCandidate = parameter.candidates?.find((candidate) => candidate.selected)

  if (selectedCandidate) {
    const candidateValue = resolveCandidateValue(selectedCandidate)
    return {
      value: candidateValue,
      unit: selectedCandidate.unit ?? parameter.unit,
      confidence: selectedCandidate.confidence,
      sourceIds: normalizeSourceIds(selectedCandidate.sourceIds ?? (selectedCandidate.sourceId ? [selectedCandidate.sourceId] : parameter.sourceIds)),
      notes: selectedCandidate.notes ?? parameter.notes,
      conditions: { ...parameter.conditions, ...selectedCandidate.conditions },
      valueType: selectedCandidate.valueType,
      selectedCandidateId: selectedCandidate.id,
      conflict,
      missingReason: candidateValue === undefined ? 'selected candidate has no usable value' : undefined,
    }
  }

  if (conflict && parameter.candidates?.length) {
    return baseResolved(parameter, undefined, 'conflict', true, 'conflict candidates require selectedValue')
  }

  if (parameter.confidence === 'unknown' || parameter.valueType === 'unknown') {
    return baseResolved(parameter, undefined, parameter.confidence, conflict, 'unknown parameter')
  }

  if (parameter.valueType === 'scalar') {
    const value = typeof parameter.value === 'number' ? parameter.value : undefined
    return baseResolved(parameter, value, parameter.confidence, conflict, value === undefined ? 'missing scalar value' : undefined)
  }

  if (parameter.valueType === 'range') {
    const selected = typeof parameter.selectedValue === 'number' ? parameter.selectedValue : undefined
    const typical = parameter.range?.typical
    const value = selected ?? typical
    return baseResolved(parameter, value, parameter.confidence, conflict, value === undefined ? 'range requires selectedValue or typical' : undefined)
  }

  return baseResolved(parameter, undefined, parameter.confidence, conflict, 'text parameter is not numeric')
}

export function detectParameterConflict(parameter: MaterialParameter) {
  const candidates = parameter.candidates ?? []

  if (candidates.length < 2) {
    return false
  }

  const scalarValues = candidates
    .map((candidate) => resolveCandidateValue(candidate))
    .filter((value): value is number => value !== undefined && value > 0)

  if (scalarValues.length >= 2) {
    const min = Math.min(...scalarValues)
    const max = Math.max(...scalarValues)
    if (max / min > 2) {
      return true
    }
  }

  const ranges = candidates
    .map((candidate) => candidate.range)
    .filter((range): range is Required<Pick<ParameterRange, 'min' | 'max'>> => typeof range?.min === 'number' && typeof range?.max === 'number')

  if (ranges.length >= 2) {
    const overlapMin = Math.max(...ranges.map((range) => range.min))
    const overlapMax = Math.min(...ranges.map((range) => range.max))
    if (overlapMin > overlapMax) {
      return true
    }
  }

  return new Set(candidates.map((candidate) => candidate.confidence)).size > 1
}

export function getReferenceUsage(project: SemivizProject, referenceId: string) {
  const usages: Array<{ materialId: string; materialName: string; parameterKey: string; parameterLabel: string }> = []
  project.materials.forEach((material) => {
    getMaterialParameters(material).forEach(([key, parameter]) => {
      const candidateSourceIds = parameter.candidates?.flatMap((candidate) => candidate.sourceIds ?? (candidate.sourceId ? [candidate.sourceId] : [])) ?? []
      if ([...parameter.sourceIds, ...candidateSourceIds].includes(referenceId)) {
        usages.push({
          materialId: material.id,
          materialName: material.displayName,
          parameterKey: key,
          parameterLabel: parameter.label,
        })
      }
    })
  })
  return usages
}

export function getMaterialParameters(material: Material): Array<[string, MaterialParameter]> {
  return [
    ['mobility_cm2Vs', material.mobility_cm2Vs],
    ['bandGap_eV', material.bandGap_eV],
    ['electronAffinity_eV', material.electronAffinity_eV],
    ['dielectricConstant', material.dielectricConstant],
    ['workFunction_eV', material.workFunction_eV],
    ['resistivity_ohm_m', material.resistivity_ohm_m],
  ]
}

function normalizeCandidate(input: unknown, fallbackId: string): ParameterCandidate {
  const record = typeof input === 'object' && input !== null ? input as Record<string, unknown> : {}
  const range = normalizeRange(record.range) ?? (typeof record.value === 'string' ? parseRangeString(record.value) : undefined)
  return {
    id: typeof record.id === 'string' ? record.id : fallbackId,
    value: range ? null : normalizeValue(record.value),
    unit: typeof record.unit === 'string' ? record.unit : undefined,
    confidence: normalizeConfidence(record.confidence),
    sourceId: typeof record.sourceId === 'string' ? record.sourceId : undefined,
    sourceIds: normalizeSourceIds(record.sourceIds),
    conditions: normalizeConditions(record.conditions),
    notes: typeof record.notes === 'string' ? record.notes : '',
    valueType: normalizeValueType(record.valueType, record.value, range),
    range,
    selected: record.selected === true,
  }
}

function resolveCandidateValue(candidate: ParameterCandidate) {
  if (candidate.valueType === 'scalar' && typeof candidate.value === 'number') return candidate.value
  if (candidate.valueType === 'range') return candidate.range?.typical
  return undefined
}

function baseResolved(
  parameter: MaterialParameter,
  value: number | undefined,
  confidence: ParameterConfidence | 'conflict',
  conflict: boolean,
  missingReason?: string,
): ResolvedMaterialParameter {
  return {
    value,
    unit: parameter.unit,
    confidence,
    sourceIds: parameter.sourceIds,
    notes: parameter.notes,
    conditions: parameter.conditions,
    valueType: parameter.valueType,
    conflict,
    missingReason,
  }
}

function unknownParameter(key: string): MaterialParameter {
  return {
    key,
    label: materialParameterLabels[key] ?? key,
    value: null,
    unit: undefined,
    confidence: 'unknown',
    sourceIds: [],
    notes: '',
    conditions: {},
    valueType: 'unknown',
    range: undefined,
    selectedValue: null,
    candidates: [],
  }
}

function normalizeValue(value: unknown) {
  return typeof value === 'number' || typeof value === 'string' || value === null ? value : null
}

function normalizeConfidence(value: unknown): ParameterConfidence {
  return value === 'known' || value === 'estimated' || value === 'unknown' ? value : 'unknown'
}

function normalizeValueType(valueType: unknown, value: unknown, range?: ParameterRange): ParameterValueType {
  if (valueType === 'scalar' || valueType === 'range' || valueType === 'text' || valueType === 'unknown') return valueType
  if (range) return 'range'
  if (typeof value === 'number') return 'scalar'
  if (typeof value === 'string') return 'text'
  return 'unknown'
}

function normalizeRange(value: unknown): ParameterRange | undefined {
  if (!value || typeof value !== 'object') return undefined
  const record = value as Record<string, unknown>
  const range = {
    min: typeof record.min === 'number' ? record.min : undefined,
    max: typeof record.max === 'number' ? record.max : undefined,
    typical: typeof record.typical === 'number' ? record.typical : undefined,
  }
  return range.min !== undefined || range.max !== undefined || range.typical !== undefined ? range : undefined
}

function parseRangeString(value: string): ParameterRange | undefined {
  const numbers = value.match(/\d*\.?\d+/g)?.map(Number).filter(Number.isFinite)
  if (!numbers || numbers.length < 2) return undefined
  return { min: numbers[0], max: numbers[1] }
}

function normalizeSourceIds(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : []
}

function normalizeConditions(value: unknown): ParameterConditions {
  if (!value || typeof value !== 'object') return {}
  const record = value as Record<string, unknown>
  return {
    temperature_K: typeof record.temperature_K === 'number' ? record.temperature_K : undefined,
    substrate: typeof record.substrate === 'string' ? record.substrate : undefined,
    thickness_nm: typeof record.thickness_nm === 'number' ? record.thickness_nm : undefined,
    phase: typeof record.phase === 'string' ? record.phase : undefined,
    measurementMethod: typeof record.measurementMethod === 'string' ? record.measurementMethod : undefined,
    environment: typeof record.environment === 'string' ? record.environment : undefined,
  }
}
