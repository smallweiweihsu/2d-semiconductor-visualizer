import { describe, expect, it } from 'vitest'
import { seedProject } from './src/data/seedProject'
import { reorderLayer } from './src/store/layerOperations'
import {
  getGeometryWarning,
  normalizeDeviceZPositions,
  normalizeViewportLayers,
  sortLayersForStack,
  withNormalizedStackOrder,
} from './src/visualization/viewportGeometry'

describe('Device Builder viewport geometry', () => {
  it('substrate 500000 nm does not explode normalized viewport height', () => {
    const normalized = normalizeViewportLayers(seedProject.devices[0].layers, seedProject.materials)

    expect(Math.max(...normalized.map((layer) => layer.visualThickness))).toBeLessThan(30)
    expect(Math.max(...normalized.map((layer) => layer.visualY))).toBeLessThan(220)
  })

  it('WSe2 z_nm = 500010 shows absolute z warning', () => {
    const layer = seedProject.devices[0].layers.find((entry) => entry.id === 'wse2-channel')!

    expect(getGeometryWarning(layer)).toBe('z_nm seems absolute; consider using relative stack order instead.')
  })

  it('normalize z positions creates reasonable relative z values', () => {
    const normalized = normalizeDeviceZPositions(seedProject.devices[0])
    const channel = normalized.layers.find((layer) => layer.id === 'wse2-channel')!
    const gate = normalized.layers.find((layer) => layer.id === 'top-gate')!

    expect(channel.geometry.z_nm).toBe(20)
    expect(gate.geometry.z_nm).toBe(50)
  })

  it('stackOrder missing is filled', () => {
    const layers = withNormalizedStackOrder(seedProject.devices[0].layers.map((layer) => ({ ...layer, stackOrder: undefined })))

    expect(layers.every((layer) => typeof layer.stackOrder === 'number')).toBe(true)
  })

  it('reorderLayer updates stackOrder', () => {
    const moved = reorderLayer(seedProject.devices[0], 'top-gate', 'down')
    const gate = moved.layers.find((layer) => layer.id === 'top-gate')!
    const dielectric = moved.layers.find((layer) => layer.id === 'top-sb2o3')!

    expect(gate.stackOrder).toBeLessThan(dielectric.stackOrder!)
  })

  it('electricalRole sorting is substrate < buffer < channel < contact < gate_dielectric < gate', () => {
    const sorted = sortLayersForStack(seedProject.devices[0].layers)

    expect(sorted.map((layer) => layer.electricalRole)).toEqual([
      'substrate',
      'buffer',
      'channel',
      'drain',
      'gate_dielectric',
      'gate',
    ])
  })

  it('normalized geometry does not use raw index top offset', () => {
    const normalized = normalizeViewportLayers(seedProject.devices[0].layers, seedProject.materials)

    expect(normalized[0]).toHaveProperty('visualY')
    expect(normalized[0]).not.toHaveProperty('layerIndex')
  })
})
