import { describe, expect, it } from 'vitest'
import { seedProject } from './src/data/seedProject'
import { extractDeviceParameters, resolveSimulationModel } from './src/simulation/mosfet'
import {
  currentProjectSchemaVersion,
  currentStorageKey,
  legacyStorageKeys,
  migrateProjectToCurrent,
  readProjectFromStorage,
  resetProjectStorage,
} from './src/store/projectMigration'

describe('project schema migration', () => {
  it('old project without schemaVersion migrates to v2', () => {
    const migrated = migrateProjectToCurrent(oldProjectFixture())

    expect(migrated.schemaVersion).toBe(currentProjectSchemaVersion)
    expect(migrated.devices[0].simulationConfig?.channelLayerId).toBe('wse2-channel')
  })

  it('WSe2 z_nm 500010 migrates to relative z', () => {
    const migrated = migrateProjectToCurrent(oldProjectFixture())
    const channel = migrated.devices[0].layers.find((layer) => layer.id === 'wse2-channel')!

    expect(channel.geometry.z_nm).toBe(20)
  })

  it('seedProject can resolve simulation without fallback', () => {
    const extracted = extractDeviceParameters(seedProject.devices[0], seedProject.materials)
    const resolved = resolveSimulationModel(extracted, options(false))

    expect(resolved.status).not.toBe('fallback_preview')
    expect(resolved.input).toBeDefined()
  })

  it('seedProject simulation status is ready_with_estimates', () => {
    const extracted = extractDeviceParameters(seedProject.devices[0], seedProject.materials)
    const resolved = resolveSimulationModel(extracted, options(false))

    expect(resolved.status).toBe('ready_with_estimates')
  })

  it('Reset project clears old localStorage keys', () => {
    const storage = createMemoryStorage()
    storage.setItem(currentStorageKey, '{"stale":true}')
    legacyStorageKeys.forEach((key) => storage.setItem(key, '{"legacy":true}'))

    const reset = resetProjectStorage(storage)

    expect(reset.schemaVersion).toBe(currentProjectSchemaVersion)
    expect(storage.getItem(currentStorageKey)).toContain(currentProjectSchemaVersion)
    legacyStorageKeys.forEach((key) => expect(storage.getItem(key)).toBeNull())
  })

  it('readProjectFromStorage migrates legacy storage and writes v2', () => {
    const storage = createMemoryStorage()
    storage.setItem('semiviz-project-v1', JSON.stringify(oldProjectFixture()))

    const project = readProjectFromStorage(storage)

    expect(project.schemaVersion).toBe(currentProjectSchemaVersion)
    expect(storage.getItem(currentStorageKey)).toContain(currentProjectSchemaVersion)
  })
})

function oldProjectFixture() {
  const oldProject = structuredClone(seedProject)
  delete (oldProject as Partial<typeof oldProject>).schemaVersion
  const channel = oldProject.devices[0].layers.find((layer) => layer.id === 'wse2-channel')!
  channel.geometry.z_nm = 500010
  oldProject.materials.find((material) => material.id === 'wse2')!.mobility_cm2Vs = {
    ...oldProject.materials.find((material) => material.id === 'wse2')!.mobility_cm2Vs,
    value: '1-250',
    valueType: 'range',
    range: { min: 1, max: 250 },
    selectedValue: null,
  }
  return oldProject
}

function options(useFallback: boolean) {
  return {
    useFallback,
    vd: 1,
    vgMin: -2,
    vgMax: 2,
    vth: 0.5,
    rc_ohm: 0,
    leakage_A: 1e-12,
  }
}

function createMemoryStorage(): Storage {
  const items = new Map<string, string>()
  return {
    get length() {
      return items.size
    },
    clear: () => items.clear(),
    getItem: (key: string) => items.get(key) ?? null,
    key: (index: number) => Array.from(items.keys())[index] ?? null,
    removeItem: (key: string) => items.delete(key),
    setItem: (key: string, value: string) => items.set(key, value),
  }
}
