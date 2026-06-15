import type { ElectricalMeasurementPoint, MeasurementData } from '../types/semiviz'

export interface ElectricalMetrics {
  pointCount: number
  minId_A?: number
  maxId_A?: number
  maxAbsId_A?: number
  onOffRatio?: number
  vgRange?: [number, number]
  vdRange?: [number, number]
  ssMin_mVdec?: number
  vth_V?: number
  gmMax_S?: number
}

export function calculateElectricalMetrics(measurement?: MeasurementData): ElectricalMetrics {
  const points = measurement?.electrical?.points ?? []
  const idValues = values(points, 'Id').map(Math.abs).filter((value) => value > 0)
  const vgValues = values(points, 'Vg')
  const vdValues = values(points, 'Vd')
  const minId = idValues.length ? Math.min(...idValues) : undefined
  const maxId = idValues.length ? Math.max(...idValues) : undefined

  const transfer = extractTransferParameters(points)

  return {
    pointCount: points.length,
    minId_A: minId,
    maxId_A: maxId,
    maxAbsId_A: maxId,
    onOffRatio: minId && maxId ? maxId / minId : undefined,
    vgRange: range(vgValues),
    vdRange: range(vdValues),
    ssMin_mVdec: transfer.ssMin_mVdec,
    vth_V: transfer.vth_V,
    gmMax_S: transfer.gmMax_S,
  }
}

/** 從轉移曲線 (Id–Vg) 萃取 SS_min、Vth（定電流法）、gm_max。半定量，需依量測條件解讀。 */
export function extractTransferParameters(points: ElectricalMeasurementPoint[]): {
  ssMin_mVdec?: number
  vth_V?: number
  gmMax_S?: number
} {
  const pts = points
    .filter((p) => typeof p.Vg === 'number' && typeof p.Id === 'number')
    .map((p) => ({ vg: p.Vg as number, id: p.Id as number }))
    .sort((a, b) => a.vg - b.vg)
  if (pts.length < 3) return {}
  const absVals = pts.map((p) => Math.abs(p.id)).filter((v) => v > 0)
  if (!absVals.length) return {}
  const maxAbs = Math.max(...absVals)

  // SS_min：次臨界區相鄰點 dVg / d(log10|Id|)，取最小（最佳）
  let ssMin: number | undefined
  let gmMax = 0
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    const dvg = b.vg - a.vg
    if (dvg === 0) continue
    const gm = Math.abs((b.id - a.id) / dvg)
    if (gm > gmMax) gmMax = gm
    const ia = Math.abs(a.id)
    const ib = Math.abs(b.id)
    if (ia > 0 && ib > 0 && Math.max(ia, ib) < maxAbs * 0.1) {
      const dlog = Math.abs(Math.log10(ib) - Math.log10(ia))
      if (dlog > 1e-6) {
        const ss = Math.abs(dvg) / dlog * 1000 // mV/dec
        if (ss > 0 && (ssMin === undefined || ss < ssMin)) ssMin = ss
      }
    }
  }

  // Vth：定電流法，Id_th = 1e-9 A，於上升邊界內插 Vg
  const idTh = 1e-9
  let vth: number | undefined
  for (let i = 1; i < pts.length; i++) {
    const ia = Math.abs(pts[i - 1].id)
    const ib = Math.abs(pts[i].id)
    if ((ia - idTh) * (ib - idTh) < 0) {
      const t = (idTh - ia) / (ib - ia)
      vth = pts[i - 1].vg + t * (pts[i].vg - pts[i - 1].vg)
      break
    }
  }

  return { ssMin_mVdec: ssMin, vth_V: vth, gmMax_S: gmMax || undefined }
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
