import { describe, expect, it } from 'vitest'
import {
  createElectricalMeasurement,
  inferColumnMappings,
  parseDelimitedText,
} from './src/measurements/csvParser'
import {
  calculateElectricalMetrics,
  getMeasurementOverlayWarnings,
  toOverlaySeries,
} from './src/measurements/electricalMetrics'

describe('measurement CSV import and overlay', () => {
  it('parses CSV headers and infers electrical mappings', () => {
    const table = parseDelimitedText('Vg (mV),Vd (V),Id (uA)\n0,1,2\n1000,1,4')
    const mappings = inferColumnMappings(table.headers)

    expect(table.rows).toHaveLength(2)
    expect(mappings['Vg (mV)']).toEqual({ role: 'Vg', unit: 'mV' })
    expect(mappings['Id (uA)']).toEqual({ role: 'Id', unit: 'uA' })
  })

  it('converts voltage and current units into V and A', () => {
    const table = parseDelimitedText('Vg (mV),Vd (V),Id (uA)\n1000,1,2')
    const measurement = createElectricalMeasurement({
      table,
      mappings: inferColumnMappings(table.headers),
      activeDeviceId: 'device-a',
      activeDeviceName: 'Device A',
      sourceName: 'transfer.csv',
    })

    expect(measurement.electrical?.points[0].Vg).toBe(1)
    expect(measurement.electrical?.points[0].Id).toBe(2e-6)
    expect(measurement.electrical?.measurementKind).toBe('unknown')
  })

  it('calculates basic electrical metrics', () => {
    const measurement = createMeasurement('Vg,Vd,Id\n0,1,1e-9\n1,1,1e-6')
    const metrics = calculateElectricalMetrics(measurement)

    expect(metrics.pointCount).toBe(2)
    expect(metrics.onOffRatio).toBeCloseTo(1000)
  })

  it('creates overlay series and warns on device or Vd mismatch', () => {
    const measurement = createMeasurement('Vg,Vd,Id\n0,2,1e-9\n1,2,1e-6')

    expect(toOverlaySeries(measurement, 'uA')[1].measuredId).toBe(1)
    expect(getMeasurementOverlayWarnings(measurement, 'other-device', 1)).toEqual([
      'Measurement deviceId differs from active device.',
      'Measurement Vd differs from simulator Vd.',
    ])
  })
})

function createMeasurement(text: string) {
  const table = parseDelimitedText(text)
  return createElectricalMeasurement({
    table,
    mappings: inferColumnMappings(table.headers),
    activeDeviceId: 'device-a',
    activeDeviceName: 'Device A',
    sourceName: 'measurement.csv',
  })
}
