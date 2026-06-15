import { normalizeViewportLayers } from '../../visualization/viewportGeometry'
import { getMaterialAppearance } from '../../visualization/materialAppearance'
import type { DeviceLayer, Material } from '../../types/semiviz'

export type DeviceViewportMode = '3D' | 'TOP' | 'SIDE' | 'EXPLODED'
export type OpacityMode = 'normal' | 'semi-transparent' | 'selected-only'
export type DisplayMode = 'Render' | 'Inspect' | 'Debug'
export const defaultDisplayMode: DisplayMode = 'Render'

export interface DeviceMeshLayer {
  id: string
  name: string
  materialName: string
  color: string
  position: [number, number, number]
  size: [number, number, number]
  opacity: number
  appearance: ReturnType<typeof getMaterialAppearance>
  unlit?: boolean
  role: DeviceLayer['role']
  electricalRole: DeviceLayer['electricalRole']
  thickness_nm: number
  isSelected: boolean
  selectLayerId: string
  highlightColor: string
  labelVisible: boolean
  glow: number
}

const sceneWidth = 8.8
const sceneDepth = 4.2

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

  let runY = 0.15
  const meshLayers = normalized.map((layer) => {
    const source = layers.find((entry) => entry.id === layer.id)
    const material = source ? materials.find((entry) => entry.id === source.materialId) : undefined
    const h = clamp(layer.visualThickness / 26, 0.08, 0.55)
    const y = runY + h / 2
    runY += h // 無間隙：層與層直接貼合堆疊
    const baseOpacity = source ? clamp(source.opacity, 0.08, 1) : 1
    const appearance = getMaterialAppearance(material, source)
    const rsize = getRoleSize(source, layer.visualWidth, layer.visualThickness)
    const size: [number, number, number] = [rsize[0], h, rsize[2]]

    return {
      id: layer.id,
      name: layer.name,
      materialName: material?.displayName ?? source?.materialId ?? 'unknown material',
      color: layer.color,
      position: [0, y, 0] as [number, number, number],
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
      glow: layer.isSelected ? 1 : source?.electricalRole === 'channel' ? 0.72 : 0,
      unlit: false,
    }
  })

  return meshLayers
}

export function getCameraPreset(mode: DeviceViewportMode, radius: number): [number, number, number] {
  if (mode === 'TOP') return [0, Math.max(4.2, radius * 1.02), 0.01]
  if (mode === 'SIDE') return [Math.max(4.4, radius * 0.92), Math.max(1.1, radius * 0.14), 0.01]
  return [Math.max(3.5, radius * 0.62), Math.max(2.2, radius * 0.42), Math.max(3.6, radius * 0.68)]
}

export function getSceneBounds(meshLayers: DeviceMeshLayer[]) {
  const maxX = Math.max(1, ...meshLayers.map((layer) => Math.abs(layer.position[0]) + layer.size[0] / 2))
  const maxY = Math.max(1, ...meshLayers.map((layer) => layer.position[1] + layer.size[1] / 2))
  const maxZ = Math.max(1, ...meshLayers.map((layer) => Math.abs(layer.position[2]) + layer.size[2] / 2))
  const radius = Math.max(4.4, maxX * 0.98, maxY * 1.12, maxZ * 1.18)

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

function getRoleSize(layer: DeviceLayer | undefined, visualWidth: number, visualThickness: number): [number, number, number] {
  const role = layer?.electricalRole
  if (role === 'substrate') return [sceneWidth * 1.04, 0.4, sceneDepth * 1.18]
  if (role === 'buffer') return [sceneWidth * 0.52, 0.11, sceneDepth * 0.52]
  if (role === 'channel') return [sceneWidth * 0.72, 0.1, sceneDepth * 0.12]
  if (role === 'source' || role === 'drain' || role === 'contact') return [sceneWidth * 0.24, 0.2, sceneDepth * 0.5]
  if (role === 'gate_dielectric') return [sceneWidth * 0.74, 0.16, sceneDepth * 0.52]
  if (role === 'gate') return [sceneWidth * 0.52, 0.18, sceneDepth * 0.42]
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
