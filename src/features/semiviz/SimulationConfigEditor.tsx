import type { DeviceStructure, SimulationConfig } from '../../types/semiviz'

const fields: Array<[keyof SimulationConfig, string]> = [
  ['channelLayerId', 'Active channel'],
  ['gateDielectricLayerId', 'Gate dielectric'],
  ['sourceLayerId', 'Source contact'],
  ['drainLayerId', 'Drain contact'],
  ['gateLayerId', 'Gate electrode'],
]

export function SimulationConfigEditor({
  device,
  onChange,
}: {
  device: DeviceStructure
  onChange: (config: Partial<SimulationConfig>) => void
}) {
  return (
    <div className="simulation-config-editor">
      <h3>Simulation roles</h3>
      {fields.map(([key, label]) => (
        <label key={key}>
          {label}
          <select value={device.simulationConfig?.[key] ?? ''} onChange={(event) => onChange({ [key]: event.target.value || undefined })}>
            <option value="">auto-detect</option>
            {device.layers.map((layer) => (
              <option value={layer.id} key={layer.id}>{layer.name}</option>
            ))}
          </select>
        </label>
      ))}
    </div>
  )
}
