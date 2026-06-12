import type { DeviceLayer, DeviceStructure, Material, MaterialParameter } from '../types/semiviz'

export const epsilon0_Fm = 8.8541878128e-12

export interface ExtractedDeviceParameters {
  deviceId: string
  deviceName: string
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
  mobility_cm2Vs?: number
  bandGap_eV?: number
  electronAffinity_eV?: number
  contactWorkFunction_eV?: number
  missing: string[]
}

export interface TransferCurveInput {
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
  const channelLayer = activeDevice.layers.find((layer) => layer.role === 'semiconductor')
  const dielectricLayer = activeDevice.layers.find((layer) => layer.role === 'dielectric' || layer.role === 'oxide')
  const contactLayers = activeDevice.layers.filter((layer) =>
    ['source', 'drain', 'contact'].includes(layer.role),
  )
  const channelMaterial = channelLayer ? findMaterial(materials, channelLayer.materialId) : undefined
  const dielectricMaterial = dielectricLayer ? findMaterial(materials, dielectricLayer.materialId) : undefined
  const contactMaterials = contactLayers
    .map((layer) => findMaterial(materials, layer.materialId))
    .filter((material): material is Material => Boolean(material))

  const contactWorkFunctions = contactMaterials
    .map((material) => parseMaterialParameter(material.workFunction_eV))
    .filter((value): value is number => value !== undefined)
  const dielectricConstant = parseMaterialParameter(dielectricMaterial?.dielectricConstant)
  const extracted: ExtractedDeviceParameters = {
    deviceId: activeDevice.id,
    deviceName: activeDevice.name,
    channelLayer,
    dielectricLayer,
    contactLayers,
    channelMaterial,
    dielectricMaterial,
    contactMaterials,
    length_um: positiveNumber(channelLayer?.geometry.length_um),
    width_um: positiveNumber(channelLayer?.geometry.width_um),
    tox_nm: positiveNumber(dielectricLayer?.geometry.thickness_nm),
    dielectricConstant,
    mobility_cm2Vs: parseMaterialParameter(channelMaterial?.mobility_cm2Vs),
    bandGap_eV: parseMaterialParameter(channelMaterial?.bandGap_eV),
    electronAffinity_eV: parseMaterialParameter(channelMaterial?.electronAffinity_eV),
    contactWorkFunction_eV: contactWorkFunctions.length ? average(contactWorkFunctions) : undefined,
    missing: [],
  }

  extracted.missing = detectMissingParameters(extracted)
  return extracted
}

export function detectMissingParameters(parameters: ExtractedDeviceParameters) {
  const missing: string[] = []

  if (!parameters.channelLayer) missing.push('channel layer role=semiconductor')
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
  const vov = input.vg - input.vth

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

export function parseMaterialParameter(parameter?: MaterialParameter) {
  if (!parameter || parameter.value === null) {
    return undefined
  }

  if (typeof parameter.value === 'number') {
    return parameter.value
  }

  const values = parameter.value.match(/\d*\.?\d+/g)?.map(Number).filter(Number.isFinite)

  if (!values?.length) {
    return undefined
  }

  return values.length === 1 ? values[0] : average(values)
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
