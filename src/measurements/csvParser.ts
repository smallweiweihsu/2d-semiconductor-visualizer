import type {
  ElectricalMeasurementColumn,
  ElectricalMeasurementColumnRole,
  ElectricalMeasurementDataset,
  ElectricalMeasurementPoint,
  MeasurementData,
} from '../types/semiviz'

export interface ParsedCsvTable {
  headers: string[]
  rows: string[][]
  delimiter: ',' | '\t' | ';' | ' '
}

export interface ColumnMapping {
  role: ElectricalMeasurementColumnRole
  unit?: string
}

export type ColumnMappingState = Record<string, ColumnMapping>

const roles: ElectricalMeasurementColumnRole[] = ['Vg', 'Vd', 'Id', 'Ig', 'time', 'sweepDirection', 'temperature']

export function parseDelimitedText(text: string): ParsedCsvTable {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  if (!lines.length) return { headers: [], rows: [], delimiter: ',' }
  const delimiter = detectDelimiter(lines[0])
  const headers = splitLine(lines[0], delimiter)
  const rows = lines.slice(1).map((line) => splitLine(line, delimiter)).filter((row) => row.some(Boolean))
  return { headers, rows, delimiter }
}

export function inferColumnMappings(headers: string[]): ColumnMappingState {
  return Object.fromEntries(headers.map((header) => [header, inferColumnMapping(header)]))
}

export function createElectricalMeasurement({
  table,
  mappings,
  activeDeviceId,
  activeDeviceName,
  sourceName,
}: {
  table: ParsedCsvTable
  mappings: ColumnMappingState
  activeDeviceId: string
  activeDeviceName: string
  sourceName: string
}): MeasurementData {
  const columns: ElectricalMeasurementColumn[] = table.headers.map((header) => ({
    source: header,
    mappedTo: mappings[header]?.role ?? 'ignore',
    unit: mappings[header]?.unit,
  }))
  const points: ElectricalMeasurementPoint[] = table.rows.map((row) => {
    const point: ElectricalMeasurementPoint = {}
    table.headers.forEach((header, index) => {
      const mapping = mappings[header]
      if (!mapping || mapping.role === 'ignore') return
      const raw = row[index]
      if (mapping.role === 'sweepDirection') {
        point.sweepDirection = raw
        return
      }
      const numeric = Number(raw)
      if (!Number.isFinite(numeric)) return
      Object.assign(point, { [mapping.role]: convertValue(numeric, mapping.unit, mapping.role) })
    })
    return point
  }).filter((point) => point.Id !== undefined && (point.Vg !== undefined || point.Vd !== undefined))
  const measurementKind = inferMeasurementKind(points)

  return {
    id: `meas-${Date.now()}`,
    sampleName: sourceName.replace(/\.(csv|txt)$/i, '') || 'Imported measurement',
    deviceName: activeDeviceName,
    deviceId: activeDeviceId,
    date: new Date().toISOString().slice(0, 10),
    type: 'electrical',
    tool: 'CSV import',
    notes: 'Imported local electrical measurement',
    electrical: {
      measurementKind,
      sourceName,
      columns,
      points,
      units: { voltage: 'V', current: 'A' },
    },
  }
}

export function convertValue(value: number, unit: string | undefined, role: ElectricalMeasurementColumnRole) {
  if (role === 'Vg' || role === 'Vd') {
    return unit === 'mV' ? value / 1000 : value
  }
  if (role === 'Id' || role === 'Ig') {
    if (unit === 'mA') return value * 1e-3
    if (unit === 'uA' || unit === 'µA') return value * 1e-6
    if (unit === 'nA') return value * 1e-9
    if (unit === 'pA') return value * 1e-12
  }
  return value
}

export function inferMeasurementKind(points: ElectricalMeasurementPoint[]): ElectricalMeasurementDataset['measurementKind'] {
  const uniqueVd = new Set(points.map((point) => point.Vd).filter((value) => value !== undefined).map((value) => value!.toFixed(6)))
  const uniqueVg = new Set(points.map((point) => point.Vg).filter((value) => value !== undefined).map((value) => value!.toFixed(6)))
  if (uniqueVg.size > 1 && uniqueVd.size <= 3) return 'id_vg'
  if (uniqueVd.size > 1 && uniqueVg.size <= 5) return 'id_vd'
  return 'unknown'
}

function inferColumnMapping(header: string): ColumnMapping {
  const normalized = header.toLowerCase().replace(/[\s_-]/g, '')
  const role = roles.find((candidate) => normalized.includes(candidate.toLowerCase())) ?? 'ignore'
  const unitMatch = header.match(/\(([^)]+)\)|\[([^\]]+)\]/)
  const unit = unitMatch?.[1] ?? unitMatch?.[2] ?? defaultUnit(role)
  return { role, unit }
}

function defaultUnit(role: ElectricalMeasurementColumnRole) {
  if (role === 'Id' || role === 'Ig') return 'A'
  if (role === 'Vg' || role === 'Vd') return 'V'
  return undefined
}

function detectDelimiter(line: string): ParsedCsvTable['delimiter'] {
  if (line.includes('\t')) return '\t'
  if (line.includes(';')) return ';'
  if (line.includes(',')) return ','
  return ' '
}

function splitLine(line: string, delimiter: ParsedCsvTable['delimiter']) {
  if (delimiter === ' ') return line.split(/\s+/).map((entry) => entry.trim())
  return line.split(delimiter).map((entry) => entry.trim().replace(/^"|"$/g, ''))
}
