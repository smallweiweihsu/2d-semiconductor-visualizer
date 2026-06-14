import { seedProject } from '../data/seedProject'
import { resolveMaterialParameter } from './materialParameterUtils'
import { normalizeStoredProject } from './projectValidation'
import { normalizeDeviceZPositions } from '../visualization/viewportGeometry'
import type { Material, SemivizProject } from '../types/semiviz'

export const currentProjectSchemaVersion = 'semiviz-project-v2'
export const currentStorageKey = 'semiviz-project-v2'
export const legacyStorageKeys = ['semiviz-project-v1']
export const projectStorageKeys = [currentStorageKey, ...legacyStorageKeys]

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function ensureSeedMaterials(project: SemivizProject): SemivizProject {
  const have = new Set(project.materials.map((m) => m.id))
  const missing = seedProject.materials.filter((m) => !have.has(m.id))
  if (!missing.length) return project
  return { ...project, materials: [...project.materials, ...missing] }
}

export function readProjectFromStorage(storage: StorageLike): SemivizProject {
  const currentRaw = storage.getItem(currentStorageKey)

  if (currentRaw) {
    try {
      const parsed = JSON.parse(currentRaw)
      const normalized = normalizeStoredProject(parsed)
      return normalized.schemaVersion === currentProjectSchemaVersion
        ? ensureSeedMaterials(normalized)
        : ensureSeedMaterials(migrateProjectToCurrent(parsed))
    } catch {
      return resetProjectStorage(storage)
    }
  }

  for (const key of legacyStorageKeys) {
    const raw = storage.getItem(key)
    if (!raw) continue

    try {
      const migrated = ensureSeedMaterials(migrateProjectToCurrent(JSON.parse(raw)))
      storage.setItem(currentStorageKey, JSON.stringify(migrated))
      return migrated
    } catch {
      continue
    }
  }

  return resetProjectStorage(storage)
}

export function resetProjectStorage(storage: StorageLike): SemivizProject {
  projectStorageKeys.forEach((key) => storage.removeItem(key))
  const fresh = structuredClone(seedProject)
  storage.setItem(currentStorageKey, JSON.stringify(fresh))
  return fresh
}

export function migrateProjectToCurrent(input: unknown): SemivizProject {
  const normalized = normalizeStoredProject(input)
  const isCurrent = normalized.schemaVersion === currentProjectSchemaVersion
  const needsZMigration = normalized.devices.some((device) =>
    device.layers.some((layer) => {
      const isBase = layer.electricalRole === 'substrate' || layer.role === 'substrate' || layer.role === 'bulk'
      return !isBase && (layer.geometry.z_nm ?? 0) > 10000
    }),
  )

  return {
    ...normalized,
    schemaVersion: currentProjectSchemaVersion,
    devices: normalized.devices.map((device) => (isCurrent && !needsZMigration ? device : normalizeDeviceZPositions(device))),
    materials: mergeSeedPrototypeParameters(normalized.materials),
  }
}

function mergeSeedPrototypeParameters(materials: Material[]) {
  return materials.map((material) => {
    const seedMaterial = seedProject.materials.find((entry) => entry.id === material.id)
    if (!seedMaterial) return material

    return {
      ...material,
      carrierType: material.carrierType === 'unknown' ? seedMaterial.carrierType : material.carrierType,
      mobility_cm2Vs: useSeedWhenMissing(material.mobility_cm2Vs, seedMaterial.mobility_cm2Vs),
      bandGap_eV: useSeedWhenMissing(material.bandGap_eV, seedMaterial.bandGap_eV),
      electronAffinity_eV: useSeedWhenMissing(material.electronAffinity_eV, seedMaterial.electronAffinity_eV),
      dielectricConstant: useSeedWhenMissing(material.dielectricConstant, seedMaterial.dielectricConstant),
      workFunction_eV: useSeedWhenMissing(material.workFunction_eV, seedMaterial.workFunction_eV),
    }
  })
}

function useSeedWhenMissing<T extends Material[keyof Material]>(current: T, seed: T): T {
  if (typeof current === 'object' && current && 'confidence' in current) {
    const resolved = resolveMaterialParameter(current)
    if (resolved.value === undefined) {
      return structuredClone(seed)
    }
  }
  return current
}
