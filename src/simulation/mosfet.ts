import type {
  CarrierType,
  DeviceLayer,
  DeviceStructure,
  Material,
  MaterialParameter,
  ParameterConfidence,
} from '../types/semiviz'
import { resolveMaterialParameter, type ResolvedMaterialParameter } from '../store/materialParameterUtils'

export const epsilon0_Fm = 8.8541878128e-12
export type SimulationStatus =
  | 'ready'
  | 'ready_with_estimates'
  | 'fallback_preview'
  | 'blocked_missing_parameters'

export const prototypeFallbackValues = {
  carrierType: 'n' as CarrierType,
  length_um: 1,
  width_um: 1,
  tox_nm: 20,
  dielectricConstant: 3.9,
  mobility_cm2Vs: 80,
}

export interface ParameterValue {
  value?: number
  confidence?: ParameterConfidence
  sourceIds?: string[]
  unit?: string
  notes?: string
  conditions?: ResolvedMaterialParameter['conditions']
  missingReason?: string
  conflict?: boolean
  valueType?: ResolvedMaterialParameter['valueType']
}

export interface ExtractedDeviceParameters {
  deviceId: string
  deviceName: string
  carrierType: CarrierType
  detection: {
    channel: 'configured' | 'auto-detected' | 'missing'
    gateDielectric: 'configured' | 'auto-detected' | 'missing'
    contacts: 'configured' | 'auto-detected' | 'missing'
  }
  channelLayer?: DeviceLayer
  dielectricLayer?: DeviceLayer
  contactLayers: DeviceLayer[]
  channelMaterial?: Material
  dielectricMaterial?: Material
  contactMaterials: Material[]
  length_um?: number
  width_um?: number
  tox_nm?: number
  dielectricConstant?: number
  dielectricConstantMeta?: ParameterValue
  mobility_cm2Vs?: number
  mobilityMeta?: ParameterValue
  bandGap_eV?: number
  bandGapMeta?: ParameterValue
  electronAffinity_eV?: number
  electronAffinityMeta?: ParameterValue
  contactWorkFunction_eV?: number
  contactWorkFunctionMeta?: ParameterValue
  missing: string[]
}

export interface ResolvedModelParameter {
  key: 'carrierType' | 'length_um' | 'width_um' | 'tox_nm' | 'dielectricConstant' | 'mobility_cm2Vs'
  label: string
  value: number | CarrierType
  unit: string
  source: 'extracted' | 'estimated' | 'fallback' | 'conflict'
  sourceIds?: string[]
  notes?: string
  conditions?: ResolvedMaterialParameter['conditions']
  detectionSource?: 'configured' | 'auto-detected' | 'fallback'
}

export interface SimulationModelResolution {
  status: SimulationStatus
  input?: TransferCurveInput
  parameters: ResolvedModelParameter[]
  missing: string[]
  warnings: string[]
}

export interface TransferCurveInput {
  carrierType: CarrierType
  mobility_cm2Vs: number
  dielectricConstant: number
  tox_nm: number
  width_um: number
  length_um: number
  vd: number
  vgMin: number
  vgMax: number
  vth: number
  rc_ohm: number
  leakage_A: number
  points?: number
}

export interface TransferPoint {
  vg: number
  id_A: number
  region: 'off' | 'linear' | 'saturation'
}

export interface OutputPoint {
  vd: number
  [series: string]: number
}

export function extractDeviceParameters(
  activeDevice: DeviceStructure,
  materials: Material[],
): ExtractedDeviceParameters {
  const configuredChannelLayer = findLayerById(activeDevice.layers, activeDevice.simulationConfig?.channelLayerId)
  const autoChannelLayer = findElectricalLayer(activeDevice.layers, ['channel'])
    ?? activeDevice.layers.find((layer) => layer.role === 'semiconductor')
  const channelLayer = configuredChannelLayer ?? autoChannelLayer
  const configuredDielectricLayer = findLayerById(activeDevice.layers, activeDevice.simulationConfig?.gateDielectricLayerId)
  const autoDielectricLayer = findElectricalLayer(activeDevice.layers, ['gate_dielectric'])
    ?? activeDevice.layers.find((layer) => layer.role === 'dielectric')
  const dielectricLayer = configuredDielectricLayer ?? autoDielectricLayer
  const configuredContactLayers = [
    findLayerById(activeDevice.layers, activeDevice.simulationConfig?.sourceLayerId),
    findLayerById(activeDevice.layers, activeDevice.simulationConfig?.drainLayerId),
  ].filter((layer): layer is DeviceLayer => Boolean(layer))
  const autoContactLayers = activeDevice.layers.filter((layer) =>
    ['source', 'drain', 'contact'].includes(layer.electricalRole)
    || (layer.electricalRole === 'unknown' && ['source', 'drain', 'contact'].includes(layer.role)),
  )
  const contactLayers = configuredContactLayers.length ? configuredContactLayers : autoContactLayers
  const channelMaterial = channelLayer ? findMaterial(materials, channelLayer.materialId) : undefined
  const dielectricMaterial = dielectricLayer ? findMaterial(materials, dielectricLayer.materialId) : undefined
  const contactMaterials = contactLayers
    .map((layer) => findMaterial(materials, layer.materialId))
    .filter((material): material is Material => Boolean(material))

  const contactWorkFunctions = contactMaterials
    .map((material) => parseMaterialParameter(material.workFunction_eV))
    .filter(hasNumericParameterValue)
  const dielectricConstant = parseMaterialParameter(dielectricMaterial?.dielectricConstant)
  const mobility = parseMaterialParameter(channelMaterial?.mobility_cm2Vs)
  const bandGap = parseMaterialParameter(channelMaterial?.bandGap_eV)
  const electronAffinity = parseMaterialParameter(channelMaterial?.electronAffinity_eV)
  const contactWorkFunction = contactWorkFunctions.length
    ? combineParameterValues(contactWorkFunctions)
    : undefined
  const extracted: ExtractedDeviceParameters = {
    deviceId: activeDevice.id,
    deviceName: activeDevice.name,
    carrierType: activeDevice.carrierType ?? channelMaterial?.carrierType ?? 'unknown',
    detection: {
      channel: configuredChannelLayer ? 'configured' : channelLayer ? 'auto-detected' : 'missing',
      gateDielectric: configuredDielectricLayer ? 'configured' : dielectricLayer ? 'auto-detected' : 'missing',
      contacts: configuredContactLayers.length ? 'configured' : contactLayers.length ? 'auto-detected' : 'missing',
    },
    channelLayer,
    dielectricLayer,
    contactLayers,
    channelMaterial,
    dielectricMaterial,
    contactMaterials,
    length_um: positiveNumber(channelLayer?.geometry.length_um),
    width_um: positiveNumber(channelLayer?.geometry.width_um),
    tox_nm: positiveNumber(dielectricLayer?.geometry.thickness_nm),
    dielectricConstant: dielectricConstant.value,
    dielectricConstantMeta: dielectricConstant,
    mobility_cm2Vs: mobility.value,
    mobilityMeta: mobility,
    bandGap_eV: bandGap.value,
    bandGapMeta: bandGap,
    electronAffinity_eV: electronAffinity.value,
    electronAffinityMeta: electronAffinity,
    contactWorkFunction_eV: contactWorkFunction?.value,
    contactWorkFunctionMeta: contactWorkFunction,
    missing: [],
  }

  extracted.missing = detectMissingParameters(extracted)
  return extracted
}

export function detectMissingParameters(parameters: ExtractedDeviceParameters) {
  const missing: string[] = []

  if (!parameters.channelLayer) missing.push('channel layer electricalRole=channel')
  if (parameters.carrierType === 'unknown') missing.push('carrierType')
  if (!parameters.length_um) missing.push('channel length_um')
  if (!parameters.width_um) missing.push('channel width_um')
  if (!parameters.mobility_cm2Vs) missing.push('channel mobility_cm2Vs')
  if (!parameters.bandGap_eV) missing.push('channel bandGap_eV')
  if (!parameters.electronAffinity_eV) missing.push('channel electronAffinity_eV')
  if (!parameters.dielectricLayer) missing.push('gate dielectric layer')
  if (!parameters.tox_nm) missing.push('dielectric thickness_nm')
  if (!parameters.dielectricConstant) missing.push('dielectricConstant')
  if (!parameters.contactLayers.length) missing.push('source/drain/contact layer')
  if (!parameters.contactWorkFunction_eV) missing.push('contact workFunction_eV')

  return missing
}

export function resolveSimulationModel(
  parameters: ExtractedDeviceParameters,
  options: {
    useFallback: boolean
    vd: number
    vgMin: number
    vgMax: number
    vth: number
    rc_ohm: number
    leakage_A: number
  },
): SimulationModelResolution {
  const resolved: ResolvedModelParameter[] = []
  const warnings: string[] = []
  const missing: string[] = []
  const carrierType = resolveCarrierType(parameters.carrierType, options.useFallback, resolved, missing)
  const length_um = resolveNumberParameter('length_um', 'L', parameters.length_um, '', 'µm', options.useFallback, resolved, missing)
  const width_um = resolveNumberParameter('width_um', 'W', parameters.width_um, '', 'µm', options.useFallback, resolved, missing)
  const tox_nm = resolveNumberParameter('tox_nm', 'tox', parameters.tox_nm, '', 'nm', options.useFallback, resolved, missing)
  const dielectricConstant = resolveNumberParameter('dielectricConstant', 'k', parameters.dielectricConstant, confidenceSource(parameters.dielectricConstantMeta), '', options.useFallback, resolved, missing, parameters.dielectricConstantMeta, parameters.detection.gateDielectric)
  const mobility_cm2Vs = resolveNumberParameter('mobility_cm2Vs', 'mobility', parameters.mobility_cm2Vs, confidenceSource(parameters.mobilityMeta), 'cm²/V·s', options.useFallback, resolved, missing, parameters.mobilityMeta, parameters.detection.channel)

  if (missing.length && !options.useFallback) {
    return {
      status: 'blocked_missing_parameters',
      parameters: resolved,
      missing,
      warnings,
    }
  }

  if (options.useFallback && resolved.some((parameter) => parameter.source === 'fallback')) {
    warnings.push('Prototype preview using fallback values, not calibrated.')
  }

  const input = {
    carrierType,
    mobility_cm2Vs,
    dielectricConstant,
    tox_nm,
    width_um,
    length_um,
    vd: options.vd,
    vgMin: options.vgMin,
    vgMax: options.vgMax,
    vth: options.vth,
    rc_ohm: options.rc_ohm,
    leakage_A: options.leakage_A,
  }

  if (resolved.some((parameter) => parameter.source === 'fallback')) {
    return { status: 'fallback_preview', input, parameters: resolved, missing, warnings }
  }

  if (resolved.some((parameter) => parameter.source === 'estimated')) {
    return { status: 'ready_with_estimates', input, parameters: resolved, missing, warnings }
  }

  return { status: 'ready', input, parameters: resolved, missing, warnings }
}

export function calculateCox(dielectricConstant: number, tox_nm: number) {
  if (dielectricConstant <= 0 || tox_nm <= 0) {
    return 0
  }

  return epsilon0_Fm * dielectricConstant / (tox_nm * 1e-9)
}

export function calculateTransferCurve(input: TransferCurveInput): TransferPoint[] {
  const pointCount = Math.max(2, input.points ?? 81)
  const step = (input.vgMax - input.vgMin) / (pointCount - 1)

  return Array.from({ length: pointCount }, (_, index) => {
    const vg = input.vgMin + index * step
    const result = calculateDrainCurrent({ ...input, vg, vd: input.vd })
    return { vg: round(vg, 3), id_A: result.id_A, region: result.region }
  })
}

export function calculateOutputCurve(
  input: Omit<TransferCurveInput, 'vd' | 'points'> & { vdMax: number; vgValues: number[]; points?: number },
): OutputPoint[] {
  const pointCount = Math.max(2, input.points ?? 61)
  const step = input.vdMax / (pointCount - 1)

  return Array.from({ length: pointCount }, (_, index) => {
    const vd = index * step
    const point: OutputPoint = { vd: round(vd, 3) }

    input.vgValues.forEach((vg) => {
      point[`Vg=${round(vg, 1)}V`] = calculateDrainCurrent({ ...input, vg, vd }).id_A
    })

    return point
  })
}

export function calculateDrainCurrent(input: TransferCurveInput & { vg: number; vd: number }) {
  const vov = calculateOverdrive(input.carrierType, input.vg, input.vth)

  if (vov <= 0) {
    return { id_A: input.leakage_A, region: 'off' as const }
  }

  const mobility_m2Vs = input.mobility_cm2Vs * 1e-4
  const cox = calculateCox(input.dielectricConstant, input.tox_nm)
  const widthLengthRatio = input.width_um / input.length_um
  const vdAbs = Math.max(input.vd, 0)
  const isLinear = vdAbs < vov
  const ideal = isLinear
    ? mobility_m2Vs * cox * widthLengthRatio * ((vov * vdAbs) - (vdAbs ** 2 / 2))
    : 0.5 * mobility_m2Vs * cox * widthLengthRatio * vov ** 2
  const limited = applyContactResistance(Math.max(ideal, input.leakage_A), input.rc_ohm, vdAbs)

  return {
    id_A: limited,
    region: isLinear ? 'linear' as const : 'saturation' as const,
  }
}

export function scaleCurrent(value_A: number, unit: 'A' | 'uA' | 'nA') {
  if (unit === 'uA') return value_A * 1e6
  if (unit === 'nA') return value_A * 1e9
  return value_A
}

export function parseMaterialParameter(parameter?: MaterialParameter): ParameterValue {
  if (!parameter) {
    return {}
  }

  const resolved = resolveMaterialParameter(parameter)
  return {
    value: resolved.value,
    confidence: resolved.confidence === 'conflict' ? 'estimated' : resolved.confidence,
    sourceIds: resolved.sourceIds,
    unit: resolved.unit,
    notes: resolved.notes,
    conditions: resolved.conditions,
    missingReason: resolved.missingReason,
    conflict: resolved.conflict,
    valueType: resolved.valueType,
  }
}

function calculateOverdrive(carrierType: CarrierType, vg: number, vth: number) {
  const threshold = Math.abs(vth)

  if (carrierType === 'p') {
    return -vg - threshold
  }

  if (carrierType === 'ambipolar') {
    return Math.max(vg - threshold, -vg - threshold)
  }

  if (carrierType === 'n') {
    return vg - threshold
  }

  return Number.NEGATIVE_INFINITY
}

function resolveCarrierType(
  value: CarrierType,
  useFallback: boolean,
  resolved: ResolvedModelParameter[],
  missing: string[],
) {
  if (value !== 'unknown') {
    resolved.push({ key: 'carrierType', label: 'carrier type', value, unit: '', source: 'extracted' })
    return value
  }

  if (useFallback) {
    resolved.push({ key: 'carrierType', label: 'carrier type', value: prototypeFallbackValues.carrierType, unit: '', source: 'fallback' })
    return prototypeFallbackValues.carrierType
  }

  missing.push('carrierType')
  return 'unknown'
}

function resolveNumberParameter(
  key: ResolvedModelParameter['key'],
  label: string,
  value: number | undefined,
  source: ResolvedModelParameter['source'] | '',
  unit: string,
  useFallback: boolean,
  resolved: ResolvedModelParameter[],
  missing: string[],
  meta?: ParameterValue,
  detectionSource?: 'configured' | 'auto-detected' | 'missing',
) {
  if (value !== undefined) {
    resolved.push({
      key,
      label,
      value,
      unit,
      source: source === 'estimated' || source === 'conflict' ? source : 'extracted',
      sourceIds: meta?.sourceIds,
      notes: meta?.notes,
      conditions: meta?.conditions,
      detectionSource: detectionSource === 'configured' || detectionSource === 'auto-detected' ? detectionSource : undefined,
    })
    return value
  }

  if (useFallback) {
    const fallbackValue = prototypeFallbackValues[key]
    resolved.push({ key, label, value: fallbackValue, unit, source: 'fallback', detectionSource: 'fallback' })
    return fallbackValue as number
  }

  missing.push(label)
  return 0
}

function confidenceSource(meta?: ParameterValue): ResolvedModelParameter['source'] | '' {
  return meta?.confidence === 'estimated' ? 'estimated' : ''
}

function hasNumericParameterValue(value: ParameterValue): value is ParameterValue & { value: number; confidence: ParameterConfidence } {
  return value.value !== undefined && value.confidence !== undefined
}

function combineParameterValues(values: Array<ParameterValue & { value: number; confidence: ParameterConfidence }>): ParameterValue {
  return {
    value: average(values.map((value) => value.value)),
    confidence: values.some((value) => value.confidence === 'estimated') ? 'estimated' : 'known',
  }
}

function findElectricalLayer(layers: DeviceLayer[], roles: DeviceLayer['electricalRole'][]) {
  return layers.find((layer) => roles.includes(layer.electricalRole))
}

function findLayerById(layers: DeviceLayer[], layerId?: string) {
  return layerId ? layers.find((layer) => layer.id === layerId) : undefined
}

function applyContactResistance(id_A: number, rc_ohm: number, vd: number) {
  if (rc_ohm <= 0 || id_A <= 0) {
    return id_A
  }

  const voltageScale = Math.max(vd, 1e-6)
  return id_A / (1 + (id_A * rc_ohm / voltageScale))
}

function findMaterial(materials: Material[], id: string) {
  return materials.find((material) => material.id === id)
}

function positiveNumber(value?: number) {
  return typeof value === 'number' && value > 0 ? value : undefined
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function round(value: number, digits: number) {
  return Number(value.toFixed(digits))
}
