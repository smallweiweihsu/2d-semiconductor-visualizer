import { normalizeViewportLayers } from '../../visualization/viewportGeometry'
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
  role: DeviceLayer['role']
  electricalRole: DeviceLayer['electricalRole']
  thickness_nm: number
  isSelected: boolean
  highlightColor: string
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
  return normalized.map((layer) => {
    const source = layers.find((entry) => entry.id === layer.id)
    const material = source ? materials.find((entry) => entry.id === source.materialId) : undefined
    const y = ((layer.visualY - minY) / 11) + (layer.visualThickness / 22)
    const zOffset = source ? clamp(source.geometry.y_um / 6, -1.2, 1.2) : 0
    const baseOpacity = source ? clamp(source.opacity, 0.08, 1) : 1

    return {
      id: layer.id,
      name: layer.name,
      materialName: material?.displayName ?? source?.materialId ?? 'unknown material',
      color: layer.color,
      position: [
        layer.visualOffsetX * sceneWidth,
        y,
        zOffset,
      ],
      size: [
        Math.max(0.45, layer.visualWidth * sceneWidth),
        Math.max(0.1, layer.visualThickness / 10),
        getDepth(source),
      ],
      opacity: getLayerOpacity(baseOpacity, layer.isSelected, opacityMode),
      role: layer.role,
      electricalRole: layer.electricalRole,
      thickness_nm: source?.geometry.thickness_nm ?? 0,
      isSelected: layer.isSelected,
      highlightColor: layer.isSelected ? '#67e8f9' : '#0f172a',
    }
  })
}

export function getCameraPreset(mode: DeviceViewportMode, radius: number): [number, number, number] {
  if (mode === 'TOP') return [0, Math.max(5, radius * 1.45), 0.01]
  if (mode === 'SIDE') return [Math.max(5, radius * 1.35), Math.max(1.5, radius * 0.18), 0.01]
  return [Math.max(4, radius * 0.9), Math.max(3, radius * 0.65), Math.max(4, radius * 0.95)]
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

function getLayerOpacity(baseOpacity: number, selected: boolean, opacityMode: OpacityMode) {
  if (opacityMode === 'semi-transparent') return selected ? 0.92 : Math.min(baseOpacity, 0.48)
  if (opacityMode === 'selected-only') return selected ? 1 : 0.18
  return baseOpacity
}

function getDepth(layer?: DeviceLayer) {
  if (!layer) return sceneDepth
  const normalizedWidth = clamp(layer.geometry.width_um / 5, 0.24, 1)
  return Math.max(0.35, normalizedWidth * sceneDepth)
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.max(min, Math.min(max, value))
}
