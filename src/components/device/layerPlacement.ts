import type {
  DeviceLayer,
  DeviceLayerRole,
  LayerHorizontalAlign,
  LayerPlacementOptions,
  LayerPlacementPreset,
  VoltageMode,
} from '../../types/device'

export const placementPresetLabels: Record<LayerPlacementPreset, string> = {
  manual: '手動設定',
  fit_selected_layer: '貼齊參考層',
  above_selected_layer: '加在參考層上方',
  below_selected_layer: '加在參考層下方',
  centered_on_selected_layer: '置中於參考層',
  left_contact: '左側接觸金屬',
  right_contact: '右側接觸金屬',
  source_contact: '源極接觸',
  drain_contact: '汲極接觸',
  top_gate: '上閘極',
  top_dielectric: '上方介電層',
  local_oxide: '局部氧化層',
  full_width_base: '全寬底層',
  custom: '自訂放置',
}

interface CreateDefaultLayerOptions {
  id: string
  materialId: string
  name: string
  role: DeviceLayerRole
  referenceLayer?: DeviceLayer | null
  placement: LayerPlacementOptions
  thickness_nm: number
  length_um: number
  width_um: number
  topZ_nm: number
}

export function createDefaultLayerFromPlacement({
  id,
  materialId,
  name,
  role,
  referenceLayer,
  placement,
  thickness_nm,
  length_um,
  width_um,
  topZ_nm,
}: CreateDefaultLayerOptions): DeviceLayer {
  const baseLayer: DeviceLayer = {
    id,
    name,
    materialId,
    role,
    geometry: {
      length_um,
      width_um,
      thickness_nm,
      x_um: referenceLayer?.geometry.x_um ?? 0,
      y_um: referenceLayer?.geometry.y_um ?? 0,
      z_nm: topZ_nm,
      rotation_deg: 0,
    },
    voltageMode: getDefaultVoltageMode(placement.preset),
    voltageLabel: getDefaultVoltageLabel(placement.preset),
    voltageValue_V: null,
    visible: true,
    opacity: getDefaultOpacity(role),
    notes_zh: '',
  }

  return referenceLayer
    ? applyPlacementPreset(baseLayer, referenceLayer, placement.preset)
    : baseLayer
}

export function applyPlacementPreset(
  layer: DeviceLayer,
  referenceLayer: DeviceLayer,
  preset: LayerPlacementPreset,
): DeviceLayer {
  let nextLayer = {
    ...layer,
    geometry: {
      ...layer.geometry,
      x_um: referenceLayer.geometry.x_um,
      y_um: referenceLayer.geometry.y_um,
    },
  }

  if (
    [
      'fit_selected_layer',
      'above_selected_layer',
      'below_selected_layer',
      'centered_on_selected_layer',
    ].includes(preset)
  ) {
    nextLayer = fitLayerToReference(nextLayer, referenceLayer)
  }

  if (preset === 'above_selected_layer') {
    nextLayer.geometry.z_nm =
      (referenceLayer.geometry.z_nm ?? 0) + referenceLayer.geometry.thickness_nm
  }

  if (preset === 'below_selected_layer') {
    nextLayer.geometry.z_nm = Math.max(
      0,
      (referenceLayer.geometry.z_nm ?? 0) - nextLayer.geometry.thickness_nm,
    )
  }

  if (preset === 'source_contact' || preset === 'left_contact') {
    nextLayer = makeContactLayer(nextLayer, referenceLayer, 'left')
    nextLayer.role = preset === 'source_contact' ? 'source' : nextLayer.role
    nextLayer.voltageMode = preset === 'source_contact' ? 'grounded' : nextLayer.voltageMode
    nextLayer.voltageLabel = preset === 'source_contact' ? 'Vs' : nextLayer.voltageLabel
  }

  if (preset === 'drain_contact' || preset === 'right_contact') {
    nextLayer = makeContactLayer(nextLayer, referenceLayer, 'right')
    nextLayer.role = preset === 'drain_contact' ? 'drain' : nextLayer.role
    nextLayer.voltageMode = preset === 'drain_contact' ? 'biased' : nextLayer.voltageMode
    nextLayer.voltageLabel = preset === 'drain_contact' ? 'Vd' : nextLayer.voltageLabel
  }

  if (preset === 'top_gate') {
    nextLayer = {
      ...nextLayer,
      role: 'gate',
      voltageMode: 'biased',
      voltageLabel: 'Vg',
      geometry: {
        ...nextLayer.geometry,
        length_um: roundGeometry(referenceLayer.geometry.length_um * 0.7),
        width_um: roundGeometry(referenceLayer.geometry.width_um * 1.05),
        x_um: referenceLayer.geometry.x_um,
        y_um: referenceLayer.geometry.y_um,
        z_nm:
          (referenceLayer.geometry.z_nm ?? 0) + referenceLayer.geometry.thickness_nm,
      },
    }
  }

  if (preset === 'top_dielectric') {
    nextLayer = {
      ...nextLayer,
      role: 'dielectric',
      opacity: Math.min(nextLayer.opacity, 0.7),
      geometry: {
        ...nextLayer.geometry,
        length_um: roundGeometry(referenceLayer.geometry.length_um * 1.15),
        width_um: roundGeometry(referenceLayer.geometry.width_um * 1.15),
        x_um: referenceLayer.geometry.x_um,
        y_um: referenceLayer.geometry.y_um,
        z_nm:
          (referenceLayer.geometry.z_nm ?? 0) + referenceLayer.geometry.thickness_nm,
      },
    }
  }

  if (preset === 'local_oxide') {
    nextLayer = {
      ...nextLayer,
      role: 'oxide',
      opacity: Math.min(nextLayer.opacity, 0.75),
      geometry: {
        ...nextLayer.geometry,
        length_um: roundGeometry(referenceLayer.geometry.length_um * 0.4),
        width_um: roundGeometry(referenceLayer.geometry.width_um * 0.8),
        x_um:
          getLayerHorizontalBounds(referenceLayer).left +
          referenceLayer.geometry.length_um * 0.25,
        y_um: referenceLayer.geometry.y_um,
        z_nm:
          (referenceLayer.geometry.z_nm ?? 0) + referenceLayer.geometry.thickness_nm,
      },
    }
  }

  if (preset === 'full_width_base') {
    nextLayer = {
      ...fitLayerToReference(nextLayer, referenceLayer),
      geometry: {
        ...nextLayer.geometry,
        thickness_nm: nextLayer.geometry.thickness_nm,
        z_nm: 0,
      },
    }
  }

  return nextLayer
}

export function getLayerHorizontalBounds(layer: DeviceLayer) {
  const halfLength = layer.geometry.length_um / 2

  return {
    left: layer.geometry.x_um - halfLength,
    right: layer.geometry.x_um + halfLength,
    center: layer.geometry.x_um,
  }
}

export function alignLayerToReference(
  layer: DeviceLayer,
  referenceLayer: DeviceLayer,
  align: LayerHorizontalAlign,
): DeviceLayer {
  const layerBounds = getLayerHorizontalBounds(layer)
  const referenceBounds = getLayerHorizontalBounds(referenceLayer)
  const nextLayer = { ...layer, geometry: { ...layer.geometry } }

  if (align === 'left') {
    nextLayer.geometry.x_um =
      referenceBounds.left + (layerBounds.right - layerBounds.left) / 2
  } else if (align === 'right') {
    nextLayer.geometry.x_um =
      referenceBounds.right - (layerBounds.right - layerBounds.left) / 2
  } else {
    nextLayer.geometry.x_um = referenceBounds.center
  }

  nextLayer.geometry.y_um = referenceLayer.geometry.y_um
  return nextLayer
}

export function fitLayerToReference(
  layer: DeviceLayer,
  referenceLayer: DeviceLayer,
): DeviceLayer {
  return {
    ...layer,
    geometry: {
      ...layer.geometry,
      length_um: referenceLayer.geometry.length_um,
      width_um: referenceLayer.geometry.width_um,
      x_um: referenceLayer.geometry.x_um,
      y_um: referenceLayer.geometry.y_um,
    },
  }
}

export function getInsertionIndex(
  layers: DeviceLayer[],
  referenceLayerId: string | null | undefined,
  preset: LayerPlacementPreset,
) {
  if (!referenceLayerId) {
    return layers.length
  }

  const referenceIndex = layers.findIndex((layer) => layer.id === referenceLayerId)

  if (referenceIndex < 0) {
    return layers.length
  }

  if (preset === 'below_selected_layer' || preset === 'full_width_base') {
    return referenceIndex
  }

  return referenceIndex + 1
}

function makeContactLayer(
  layer: DeviceLayer,
  referenceLayer: DeviceLayer,
  side: 'left' | 'right',
): DeviceLayer {
  const contactLength = roundGeometry(
    Math.max(0.35, referenceLayer.geometry.length_um * 0.24),
  )
  const referenceBounds = getLayerHorizontalBounds(referenceLayer)
  const overlap = Math.min(contactLength * 0.35, referenceLayer.geometry.length_um * 0.08)
  const x_um =
    side === 'left'
      ? referenceBounds.left + contactLength / 2 - overlap
      : referenceBounds.right - contactLength / 2 + overlap

  return {
    ...layer,
    geometry: {
      ...layer.geometry,
      length_um: contactLength,
      width_um: referenceLayer.geometry.width_um,
      x_um,
      y_um: referenceLayer.geometry.y_um,
      z_nm:
        (referenceLayer.geometry.z_nm ?? 0) + referenceLayer.geometry.thickness_nm,
    },
  }
}

function getDefaultVoltageMode(preset: LayerPlacementPreset): VoltageMode {
  if (preset === 'source_contact') {
    return 'grounded'
  }

  if (preset === 'drain_contact' || preset === 'top_gate') {
    return 'biased'
  }

  return 'none'
}

function getDefaultVoltageLabel(preset: LayerPlacementPreset) {
  if (preset === 'source_contact') {
    return 'Vs'
  }

  if (preset === 'drain_contact') {
    return 'Vd'
  }

  if (preset === 'top_gate') {
    return 'Vg'
  }

  return undefined
}

function getDefaultOpacity(role: DeviceLayerRole) {
  return ['dielectric', 'oxide', 'passivation'].includes(role) ? 0.72 : 1
}

function roundGeometry(value: number) {
  return Math.round(value * 1000) / 1000
}
