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

const SEED_PARAM_KEYS = ['bandGap_eV', 'electronAffinity_eV', 'workFunction_eV', 'dielectricConstant', 'mobility_cm2Vs', 'resistivity_ohm_m', 'latticeConstant_A', 'defaultThickness_nm'] as const

export function ensureSeedMaterials(project: SemivizProject): SemivizProject {
  const seedById = new Map(seedProject.materials.map((m) => [m.id, m]))
  // 1) 既有種子材料：把「未知」的參數用最新種子值補上（不覆蓋使用者已設定的值）
  const mergedMaterials = project.materials.map((mat) => {
    const seed = seedById.get(mat.id)
    if (!seed) return mat
    const next = { ...mat }
    let changed = false
    for (const k of SEED_PARAM_KEYS) {
      const cur = next[k]
      const sv = seed[k]
      if (cur && cur.confidence === 'unknown' && sv && sv.confidence !== 'unknown') {
        next[k] = sv
        changed = true
      }
    }
    return changed ? next : mat
  })
  // 2) 補上缺少的種子材料
  const haveM = new Set(mergedMaterials.map((m) => m.id))
  const missingM = seedProject.materials.filter((m) => !haveM.has(m.id))
  const materials = missingM.length ? [...mergedMaterials, ...missingM] : mergedMaterials
  const withMaterials = { ...project, materials }
  // 3) 既有種子/library 文獻：補填缺少的 electrode / notes / material（不覆蓋使用者已填值）
  const seedRefById = new Map(seedProject.references.map((r) => [r.id, r]))
  const mergedRefs = (withMaterials.references ?? []).map((r) => {
    const sr = seedRefById.get(r.id)
    if (!sr) return r
    const next = { ...r }
    let ch = false
    if (next.electrode === undefined && sr.electrode !== undefined) { next.electrode = sr.electrode; ch = true }
    if ((!next.notes || next.notes === '') && sr.notes) { next.notes = sr.notes; ch = true }
    if ((!next.material || next.material === '') && sr.material) { next.material = sr.material; ch = true }
    return ch ? next : r
  })
  // 4) 補上缺少的種子文獻
  const haveR = new Set(mergedRefs.map((r) => r.id))
  const missingR = seedProject.references.filter((r) => !haveR.has(r.id))
  return { ...withMaterials, references: missingR.length ? [...mergedRefs, ...missingR] : mergedRefs }
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
