import type { DeviceLayer } from '../../types/device'
import type { Material } from '../../types/material'

export type CameraViewPreset = 'three_d' | 'top' | 'side' | 'front'

export interface RenderableLayer3D {
  layer: DeviceLayer
  material: Material
  position: [number, number, number]
  size: [number, number, number]
  visualThickness: number
}

export interface SkippedLayer3D {
  layer: DeviceLayer
  reason: 'missing_material' | 'invalid_dimensions'
}

export interface DeviceSceneGeometry {
  renderLayers: RenderableLayer3D[]
  skippedLayers: SkippedLayer3D[]
  center: [number, number, number]
  radius: number
  totalVisualHeight: number
}
