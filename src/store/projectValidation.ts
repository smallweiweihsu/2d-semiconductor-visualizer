import { seedProject } from '../data/seedProject'
import type {
  DeviceLayer,
  DeviceStructure,
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
    : seedProject.devices
  const materials = input.materials.length
    ? (input.materials as Material[])
    : seedProject.materials
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
      references: normalizeOptionalArray<LiteratureSource>(input.references, seedProject.references),
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

  return {
    id,
    templateId: typeof record.templateId === 'string' ? record.templateId : 'imported',
    name: typeof record.name === 'string' && record.name ? record.name : `Imported Device ${index + 1}`,
    description: typeof record.description === 'string' ? record.description : 'Imported project device',
    tags: Array.isArray(record.tags) ? record.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    layers: Array.isArray(record.layers) ? (record.layers as DeviceLayer[]) : [],
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : now,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : now,
    ...(record.layers === undefined && { layers: fallback.layers }),
  }
}

function normalizeOptionalArray<T>(value: unknown, fallback: T[]) {
  return Array.isArray(value) && value.length ? (value as T[]) : fallback
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
