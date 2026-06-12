import { describe, expect, it } from 'vitest'
import { seedProject } from './src/data/seedProject'
import {
  createDeviceMeshLayers,
  getCameraPreset,
  isWebGLAvailable,
} from './src/components/semiviz/deviceViewport3DUtils'

describe('interactive DeviceViewport3D helpers', () => {
  it('normalized layers can be converted to 3D mesh props', () => {
    const meshes = createDeviceMeshLayers({
      layers: seedProject.devices[0].layers,
      materials: seedProject.materials,
      selectedId: 'wse2-channel',
      mode: '3D',
    })

    expect(meshes.length).toBeGreaterThan(0)
    expect(meshes[0].position).toHaveLength(3)
    expect(meshes[0].size).toHaveLength(3)
  })

  it('substrate thickness does not dominate 3D scale', () => {
    const meshes = createDeviceMeshLayers({
      layers: seedProject.devices[0].layers,
      materials: seedProject.materials,
      selectedId: '',
      mode: '3D',
    })
    const substrate = meshes.find((mesh) => mesh.id === 'sb-bulk-source')!
    const channel = meshes.find((mesh) => mesh.id === 'wse2-channel')!

    expect(substrate.size[1]).toBeLessThan(3)
    expect(substrate.size[1] / channel.size[1]).toBeLessThan(4)
  })

  it('selected layer returns highlight props', () => {
    const meshes = createDeviceMeshLayers({
      layers: seedProject.devices[0].layers,
      materials: seedProject.materials,
      selectedId: 'wse2-channel',
      mode: '3D',
    })
    const selected = meshes.find((mesh) => mesh.id === 'wse2-channel')!

    expect(selected.isSelected).toBe(true)
    expect(selected.highlightColor).toBe('#67e8f9')
  })

  it('exploded mode increases layer spacing', () => {
    const normal = createDeviceMeshLayers({
      layers: seedProject.devices[0].layers,
      materials: seedProject.materials,
      selectedId: '',
      mode: '3D',
    })
    const exploded = createDeviceMeshLayers({
      layers: seedProject.devices[0].layers,
      materials: seedProject.materials,
      selectedId: '',
      mode: 'EXPLODED',
    })

    expect(exploded.at(-1)!.position[1]).toBeGreaterThan(normal.at(-1)!.position[1])
  })

  it('invisible layer is excluded from render list', () => {
    const layers = seedProject.devices[0].layers.map((layer) =>
      layer.id === 'wse2-channel' ? { ...layer, visible: false } : layer,
    )
    const meshes = createDeviceMeshLayers({
      layers,
      materials: seedProject.materials,
      selectedId: 'wse2-channel',
      mode: '3D',
    })

    expect(meshes.some((mesh) => mesh.id === 'wse2-channel')).toBe(false)
  })

  it('camera preset for TOP / SIDE / 3D returns expected position', () => {
    expect(getCameraPreset('TOP', 10)[1]).toBeGreaterThan(10)
    expect(getCameraPreset('SIDE', 10)[0]).toBeGreaterThan(10)
    expect(getCameraPreset('3D', 10)[2]).toBeGreaterThan(4)
  })

  it('fallback preview exists when WebGL disabled helper returns false', () => {
    expect(isWebGLAvailable()).toBe(false)
  })
})
