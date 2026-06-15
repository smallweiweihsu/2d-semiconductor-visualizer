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
  // 儀器輸出常見格式（tab 分隔）：
  //   轉移：Voltage (V) - |Ids|, |Current| (A) - |Ids|, Voltage (V) - |Igs|, |Current| (A) - |Igs|
  //   輸出：Drain Voltage (V) - |Ids|, Drain Current (A) - |Ids|, ... Plot 1..5
  // 規則：第一個電壓欄→Vg/Vd，其餘電壓欄忽略（同一掃描軸）；第一個 Id 電流→Id、第一個 Ig 電流→Ig，其餘忽略。
  const state: ColumnMappingState = {}
  let voltageAssigned = false
  let idAssigned = false
  let igAssigned = false
  for (const header of headers) {
    const h = header.toLowerCase()
    const unitMatch = header.match(/\(([^)]+)\)|\[([^\]]+)\]/)
    const rawUnit = unitMatch?.[1] ?? unitMatch?.[2]
    let role: ElectricalMeasurementColumnRole | 'ignore' = 'ignore'
    let unit: string | undefined
    if (h.includes('current')) {
      const isGate = h.includes('igs') || /\big\b/.test(h) || h.includes('|igs|') || h.includes('- ig')
      if (isGate) {
        if (!igAssigned) { role = 'Ig'; igAssigned = true; unit = rawUnit ?? 'A' }
      } else {
        if (!idAssigned) { role = 'Id'; idAssigned = true; unit = rawUnit ?? 'A' }
      }
    } else if (h.includes('voltage') || h.includes('vg') || h.includes('vd')) {
      const isDrain = h.includes('drain') || h.includes('vd')
      if (!voltageAssigned) { role = isDrain ? 'Vd' : 'Vg'; voltageAssigned = true; unit = rawUnit ?? 'V' }
    } else {
      const fallback = inferColumnMapping(header)
      role = fallback.role
      unit = fallback.unit
    }
    state[header] = { role: role as ElectricalMeasurementColumnRole, unit }
  }
  return state
}

export function createElectricalMeasurement({
  table,
  mappings,
  activeDeviceId,
  activeDeviceName,
  sourceName,
  deviceNameOverride,
  dateOverride,
  kindOverride,
}: {
  table: ParsedCsvTable
  mappings: ColumnMappingState
  activeDeviceId: string
  activeDeviceName: string
  sourceName: string
  deviceNameOverride?: string
  dateOverride?: string
  kindOverride?: ElectricalMeasurementDataset['measurementKind']
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
  const measurementKind = kindOverride ?? inferMeasurementKind(points)

  // 輸出檔常含多條 Vg 的 (Vd, Id) 欄位對；擷取為可選曲線。
  let curves: Array<{ label: string; points: Array<{ x: number; id: number }> }> | undefined
  if (measurementKind === 'id_vd') {
    const built: Array<{ label: string; points: Array<{ x: number; id: number }> }> = []
    for (let i = 0; i + 1 < table.headers.length; i++) {
      const hv = table.headers[i].toLowerCase()
      const hc = table.headers[i + 1].toLowerCase()
      if (hv.includes('voltage') && hc.includes('current')) {
        const m = table.headers[i + 1].match(/\|i?ds?\|/i) ? '主曲線' : (table.headers[i + 1].match(/plot\s*(\d+)/i)?.[0] ?? `曲線 ${built.length + 1}`)
        const pts = table.rows.map((row) => ({ x: Number(row[i]), id: Number(row[i + 1]) })).filter((pt) => Number.isFinite(pt.x) && Number.isFinite(pt.id))
        if (pts.length) built.push({ label: m, points: pts })
      }
    }
    if (built.length > 1) curves = built
  }

  return {
    id: `meas-${Date.now()}`,
    sampleName: sourceName.replace(/\.(csv|txt)$/i, '') || 'Imported measurement',
    deviceName: deviceNameOverride || activeDeviceName,
    deviceId: activeDeviceId,
    date: dateOverride || new Date().toISOString().slice(0, 10),
    type: 'electrical',
    tool: 'CSV import',
    notes: 'Imported local electrical measurement',
    electrical: {
      measurementKind,
      sourceName,
      columns,
      points,
      units: { voltage: 'V', current: 'A' },
      curves,
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


/** 由檔名推斷 元件 / 日期 / 量測類型。建議命名：DeviceName_YYYY-MM-DD_transfer.txt（或 _output）。 */
export function parseMeasurementFilename(filename: string): { date?: string; kind?: ElectricalMeasurementDataset['measurementKind']; temperatureK?: number } {
  const base = filename.replace(/\.(csv|txt|dat)$/i, '')
  const lower = base.toLowerCase()
  // 類型：transfer 檔通常含 Vg 掃描；output 檔含 Vd 掃描。檔名/資料夾含 output→id_vd、transfer→id_vg。
  let kind: ElectricalMeasurementDataset['measurementKind'] | undefined
  if (/\btransfer\b|id[_-]?vg/.test(lower)) kind = 'id_vg'
  else if (/\boutput\b|id[_-]?vd/.test(lower)) kind = 'id_vd'
  const dateMatch = base.match(/(20\d{2})[-_/.]?(\d{2})[-_/.]?(\d{2})/)
  const date = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : undefined
  // 溫度：例如 100k / 80K / 300 K → 視為 K
  const tMatch = base.match(/(\d{1,3})\s*[kK]\b/)
  const temperatureK = tMatch ? Number(tMatch[1]) : undefined
  return { date, kind, temperatureK }
}
