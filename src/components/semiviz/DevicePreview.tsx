import type { DeviceLayer } from '../../types/semiviz'

export function DevicePreview({ layers }: { layers: DeviceLayer[] }) {
  return (
    <div className="manus-device-preview" aria-label="device preview">
      <span>{layers.length} layers</span>
    </div>
  )
}
