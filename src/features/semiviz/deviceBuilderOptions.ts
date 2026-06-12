import type { DeviceLayerRole, ElectricalRole, VoltageMode } from '../../types/semiviz'

export const deviceLayerRoles: DeviceLayerRole[] = [
  'source',
  'drain',
  'gate',
  'semiconductor',
  'dielectric',
  'oxide',
  'substrate',
  'bulk',
  'passivation',
  'contact',
  'custom',
]

export const electricalRoles: ElectricalRole[] = [
  'channel',
  'source',
  'drain',
  'gate',
  'gate_dielectric',
  'buffer',
  'substrate',
  'passivation',
  'contact',
  'unknown',
]

export const voltageModes: VoltageMode[] = ['grounded', 'biased', 'floating', 'none']
