import { normalizeViewportLayers } from '../../visualization/viewportGeometry'
import { getMaterialAppearance } from '../../visualization/materialAppearance'
import type { DeviceLayer, Material } from '../../types/semiviz'

export type DeviceViewportMode = '3D' | 'TOP' | 'SIDE' | 'EXPLODED'
export type OpacityMode = 'normal' | 'semi-transparent' | 'selected-only'

export interface DeviceMeshLayer {
  id: string
  name: string
  materialName: string
  color: string
  position: [number, number, number]
  size: [number, number, number]
  opacity: number
  appearance: ReturnType<typeof getMaterialAppearance>
  role: DeviceLayer['role']
  electricalRole: DeviceLayer['electricalRole']
  thickness_nm: number
  isSelected: boolean
  selectLayerId: string
  highlightColor: string
  labelVisible: boolean
  glow: number
}

const sceneWidth = 7.8
const sceneDepth = 3.6

export function createDeviceMeshLayers({
  layers,
  materials,
  selectedId,
  mode,
  opacityMode = 'normal',
}: {
  layers: DeviceLayer[]
  materials: Material[]
  selectedId: string
  mode: DeviceViewportMode
  opacityMode?: OpacityMode
}): DeviceMeshLayer[] {
  const normalized = normalizeViewportLayers(
    layers.filter((layer) => layer.visible),
    materials,
    selectedId,
    mode === 'EXPLODED',
  )

  if (!normalized.length) {
    return []
  }

  const minY = Math.min(...normalized.map((layer) => layer.visualY))
  const meshLayers = normalized.map((layer) => {
    const source = layers.find((entry) => entry.id === layer.id)
    const material = source ? materials.find((entry) => entry.id === source.materialId) : undefined
    const rolePlacement = getRolePlacement(source)
    const y = ((layer.visualY - minY) / 13) + (layer.visualThickness / 28) + rolePlacement.yLift
    const zOffset = rolePlacement.z
    const baseOpacity = source ? clamp(source.opacity, 0.08, 1) : 1
    const appearance = getMaterialAppearance(material, source)
    const size = getRoleSize(source, layer.visualWidth, layer.visualThickness)

    return {
      id: layer.id,
      name: layer.name,
      materialName: material?.displayName ?? source?.materialId ?? 'unknown material',
      color: layer.color,
      position: [
        rolePlacement.x + layer.visualOffsetX * sceneWidth * rolePlacement.offsetScale,
        y,
        zOffset,
      ] as [number, number, number],
      size,
      opacity: getLayerOpacity(Math.min(baseOpacity, appearance.opacity), layer.isSelected, opacityMode, source?.electricalRole),
      appearance,
      role: layer.role,
      electricalRole: layer.electricalRole,
      thickness_nm: source?.geometry.thickness_nm ?? 0,
      isSelected: layer.isSelected,
      selectLayerId: layer.id,
      highlightColor: layer.isSelected ? '#67e8f9' : '#0f172a',
      labelVisible: layer.isSelected || isImportantLabel(source),
      glow: layer.isSelected ? 1 : source?.electricalRole === 'channel' ? 0.45 : 0,
    }
  })

  const hasSourcePad = meshLayers.some((mesh) => mesh.electricalRole === 'source')
  const substrateSource = layers.find((layer) => layer.role === 'source' && layer.electricalRole === 'substrate' && layer.visible)
  const channel = meshLayers.find((mesh) => mesh.electricalRole === 'channel')
  const sourceMaterial = substrateSource ? materials.find((material) => material.id === substrateSource.materialId) : undefined

  if (!hasSourcePad && substrateSource && channel) {
    const appearance = getMaterialAppearance(sourceMaterial, { ...substrateSource, electricalRole: 'source' })
    meshLayers.push({
      id: `${substrateSource.id}-visual-source-pad`,
      name: 'Source contact',
      materialName: sourceMaterial?.displayName ?? substrateSource.materialId,
      color: appearance.color,
      position: [-2.15, channel.position[1] + 0.13, 0],
      size: [sceneWidth * 0.22, 0.22, sceneDepth * 0.48],
      opacity: getLayerOpacity(Math.min(substrateSource.opacity, appearance.opacity), selectedId === substrateSource.id, opacityMode, 'source'),
      appearance,
      role: 'source',
      electricalRole: 'source',
      thickness_nm: substrateSource.geometry.thickness_nm,
      isSelected: selectedId === substrateSource.id,
      selectLayerId: substrateSource.id,
      highlightColor: selectedId === substrateSource.id ? '#67e8f9' : '#0f172a',
      labelVisible: true,
      glow: selectedId === substrateSource.id ? 1 : 0,
    })
  }

  return meshLayers
}

export function getCameraPreset(mode: DeviceViewportMode, radius: number): [number, number, number] {
  if (mode === 'TOP') return [0, Math.max(5, radius * 1.28), 0.01]
  if (mode === 'SIDE') return [Math.max(5, radius * 1.15), Math.max(1.3, radius * 0.16), 0.01]
  return [Math.max(4, radius * 0.82), Math.max(2.7, radius * 0.52), Math.max(4, radius * 0.9)]
}

export function getSceneBounds(meshLayers: DeviceMeshLayer[]) {
  const maxX = Math.max(1, ...meshLayers.map((layer) => Math.abs(layer.position[0]) + layer.size[0] / 2))
  const maxY = Math.max(1, ...meshLayers.map((layer) => layer.position[1] + layer.size[1] / 2))
  const maxZ = Math.max(1, ...meshLayers.map((layer) => Math.abs(layer.position[2]) + layer.size[2] / 2))
  const radius = Math.max(5.5, maxX * 1.35, maxY * 2.2, maxZ * 1.8)

  return {
    center: [0, maxY / 2, 0] as [number, number, number],
    radius,
  }
}

export function isWebGLAvailable() {
  if (typeof document === 'undefined') return false

  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function getLayerOpacity(baseOpacity: number, selected: boolean, opacityMode: OpacityMode, role?: DeviceLayer['electricalRole']) {
  if (opacityMode === 'semi-transparent') {
    if (role === 'gate_dielectric' || role === 'buffer' || role === 'passivation') return Math.min(baseOpacity, 0.32)
    return selected ? 0.95 : Math.max(0.38, Math.min(baseOpacity, 0.72))
  }
  if (opacityMode === 'selected-only') return selected ? 1 : 0.18
  return baseOpacity
}

function getRolePlacement(layer?: DeviceLayer) {
  const role = layer?.electricalRole
  if (role === 'source') return { x: -2.15, z: 0, yLift: 0.05, offsetScale: 0.25 }
  if (role === 'drain') return { x: 2.15, z: 0, yLift: 0.05, offsetScale: 0.25 }
  if (role === 'contact') return { x: layer?.geometry.x_um && layer.geometry.x_um < 0 ? -2.15 : 2.15, z: 0, yLift: 0.05, offsetScale: 0.25 }
  if (role === 'gate') return { x: 0, z: 0, yLift: 0.08, offsetScale: 0.2 }
  return { x: 0, z: clamp((layer?.geometry.y_um ?? 0) / 7, -0.8, 0.8), yLift: 0, offsetScale: 1 }
}

function getRoleSize(layer: DeviceLayer | undefined, visualWidth: number, visualThickness: number): [number, number, number] {
  const role = layer?.electricalRole
  if (role === 'substrate') return [sceneWidth * 1.02, 0.42, sceneDepth * 1.25]
  if (role === 'buffer') return [sceneWidth * 0.52, 0.13, sceneDepth * 0.58]
  if (role === 'channel') return [sceneWidth * 0.66, 0.12, sceneDepth * 0.28]
  if (role === 'source' || role === 'drain' || role === 'contact') return [sceneWidth * 0.22, 0.22, sceneDepth * 0.48]
  if (role === 'gate_dielectric') return [sceneWidth * 0.72, 0.18, sceneDepth * 0.5]
  if (role === 'gate') return [sceneWidth * 0.44, 0.2, sceneDepth * 0.4]
  if (role === 'passivation') return [sceneWidth * 0.82, 0.16, sceneDepth * 0.7]
  return [Math.max(0.45, visualWidth * sceneWidth), Math.max(0.1, visualThickness / 11), sceneDepth * 0.45]
}

export function isImportantLabel(layer?: DeviceLayer) {
  return layer?.electricalRole === 'channel'
    || layer?.electricalRole === 'source'
    || layer?.electricalRole === 'drain'
    || layer?.electricalRole === 'gate_dielectric'
    || layer?.electricalRole === 'gate'
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.max(min, Math.min(max, value))
}
