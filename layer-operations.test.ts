import { describe, expect, it } from 'vitest'
import { seedProject } from './src/data/seedProject'
import {
  addLayer,
  deleteLayer,
  reorderLayer,
  updateLayerGeometry,
} from './src/store/layerOperations'
import { normalizeImportedProject } from './src/store/projectValidation'
import { extractDeviceParameters } from './src/simulation/mosfet'

describe('Device Builder layer operations', () => {
  it('updateLayerGeometry updates only the selected layer geometry', () => {
    const device = structuredClone(seedProject.devices[0])
    const updated = updateLayerGeometry(device, 'wse2-channel', { thickness_nm: 2.5 })

    expect(updated.layers.find((layer) => layer.id === 'wse2-channel')?.geometry.thickness_nm).toBe(2.5)
    expect(updated.layers.find((layer) => layer.id === 'top-sb2o3')?.geometry.thickness_nm).toBe(20)
  })

  it('addLayer appends a new editable layer', () => {
    const device = structuredClone(seedProject.devices[0])
    const result = addLayer(device, { name: 'Test Layer', electricalRole: 'gate_dielectric' })

    expect(result.device.layers).toHaveLength(device.layers.length + 1)
    expect(result.layer.name).toBe('Test Layer')
    expect(result.layer.electricalRole).toBe('gate_dielectric')
  })

  it('deleteLayer removes stale simulationConfig references', () => {
    const device = structuredClone(seedProject.devices[0])
    const updated = deleteLayer(device, 'top-sb2o3')

    expect(updated.layers.some((layer) => layer.id === 'top-sb2o3')).toBe(false)
    expect(updated.simulationConfig?.gateDielectricLayerId).toBeUndefined()
  })

  it('reorderLayer moves a layer up and down', () => {
    const device = structuredClone(seedProject.devices[0])
    const movedUp = reorderLayer(device, 'wse2-channel', 'up')
    const movedDown = reorderLayer(movedUp, 'wse2-channel', 'down')

    expect(movedUp.layers[1].id).toBe('wse2-channel')
    expect(movedDown.layers[2].id).toBe('wse2-channel')
  })

  it('normalizes simulationConfig and removes missing layer ids', () => {
    const result = normalizeImportedProject({
      activeDeviceId: 'imported',
      devices: [{
        id: 'imported',
        name: 'Imported',
        description: 'with stale config',
        simulationConfig: {
          channelLayerId: 'channel',
          gateDielectricLayerId: 'missing-layer',
        },
        layers: [{
          id: 'channel',
          name: 'Channel',
          materialId: 'wse2',
          role: 'semiconductor',
          geometry: { length_um: 1, width_um: 1, thickness_nm: 1, x_um: 0, y_um: 0 },
        }],
        tags: [],
        createdAt: '2026-06-12',
        updatedAt: '2026-06-12',
      }],
      materials: [],
    })

    expect(result.ok).toBe(true)
    expect(result.project?.devices[0].simulationConfig?.channelLayerId).toBe('channel')
    expect(result.project?.devices[0].simulationConfig?.gateDielectricLayerId).toBeUndefined()
    expect(result.project?.devices[0].layers[0].electricalRole).toBe('channel')
  })

  it('extractDeviceParameters uses simulationConfig before electricalRole', () => {
    const device = structuredClone(seedProject.devices[0])
    const configuredGate = {
      ...device.layers.find((layer) => layer.id === 'top-sb2o3')!,
      id: 'configured-hfo2',
      materialId: 'hfo2',
      name: 'Configured HfO2',
      electricalRole: 'buffer' as const,
      geometry: { ...device.layers[4].geometry, thickness_nm: 9 },
    }
    device.layers.push(configuredGate)
    device.simulationConfig = {
      ...device.simulationConfig,
      gateDielectricLayerId: configuredGate.id,
    }

    const extracted = extractDeviceParameters(device, seedProject.materials)

    expect(extracted.dielectricLayer?.id).toBe('configured-hfo2')
    expect(extracted.detection.gateDielectric).toBe('configured')
  })

  it('extractDeviceParameters falls back to electricalRole when simulationConfig is missing', () => {
    const device = structuredClone(seedProject.devices[0])
    device.simulationConfig = {}

    const extracted = extractDeviceParameters(device, seedProject.materials)

    expect(extracted.dielectricLayer?.id).toBe('top-sb2o3')
    expect(extracted.detection.gateDielectric).toBe('auto-detected')
  })
})
