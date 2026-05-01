import { materials } from '../../data/materials'
import type { DeviceLayer } from '../../types/device'
import type { DeviceSceneGeometry, RenderableLayer3D, SkippedLayer3D } from './viewerTypes'

const HORIZONTAL_SCALE = 1
const MIN_VISUAL_THICKNESS = 0.05
const MAX_VISUAL_THICKNESS = 1.2

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function getVisualThickness(thickness_nm: number) {
  if (!Number.isFinite(thickness_nm) || thickness_nm <= 0) {
    return 0
  }

  // Visual-only scaling: real nm-to-um proportions would make 2D layers invisible
  // and bulk layers overwhelming, so thickness is compressed logarithmically.
  return clamp(
    Math.log10(thickness_nm + 1) * 0.12,
    MIN_VISUAL_THICKNESS,
    MAX_VISUAL_THICKNESS,
  )
}

export function getOpacity(opacity: number) {
  return clamp(Number.isFinite(opacity) ? opacity : 1, 0, 1)
}

export function createDeviceSceneGeometry(
  layers: DeviceLayer[],
  exploded: boolean,
): DeviceSceneGeometry {
  const renderLayers: RenderableLayer3D[] = []
  const skippedLayers: SkippedLayer3D[] = []
  let visualStackY = 0

  layers.forEach((layer, index) => {
    if (!layer.visible) {
      return
    }

    const material = materials.find((item) => item.id === layer.materialId)

    if (!material) {
      skippedLayers.push({ layer, reason: 'missing_material' })
      return
    }

    const hasValidDimensions =
      Number.isFinite(layer.geometry.length_um) &&
      Number.isFinite(layer.geometry.width_um) &&
      Number.isFinite(layer.geometry.thickness_nm) &&
      layer.geometry.length_um > 0 &&
      layer.geometry.width_um > 0 &&
      layer.geometry.thickness_nm > 0

    if (!hasValidDimensions) {
      skippedLayers.push({ layer, reason: 'invalid_dimensions' })
      return
    }

    const visualThickness = getVisualThickness(layer.geometry.thickness_nm)
    const explodedOffset = exploded ? index * 0.58 : 0
    const positionY = visualStackY + visualThickness / 2 + explodedOffset

    renderLayers.push({
      layer,
      material,
      position: [
        layer.geometry.x_um * HORIZONTAL_SCALE,
        positionY,
        layer.geometry.y_um * HORIZONTAL_SCALE,
      ],
      size: [
        layer.geometry.length_um * HORIZONTAL_SCALE,
        visualThickness,
        layer.geometry.width_um * HORIZONTAL_SCALE,
      ],
      visualThickness,
    })

    visualStackY += visualThickness
  })

  const totalVisualHeight = renderLayers.reduce(
    (maxHeight, renderLayer) =>
      Math.max(
        maxHeight,
        renderLayer.position[1] + renderLayer.visualThickness / 2,
      ),
    0,
  )
  const maxHorizontalSpan = renderLayers.reduce(
    (maxSpan, renderLayer) =>
      Math.max(maxSpan, renderLayer.size[0], renderLayer.size[2]),
    1,
  )

  return {
    renderLayers,
    skippedLayers,
    center: [0, totalVisualHeight / 2, 0],
    radius: Math.max(6, maxHorizontalSpan * 1.4, totalVisualHeight * 2.2),
    totalVisualHeight,
  }
}
