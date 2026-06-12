import { seedProject } from '../data/seedProject'
import { normalizeSimulationConfig } from './layerOperations'
import { normalizeMaterialParameter } from './materialParameterUtils'
import { inferStackOrder, withNormalizedStackOrder } from '../visualization/viewportGeometry'
import type {
  CarrierType,
  DeviceLayer,
  DeviceLayerRole,
  DeviceStructure,
  ElectricalRole,
  Material,
  MeasurementData,
  ProcessFlow,
  ResearchHypothesis,
  SemivizProject,
  LiteratureSource,
} from '../types/semiviz'

export interface ProjectImportResult {
  ok: boolean
  project?: SemivizProject
  error?: string
}

export function parseProjectJson(text: string): ProjectImportResult {
  try {
    return normalizeImportedProject(JSON.parse(text))
  } catch {
    return { ok: false, error: 'JSON 格式無法解析' }
  }
}

export function normalizeImportedProject(input: unknown): ProjectImportResult {
  if (!isRecord(input)) {
    return { ok: false, error: '匯入內容必須是 project object' }
  }

  if (!Array.isArray(input.devices)) {
    return { ok: false, error: 'devices 必須是 array' }
  }

  if (!Array.isArray(input.materials)) {
    return { ok: false, error: 'materials 必須是 array' }
  }

  const devices = input.devices.length
    ? input.devices.map((device, index) => normalizeDevice(device, index))
    : structuredClone(seedProject.devices)
  const materials = input.materials.length
    ? input.materials.map((material) => normalizeMaterial(material))
    : structuredClone(seedProject.materials)
  const activeDeviceId = typeof input.activeDeviceId === 'string'
    && devices.some((device) => device.id === input.activeDeviceId)
    ? input.activeDeviceId
    : devices[0].id

  return {
    ok: true,
    project: {
      activeDeviceId,
      devices,
      materials,
      processes: normalizeOptionalArray<ProcessFlow>(input.processes, seedProject.processes),
      measurements: normalizeOptionalArray<MeasurementData>(input.measurements, seedProject.measurements),
      references: normalizeReferences(input.references),
      hypotheses: normalizeOptionalArray<ResearchHypothesis>(input.hypotheses, seedProject.hypotheses),
    },
  }
}

export function normalizeStoredProject(input: unknown): SemivizProject {
  const result = normalizeImportedProject(input)

  if (!result.ok || !result.project) {
    return seedProject
  }

  return result.project
}

function normalizeDevice(input: unknown, index: number): DeviceStructure {
  const record = isRecord(input) ? input : {}
  const fallback = seedProject.devices[0]
  const id = typeof record.id === 'string' && record.id ? record.id : `imported-device-${index + 1}`
  const now = new Date().toISOString().slice(0, 10)
  const layers = Array.isArray(record.layers)
    ? withNormalizedStackOrder(record.layers.map((layer, layerIndex) => normalizeLayer(layer, layerIndex)))
    : withNormalizedStackOrder(structuredClone(fallback.layers))

  return {
    id,
    templateId: typeof record.templateId === 'string' ? record.templateId : 'imported',
    name: typeof record.name === 'string' && record.name ? record.name : `Imported Device ${index + 1}`,
    description: typeof record.description === 'string' ? record.description : 'Imported project device',
    carrierType: normalizeCarrierType(record.carrierType),
    simulationConfig: normalizeSimulationConfig(
      isRecord(record.simulationConfig) ? record.simulationConfig : undefined,
      layers,
    ),
    tags: Array.isArray(record.tags) ? record.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    layers,
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : now,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : now,
  }
}

function normalizeLayer(input: unknown, index: number): DeviceLayer {
  const record = isRecord(input) ? input : {}
  const role = normalizeDeviceLayerRole(record.role)

  return {
    id: typeof record.id === 'string' && record.id ? record.id : `imported-layer-${index + 1}`,
    name: typeof record.name === 'string' && record.name ? record.name : `Imported Layer ${index + 1}`,
    materialId: typeof record.materialId === 'string' && record.materialId ? record.materialId : seedProject.materials[0].id,
    role,
    electricalRole: normalizeElectricalRole(record.electricalRole, role),
    stackOrder: typeof record.stackOrder === 'number'
      ? record.stackOrder
      : inferStackOrder({ role, electricalRole: normalizeElectricalRole(record.electricalRole, role) } as DeviceLayer, index),
    geometry: isRecord(record.geometry)
      ? {
          length_um: toNumber(record.geometry.length_um),
          width_um: toNumber(record.geometry.width_um),
          thickness_nm: toNumber(record.geometry.thickness_nm),
          x_um: toNumber(record.geometry.x_um),
          y_um: toNumber(record.geometry.y_um),
          z_nm: typeof record.geometry.z_nm === 'number' ? record.geometry.z_nm : undefined,
        }
      : { length_um: 0, width_um: 0, thickness_nm: 0, x_um: 0, y_um: 0 },
    voltageMode: record.voltageMode === 'grounded' || record.voltageMode === 'biased' || record.voltageMode === 'floating' || record.voltageMode === 'none'
      ? record.voltageMode
      : 'none',
    voltageLabel: typeof record.voltageLabel === 'string' ? record.voltageLabel : undefined,
    voltageValue_V: typeof record.voltageValue_V === 'number' ? record.voltageValue_V : null,
    visible: typeof record.visible === 'boolean' ? record.visible : true,
    opacity: typeof record.opacity === 'number' ? record.opacity : 1,
    notes: typeof record.notes === 'string' ? record.notes : undefined,
  }
}

function normalizeMaterial(input: unknown): Material {
  const record = isRecord(input) ? input : {}
  const fallback = seedProject.materials[0]
  return {
    ...fallback,
    ...(record as Partial<Material>),
    id: typeof record.id === 'string' && record.id ? record.id : fallback.id,
    name: typeof record.name === 'string' && record.name ? record.name : fallback.name,
    displayName: typeof record.displayName === 'string' && record.displayName ? record.displayName : fallback.displayName,
    carrierType: normalizeCarrierType(record.carrierType),
    bandGap_eV: normalizeMaterialParameter(record.bandGap_eV, 'bandGap_eV'),
    electronAffinity_eV: normalizeMaterialParameter(record.electronAffinity_eV, 'electronAffinity_eV'),
    workFunction_eV: normalizeMaterialParameter(record.workFunction_eV, 'workFunction_eV'),
    dielectricConstant: normalizeMaterialParameter(record.dielectricConstant, 'dielectricConstant'),
    mobility_cm2Vs: normalizeMaterialParameter(record.mobility_cm2Vs, 'mobility_cm2Vs'),
    resistivity_ohm_m: normalizeMaterialParameter(record.resistivity_ohm_m, 'resistivity_ohm_m'),
    latticeConstant_A: normalizeMaterialParameter(record.latticeConstant_A, 'latticeConstant_A'),
    defaultThickness_nm: normalizeMaterialParameter(record.defaultThickness_nm, 'defaultThickness_nm'),
  }
}

function normalizeReferences(value: unknown): LiteratureSource[] {
  const source = Array.isArray(value) && value.length ? value : seedProject.references
  return source.map((entry, index) => {
    const record = isRecord(entry) ? entry : {}
    return {
      id: typeof record.id === 'string' && record.id ? record.id : `ref-${index + 1}`,
      title: typeof record.title === 'string' ? record.title : 'Untitled reference',
      authors: typeof record.authors === 'string' ? record.authors : '',
      year: typeof record.year === 'number' ? record.year : new Date().getFullYear(),
      journal: typeof record.journal === 'string' ? record.journal : undefined,
      doi: typeof record.doi === 'string' ? record.doi : undefined,
      url: typeof record.url === 'string' ? record.url : undefined,
      material: typeof record.material === 'string' ? record.material : undefined,
      parameterExtracted: typeof record.parameterExtracted === 'string' ? record.parameterExtracted : undefined,
      reliabilityScore: typeof record.reliabilityScore === 'number' ? record.reliabilityScore : 5,
      status: record.status === 'candidate' || record.status === 'reviewed' || record.status === 'accepted' || record.status === 'rejected'
        ? record.status
        : 'candidate',
      notes: typeof record.notes === 'string' ? record.notes : '',
    }
  })
}

function normalizeElectricalRole(value: unknown, role: DeviceLayerRole): ElectricalRole {
  if (
    value === 'channel'
    || value === 'source'
    || value === 'drain'
    || value === 'gate'
    || value === 'gate_dielectric'
    || value === 'buffer'
    || value === 'substrate'
    || value === 'passivation'
    || value === 'contact'
    || value === 'unknown'
  ) {
    return value
  }

  const roleMap: Partial<Record<DeviceLayerRole, ElectricalRole>> = {
    semiconductor: 'channel',
    source: 'source',
    drain: 'drain',
    gate: 'gate',
    dielectric: 'gate_dielectric',
    oxide: 'buffer',
    substrate: 'substrate',
    bulk: 'substrate',
    passivation: 'passivation',
    contact: 'contact',
  }

  return roleMap[role] ?? 'unknown'
}

function normalizeDeviceLayerRole(value: unknown): DeviceLayerRole {
  if (
    value === 'source'
    || value === 'drain'
    || value === 'gate'
    || value === 'semiconductor'
    || value === 'dielectric'
    || value === 'oxide'
    || value === 'substrate'
    || value === 'bulk'
    || value === 'passivation'
    || value === 'contact'
    || value === 'custom'
  ) {
    return value
  }

  return 'custom'
}

function normalizeCarrierType(value: unknown): CarrierType {
  return value === 'n' || value === 'p' || value === 'ambipolar' || value === 'unknown'
    ? value
    : 'unknown'
}

function toNumber(value: unknown) {
  return typeof value === 'number' ? value : 0
}

function normalizeOptionalArray<T>(value: unknown, fallback: T[]) {
  return Array.isArray(value) && value.length ? structuredClone(value as T[]) : structuredClone(fallback)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
