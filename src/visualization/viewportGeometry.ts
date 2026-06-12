import type { DeviceLayer, DeviceStructure, ElectricalRole, Material } from '../types/semiviz'

export interface NormalizedViewportLayer {
  id: string
  name: string
  color: string
  displayOrder: number
  visualThickness: number
  visualY: number
  visualWidth: number
  visualOffsetX: number
  role: DeviceLayer['role']
  electricalRole: ElectricalRole
  isSelected: boolean
}

const roleOrder: Record<ElectricalRole, number> = {
  substrate: 0,
  buffer: 10,
  channel: 20,
  source: 30,
  drain: 30,
  contact: 30,
  gate_dielectric: 40,
  gate: 50,
  passivation: 60,
  unknown: 25,
}

export function normalizeViewportLayers(
  layers: DeviceLayer[],
  materials: Material[] = [],
  selectedId = '',
  exploded = false,
): NormalizedViewportLayer[] {
  const sorted = sortLayersForStack(layers)
  const gap = exploded ? 18 : 6
  let cursor = 18

  return sorted.map((layer) => {
    const visualThickness = getVisualThickness(layer)
    const material = materials.find((entry) => entry.id === layer.materialId)
    const normalized: NormalizedViewportLayer = {
      id: layer.id,
      name: layer.name,
      color: material?.color ?? '#22d3ee',
      displayOrder: getDisplayOrder(layer),
      visualThickness,
      visualY: cursor,
      visualWidth: getVisualWidth(layer),
      visualOffsetX: getVisualOffsetX(layer),
      role: layer.role,
      electricalRole: layer.electricalRole,
      isSelected: layer.id === selectedId,
    }
    cursor += visualThickness + gap
    return normalized
  })
}

export function sortLayersForStack(layers: DeviceLayer[]) {
  return [...layers].sort((a, b) => getDisplayOrder(a) - getDisplayOrder(b))
}

export function sortLayersForList(layers: DeviceLayer[]) {
  return [...sortLayersForStack(layers)].reverse()
}

export function inferStackOrder(layer: DeviceLayer, index = 0) {
  if (typeof layer.stackOrder === 'number') return layer.stackOrder
  return roleOrder[layer.electricalRole] + index * 0.01
}

export function withNormalizedStackOrder(layers: DeviceLayer[]) {
  return assignStackOrder(sortLayersForStack(layers))
}

export function assignStackOrder(layers: DeviceLayer[]) {
  return layers.map((layer, index) => ({ ...layer, stackOrder: index * 10 }))
}

export function sanitizeLayerGeometry(layer: DeviceLayer): DeviceLayer['geometry'] {
  const isBase = layer.electricalRole === 'substrate' || layer.role === 'bulk' || layer.role === 'substrate'
  return {
    length_um: finiteOr(layer.geometry.length_um, 1),
    width_um: finiteOr(layer.geometry.width_um, 1),
    thickness_nm: finiteOr(layer.geometry.thickness_nm, isBase ? 100 : 1),
    x_um: finiteOr(layer.geometry.x_um, 0),
    y_um: finiteOr(layer.geometry.y_um, 0),
    z_nm: isBase ? 0 : finiteOr(layer.geometry.z_nm, 0),
  }
}

export function normalizeLayerGeometry(layer: DeviceLayer, order: number): DeviceLayer['geometry'] {
  return {
    ...sanitizeLayerGeometry(layer),
    z_nm: getRelativeZ(layer, order),
  }
}

export function normalizeDeviceZPositions(device: DeviceStructure): DeviceStructure {
  const sorted = sortLayersForStack(device.layers)
  const zMap = new Map(sorted.map((layer, index) => [layer.id, getRelativeZ(layer, index)]))
  return {
    ...device,
    layers: device.layers.map((layer) => ({
      ...layer,
      geometry: {
        ...sanitizeLayerGeometry(layer),
        z_nm: zMap.get(layer.id) ?? 0,
      },
    })),
  }
}

export function getGeometryWarning(layer: DeviceLayer) {
  const isBase = layer.electricalRole === 'substrate' || layer.role === 'bulk' || layer.role === 'substrate'
  if (!isBase && (layer.geometry.z_nm ?? 0) > 10000) {
    return 'z_nm seems absolute; consider using relative stack order instead.'
  }
  return ''
}

function getDisplayOrder(layer: DeviceLayer) {
  return inferStackOrder(layer)
}

function getVisualThickness(layer: DeviceLayer) {
  if (layer.electricalRole === 'substrate' || layer.role === 'bulk' || layer.role === 'substrate') return 22
  if (layer.electricalRole === 'channel') return 10
  if (layer.electricalRole === 'gate_dielectric' || layer.electricalRole === 'buffer') return 14
  return 12
}

function getVisualWidth(layer: DeviceLayer) {
  const length = finiteOr(layer.geometry.length_um, 1)
  const clamped = Math.max(0.35, Math.min(1, length / 10))
  if (layer.electricalRole === 'substrate') return 0.96
  return clamped
}

function getVisualOffsetX(layer: DeviceLayer) {
  return Math.max(-0.18, Math.min(0.18, finiteOr(layer.geometry.x_um, 0) / 20))
}

function getRelativeZ(layer: DeviceLayer, order: number) {
  if (layer.electricalRole === 'substrate' || layer.role === 'bulk' || layer.role === 'substrate') return 0
  const explicit = {
    substrate: 0,
    buffer: 10,
    channel: 20,
    source: 30,
    drain: 30,
    contact: 30,
    gate_dielectric: 40,
    gate: 50,
    passivation: 60,
    unknown: 20 + order * 10,
  } satisfies Record<ElectricalRole, number>
  return explicit[layer.electricalRole]
}

function finiteOr(value: number | undefined, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}
