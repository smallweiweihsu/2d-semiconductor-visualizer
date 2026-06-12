import { seedProject } from '../data/seedProject'
import { assignStackOrder, sortLayersForList, withNormalizedStackOrder } from '../visualization/viewportGeometry'
import type { DeviceLayer, DeviceStructure, SimulationConfig } from '../types/semiviz'

export type LayerPatch = Partial<Omit<DeviceLayer, 'geometry'>> & {
  geometry?: Partial<DeviceLayer['geometry']>
}

export function addLayer(device: DeviceStructure, layer?: Partial<DeviceLayer>) {
  const nextLayer = createLayer(layer)
  return {
    device: touchDevice({
      ...device,
      layers: withNormalizedStackOrder([...device.layers, nextLayer]),
      simulationConfig: normalizeSimulationConfig(device.simulationConfig, [...device.layers, nextLayer]),
    }),
    layer: nextLayer,
  }
}

export function updateLayer(device: DeviceStructure, layerId: string, patch: LayerPatch) {
  const layers = device.layers.map((layer) =>
    layer.id === layerId
      ? {
          ...layer,
          ...patch,
          geometry: patch.geometry ? { ...layer.geometry, ...patch.geometry } : layer.geometry,
        }
      : layer,
  )

  return touchDevice({ ...device, layers })
}

export function updateLayerGeometry(
  device: DeviceStructure,
  layerId: string,
  geometry: Partial<DeviceLayer['geometry']>,
) {
  return updateLayer(device, layerId, { geometry })
}

export function deleteLayer(device: DeviceStructure, layerId: string) {
  const layers = device.layers.filter((layer) => layer.id !== layerId)
  return touchDevice({
    ...device,
    layers: withNormalizedStackOrder(layers),
    simulationConfig: normalizeSimulationConfig(device.simulationConfig, layers),
  })
}

export function duplicateLayer(device: DeviceStructure, layerId: string) {
  const index = device.layers.findIndex((layer) => layer.id === layerId)

  if (index < 0) {
    return { device, layer: undefined }
  }

  const copy = createLayer({
    ...device.layers[index],
    id: undefined,
    name: `${device.layers[index].name} copy`,
  })
  const layers = withNormalizedStackOrder([...device.layers.slice(0, index + 1), copy, ...device.layers.slice(index + 1)])

  return {
    device: touchDevice({
      ...device,
      layers,
      simulationConfig: normalizeSimulationConfig(device.simulationConfig, layers),
    }),
    layer: copy,
  }
}

export function reorderLayer(device: DeviceStructure, layerId: string, direction: 'up' | 'down') {
  const visibleList = sortLayersForList(device.layers)
  const index = visibleList.findIndex((layer) => layer.id === layerId)
  const targetIndex = direction === 'up' ? index - 1 : index + 1

  if (index < 0 || targetIndex < 0 || targetIndex >= visibleList.length) {
    return device
  }

  const layers = [...visibleList]
  const [layer] = layers.splice(index, 1)
  layers.splice(targetIndex, 0, layer)

  return touchDevice({ ...device, layers: assignStackOrder([...layers].reverse()) })
}

export function updateSimulationConfig(
  device: DeviceStructure,
  config: Partial<SimulationConfig>,
) {
  return touchDevice({
    ...device,
    simulationConfig: normalizeSimulationConfig({ ...device.simulationConfig, ...config }, device.layers),
  })
}

export function normalizeSimulationConfig(
  config: Partial<SimulationConfig> | undefined,
  layers: DeviceLayer[],
): SimulationConfig {
  const layerIds = new Set(layers.map((layer) => layer.id))
  const next: SimulationConfig = {}

  if (config?.channelLayerId && layerIds.has(config.channelLayerId)) next.channelLayerId = config.channelLayerId
  if (config?.gateDielectricLayerId && layerIds.has(config.gateDielectricLayerId)) next.gateDielectricLayerId = config.gateDielectricLayerId
  if (config?.sourceLayerId && layerIds.has(config.sourceLayerId)) next.sourceLayerId = config.sourceLayerId
  if (config?.drainLayerId && layerIds.has(config.drainLayerId)) next.drainLayerId = config.drainLayerId
  if (config?.gateLayerId && layerIds.has(config.gateLayerId)) next.gateLayerId = config.gateLayerId

  return next
}

function createLayer(layer?: Partial<DeviceLayer>): DeviceLayer {
  const fallback = seedProject.devices[0].layers[2]
  const timestamp = Date.now()
  return {
    ...fallback,
    ...layer,
    id: layer?.id ?? `layer-${timestamp}`,
    name: layer?.name ?? 'New Layer',
    materialId: layer?.materialId ?? fallback.materialId,
    role: layer?.role ?? 'custom',
    electricalRole: layer?.electricalRole ?? 'unknown',
    stackOrder: layer?.stackOrder,
    geometry: {
      length_um: layer?.geometry?.length_um ?? fallback.geometry.length_um,
      width_um: layer?.geometry?.width_um ?? fallback.geometry.width_um,
      thickness_nm: layer?.geometry?.thickness_nm ?? fallback.geometry.thickness_nm,
      x_um: layer?.geometry?.x_um ?? 0,
      y_um: layer?.geometry?.y_um ?? 0,
      z_nm: layer?.geometry?.z_nm ?? 0,
    },
    voltageMode: layer?.voltageMode ?? 'none',
    voltageLabel: layer?.voltageLabel ?? '',
    voltageValue_V: layer?.voltageValue_V ?? null,
    visible: layer?.visible ?? true,
    opacity: layer?.opacity ?? 1,
    notes: layer?.notes ?? '',
  }
}

function touchDevice(device: DeviceStructure): DeviceStructure {
  return {
    ...device,
    updatedAt: new Date().toISOString().slice(0, 10),
  }
}
