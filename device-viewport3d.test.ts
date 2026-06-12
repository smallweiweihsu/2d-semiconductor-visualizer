import { describe, expect, it } from 'vitest'
import { seedProject } from './src/data/seedProject'
import {
  createDeviceMeshLayers,
  defaultDisplayMode,
  getCameraPreset,
  getSceneBounds,
  isWebGLAvailable,
} from './src/components/semiviz/deviceViewport3DUtils'
import { getMaterialAppearance } from './src/visualization/materialAppearance'

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
    expect(substrate.size[1] / channel.size[1]).toBeLessThan(4.5)
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
    expect(selected.glow).toBeGreaterThan(0)
  })

  it('places source and drain on opposite sides of channel', () => {
    const meshes = createDeviceMeshLayers({
      layers: seedProject.devices[0].layers,
      materials: seedProject.materials,
      selectedId: '',
      mode: '3D',
    })
    const source = meshes.find((mesh) => mesh.electricalRole === 'source')!
    const drain = meshes.find((mesh) => mesh.electricalRole === 'drain')!
    const channel = meshes.find((mesh) => mesh.electricalRole === 'channel')!

    expect(source.position[0]).toBeLessThan(channel.position[0])
    expect(drain.position[0]).toBeGreaterThan(channel.position[0])
  })

  it('gate dielectric is above channel but below gate', () => {
    const meshes = createDeviceMeshLayers({
      layers: seedProject.devices[0].layers,
      materials: seedProject.materials,
      selectedId: '',
      mode: '3D',
    })

    expect(meshes.find((mesh) => mesh.electricalRole === 'gate_dielectric')!.position[1]).toBeGreaterThan(meshes.find((mesh) => mesh.electricalRole === 'channel')!.position[1])
    expect(meshes.find((mesh) => mesh.electricalRole === 'gate_dielectric')!.position[1]).toBeLessThan(meshes.find((mesh) => mesh.electricalRole === 'gate')!.position[1])
  })

  it('important labels include channel/source/drain/gate dielectric/gate but not buffer by default', () => {
    const meshes = createDeviceMeshLayers({
      layers: seedProject.devices[0].layers,
      materials: seedProject.materials,
      selectedId: '',
      mode: '3D',
    })

    expect(meshes.filter((mesh) => mesh.labelVisible).map((mesh) => mesh.electricalRole)).toEqual(expect.arrayContaining(['channel', 'source', 'drain', 'gate_dielectric', 'gate']))
    expect(meshes.find((mesh) => mesh.electricalRole === 'buffer')?.labelVisible).toBe(false)
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
    expect(getCameraPreset('SIDE', 10)[0]).toBeGreaterThan(8)
    expect(getCameraPreset('3D', 10)[2]).toBeGreaterThan(4)
  })

  it('Render mode is the default display mode', () => {
    expect(defaultDisplayMode).toBe('Render')
  })

  it('scene bounds keep the device large in the viewport', () => {
    const meshes = createDeviceMeshLayers({
      layers: seedProject.devices[0].layers,
      materials: seedProject.materials,
      selectedId: '',
      mode: '3D',
    })
    const bounds = getSceneBounds(meshes)
    const deviceWidth = Math.max(...meshes.map((mesh) => Math.abs(mesh.position[0]) + mesh.size[0] / 2)) * 2

    expect(deviceWidth / (bounds.radius * 2)).toBeGreaterThan(0.65)
  })

  it('fallback preview exists when WebGL disabled helper returns false', () => {
    expect(isWebGLAvailable()).toBe(false)
  })

  it('material appearance returns translucent oxide and metallic contact', () => {
    const sb2o3 = seedProject.materials.find((material) => material.id === 'sb2o3')!
    const pd = seedProject.materials.find((material) => material.id === 'pd')!

    expect(getMaterialAppearance(sb2o3).opacity).toBeLessThan(0.6)
    expect(getMaterialAppearance(pd).metalness).toBeGreaterThan(0.7)
  })
})
