import type { ElectricalMeasurementPoint, MeasurementData } from '../types/semiviz'

export interface ElectricalMetrics {
  pointCount: number
  minId_A?: number
  maxId_A?: number
  maxAbsId_A?: number
  onOffRatio?: number
  vgRange?: [number, number]
  vdRange?: [number, number]
}

export function calculateElectricalMetrics(measurement?: MeasurementData): ElectricalMetrics {
  const points = measurement?.electrical?.points ?? []
  const idValues = values(points, 'Id').map(Math.abs).filter((value) => value > 0)
  const vgValues = values(points, 'Vg')
  const vdValues = values(points, 'Vd')
  const minId = idValues.length ? Math.min(...idValues) : undefined
  const maxId = idValues.length ? Math.max(...idValues) : undefined

  return {
    pointCount: points.length,
    minId_A: minId,
    maxId_A: maxId,
    maxAbsId_A: maxId,
    onOffRatio: minId && maxId ? maxId / minId : undefined,
    vgRange: range(vgValues),
    vdRange: range(vdValues),
  }
}

export function getMeasurementOverlayWarnings(measurement: MeasurementData | undefined, activeDeviceId: string, simulationVd: number) {
  const warnings: string[] = []
  if (!measurement?.electrical) return warnings
  if (measurement.deviceId && measurement.deviceId !== activeDeviceId) warnings.push('Measurement deviceId differs from active device.')
  const vdValues = values(measurement.electrical.points, 'Vd')
  const averageVd = vdValues.length ? vdValues.reduce((sum, value) => sum + value, 0) / vdValues.length : undefined
  if (averageVd !== undefined && Math.abs(averageVd - simulationVd) > 0.05) warnings.push('Measurement Vd differs from simulator Vd.')
  return warnings
}

export function toOverlaySeries(measurement: MeasurementData | undefined, unit: 'A' | 'uA' | 'nA') {
  const scale = unit === 'uA' ? 1e6 : unit === 'nA' ? 1e9 : 1
  return (measurement?.electrical?.points ?? [])
    .filter((point) => point.Vg !== undefined && point.Id !== undefined)
    .map((point) => ({ vg: point.Vg!, measuredId: point.Id! * scale }))
}

function values(points: ElectricalMeasurementPoint[], key: keyof ElectricalMeasurementPoint) {
  return points.map((point) => point[key]).filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
}

function range(valuesToRange: number[]): [number, number] | undefined {
  return valuesToRange.length ? [Math.min(...valuesToRange), Math.max(...valuesToRange)] : undefined
}
