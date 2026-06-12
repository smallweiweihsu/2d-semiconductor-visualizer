import { deviceLayerRoles, electricalRoles, voltageModes } from './deviceBuilderOptions'
import type { DeviceLayer, Material } from '../../types/semiviz'

export function LayerPropertyEditor({
  layer,
  materials,
  geometryWarning,
  normalizeMessage,
  onNormalizeZ,
  onChange,
}: {
  layer: DeviceLayer
  materials: Material[]
  geometryWarning?: string
  normalizeMessage?: string
  onNormalizeZ: () => void
  onChange: (patch: Partial<Omit<DeviceLayer, 'geometry'>> & { geometry?: Partial<DeviceLayer['geometry']> }) => void
}) {
  return (
    <div className="layer-property-form">
      <label>
        layer name
        <input value={layer.name} onChange={(event) => onChange({ name: event.target.value })} />
      </label>
      <label>
        materialId
        <select value={layer.materialId} onChange={(event) => onChange({ materialId: event.target.value })}>
          {materials.map((material) => <option value={material.id} key={material.id}>{material.displayName}</option>)}
        </select>
      </label>
      <label>
        role
        <select value={layer.role} onChange={(event) => onChange({ role: event.target.value as DeviceLayer['role'] })}>
          {deviceLayerRoles.map((role) => <option value={role} key={role}>{role}</option>)}
        </select>
      </label>
      <label>
        electricalRole
        <select value={layer.electricalRole} onChange={(event) => onChange({ electricalRole: event.target.value as DeviceLayer['electricalRole'] })}>
          {electricalRoles.map((role) => <option value={role} key={role}>{role}</option>)}
        </select>
      </label>
      <div className="form-grid-2">
        <NumberField label="length_um" value={layer.geometry.length_um} onChange={(value) => onChange({ geometry: { length_um: value } })} />
        <NumberField label="width_um" value={layer.geometry.width_um} onChange={(value) => onChange({ geometry: { width_um: value } })} />
        <NumberField label="thickness_nm" value={layer.geometry.thickness_nm} onChange={(value) => onChange({ geometry: { thickness_nm: value } })} />
        <NumberField label="x_um" value={layer.geometry.x_um} onChange={(value) => onChange({ geometry: { x_um: value } })} />
        <NumberField label="y_um" value={layer.geometry.y_um} onChange={(value) => onChange({ geometry: { y_um: value } })} />
        <NumberField label="relative z offset (nm)" value={layer.geometry.z_nm ?? 0} onChange={(value) => onChange({ geometry: { z_nm: value } })} />
      </div>
      {geometryWarning ? <div className="geometry-warning">{geometryWarning}</div> : null}
      {normalizeMessage ? <div className="geometry-success" role="status">{normalizeMessage}</div> : null}
      <button className={geometryWarning ? 'manus-button primary normalize-z-button' : 'manus-button ghost normalize-z-button'} type="button" onClick={onNormalizeZ}>Normalize z positions</button>
      <label>
        voltageMode
        <select value={layer.voltageMode} onChange={(event) => onChange({ voltageMode: event.target.value as DeviceLayer['voltageMode'] })}>
          {voltageModes.map((mode) => <option value={mode} key={mode}>{mode}</option>)}
        </select>
      </label>
      <div className="form-grid-2">
        <label>
          voltageLabel
          <input value={layer.voltageLabel ?? ''} onChange={(event) => onChange({ voltageLabel: event.target.value })} />
        </label>
        <NumberField label="voltageValue_V" value={layer.voltageValue_V ?? 0} onChange={(value) => onChange({ voltageValue_V: value })} />
      </div>
      <label className="toggle-field compact">
        <input type="checkbox" checked={layer.visible} onChange={(event) => onChange({ visible: event.target.checked })} />
        visible
      </label>
      <NumberField label="opacity" value={layer.opacity} min={0} max={1} step={0.05} onChange={(value) => onChange({ opacity: value })} />
      <label>
        notes
        <textarea value={layer.notes ?? ''} onChange={(event) => onChange({ notes: event.target.value })} />
      </label>
    </div>
  )
}

function NumberField({
  label,
  value,
  min,
  max,
  step = 0.1,
  onChange,
}: {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
}) {
  return (
    <label>
      {label}
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}
